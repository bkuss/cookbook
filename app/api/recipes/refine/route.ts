import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';
import { refineRecipe, type RefineRecipeInput } from '@/lib/replicate/client';

interface RefineRequest {
  recipe: RefineRecipeInput;
  userRequest: string;
}

export async function POST(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const body: RefineRequest = await request.json();

    if (!body.recipe) {
      return NextResponse.json(
        { error: 'Rezept ist erforderlich' },
        { status: 400 }
      );
    }

    if (!body.userRequest || !body.userRequest.trim()) {
      return NextResponse.json(
        { error: 'Anweisung ist erforderlich' },
        { status: 400 }
      );
    }

    const refinedRecipe = await refineRecipe(body.recipe, body.userRequest.trim());

    return NextResponse.json(refinedRecipe);
  } catch (error) {
    console.error('Error refining recipe:', error);
    return NextResponse.json(
      { error: 'Rezept konnte nicht angepasst werden' },
      { status: 500 }
    );
  }
}
