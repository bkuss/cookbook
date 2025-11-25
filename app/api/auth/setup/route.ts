import { NextResponse } from 'next/server';
import { hashPin } from '@/lib/auth/pin';
import { createSession, setSessionCookie } from '@/lib/auth/session';
import { getSetting, setSetting } from '@/lib/db/queries/settings';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin || typeof pin !== 'string' || pin.length < 4) {
      return NextResponse.json(
        { error: 'PIN muss mindestens 4 Zeichen haben' },
        { status: 400 }
      );
    }

    // Check if PIN already exists
    const existingPin = await getSetting('pin_hash');
    if (existingPin) {
      return NextResponse.json(
        { error: 'PIN ist bereits konfiguriert' },
        { status: 400 }
      );
    }

    // Hash and store the PIN
    const hashedPin = await hashPin(pin);
    await setSetting('pin_hash', hashedPin);

    // Create session
    const token = await createSession();
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Einrichten des PINs' },
      { status: 500 }
    );
  }
}
