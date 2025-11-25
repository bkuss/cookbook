'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function SettingsPage() {
  const router = useRouter();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleChangePin(e: React.FormEvent) {
    e.preventDefault();

    if (newPin.length < 4) {
      toast.error('PIN muss mindestens 4 Zeichen haben');
      return;
    }

    if (newPin !== confirmPin) {
      toast.error('PINs stimmen nicht überein');
      return;
    }

    setLoading(true);

    try {
      // First verify current PIN
      const verifyRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: currentPin }),
      });

      if (!verifyRes.ok) {
        toast.error('Aktueller PIN ist falsch');
        return;
      }

      // Then set new PIN (we need a new endpoint for this)
      const changeRes = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin }),
      });

      if (!changeRes.ok) {
        const data = await changeRes.json();
        toast.error(data.error || 'Fehler beim Ändern des PINs');
        return;
      }

      toast.success('PIN erfolgreich geändert');
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
    } catch {
      toast.error('Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Fehler beim Abmelden');
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Einstellungen" />

      <main className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>PIN ändern</CardTitle>
            <CardDescription>
              Ändere den PIN für dein Familienkochbuch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPin">Aktueller PIN</Label>
                <Input
                  id="currentPin"
                  type="password"
                  inputMode="numeric"
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPin">Neuer PIN</Label>
                <Input
                  id="newPin"
                  type="password"
                  inputMode="numeric"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  minLength={4}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPin">PIN bestätigen</Label>
                <Input
                  id="confirmPin"
                  type="password"
                  inputMode="numeric"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  minLength={4}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? 'Speichern...' : 'PIN ändern'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Abmelden</CardTitle>
            <CardDescription>
              Melde dich von diesem Gerät ab
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleLogout} disabled={loggingOut}>
              {loggingOut ? 'Abmelden...' : 'Abmelden'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Über</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Familienrezepte v1.0
            </p>
            <p className="text-sm text-muted-foreground">
              Dein digitales Familienkochbuch
            </p>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
