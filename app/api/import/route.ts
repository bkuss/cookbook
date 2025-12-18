import { createRecipe, recipeExistsByTitle } from '@/lib/db/queries/recipes';
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { isValidAmount } from '@/lib/utils/amount';

interface ImportIngredient {
  name: string;
  amount: string | number | null;
  unit: string | null;
}

interface ImportRecipe {
  title: string;
  instructions: string;
  servings: number;
  imageData?: string | null;
  sourceUrl?: string | null;
  ingredients: ImportIngredient[];
}

interface ImportData {
  version: number;
  exportedAt?: string;
  recipes: ImportRecipe[];
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

function validateImportData(data: unknown): data is ImportData {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== 'number') return false;
  if (!Array.isArray(obj.recipes)) return false;

  for (const recipe of obj.recipes) {
    if (!recipe || typeof recipe !== 'object') return false;
    const r = recipe as Record<string, unknown>;
    if (typeof r.title !== 'string' || !r.title.trim()) return false;
    if (typeof r.instructions !== 'string') return false;
    if (typeof r.servings !== 'number') return false;
    if (!Array.isArray(r.ingredients)) return false;

    for (const ing of r.ingredients) {
      if (!ing || typeof ing !== 'object') return false;
      const i = ing as Record<string, unknown>;
      if (typeof i.name !== 'string' || !i.name.trim()) return false;
      // Validate amount: allow null, numbers, or valid amount strings
      if (i.amount !== null && i.amount !== undefined) {
        if (typeof i.amount === 'string' && !isValidAmount(i.amount)) return false;
        if (typeof i.amount !== 'string' && typeof i.amount !== 'number') return false;
      }
    }
  }

  return true;
}

export async function POST(req: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const data = await req.json();

    if (!validateImportData(data)) {
      return NextResponse.json(
        { error: 'Ungültiges Dateiformat' },
        { status: 400 }
      );
    }

    const result: ImportResult = {
      imported: 0,
      skipped: 0,
      errors: [],
    };

    for (const recipe of data.recipes) {
      try {
        const exists = await recipeExistsByTitle(recipe.title);

        if (exists) {
          result.skipped++;
          continue;
        }

        await createRecipe({
          title: recipe.title,
          instructions: recipe.instructions,
          servings: recipe.servings,
          imageData: recipe.imageData || null,
          sourceUrl: recipe.sourceUrl || null,
          ingredients: recipe.ingredients.map((ing) => {
            // Convert number to string for backward compatibility
            let amount: string | null = null;
            if (typeof ing.amount === 'number') {
              amount = Number.isInteger(ing.amount)
                ? ing.amount.toString()
                : ing.amount.toString().replace(/\.?0+$/, '');
            } else if (typeof ing.amount === 'string') {
              amount = ing.amount;
            }
            return {
              name: ing.name,
              amount,
              unit: ing.unit,
            };
          }),
        });

        result.imported++;
      } catch (error) {
        console.error(`Error importing recipe "${recipe.title}":`, error);
        result.errors.push(`Fehler bei "${recipe.title}"`);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error importing recipes:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
