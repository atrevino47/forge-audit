import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { teamMemberSchema, teamMemberUpdateSchema, teamMemberDeleteSchema } from '@/app/api/_shared/schemas';

// GET /api/admin/team — List team members
export async function GET() {
  try {
    // TODO Phase 2: requireRole('admin')
    // TODO Phase 2: Query users table WHERE role IN ('team', 'admin')

    return NextResponse.json({
      members: [
        {
          id: crypto.randomUUID(),
          email: 'adrian@forgedigital.com',
          fullName: 'Adrián Treviño',
          role: 'admin',
          createdAt: '2026-01-01T00:00:00Z',
          campaignCount: 12,
        },
        {
          id: crypto.randomUUID(),
          email: 'team@forgedigital.com',
          fullName: 'Team Member',
          role: 'team',
          createdAt: '2026-02-15T00:00:00Z',
          campaignCount: 5,
        },
      ],
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('GET /api/admin/team error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch team members', 500);
  }
}

// POST /api/admin/team — Add team member
export async function POST(request: Request) {
  try {
    // TODO Phase 2: requireRole('admin')
    const body = await parseBody(request, teamMemberSchema);

    // TODO Phase 2: Invite user via Supabase Auth admin API
    // TODO Phase 2: Create users row with specified role

    return NextResponse.json(
      {
        id: crypto.randomUUID(),
        email: body.email,
        fullName: body.fullName,
        role: body.role,
        createdAt: new Date().toISOString(),
        status: 'invited',
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('POST /api/admin/team error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to add team member', 500);
  }
}

// PATCH /api/admin/team — Update team member
export async function PATCH(request: Request) {
  try {
    // TODO Phase 2: requireRole('admin')
    const body = await parseBody(request, teamMemberUpdateSchema);

    // TODO Phase 2: Update users row

    return NextResponse.json({
      id: body.id,
      role: body.role,
      fullName: body.fullName,
      updated: true,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('PATCH /api/admin/team error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to update team member', 500);
  }
}

// DELETE /api/admin/team — Remove team member
export async function DELETE(request: Request) {
  try {
    // TODO Phase 2: requireRole('admin')
    const body = await parseBody(request, teamMemberDeleteSchema);

    // TODO Phase 2: Downgrade user role to 'user' (don't delete the account)

    return NextResponse.json({ id: body.id, removed: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    console.error('DELETE /api/admin/team error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to remove team member', 500);
  }
}
