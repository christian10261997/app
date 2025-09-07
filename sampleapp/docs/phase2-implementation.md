# Phase 2 Implementation Guide

## Implementation Order

### Step 1: Recipe Data Structure Setup ✅

- [x] Create recipe TypeScript interfaces
- [x] Define Firestore collection structure
- [x] Set up recipe constants and enums

### Step 2: Free Recipe Generation Service

```typescript
// Priority implementation order:
1. Hugging Face API integration (free tier)
2. Local Filipino recipe database fallback
3. Recipe generation hook with error handling
```

### Step 3: Recipe Storage & Management

```typescript
// Core CRUD operations:
1. Save generated recipes to Firestore
2. Load user's saved recipes
3. Recipe search and filtering
4. Favorite/unfavorite functionality
```

### Step 4: Enhanced UI Components

```typescript
// Component development order:
1. Recipe card component (list/grid view)
2. Recipe generator interface
3. Recipe details view
4. Enhanced ingredients input with autocomplete
```

### Step 5: Dashboard Integration

```typescript
// Replace current home tab with:
1. Recipe dashboard with saved recipes
2. Quick recipe generation
3. Search and filter controls
```

## Free API Implementation Strategy

### Hugging Face Integration (Primary)

```typescript
// services/huggingFaceAPI.ts
const HUGGING_FACE_CONFIG = {
  baseURL: "https://api-inference.huggingface.co/models",
  model: "microsoft/DialoGPT-medium",
  token: process.env.HUGGING_FACE_TOKEN || "", // Free tier
  maxTokens: 500,
};

const generateRecipePrompt = (ingredients: string[]) => `
Create a Filipino recipe using: ${ingredients.join(", ")}.
Include: recipe name, ingredients list, cooking instructions, prep time, cook time.
Format as JSON with fields: name, ingredients, instructions, prepTime, cookTime, servings.
Favor Filipino cuisine (adobo, sinigang, lumpia style dishes).
`;
```

### Local Fallback Database

```json
// data/filipino-recipes.json
{
  "recipes": [
    {
      "name": "Chicken Adobo",
      "baseIngredients": ["chicken", "soy sauce", "vinegar"],
      "instructions": ["Marinate chicken...", "Cook until tender..."],
      "cuisine": "Filipino",
      "difficulty": "Easy"
    }
  ]
}
```

## Database Schema

### Firestore Collections

```javascript
// Collection: recipes
{
  id: "auto-generated",
  userId: "firebase-auth-uid",
  name: "Adobong Manok",
  ingredients: ["1 kg chicken", "1/2 cup soy sauce", "1/4 cup vinegar"],
  instructions: ["Step 1: Marinate...", "Step 2: Cook..."],
  prepTime: 15,
  cookTime: 45,
  servings: 4,
  cuisine: "Filipino",
  category: "Main Course",
  difficulty: "Easy",
  tags: ["comfort-food", "rice-dish"],
  isFavorite: false,
  isGenerated: true,
  sourceIngredients: ["chicken", "soy sauce", "vinegar"],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

## Hook Implementation

### useRecipeGenerator Hook

```typescript
// hooks/useRecipeGenerator.ts
export function useRecipeGenerator() {
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuthContext();

  const generateRecipe = async (request: RecipeGenerationRequest) => {
    setIsGenerating(true);
    try {
      // Try Hugging Face API first
      const result = await huggingFaceAPI.generateRecipe(request);
      if (result.success) return result;

      // Fallback to local database
      return await localRecipeDB.findMatch(request.ingredients);
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsGenerating(false);
    }
  };

  const saveRecipe = async (recipe: Omit<Recipe, "id" | "userId" | "createdAt" | "updatedAt">) => {
    if (!user) return { success: false, error: "User not authenticated" };

    const recipeData = {
      ...recipe,
      userId: user.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await addDocument("recipes", recipeData);
  };

  return {
    generateRecipe,
    savedRecipes,
    isGenerating,
    saveRecipe,
    loadUserRecipes,
    deleteRecipe,
    toggleFavorite,
  };
}
```

## Component Structure

### Recipe Card Component

```typescript
// components/recipe/RecipeCard.tsx
interface RecipeCardProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  onFavorite: (recipeId: string) => void;
  onDelete: (recipeId: string) => void;
}

export function RecipeCard({ recipe, onPress, onFavorite, onDelete }: RecipeCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(recipe)}>
      <Text style={styles.recipeName}>{recipe.name}</Text>
      <Text style={styles.cuisine}>
        {recipe.cuisine} • {recipe.difficulty}
      </Text>
      <Text style={styles.time}>⏱️ {recipe.prepTime + recipe.cookTime} min</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onFavorite(recipe.id)}>
          <Ionicons name={recipe.isFavorite ? "heart" : "heart-outline"} size={24} color={recipe.isFavorite ? "red" : "gray"} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
```

### Recipe Generator Interface

```typescript
// components/recipe/RecipeGenerator.tsx
export function RecipeGenerator() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<RecipeGenerationRequest["preferences"]>({});
  const { generateRecipe, isGenerating, saveRecipe } = useRecipeGenerator();

  const handleGenerate = async () => {
    const result = await generateRecipe({ ingredients, preferences });
    if (result.success && result.recipe) {
      // Show recipe preview
      // Option to save recipe
      await saveRecipe(result.recipe);
    }
  };

  return (
    <View style={styles.container}>
      <IngredientsInput ingredients={ingredients} onIngredientsChange={setIngredients} />
      <PreferencesSelector preferences={preferences} onPreferencesChange={setPreferences} />
      <TouchableOpacity style={styles.generateButton} onPress={handleGenerate} disabled={isGenerating || ingredients.length === 0}>
        <Text style={styles.buttonText}>{isGenerating ? "Generating..." : "Generate Recipe"}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

## Implementation Checklist

### Phase 2A: Core Recipe System

- [ ] Create recipe types and interfaces
- [ ] Implement Hugging Face API integration
- [ ] Create local recipe fallback database
- [ ] Build recipe generation hook
- [ ] Implement recipe CRUD operations

### Phase 2B: UI Components

- [ ] Recipe card component
- [ ] Recipe generator interface
- [ ] Recipe details view
- [ ] Enhanced ingredients input
- [ ] Search and filter components

### Phase 2C: Dashboard Integration

- [ ] Replace home tab with recipe dashboard
- [ ] Implement recipe listing with pagination
- [ ] Add search and filter functionality
- [ ] Integrate recipe generation flow

### Phase 2D: Filipino Cuisine Features

- [ ] Implement 70/30 Filipino bias in generation
- [ ] Add Filipino ingredient suggestions
- [ ] Create Filipino recipe categories
- [ ] Add common Filipino cooking terms

## Testing Strategy

1. **API Testing**: Test Hugging Face integration with various ingredients
2. **Fallback Testing**: Ensure local database works when API fails
3. **UI Testing**: Test recipe generation and saving flow
4. **Data Validation**: Verify recipe data structure and storage
5. **Performance**: Test with large recipe collections

## Next Steps After Documentation

1. Start with recipe type definitions (already created)
2. Implement Hugging Face API service
3. Create local Filipino recipe database
4. Build recipe generation hook
5. Create basic recipe UI components

Ready to begin implementation? 🚀
