import { NextResponse } from 'next/server';
import { generateRecipeImage } from '@/lib/replicate/client';
import { requireAuth } from '@/lib/auth/session';

export async function POST(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  try {
    const { title, ingredients } = await request.json();

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Titel ist erforderlich' },
        { status: 400 }
      );
    }

    const ingredientNames = Array.isArray(ingredients)
      ? ingredients.map((ing: { name?: string } | string) =>
          typeof ing === 'string' ? ing : ing.name || ''
        ).filter(Boolean)
      : [];

    const imageBuffer = await generateRecipeImage(title, ingredientNames);

    // Convert buffer to base64 data URL
    const base64 = imageBuffer.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({
      success: true,
      imageData: dataUrl,
    });
  } catch (error) {
    console.error('Image generation error:', error);

    return NextResponse.json(
      {
        error: 'Fehler beim Generieren des Bildes',
        code: 'GENERATION_FAILED',
      },
      { status: 500 }
    );
  }
}
