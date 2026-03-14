import { NextResponse } from 'next/server';
import { errorResponse } from '@/app/api/_shared/helpers';
import type { AuditResult, CategoryResult } from '@contracts/audit-types';

function mockCategoryResult(category: string, score: number): CategoryResult {
  return {
    category: category as CategoryResult['category'],
    score,
    status: 'completed',
    subCategories: [
      {
        name: `${category} - General`,
        score,
        items: [
          {
            id: crypto.randomUUID(),
            label: `${category} check 1`,
            status: score > 70 ? 'pass' : 'warning',
            detail: `Mock detail for ${category}`,
          },
        ],
      },
    ],
    recommendations: [
      {
        id: crypto.randomUUID(),
        title: `Improve ${category}`,
        description: `Mock recommendation for ${category}`,
        priority: score < 60 ? 'high' : 'medium',
        effort: 'moderate',
        impact: 'high',
        category: category as CategoryResult['category'],
      },
    ],
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return errorResponse('INVALID_INPUT', 'Audit ID is required', 400);
    }

    // TODO Phase 2: Fetch audit + categories from DB
    // TODO Phase 2: Return 404 if not found, 202 if still running

    const mockResult: AuditResult = {
      id,
      overallScore: 68,
      grade: 'C+',
      categories: [
        mockCategoryResult('seo', 72),
        mockCategoryResult('website', 65),
        mockCategoryResult('social', 58),
        mockCategoryResult('branding', 74),
        mockCategoryResult('gbp', 70),
        mockCategoryResult('ads', 62),
        mockCategoryResult('reputation', 75),
      ],
      actionPlan: [
        {
          id: crypto.randomUUID(),
          title: 'Fix page speed issues',
          description: 'Your website loads slowly on mobile devices. Optimize images and minimize JavaScript.',
          priority: 'high',
          effort: 'moderate',
          impact: 'high',
          category: 'website',
        },
        {
          id: crypto.randomUUID(),
          title: 'Add meta descriptions',
          description: 'Several pages are missing meta descriptions, hurting CTR in search results.',
          priority: 'high',
          effort: 'quick-win',
          impact: 'medium',
          category: 'seo',
        },
        {
          id: crypto.randomUUID(),
          title: 'Increase posting frequency',
          description: 'Post at least 3x per week on Instagram and 2x on LinkedIn for better engagement.',
          priority: 'medium',
          effort: 'moderate',
          impact: 'medium',
          category: 'social',
        },
      ],
      createdAt: new Date(Date.now() - 60000).toISOString(),
      completedAt: new Date().toISOString(),
    };

    return NextResponse.json(mockResult);
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('GET /api/audit/results/[id] error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch audit results', 500);
  }
}
