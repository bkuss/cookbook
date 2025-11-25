import { NextResponse } from 'next/server';
import { verifyPin, hashPin } from '@/lib/auth/pin';
import { getSetting, setSetting } from '@/lib/db/queries/settings';

export async function POST(request: Request) {
  try {
    const { currentPin, newPin } = await request.json();

    if (!currentPin || !newPin) {
      return NextResponse.json(
        { error: 'Beide PINs sind erforderlich' },
        { status: 400 }
      );
    }

    if (newPin.length < 4) {
      return NextResponse.json(
        { error: 'Neuer PIN muss mindestens 4 Zeichen haben' },
        { status: 400 }
      );
    }

    // Verify current PIN
    const storedHash = await getSetting('pin_hash');
    if (!storedHash) {
      return NextResponse.json(
        { error: 'PIN nicht konfiguriert' },
        { status: 400 }
      );
    }

    const isValid = await verifyPin(currentPin, storedHash);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Aktueller PIN ist falsch' },
        { status: 401 }
      );
    }

    // Hash and save new PIN
    const newHash = await hashPin(newPin);
    await setSetting('pin_hash', newHash);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change PIN error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Ändern des PINs' },
      { status: 500 }
    );
  }
}
