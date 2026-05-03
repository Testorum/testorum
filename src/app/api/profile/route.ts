// ============================================================
// src/app/api/profile/route.ts
// 프로필 수정 API — display_name + avatar_url
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Tori avatars whitelist (XSS prevention)
const ALLOWED_AVATARS = new Set([
  '/tori/celebrating.png',
  '/tori/curious.png',
  '/tori/excited.png',
  '/tori/happy.png',
  '/tori/sad.png',
  '/tori/smug.png',
  '/tori/surprised.png',
  '/tori/thinking.png',
]);

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const { display_name, avatar_url } = body as Record<string, unknown>;

    // Validate display_name
    if (display_name !== undefined) {
      if (typeof display_name !== 'string') {
        return NextResponse.json({ error: 'display_name must be a string' }, { status: 400 });
      }
      const trimmed = display_name.trim();
      if (trimmed.length < 1 || trimmed.length > 30) {
        return NextResponse.json({ error: 'display_name must be 1-30 characters' }, { status: 400 });
      }
      // Basic XSS sanitization
      if (/<[^>]*>/.test(trimmed)) {
        return NextResponse.json({ error: 'display_name contains invalid characters' }, { status: 400 });
      }
    }

    // Validate avatar_url — must be null or a whitelisted path
    if (avatar_url !== undefined && avatar_url !== null) {
      if (typeof avatar_url !== 'string' || !ALLOWED_AVATARS.has(avatar_url)) {
        return NextResponse.json({ error: 'Invalid avatar selection' }, { status: 400 });
      }
    }

    // Build update object
    const updates: Record<string, unknown> = {};
    if (display_name !== undefined) {
      updates.display_name = (display_name as string).trim();
    }
    if (avatar_url !== undefined) {
      updates.avatar_url = avatar_url;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (updateError) {
      logger.error('api/profile', updateError, { user_id: user.id });
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('api/profile', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
