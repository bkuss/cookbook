export interface Ingredient {
  id?: number;
  name: string;
  amount: number | null;
  unit: string | null;
  sortOrder?: number;
}

export interface Recipe {
  id: string;
  title: string;
  instructions: string;
  servings: number;
  imageData: string | null;
  sourceUrl: string | null;
  ingredients: Ingredient[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeInput {
  title: string;
  instructions: string;
  servings: number;
  imageData?: string | null;
  sourceUrl?: string | null;
  ingredients: Omit<Ingredient, 'id' | 'sortOrder'>[];
}

export interface RecipeListItem {
  id: string;
  title: string;
  imageData: string | null;
  servings: number;
  createdAt: Date;
}
