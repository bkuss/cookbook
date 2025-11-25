import { NextResponse } from 'next/server';
import { verifyPin } from '@/lib/auth/pin';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { getSetting } from '@/lib/db/queries/settings';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { error: 'PIN erforderlich' },
        { status: 400 }
      );
    }

    const storedHash = await getSetting('pin_hash');
    if (!storedHash) {
      return NextResponse.json(
        { error: 'PIN nicht konfiguriert', needsSetup: true },
        { status: 400 }
      );
    }

    const isValid = await verifyPin(pin, storedHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Falscher PIN' },
        { status: 401 }
      );
    }

    const token = await createSession();
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Anmeldung fehlgeschlagen' },
      { status: 500 }
    );
  }
}
