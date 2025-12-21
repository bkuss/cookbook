'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Ingredient, RecipeInput } from '@/lib/types/recipe';
import { SparklesIcon } from 'lucide-react';
import { useState } from 'react';

interface RefineDialogProps {
  recipe: {
    title: string;
    servings: number;
    ingredients: Omit<Ingredient, 'id' | 'sortOrder'>[];
    instructions: string;
  };
  onRefine: (refinedRecipe: RecipeInput) => void;
}

export function RefineDialog({ recipe, onRefine }: RefineDialogProps) {
  const [open, setOpen] = useState(false);
  const [userRequest, setUserRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleRefine() {
    if (!userRequest.trim()) {
      setError('Bitte gib eine Anweisung ein');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/recipes/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipe: {
            title: recipe.title,
            servings: recipe.servings,
            ingredients: recipe.ingredients.filter((ing) => ing.name.trim()),
            instructions: recipe.instructions,
          },
          userRequest: userRequest.trim(),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Ein Fehler ist aufgetreten');
        return;
      }

      onRefine(result);
      setOpen(false);
      setUserRequest('');
    } catch {
      setError('Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <SparklesIcon className="size-4 mr-2" />
          Mit KI anpassen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rezept mit KI anpassen</DialogTitle>
          <DialogDescription>
            Beschreibe, wie das Rezept angepasst werden soll.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="userRequest">Anweisung</Label>
            <Textarea
              id="userRequest"
              placeholder="z.B. Mach das Rezept vegan, verdopple die Portionen, ersetze Butter durch Olivenöl..."
              value={userRequest}
              onChange={(e) => setUserRequest(e.target.value)}
              rows={4}
              disabled={loading}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Abbrechen
          </Button>
          <Button type="button" onClick={handleRefine} disabled={loading || !userRequest.trim()}>
            {loading ? 'Wird angepasst...' : 'Anpassen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
