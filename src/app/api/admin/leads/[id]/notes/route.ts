import { NextResponse } from 'next/server';
import { errorResponse, parseBody } from '@/app/api/_shared/helpers';
import { addLeadNoteSchema } from '@/app/api/_shared/schemas';
import { createServiceClient } from '@/lib/db';
import { requireRole, AuthError } from '@/lib/auth/guards';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('team', 'admin');
    const { id } = await params;
    const supabase = createServiceClient();

    const { data: notes, error } = await supabase
      .from('lead_notes')
      .select('id, lead_id, author_id, author_name, content, note_type, created_at')
      .eq('lead_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Lead notes fetch error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to fetch notes', 500);
    }

    return NextResponse.json({
      notes: (notes ?? []).map((n) => ({
        id: n.id as string,
        leadId: n.lead_id as string,
        authorId: n.author_id as string | null,
        authorName: n.author_name as string,
        content: n.content as string,
        noteType: n.note_type as string,
        createdAt: n.created_at as string,
      })),
    });
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('GET /api/admin/leads/[id]/notes error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to fetch notes', 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole('team', 'admin');
    const { id } = await params;
    const supabase = createServiceClient();
    const body = await parseBody(request, addLeadNoteSchema);

    const authorName =
      (session.user.user_metadata?.full_name as string) ??
      session.user.email ??
      'Team';

    const { data: note, error } = await supabase
      .from('lead_notes')
      .insert({
        lead_id: id,
        author_id: session.user.id,
        author_name: authorName,
        content: body.content,
        note_type: body.noteType,
      })
      .select('id, lead_id, author_id, author_name, content, note_type, created_at')
      .single();

    if (error) {
      console.error('Lead note insert error:', error);
      return errorResponse('INTERNAL_ERROR', 'Failed to add note', 500);
    }

    return NextResponse.json(
      {
        id: note.id as string,
        leadId: note.lead_id as string,
        authorId: note.author_id as string | null,
        authorName: note.author_name as string,
        content: note.content as string,
        noteType: note.note_type as string,
        createdAt: note.created_at as string,
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof NextResponse) return err;
    if (err instanceof AuthError) {
      const status = err.code === 'UNAUTHORIZED' ? 401 : 403;
      return errorResponse(err.code, err.message, status);
    }
    console.error('POST /api/admin/leads/[id]/notes error:', err);
    return errorResponse('INTERNAL_ERROR', 'Failed to add note', 500);
  }
}
