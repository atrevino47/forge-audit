// src/lib/analyzers/utils/scraper.ts
// Website scraping utilities — HTML fetch, parse meta/headings/links, check sitemap/robots

import type { ScrapedPage } from '../../audit/types';

const FETCH_TIMEOUT_MS = 10_000;
const USER_AGENT = 'ForgeAuditBot/1.0 (+https://audit.forgedigital.com)';

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Fetch and parse a web page, extracting meta tags, headings, images, links, etc.
 */
export async function scrapePage(url: string): Promise<ScrapedPage> {
  const normalizedUrl = normalizeUrl(url);
  const hasSSL = normalizedUrl.startsWith('https://');

  const response = await fetchWithTimeout(normalizedUrl, FETCH_TIMEOUT_MS);
  const html = await response.text();

  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const textContent = extractTextContent(html);

  return {
    url: normalizedUrl,
    html,
    statusCode: response.status,
    headers,
    meta: extractMetaTags(html),
    headings: extractHeadings(html),
    images: extractImages(html, normalizedUrl),
    links: extractLinks(html, normalizedUrl),
    scripts: extractScripts(html),
    textContent,
    wordCount: countWords(textContent),
    hasSSL,
    schemaMarkup: extractSchemaMarkup(html),
  };
}

/**
 * Check if sitemap.xml exists at the domain root.
 */
export async function checkSitemap(url: string): Promise<{ exists: boolean; url: string }> {
  const sitemapUrl = `${getBaseUrl(url)}/sitemap.xml`;
  try {
    const response = await fetchWithTimeout(sitemapUrl, 5_000);
    const text = await response.text();
    return {
      exists: response.ok && (text.includes('<urlset') || text.includes('<sitemapindex')),
      url: sitemapUrl,
    };
  } catch {
    return { exists: false, url: sitemapUrl };
  }
}

/**
 * Check if robots.txt exists and is valid.
 */
export async function checkRobotsTxt(url: string): Promise<{ exists: boolean; content?: string }> {
  const robotsUrl = `${getBaseUrl(url)}/robots.txt`;
  try {
    const response = await fetchWithTimeout(robotsUrl, 5_000);
    if (!response.ok) return { exists: false };
    const content = await response.text();
    const isValid = /user-agent/i.test(content);
    return { exists: isValid, content: isValid ? content : undefined };
  } catch {
    return { exists: false };
  }
}

/**
 * Follow redirects manually to detect redirect chains.
 */
export async function checkRedirectChain(
  url: string,
): Promise<{ chain: string[]; hasChain: boolean }> {
  const chain: string[] = [normalizeUrl(url)];
  let currentUrl = chain[0];

  for (let i = 0; i < 10; i++) {
    try {
      const response = await fetch(currentUrl, {
        redirect: 'manual',
        headers: { 'User-Agent': USER_AGENT },
      });
      const location = response.headers.get('location');
      if (!location || response.status < 300 || response.status >= 400) break;

      const nextUrl = new URL(location, currentUrl).toString();
      chain.push(nextUrl);
      currentUrl = nextUrl;
    } catch {
      break;
    }
  }

  return { chain, hasChain: chain.length > 2 };
}

// ─── Fetch Helper ────────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
      },
      redirect: 'follow',
    });
  } finally {
    clearTimeout(timeout);
  }
}

// ─── URL Helpers ─────────────────────────────────────────────────────────────

function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = `https://${normalized}`;
  }
  return normalized.replace(/\/+$/, '');
}

function getBaseUrl(url: string): string {
  const parsed = new URL(normalizeUrl(url));
  return `${parsed.protocol}//${parsed.host}`;
}

function resolveUrl(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

// ─── HTML Parsing Helpers ────────────────────────────────────────────────────

function extractMetaTags(html: string): ScrapedPage['meta'] {
  const meta: ScrapedPage['meta'] = {};

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) meta.title = decodeEntities(titleMatch[1].trim());

  const metaRe = /<meta\s+([^>]*?)\/?\s*>/gi;
  let m: RegExpExecArray | null;
  while ((m = metaRe.exec(html)) !== null) {
    const attrs = m[1];
    const name = getAttr(attrs, 'name') ?? getAttr(attrs, 'property');
    const content = getAttr(attrs, 'content');

    if (!content) {
      const charset = getAttr(attrs, 'charset');
      if (charset) meta.charset = charset;
      continue;
    }

    switch (name?.toLowerCase()) {
      case 'description':       meta.description = content; break;
      case 'robots':            meta.robots = content; break;
      case 'viewport':          meta.viewport = content; break;
      case 'og:image':          meta.ogImage = content; break;
    }
  }

  const canonicalMatch = html.match(
    /<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
  );
  if (canonicalMatch) meta.canonical = canonicalMatch[1];

  return meta;
}

function extractHeadings(html: string): ScrapedPage['headings'] {
  const headings: ScrapedPage['headings'] = [];
  const re = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    headings.push({ tag: m[1].toLowerCase(), text: stripHtml(m[2]).trim() });
  }
  return headings;
}

function extractImages(html: string, baseUrl: string): ScrapedPage['images'] {
  const images: ScrapedPage['images'] = [];
  const re = /<img\s+([^>]*?)\/?\s*>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const src = getAttr(m[1], 'src');
    if (!src) continue;
    images.push({ src: resolveUrl(src, baseUrl), alt: getAttr(m[1], 'alt') });
  }
  return images;
}

function extractLinks(html: string, baseUrl: string): ScrapedPage['links'] {
  const links: ScrapedPage['links'] = [];
  const baseHost = new URL(baseUrl).host;
  const re = /<a\s+([^>]*?)>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = getAttr(m[1], 'href');
    if (!href || /^(#|javascript:|mailto:|tel:)/.test(href)) continue;

    const resolved = resolveUrl(href, baseUrl);
    let isInternal = false;
    try { isInternal = new URL(resolved).host === baseHost; } catch { isInternal = href.startsWith('/'); }

    links.push({ href: resolved, text: stripHtml(m[2]).trim(), isInternal });
  }
  return links;
}

function extractScripts(html: string): ScrapedPage['scripts'] {
  const scripts: ScrapedPage['scripts'] = [];
  const re = /<script\s*([^>]*?)>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const src = getAttr(m[1], 'src');
    const content = m[2].trim();
    if (src || content) {
      scripts.push({ src: src ?? undefined, content: content || undefined });
    }
  }
  return scripts;
}

function extractTextContent(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSchemaMarkup(html: string): Record<string, unknown>[] {
  const schemas: Record<string, unknown>[] = [];
  const re = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1]);
      if (Array.isArray(parsed)) schemas.push(...parsed);
      else schemas.push(parsed);
    } catch {
      // invalid JSON-LD — skip
    }
  }
  return schemas;
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function getAttr(attrs: string, name: string): string | null {
  const match = attrs.match(new RegExp(`${name}\\s*=\\s*["']([^"']*?)["']`, 'i'));
  return match ? match[1] : null;
}
