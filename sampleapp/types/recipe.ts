export interface Recipe {
  id: string;
  userId: string;
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  cuisine: string; // e.g., "Filipino", "Italian", "Fusion"
  category: string; // e.g., "Main Course", "Dessert", "Snack"
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[]; // e.g., ["spicy", "vegetarian", "quick"]
  isFavorite: boolean;
  isGenerated: boolean; // true if AI-generated, false if user-created
  sourceIngredients: string[]; // original ingredients used for generation
  createdAt: Date;
  updatedAt: Date;
}

export interface RecipeGenerationRequest {
  ingredients: string[];
  preferences?: {
    cuisine?: string;
    category?: string;
    difficulty?: string;
    maxPrepTime?: number;
    dietary?: string[]; // e.g., ["vegetarian", "gluten-free"]
  };
}

export interface RecipeGenerationResponse {
  success: boolean;
  recipe?: Omit<Recipe, "id" | "userId" | "createdAt" | "updatedAt">;
  error?: string;
  usageLimit?: {
    current: number;
    limit: number;
    hasHitLimit: boolean;
  };
}

export interface SavedRecipesList {
  recipes: Recipe[];
  totalCount: number;
  lastUpdated: Date;
}

// For Filipino cuisine bias
export const FILIPINO_CUISINES = ["Filipino", "Kapampangan", "Ilocano", "Bicolano", "Visayan", "Mindanaoan"] as const;

export const RECIPE_CATEGORIES = ["Breakfast", "Main Course", "Side Dish", "Soup", "Dessert", "Snack", "Beverage", "Appetizer"] as const;

export const COMMON_FILIPINO_TAGS = ["rice-based", "coconut", "seafood", "pork", "chicken", "vegetable", "noodles", "street-food", "festival-food", "comfort-food"] as const;
