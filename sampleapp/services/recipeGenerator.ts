import filipinoRecipes from "../data/filipino-recipes.json";
import { AIRecipeRequest } from "../types/api";
import { Recipe, RecipeGenerationRequest, RecipeGenerationResponse } from "../types/recipe";
import { huggingFaceService } from "./huggingface";

// Simple recipe generation using local database matching
export class RecipeGeneratorService {
  private filipinoRecipes: any[] = filipinoRecipes.recipes;

  // Main recipe generation function with AI integration and Filipino bias
  async generateRecipe(request: RecipeGenerationRequest): Promise<RecipeGenerationResponse> {
    try {
      console.log("🤖 Starting AI recipe generation...");

      // Step 1: Try AI generation first (if configured)
      let recipe = await this.generateWithAI(request);
      let wasAIGenerated = false;

      // Step 2: Fall back to local database if AI fails
      if (!recipe) {
        console.log("🔄 AI generation failed, falling back to local database...");
        recipe = await this.generateFromLocalDatabase(request);
      } else {
        wasAIGenerated = true;
        console.log("✅ AI generation successful!");
      }

      if (!recipe) {
        return {
          success: false,
          error: "No suitable recipe found for the given ingredients",
        };
      }

      // Step 3: Enhance with generation metadata
      recipe.isGenerated = true;
      if (wasAIGenerated) {
        recipe.tags = [...(recipe.tags || []), "ai-generated"];
      }

      console.log("🎉 Recipe generation completed successfully!");
      return {
        success: true,
        recipe,
      };
    } catch (error: any) {
      console.error("Recipe generation error:", error);
      return {
        success: false,
        error: error.message || "Failed to generate recipe",
      };
    }
  }

  // Generate recipe using AI (Hugging Face)
  private async generateWithAI(request: RecipeGenerationRequest): Promise<Omit<Recipe, "id" | "userId" | "createdAt" | "updatedAt"> | null> {
    try {
      if (!huggingFaceService.isConfigured()) {
        console.log("⚠️ Hugging Face API not configured, skipping AI generation");
        return null;
      }

      // Convert our request format to AI request format
      const aiRequest: AIRecipeRequest = {
        ingredients: request.ingredients,
        preferences: {
          cuisine: "Filipino", // Always Filipino cuisine
          category: request.preferences?.category,
          difficulty: request.preferences?.difficulty,
          maxPrepTime: request.preferences?.maxPrepTime,
          dietary: request.preferences?.dietary,
        },
        context: {
          useFilipinoBias: true, // Maintain 70% Filipino bias
          creativityLevel: "balanced",
          fusionAllowed: true,
        },
      };

      const response = await huggingFaceService.generateRecipe(aiRequest);

      if (response.success && response.recipe) {
        // Convert AI response to our recipe format
        return {
          name: response.recipe.name,
          description: response.recipe.description,
          ingredients: response.recipe.ingredients,
          instructions: response.recipe.instructions,
          prepTime: response.recipe.prepTime,
          cookTime: response.recipe.cookTime,
          servings: response.recipe.servings,
          cuisine: "Filipino", // Always Filipino cuisine
          category: response.recipe.category,
          difficulty: response.recipe.difficulty,

          tags: response.recipe.tags || [],
          isFavorite: false,
          isGenerated: true,
          sourceIngredients: request.ingredients,
        };
      }

      return null;
    } catch (error) {
      console.error("AI generation error:", error);
      return null;
    }
  }

  // Generate recipe from local Filipino database
  private async generateFromLocalDatabase(request: RecipeGenerationRequest): Promise<Omit<Recipe, "id" | "userId" | "createdAt" | "updatedAt"> | null> {
    const { ingredients, preferences } = request;

    // Find recipes that match the ingredients
    const matchingRecipes = this.findMatchingRecipes(ingredients);

    if (matchingRecipes.length === 0) {
      // If no exact match, create a fusion recipe
      return this.createFusionRecipe(ingredients, preferences);
    }

    // Apply preferences filtering
    let filteredRecipes = matchingRecipes;

    // Cuisine filtering removed - all recipes are Filipino cuisine

    if (preferences?.category) {
      filteredRecipes = filteredRecipes.filter((r) => r.category.toLowerCase().includes(preferences.category!.toLowerCase()));
    }

    if (preferences?.difficulty) {
      filteredRecipes = filteredRecipes.filter((r) => r.difficulty.toLowerCase() === preferences.difficulty!.toLowerCase());
    }

    if (preferences?.maxPrepTime) {
      filteredRecipes = filteredRecipes.filter((r) => r.prepTime <= preferences.maxPrepTime!);
    }

    // If filtering removed all recipes, use original matches
    const recipesToChooseFrom = filteredRecipes.length > 0 ? filteredRecipes : matchingRecipes;

    // Select best matching recipe (first one for now, could be improved with scoring)
    const selectedRecipe = recipesToChooseFrom[0];

    return this.formatRecipeResponse(selectedRecipe, ingredients);
  }

