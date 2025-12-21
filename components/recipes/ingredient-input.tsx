'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Ingredient } from '@/lib/types/recipe';
import { cn } from '@/lib/utils';
import { isValidAmount } from '@/lib/utils/amount';
import isEqual from 'fast-deep-equal';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type IngredientBase = Omit<Ingredient, 'id' | 'sortOrder'>;
type IngredientWithId = IngredientBase & { _id: string };
type IngredientField = 'name' | 'amount' | 'unit';

const highlightClass = 'bg-yellow-50 dark:bg-yellow-900/20 ring-1 ring-yellow-200 dark:ring-yellow-800';

// crypto.randomUUID() requires secure context (HTTPS). Fallback for HTTP deployments.
function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

interface IngredientInputProps {
  ingredients: IngredientBase[];
  onChange: (ingredients: IngredientBase[]) => void;
  highlightedFields?: Map<number, Set<IngredientField>>;
  onHighlightClear?: (index: number, field: IngredientField) => void;
}

function addIds(ingredients: IngredientBase[]): IngredientWithId[] {
  return ingredients.map((ing) => ({ ...ing, _id: generateId() }));
}

function stripIds(ingredients: IngredientWithId[]): IngredientBase[] {
  return ingredients.map(({ _id: _, ...rest }) => rest);
}

interface IngredientRowProps {
  ingredient: IngredientWithId;
  index: number;
  onUpdate: (id: string, field: keyof IngredientBase, value: string | null) => void;
  onRemove: (id: string) => void;
  isAmountInvalid: (amount: string | null) => boolean;
  highlightedFields?: Set<IngredientField>;
  onHighlightClear?: (field: IngredientField) => void;
}

function IngredientRow({
  ingredient,
  onUpdate,
  onRemove,
  isAmountInvalid,
  highlightedFields,
  onHighlightClear,
}: IngredientRowProps) {
  const controls = useDragControls();

  function handleFieldChange(field: IngredientField, value: string | null) {
    onUpdate(ingredient._id, field, value);
    if (highlightedFields?.has(field)) {
      onHighlightClear?.(field);
    }
  }

  return (
    <Reorder.Item
      value={ingredient}
      dragListener={false}
      dragControls={controls}
      className="flex gap-2 items-start bg-background"
    >
      <div
        className="cursor-grab active:cursor-grabbing shrink-0 text-muted-foreground py-2 touch-none"
        onPointerDown={(e) => controls.start(e)}
      >
        <GripVertical size={18} />
      </div>
      <Input
        placeholder="Menge"
        type="text"
        inputMode="decimal"
        className={cn(
          'w-[72px] sm:w-20',
          isAmountInvalid(ingredient.amount) && 'border-destructive focus-visible:ring-destructive',
          highlightedFields?.has('amount') && highlightClass
        )}
        value={ingredient.amount ?? ''}
        onChange={(e) => handleFieldChange('amount', e.target.value || null)}
      />
      <Input
        placeholder="Einheit"
        className={cn('w-[72px] sm:w-20', highlightedFields?.has('unit') && highlightClass)}
        value={ingredient.unit ?? ''}
        onChange={(e) => handleFieldChange('unit', e.target.value || null)}
      />
      <Input
        placeholder="Zutat (z.B. Mehl)"
        className={cn('flex-1', highlightedFields?.has('name') && highlightClass)}
        value={ingredient.name}
        onChange={(e) => handleFieldChange('name', e.target.value)}
        required
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="shrink-0 text-destructive hover:text-destructive"
        onClick={() => onRemove(ingredient._id)}
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
    </Reorder.Item>
  );
}

export function IngredientInput({
  ingredients,
  onChange,
  highlightedFields,
  onHighlightClear,
}: IngredientInputProps) {
  const [items, setItems] = useState<IngredientWithId[]>(() => addIds(ingredients));
  const lastEmittedRef = useRef<IngredientBase[]>(ingredients);

  // Sync when parent changes ingredients (e.g., AI extraction)
  // Guard condition prevents cascading renders - only updates on external changes
  useEffect(() => {
    if (!isEqual(ingredients, lastEmittedRef.current)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setItems(addIds(ingredients));
      lastEmittedRef.current = ingredients;
    }
  }, [ingredients]);

  function emitChange(newItems: IngredientWithId[]) {
    const stripped = stripIds(newItems);
    lastEmittedRef.current = stripped;
    onChange(stripped);
  }

  function addIngredient() {
    const newItems = [...items, { name: '', amount: null, unit: null, _id: generateId() }];
    setItems(newItems);
    emitChange(newItems);
  }

  function removeIngredient(id: string) {
    const newItems = items.filter((item) => item._id !== id);
    setItems(newItems);
    emitChange(newItems);
  }

  function updateIngredient(id: string, field: keyof IngredientBase, value: string | null) {
    const newItems = items.map((item) =>
      item._id === id ? { ...item, [field]: value } : item
    );
    setItems(newItems);
    emitChange(newItems);
  }

  function handleReorder(newItems: IngredientWithId[]) {
    setItems(newItems);
    emitChange(newItems);
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

      {items.length === 0 && (
        <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
          Noch keine Zutaten. Klicke auf &quot;+ Zutat&quot; um eine hinzuzufügen.
        </p>
      )}

      <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-2">
        {items.map((ingredient, index) => (
          <IngredientRow
            key={ingredient._id}
            ingredient={ingredient}
            index={index}
            onUpdate={updateIngredient}
            onRemove={removeIngredient}
            isAmountInvalid={isAmountInvalid}
            highlightedFields={highlightedFields?.get(index)}
            onHighlightClear={
              onHighlightClear ? (field) => onHighlightClear(index, field) : undefined
            }
          />
        ))}
      </Reorder.Group>
    </div>
  );
}
