'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Ingredient } from '@/lib/types/recipe';
import { isValidAmount } from '@/lib/utils/amount';
import { cn } from '@/lib/utils';

interface IngredientInputProps {
  ingredients: Omit<Ingredient, 'id' | 'sortOrder'>[];
  onChange: (ingredients: Omit<Ingredient, 'id' | 'sortOrder'>[]) => void;
}

export function IngredientInput({ ingredients, onChange }: IngredientInputProps) {
  function addIngredient() {
    onChange([...ingredients, { name: '', amount: null, unit: null }]);
  }

  function removeIngredient(index: number) {
    onChange(ingredients.filter((_, i) => i !== index));
  }

  function updateIngredient(index: number, field: keyof Omit<Ingredient, 'id' | 'sortOrder'>, value: string | null) {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  }

  function isAmountInvalid(amount: string | null): boolean {
    return amount !== null && amount !== '' && !isValidAmount(amount);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Zutaten</label>
        <Button type="button" variant="outline" size="sm" onClick={addIngredient}>
          + Zutat
        </Button>
      </div>

      {ingredients.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
          Noch keine Zutaten. Klicke auf &quot;+ Zutat&quot; um eine hinzuzufügen.
        </p>
      )}

      <div className="space-y-2">
        {ingredients.map((ingredient, index) => (
          <div key={index} className="flex gap-2 items-start">
            <Input
              placeholder="Menge"
              type="text"
              inputMode="decimal"
              className={cn(
                'w-20',
                isAmountInvalid(ingredient.amount) && 'border-destructive focus-visible:ring-destructive'
              )}
              value={ingredient.amount ?? ''}
              onChange={(e) =>
                updateIngredient(index, 'amount', e.target.value || null)
              }
            />
            <Input
              placeholder="Einheit"
              className="w-20"
              value={ingredient.unit ?? ''}
              onChange={(e) =>
                updateIngredient(index, 'unit', e.target.value || null)
              }
            />
            <Input
              placeholder="Zutat (z.B. Mehl)"
              className="flex-1"
              value={ingredient.name}
              onChange={(e) => updateIngredient(index, 'name', e.target.value)}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 text-destructive hover:text-destructive"
              onClick={() => removeIngredient(index)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
