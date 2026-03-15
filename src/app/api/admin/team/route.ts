import { NextResponse } from 'next/server';
import { parseBody, errorResponse } from '@/app/api/_shared/helpers';
import { teamMemberSchema, teamMemberUpdateSchema, teamMemberDeleteSchema } from '@/app/api/_shared/schemas';
import { createServiceClient } from '@/lib/db';
import { requireRole, AuthError } from '@/lib/auth/guards';

// GET /api/admin/team — List team members
export async function GET() {
  try {
    await requireRole('admin');
    const supabase = createServiceClient();

    const { data: rows, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .in('role', ['team', 'admin'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Team members fetch error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to fetch team members', 500);
    }

    const members = (rows ?? []).map((row) => ({
      id: row.id as string,
      email: row.email as string,
      fullName: row.full_name as string,
      role: row.role as string,
      createdAt: row.created_at as string,
    }));

    return NextResponse.json({ members });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('GET /api/admin/team error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch team members', 500);
  }
}

// POST /api/admin/team — Add team member
export async function POST(request: Request) {
  try {
    await requireRole('admin');
    const supabase = createServiceClient();
    const body = await parseBody(request, teamMemberSchema);

    const newId = crypto.randomUUID();

    const { data: inserted, error } = await supabase
      .from('users')
      .insert({
        id: newId,
        email: body.email,
        full_name: body.fullName,
        role: body.role,
      })
      .select('id, email, full_name, role, created_at')
      .single();

    if (error) {
      console.error('Team member insert error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to add team member', 500);
    }

    return NextResponse.json(
      {
        id: inserted.id as string,
        email: inserted.email as string,
        fullName: inserted.full_name as string,
        role: inserted.role as string,
        createdAt: inserted.created_at as string,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('POST /api/admin/team error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to add team member', 500);
  }
}

// PATCH /api/admin/team — Update team member
export async function PATCH(request: Request) {
  try {
    await requireRole('admin');
    const supabase = createServiceClient();
    const body = await parseBody(request, teamMemberUpdateSchema);

    const updates: Record<string, string> = {};
    if (body.role) updates.role = body.role;
    if (body.fullName) updates.full_name = body.fullName;

    const { data: updated, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', body.id)
      .select('id, email, full_name, role, created_at')
      .single();

    if (error) {
      console.error('Team member update error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to update team member', 500);
    }

    if (!updated) {
      return errorResponse('NOT_FOUND', 'Team member not found', 404);
    }

    return NextResponse.json({
      id: updated.id as string,
      email: updated.email as string,
      fullName: updated.full_name as string,
      role: updated.role as string,
      createdAt: updated.created_at as string,
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('PATCH /api/admin/team error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to update team member', 500);
  }
}

// DELETE /api/admin/team — Remove team member
export async function DELETE(request: Request) {
  try {
    await requireRole('admin');
    const supabase = createServiceClient();
    const body = await parseBody(request, teamMemberDeleteSchema);

    // Prevent deleting admin users to protect against removing the last admin
    const { data: target } = await supabase
      .from('users')
      .select('role')
      .eq('id', body.id)
      .single();

    if (!target) {
      return errorResponse('NOT_FOUND', 'Team member not found', 404);
    }

    if (target.role === 'admin') {
      return errorResponse('FORBIDDEN', 'Cannot delete an admin user', 403);
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', body.id)
      .neq('role', 'admin');

    if (error) {
      console.error('Team member delete error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to remove team member', 500);
    }

    return NextResponse.json({ id: body.id, removed: true });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('DELETE /api/admin/team error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to remove team member', 500);
  }
}
