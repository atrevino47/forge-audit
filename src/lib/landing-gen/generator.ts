// src/lib/landing-gen/generator.ts
// Main landing page HTML generation — orchestrates AI copy + templates + styles

import type { AuditResult } from '../../../contracts/audit-types';
import type { SupportedLanguage } from '../../../contracts/constants';
import { analyzeWithSonnet, parseAIJSON } from '../ai/client';
import { landingPageCopyPrompt } from '../prompts/landing-page';
import { generateStyles, type BrandColors } from './styles';
import {
  buildHeroSection,
  buildFeaturesSection,
  buildSocialProofSection,
  buildAboutSection,
  buildCtaSection,
  buildForgeBadge,
  type LandingPageCopy,
} from './templates';

interface GenerateLandingPageParams {
  auditData: AuditResult;
  businessInfo: { name: string; industry: string; url: string };
  brandColors: BrandColors;
  language: SupportedLanguage;
}

/**
 * Generate a complete, self-contained HTML landing page based on audit data.
 * Uses Sonnet to generate copy, then assembles with templates and inline CSS.
 */
export async function generateLandingPage(params: GenerateLandingPageParams): Promise<string> {
  const { auditData, businessInfo, brandColors, language } = params;

  const copy = await generateCopy(auditData, businessInfo, brandColors, language);
  return assembleHTML(copy, brandColors);
}

async function generateCopy(
  auditData: AuditResult,
  businessInfo: { name: string; industry: string; url: string },
  brandColors: BrandColors,
  language: SupportedLanguage
): Promise<LandingPageCopy> {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  for (const cat of auditData.categories) {
    if (cat.score >= 70) {
      strengths.push(`${cat.category}: ${cat.score}/100`);
    } else {
      weaknesses.push(`${cat.category}: ${cat.score}/100`);
    }
    for (const rec of cat.recommendations.slice(0, 2)) {
      recommendations.push(rec.title);
    }
  }

  const systemPrompt = landingPageCopyPrompt.system(language);
  const userPrompt = landingPageCopyPrompt.user({
    businessName: businessInfo.name,
    industry: businessInfo.industry,
    url: businessInfo.url,
    language,
    brandColors,
    auditHighlights: {
      overallScore: auditData.overallScore,
      topStrengths: strengths.slice(0, 3),
      topWeaknesses: weaknesses.slice(0, 3),
      topRecommendations: recommendations.slice(0, 5),
    },
    valueProposition: null,
  });

  const raw = await analyzeWithSonnet({
    systemPrompt,
    userPrompt,
    language,
    maxTokens: 4096,
  });

  const parsed = parseAIJSON<LandingPageCopy>(raw);

  if (parsed?.hero && parsed?.features && parsed?.cta) {
    return parsed;
  }

  return buildFallbackCopy(businessInfo, language);
}

function assembleHTML(copy: LandingPageCopy, brandColors: BrandColors): string {
  const css = generateStyles(brandColors);
  const hero = buildHeroSection(copy.hero);
  const features = buildFeaturesSection(copy.features);
  const socialProof = buildSocialProofSection(copy.socialProof);
  const about = buildAboutSection(copy.about);
  const cta = buildCtaSection(copy.cta);
  const badge = buildForgeBadge();

  return `<!DOCTYPE html>
<html lang="${copy.meta?.pageTitle ? 'en' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeAttr(copy.meta?.pageTitle ?? 'Welcome')}</title>
  <meta name="description" content="${escapeAttr(copy.meta?.pageDescription ?? '')}">
  <style>${css}</style>
</head>
<body>
  ${hero}
  ${features}
  ${socialProof}
  ${about}
  ${cta}
  ${badge}
</body>
</html>`;
}

function escapeAttr(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildFallbackCopy(
  businessInfo: { name: string; industry: string; url: string },
  language: SupportedLanguage
): LandingPageCopy {
  const isEs = language === 'es';
  return {
    hero: {
      headline: isEs
        ? `${businessInfo.name} — Expertos en ${businessInfo.industry}`
        : `${businessInfo.name} — ${businessInfo.industry} Experts`,
      subheadline: isEs
        ? 'Soluciones profesionales diseñadas para hacer crecer tu negocio.'
        : 'Professional solutions designed to grow your business.',
      ctaText: isEs ? 'Contáctanos' : 'Get in Touch',
      ctaSubtext: isEs ? 'Sin compromiso' : 'No commitment required',
    },
    features: [
      {
        title: isEs ? 'Experiencia Comprobada' : 'Proven Experience',
        description: isEs
          ? 'Años de experiencia respaldando a negocios como el tuyo.'
          : 'Years of experience supporting businesses like yours.',
        icon: 'shield',
      },
      {
        title: isEs ? 'Resultados Medibles' : 'Measurable Results',
        description: isEs
          ? 'Nos enfocamos en métricas que impactan tu crecimiento.'
          : 'We focus on metrics that drive your growth.',
        icon: 'trending-up',
      },
      {
        title: isEs ? 'Atención Personalizada' : 'Personalized Attention',
        description: isEs
          ? 'Cada negocio es único. Nuestras soluciones también.'
          : 'Every business is unique. Our solutions are too.',
        icon: 'users',
      },
    ],
    socialProof: {
      headline: isEs ? 'Números que hablan' : 'Numbers That Speak',
      stats: [
        { value: '100+', label: isEs ? 'Clientes Atendidos' : 'Clients Served' },
        { value: '4.9', label: isEs ? 'Calificación Promedio' : 'Average Rating' },
        { value: '24/7', label: isEs ? 'Soporte' : 'Support' },
      ],
    },
    about: {
      headline: isEs ? `Acerca de ${businessInfo.name}` : `About ${businessInfo.name}`,
      body: isEs
        ? `${businessInfo.name} es un negocio dedicado a ofrecer soluciones de calidad en la industria de ${businessInfo.industry}. Nos apasiona lo que hacemos y estamos comprometidos con la excelencia en cada proyecto.`
        : `${businessInfo.name} is a business dedicated to delivering quality solutions in the ${businessInfo.industry} industry. We are passionate about what we do and committed to excellence in every project.`,
    },
    cta: {
      headline: isEs ? '¿Listo para empezar?' : 'Ready to Get Started?',
      subheadline: isEs
        ? 'Agenda una consulta gratuita y descubre cómo podemos ayudarte.'
        : 'Schedule a free consultation and discover how we can help.',
      buttonText: isEs ? 'Agenda tu Consulta' : 'Book Your Consultation',
      contactInfo: isEs ? 'Contáctanos hoy' : 'Contact us today',
    },
    meta: {
      pageTitle: `${businessInfo.name} — ${businessInfo.industry}`,
      pageDescription: isEs
        ? `${businessInfo.name} ofrece soluciones profesionales en ${businessInfo.industry}. Contáctanos hoy.`
        : `${businessInfo.name} offers professional ${businessInfo.industry} solutions. Contact us today.`,
    },
  };
}
