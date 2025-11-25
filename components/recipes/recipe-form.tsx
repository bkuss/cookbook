'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IngredientInput } from './ingredient-input';
import { ImageUpload } from './image-upload';
import type { Recipe, RecipeInput, Ingredient } from '@/lib/types/recipe';

interface RecipeFormProps {
  recipe?: Recipe;
  onSubmit?: (recipe: Recipe) => void;
}

export function RecipeForm({ recipe, onSubmit }: RecipeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState(recipe?.title || '');
  // Strip numbered list formatting for editing
  const [instructions, setInstructions] = useState(() => {
    if (!recipe?.instructions) return '';
    return recipe.instructions
      .split('\n')
      .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter((line) => line.length > 0)
      .join('\n');
  });
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [sourceUrl, setSourceUrl] = useState(recipe?.sourceUrl || '');
  const [imageData, setImageData] = useState<string | null>(recipe?.imageData || null);
  const [ingredients, setIngredients] = useState<Omit<Ingredient, 'id' | 'sortOrder'>[]>(
    recipe?.ingredients.map(({ name, amount, unit }) => ({ name, amount, unit })) || [
      { name: '', amount: null, unit: null },
    ]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const validIngredients = ingredients.filter((ing) => ing.name.trim());

    if (validIngredients.length === 0) {
      setError('Mindestens eine Zutat ist erforderlich');
      setLoading(false);
      return;
    }

    // Convert plain text lines to markdown numbered list
    const formattedInstructions = instructions
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line, i) => {
        // If line already starts with a number and dot/paren, keep it
        if (/^\d+[\.\)]\s/.test(line)) {
          return line.replace(/^\d+[\.\)]\s*/, `${i + 1}. `);
        }
        return `${i + 1}. ${line}`;
      })
      .join('\n');

    const data: RecipeInput = {
      title: title.trim(),
      instructions: formattedInstructions,
      servings,
      sourceUrl: sourceUrl.trim() || null,
      imageData,
      ingredients: validIngredients,
    };

    try {
      const isUpdate = Boolean(recipe?.id);
      const url = isUpdate ? `/api/recipes/${recipe!.id}` : '/api/recipes';
      const method = isUpdate ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Ein Fehler ist aufgetreten');
        return;
      }

      if (onSubmit) {
        onSubmit(result);
      } else {
        router.push(`/recipes/${result.id}`);
        router.refresh();
      }
    } catch {
      setError('Verbindungsfehler');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Titel</Label>
        <Input
          id="title"
          placeholder="Name des Rezepts"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <ImageUpload
        value={imageData}
        onChange={setImageData}
        title={title}
        ingredients={ingredients.filter((ing) => ing.name.trim())}
      />

      <div className="space-y-2">
        <Label htmlFor="servings">Portionen</Label>
        <Input
          id="servings"
          type="number"
          min="1"
          value={servings}
          onChange={(e) => setServings(parseInt(e.target.value) || 1)}
          className="w-24"
        />
      </div>

      <IngredientInput ingredients={ingredients} onChange={setIngredients} />

      <div className="space-y-2">
        <Label htmlFor="instructions">Zubereitung</Label>
        <p className="text-sm text-muted-foreground">
          Schreibe jeden Schritt in eine neue Zeile. Die Nummerierung erfolgt automatisch.
        </p>
        <Textarea
          id="instructions"
          placeholder={"Zwiebeln würfeln und anbraten\nKnoblauch hinzufügen\nMit Brühe ablöschen\n..."}
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={8}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceUrl">Quelle (optional)</Label>
        <Input
          id="sourceUrl"
          type="url"
          placeholder="https://..."
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Speichern...' : recipe?.id ? 'Aktualisieren' : 'Rezept erstellen'}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
