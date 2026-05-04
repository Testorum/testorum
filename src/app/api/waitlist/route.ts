import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { logger } from '@/lib/logger';

/**
 * POST /api/waitlist
 *
 * Register an email for a feature waitlist.
 * Body: { email: string, feature?: string }
 */
export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { email, feature } = body as { email?: string; feature?: string };

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed) || trimmed.length > 254) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate feature
    const featureValue = (typeof feature === 'string' && feature.trim()) || 'creator';
    const allowedFeatures = ['creator', 'premium', 'general'];
    if (!allowedFeatures.includes(featureValue)) {
      return NextResponse.json(
        { error: 'Invalid feature' },
        { status: 400 }
      );
    }

    // Insert into waitlist (UNIQUE constraint on email handles duplicates)
    const supabase = await createServerClient();
    const { error } = await (supabase as any)
      .from('waitlist')
      .insert({ email: trimmed, feature: featureValue });

    if (error) {
      // Unique constraint violation = already registered
      if (error.code === '23505') {
        return NextResponse.json(
          { success: true, duplicate: true },
          { status: 200 }
        );
      }
      logger.error('API/waitlist', error, { email: trimmed });
      return NextResponse.json(
        { error: 'Failed to register' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, duplicate: false },
      { status: 201 }
    );
  } catch (error) {
    logger.error('API/waitlist/unhandled', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
