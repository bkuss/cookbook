import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { isPinConfigured } from '@/lib/db/queries/settings';

export async function GET() {
  try {
    const [isAuthenticated, pinConfigured] = await Promise.all([
      verifySession(),
      isPinConfigured(),
    ]);

    return NextResponse.json({
      authenticated: isAuthenticated,
      pinConfigured,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Status konnte nicht abgerufen werden' },
      { status: 500 }
    );
  }
}
