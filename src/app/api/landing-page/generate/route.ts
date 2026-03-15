import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { generateLandingPageSchema } from '@/app/api/_shared/schemas';
import type { GenerateLandingPageResponse } from '@contracts/api-contracts';
import type { AuditResult, CategoryResult, Grade } from '@contracts/audit-types';
import type { SupportedLanguage } from '@contracts/constants';
import { createServiceClient } from '@/lib/db/client';
import { generateLandingPage } from '@/lib/landing-gen/generator';

interface AuditRow {
  id: string;
  lead_id: string;
  status: string;
  overall_score: number | null;
  overall_grade: string | null;
  language: string;
  inputs: {
    businessName: string;
    websiteUrl: string;
    goals: { industry: string };
  };
}

interface CategoryRow {
  category: string;
  status: string;
  score: number | null;
  results: CategoryResult | null;
}

export async function POST(request: Request) {
  try {
    const body = await parseBody(request, generateLandingPageSchema);
    const supabase = createServiceClient();

    // ── Fetch audit row ──────────────────────────────────────────────────────
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('id, lead_id, status, overall_score, overall_grade, language, inputs')
      .eq('id', body.auditId)
      .single();

    if (auditError || !audit) {
      return errorResponse('NOT_FOUND', 'Audit not found', 404);
    }

    const auditRow = audit as AuditRow;

    if (auditRow.status !== 'completed') {
      return errorResponse('CONFLICT', 'Audit has not completed yet', 409);
    }

    // ── Check if a page was already generated for this audit ─────────────────
    const { data: existingPage } = await supabase
      .from('generated_pages')
      .select('id')
      .eq('audit_id', body.auditId)
      .limit(1)
      .maybeSingle();

    if (existingPage) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://audit.forgedigital.com';
      const response: GenerateLandingPageResponse = {
        pageId: existingPage.id as string,
        previewUrl: `${appUrl}/preview/${existingPage.id}`,
      };
      return NextResponse.json(response, { status: 200 });
    }

    // ── Fetch completed category results ─────────────────────────────────────
    const { data: categoryRows, error: catError } = await supabase
      .from('audit_categories')
      .select('category, status, score, results')
      .eq('audit_id', body.auditId)
      .eq('status', 'completed');

    if (catError) {
      console.error('Failed to fetch audit categories:', catError);
      return errorResponse('INTERNAL_ERROR', 'Failed to fetch audit data', 500);
    }

    const categories = ((categoryRows ?? []) as CategoryRow[])
      .filter((r): r is CategoryRow & { results: CategoryResult } => r.results !== null)
      .map((r) => r.results);

    // ── Build the AuditResult shape for the generator ────────────────────────
    const auditData: AuditResult = {
      id: auditRow.id,
      overallScore: auditRow.overall_score ?? 0,
      grade: (auditRow.overall_grade ?? 'F') as Grade,
      categories,
      actionPlan: categories.flatMap((c) => c.recommendations),
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    const businessInfo = {
      name: auditRow.inputs.businessName,
      industry: auditRow.inputs.goals.industry,
      url: auditRow.inputs.websiteUrl,
    };

    // ── Extract brand colors (fallback to Forge brand palette) ───────────────
    const brandColors = {
      primary: '#0B1120',
      secondary: '#1a2340',
      accent: '#D4A537',
    };

    // Try to extract brand colors from the branding category result
    const brandingResult = categories.find((c) => c.category === 'branding');
    if (brandingResult) {
      for (const sub of brandingResult.subCategories) {
        for (const item of sub.items) {
          if (item.id === 'primary_color' && typeof item.value === 'string' && item.value.startsWith('#')) {
            brandColors.primary = item.value;
          }
          if (item.id === 'secondary_color' && typeof item.value === 'string' && item.value.startsWith('#')) {
            brandColors.secondary = item.value;
          }
          if (item.id === 'accent_color' && typeof item.value === 'string' && item.value.startsWith('#')) {
            brandColors.accent = item.value;
          }
        }
      }
    }

    const language = (auditRow.language ?? 'en') as SupportedLanguage;

    // ── Generate the landing page HTML ───────────────────────────────────────
    const html = await generateLandingPage({
      auditData,
      businessInfo,
      brandColors,
      language,
    });

    // ── Store in generated_pages table ───────────────────────────────────────
    const { data: pageRow, error: insertError } = await supabase
      .from('generated_pages')
      .insert({
        audit_id: body.auditId,
        html_content: html,
        metadata: {
          lead_id: auditRow.lead_id,
          business_name: businessInfo.name,
          brand_colors: brandColors,
          language,
        },
      })
      .select('id')
      .single();

    if (insertError || !pageRow) {
      console.error('Failed to store generated page:', insertError);
      return errorResponse('INTERNAL_ERROR', 'Failed to store generated page', 500);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://audit.forgedigital.com';
    const pageId = pageRow.id as string;

    const response: GenerateLandingPageResponse = {
      pageId,
      previewUrl: `${appUrl}/preview/${pageId}`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('POST /api/landing-page/generate error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to generate landing page', 500);
  }
}