  // Find recipes that match given ingredients
  private findMatchingRecipes(userIngredients: string[]): any[] {
    const normalizedUserIngredients = userIngredients.map((ing) => ing.toLowerCase().trim());

    return this.filipinoRecipes.filter((recipe) => {
      const recipeIngredients = recipe.baseIngredients.map((ing: string) => ing.toLowerCase());

      // Check if at least 2 ingredients match, or 50% of user ingredients
      const matchCount = normalizedUserIngredients.filter((userIng) => recipeIngredients.some((recipeIng: string) => recipeIng.includes(userIng) || userIng.includes(recipeIng))).length;

      const requiredMatches = Math.max(2, Math.ceil(normalizedUserIngredients.length * 0.5));
      return matchCount >= requiredMatches;
    });
  }

  // Create a fusion recipe when no direct match is found
  private createFusionRecipe(ingredients: string[], preferences?: RecipeGenerationRequest["preferences"]): Omit<Recipe, "id" | "userId" | "createdAt" | "updatedAt"> {
    // Select a base Filipino recipe and adapt it
    const baseRecipe = this.getRandomFilipinoRecipe();

    // Create fusion recipe name
    const primaryIngredient = ingredients[0] || "Mixed";
    const fusionName = `${primaryIngredient.charAt(0).toUpperCase() + primaryIngredient.slice(1)} Filipino Fusion`;

    // Adapt ingredients list
    const adaptedIngredients = this.adaptIngredientsForFusion(ingredients, baseRecipe.ingredients);

    // Adapt instructions
    const adaptedInstructions = this.adaptInstructionsForFusion(ingredients, baseRecipe.instructions);

    return {
      name: fusionName,
      description: `A fusion dish combining ${ingredients.join(", ")} with Filipino cooking techniques`,
      ingredients: adaptedIngredients,
      instructions: adaptedInstructions,
      prepTime: baseRecipe.prepTime + 5, // Add a bit more prep time for fusion
      cookTime: baseRecipe.cookTime,
      servings: baseRecipe.servings,
      cuisine: "Filipino Fusion",
      category: preferences?.category || baseRecipe.category,
      difficulty: "Medium", // Fusion recipes are typically medium difficulty

      tags: ["fusion", "creative", ...baseRecipe.tags],
      isFavorite: false,
      isGenerated: true,
      sourceIngredients: ingredients,
    };
  }

  // Get a random Filipino recipe as base
  private getRandomFilipinoRecipe(): any {
    const randomIndex = Math.floor(Math.random() * this.filipinoRecipes.length);
    return this.filipinoRecipes[randomIndex];
  }

  // Adapt ingredients for fusion cooking
  private adaptIngredientsForFusion(userIngredients: string[], baseIngredients: string[]): string[] {
    const adapted = [...baseIngredients];

    // Replace some base ingredients with user ingredients
    userIngredients.forEach((userIng, index) => {
      if (index < adapted.length) {
        // Simple replacement strategy - replace with similar quantities
        adapted[index] = this.formatIngredientWithQuantity(userIng);
      } else {
        // Add new ingredients
        adapted.push(this.formatIngredientWithQuantity(userIng));
      }
    });

    return adapted.slice(0, Math.max(adapted.length, userIngredients.length + 3)); // Limit ingredients
  }

  // Format ingredient with estimated quantity
  private formatIngredientWithQuantity(ingredient: string): string {
    const quantities = ["1 cup", "2 cups", "1/2 cup", "200g", "300g", "1 piece", "2 pieces", "1 tbsp", "2 tbsp"];
    const randomQuantity = quantities[Math.floor(Math.random() * quantities.length)];
    return `${randomQuantity} ${ingredient}`;
  }

  // Adapt cooking instructions for fusion
  private adaptInstructionsForFusion(userIngredients: string[], baseInstructions: string[]): string[] {
    const adapted = [...baseInstructions];

    // Add preparation steps for user ingredients
    const userIngredientPrep = `Prepare ${userIngredients.join(", ")} by washing and cutting as needed`;
    adapted.unshift(userIngredientPrep);

    // Modify cooking steps to incorporate user ingredients
    adapted[2] = `Add ${userIngredients[0] || "main ingredient"} and cook according to recipe`;

    return adapted;
  }

  // Format recipe response
  private formatRecipeResponse(recipe: any, sourceIngredients: string[]): Omit<Recipe, "id" | "userId" | "createdAt" | "updatedAt"> {
    return {
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      cuisine: recipe.cuisine,
      category: recipe.category,
      difficulty: recipe.difficulty as "Easy" | "Medium" | "Hard",

      tags: recipe.tags || [],
      isFavorite: false,
      isGenerated: true,
      sourceIngredients: sourceIngredients,
    };
  }

  // Get recipe suggestions based on ingredients (for autocomplete)
  getIngredientSuggestions(input: string): string[] {
    const allIngredients = new Set<string>();

    this.filipinoRecipes.forEach((recipe) => {
      recipe.baseIngredients.forEach((ing: string) => {
        allIngredients.add(ing.toLowerCase());
      });
    });

    const inputLower = input.toLowerCase();
    return Array.from(allIngredients)
      .filter((ing) => ing.includes(inputLower))
      .slice(0, 10); // Limit to 10 suggestions
  }

  // Get random Filipino recipe for inspiration
  getRandomRecipeInspiration(): any {
    return this.getRandomFilipinoRecipe();
  }
}

// Singleton instance
export const recipeGenerator = new RecipeGeneratorService();
