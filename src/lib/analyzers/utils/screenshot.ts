// src/lib/analyzers/utils/screenshot.ts
// Screenshot capture via external API (e.g. ScreenshotOne)

import type { ScreenshotResult } from '../../audit/types';

const SCREENSHOT_TIMEOUT_MS = 15_000;

/**
 * Capture a screenshot of a URL using an external screenshot API.
 * Returns null gracefully if the API key is missing or the capture fails.
 */
export async function captureScreenshot(
  url: string,
  options: { width?: number; height?: number; fullPage?: boolean } = {},
): Promise<ScreenshotResult | null> {
  const { width = 1280, height = 800, fullPage = false } = options;

  const apiKey = process.env.SCREENSHOT_API_KEY;
  if (!apiKey) {
    console.warn('[screenshot] SCREENSHOT_API_KEY not configured — skipping');
    return null;
  }

  try {
    const apiUrl = buildApiUrl(url, { width, height, fullPage, apiKey });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), SCREENSHOT_TIMEOUT_MS);

    const response = await fetch(apiUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      console.warn(`[screenshot] API returned ${response.status} for ${url}`);
      return null;
    }

    const buffer = await response.arrayBuffer();
    return {
      imageBase64: Buffer.from(buffer).toString('base64'),
      mimeType: 'image/png',
      width,
      height,
    };
  } catch (error) {
    console.warn(
      '[screenshot] Capture failed:',
      error instanceof Error ? error.message : 'Unknown error',
    );
    return null;
  }
}

/**
 * Capture screenshots of multiple pages concurrently.
 * Returns a Map keyed by URL.
 */
export async function captureMultipleScreenshots(
  urls: string[],
  options: { width?: number; height?: number } = {},
): Promise<Map<string, ScreenshotResult | null>> {
  const results = await Promise.allSettled(
    urls.map((u) => captureScreenshot(u, options)),
  );

  const map = new Map<string, ScreenshotResult | null>();
  urls.forEach((u, i) => {
    const r = results[i];
    map.set(u, r.status === 'fulfilled' ? r.value : null);
  });
  return map;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildApiUrl(
  url: string,
  opts: { width: number; height: number; fullPage: boolean; apiKey: string },
): string {
  const base = process.env.SCREENSHOT_API_URL ?? 'https://api.screenshotone.com/take';
  const params = new URLSearchParams({
    access_key: opts.apiKey,
    url,
    viewport_width: String(opts.width),
    viewport_height: String(opts.height),
    full_page: String(opts.fullPage),
    format: 'png',
    block_ads: 'true',
    block_cookie_banners: 'true',
    delay: '2',
    timeout: '15',
  });
  return `${base}?${params}`;
}
