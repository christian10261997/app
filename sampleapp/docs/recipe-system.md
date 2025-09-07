# Recipe System Documentation

## Overview

KitchenPal's recipe system provides AI-powered recipe generation from user ingredients with a 70% Filipino cuisine bias, using Hugging Face API with intelligent fallback to a local recipe database.

## Data Structure

### Recipe Interface

```typescript
interface Recipe {
  id: string;
  userId: string;
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  cuisine: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  isFavorite: boolean;
  isGenerated: boolean; // AI vs user-created
  sourceIngredients: string[]; // original input ingredients
  createdAt: Date;
  updatedAt: Date;
}
```

````

_Note: Nutritional information is optional and basic. Focus is on AI recipe generation quality._

## Recipe Generation System

### 1. Free API Strategy

**Primary: Hugging Face Inference API**

- Model: `microsoft/DialoGPT-medium` (primary choice)
- Cost: Free tier (30,000 characters/month)
- Features: AI-powered creative recipe generation
- Backup: Local recipe database for reliable offline support

**Fallback: Local Recipe Database**

- Curated Filipino recipes (200+ recipes)
- Ingredient-based matching algorithm
- Always available offline

### 2. Filipino Cuisine Bias (70/30 Rule)

```typescript
const FILIPINO_BIAS_PROMPT = `
Generate a recipe using these ingredients: {ingredients}
Priority: 70% Filipino/Southeast Asian cuisine, 30% international
Include traditional Filipino cooking methods and flavor profiles.
Common Filipino ingredients to suggest: coconut milk, fish sauce, soy sauce, vinegar, rice, etc.
`;
````

### 3. Generation Flow

```
User Ingredients → Validate Input → Generate Recipe (API/Local) → Post-process → Save to Firestore
```

## Storage Structure

### Firestore Collections

**Collection: `recipes`**

```javascript
{
  // Document ID: auto-generated
  userId: "string", // Firebase Auth UID
  name: "Adobong Manok",
  ingredients: ["chicken", "soy sauce", "vinegar", "garlic"],
  instructions: ["Step 1...", "Step 2..."],
  cuisine: "Filipino",
  category: "Main Course",
  difficulty: "Easy",
  isGenerated: true,
  sourceIngredients: ["chicken", "garlic", "onion"],
  // ... other fields
}
```

**Collection: `user_preferences`**

```javascript
{
  userId: "string",
  favoriteCuisines: ["Filipino", "Italian"],
  dietaryRestrictions: ["vegetarian"],
  preferredDifficulty: "Easy",
  defaultServings: 4
}
```

## Key Features

### 1. Recipe Generation

**Input Processing:**

- Ingredient validation and normalization
- Duplicate removal
- Filipino ingredient suggestions

**AI Prompt Engineering:**

- Filipino cuisine bias implementation (70/30 rule)
- Contextual cooking instructions
- Creative ingredient combinations

**Output Processing:**

- Recipe format standardization
- Instruction step parsing
- Quality validation and error handling

### 2. Recipe Management

**CRUD Operations:**

- Create: Generate or manually add recipes
- Read: View recipe details, search, filter
- Update: Edit recipe details, mark favorites
- Delete: Remove saved recipes

**Search & Filter:**

- By ingredients, cuisine, category
- Difficulty level, prep/cook time
- Favorite recipes, generated vs manual

### 3. User Interface

**Recipe Dashboard:**

- Grid/list view of saved recipes
- Search and filter controls
- Quick actions (favorite, delete)

**Recipe Generator:**

- Enhanced ingredient input with autocomplete
- Generation preferences (cuisine, difficulty)
- Real-time recipe generation

**Recipe Details:**

- Full recipe display with instructions
- Basic nutritional information (when available)
- Save/favorite actions
- Share functionality

## File Structure

```
/types/
  ├── recipe.ts              # Recipe TypeScript interfaces
  └── api.ts                 # API response interfaces
/hooks/
  └── useRecipeGenerator.ts  # AI recipe generation hook
/services/
  ├── huggingface.ts         # Hugging Face API integration
  ├── recipeGenerator.ts     # Recipe generation logic
  └── apiClient.ts           # Generic API client
/config/
  └── apiConfig.ts           # API configuration
/data/
  └── filipino-recipes.json  # Local fallback recipe database
/components/recipe/          # Recipe-related components
  ├── RecipeCard.tsx         # Recipe display card
  ├── RecipeGenerator.tsx    # Generation interface
  └── RecipeDetailsModal.tsx # Full recipe view modal
/app/home/(tabs)/
  ├── index.tsx              # Home tab with recipe generator
  └── recipe.tsx             # Recipe dashboard screen
```

## API Integration

### Recipe Generation Hook

```typescript
const {
  generateRecipe, // Generate recipe from ingredients
  savedRecipes, // User's saved recipes
  isGenerating, // Loading state
  saveRecipe, // Save recipe to Firestore
  deleteRecipe, // Remove recipe
  toggleFavorite, // Mark as favorite
  searchRecipes, // Search saved recipes
} = useRecipeGenerator();
```

### Usage Example

```typescript
const handleGenerateRecipe = async () => {
  const result = await generateRecipe({
    ingredients: ["chicken", "garlic", "soy sauce"],
    preferences: {
      cuisine: "Filipino",
      difficulty: "Easy",
      maxPrepTime: 30,
    },
  });

  if (result.success && result.recipe) {
    await saveRecipe(result.recipe);
  }
};
```

## Dependencies

- `firebase/firestore` - Recipe storage and user authentication
- `@react-native-async-storage/async-storage` - Local caching
- Native fetch API - For Hugging Face API calls
- Local JSON database - Fallback recipe system

## Security & Rules

### Firestore Security Rules

```javascript
// Users can only access their own recipes
match /recipes/{recipeId} {
  allow read, write: if request.auth != null
    && request.auth.uid == resource.data.userId;
}

// Users can read/write their preferences
match /user_preferences/{userId} {
  allow read, write: if request.auth != null
    && request.auth.uid == userId;
}
```

## Testing Strategy

1. **Unit Tests**: Recipe generation logic, data validation
2. **Integration Tests**: API calls, Firestore operations
3. **UI Tests**: Recipe display, search functionality
4. **Manual Testing**: End-to-end recipe generation flow

## Performance Optimization

- **Caching**: Store frequently accessed recipes locally
- **Pagination**: Load recipes in batches for large collections
- **Lazy Loading**: Load recipe details on demand
- **Compression**: Optimize recipe data structure for storage

## Future Enhancements

- Recipe sharing between users
- Meal planning and scheduling
- Shopping list generation from recipes
- Recipe rating and reviews
- Photo upload for recipes
- Voice-guided cooking instructions
- Recipe scaling (serving size adjustment)
- Ingredient substitution suggestions
