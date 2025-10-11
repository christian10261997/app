import { AIRecipeRequest } from "../types/api";
import { Recipe, RecipeGenerationRequest, RecipeGenerationResponse } from "../types/recipe";
import { huggingFaceService } from "./huggingface";

// AI-focused recipe generation service
export class RecipeGeneratorService {
  // Comprehensive list of non-edible and potentially dangerous items
  private readonly NON_EDIBLE_ITEMS = new Set([
    // Cleaning products and chemicals
    "bleach",
    "detergent",
    "soap",
    "shampoo",
    "conditioner",
    "toothpaste",
    "mouthwash",
    "dish soap",
    "laundry detergent",
    "fabric softener",
    "window cleaner",
    "floor cleaner",
    "bathroom cleaner",
    "toilet cleaner",
    "oven cleaner",
    "drain cleaner",
    "pesticide",
    "insecticide",
    "herbicide",
    "fertilizer",
    "paint",
    "varnish",
    "glue",
    "adhesive",
    "rock",
    "roofing material",

    // Personal care items
    "deodorant",
    "perfume",
    "cologne",
    "lotion",
    "sunscreen",
    "makeup",
    "lipstick",
    "nail polish",
    "nail polish remover",
    "rubbing alcohol",
    "hydrogen peroxide",
    "antiseptic",
    "bandage",
    "gauze",
    "cotton swab",
    "tampon",
    "pad",
    "diaper",

    // Household items
    "paper",
    "cardboard",
    "plastic",
    "rubber",
    "metal",
    "glass",
    "ceramic",
    "wood",
    "fabric",
    "cloth",
    "leather",
    "foam",
    "sponge",
    "steel wool",
    "sandpaper",
    "battery",
    "wire",
    "cable",
    "electronics",
    "phone",
    "computer",
    "remote control",

    // Medical items
    "medicine",
    "pill",
    "tablet",
    "capsule",
    "syringe",
    "needle",
    "thermometer",
    "bandage",
    "gauze",
    "medical tape",
    "surgical mask",
    "gloves",
    "condom",

    // Toxic substances
    "poison",
    "toxic",
    "venom",
    "arsenic",
    "cyanide",
    "mercury",
    "lead",
    "cadmium",
    "rat poison",
    "antifreeze",
    "gasoline",
    "kerosene",
    "lighter fluid",
    "charcoal",
    "lighter",
    "match",
    "cigarette",
    "tobacco",
    "alcohol",
    "beer",
    "wine",
    "liquor",

    // Non-food items that might be confused
    "rock",
    "stone",
    "pebble",
    "sand",
    "dirt",
    "soil",
    "mud",
    "clay",
    "chalk",
    "crayon",
    "marker",
    "pen",
    "pencil",
    "eraser",
    "stapler",
    "staples",
    "paper clip",
    "rubber band",
    "tape",
    "sticker",
    "label",
    "tag",
    "button",
    "zipper",
    "snap",

    // Raw/unsafe food items (context-dependent)
    "raw meat",
    "raw chicken",
    "raw fish",
    "raw eggs",
    "raw milk",
    "raw shellfish",
    "moldy",
    "rotten",
    "spoiled",
    "expired",
    "contaminated",
    "dirty",
    "unwashed",

    // Plants that are poisonous
    "poison ivy",
    "poison oak",
    "poison sumac",
    "hemlock",
    "nightshade",
    "belladonna",
    "foxglove",
    "oleander",
    "rhododendron",
    "azalea",
    "lily of the valley",
    "daffodil",
    "hyacinth",
    "tulip",
    "iris",
    "wisteria",
    "jimsonweed",
    "castor bean",
    "rosary pea",

    // Miscellaneous dangerous items
    "fire",
    "flame",
    "smoke",
    "ash",
    "ember",
    "spark",
    "explosive",
    "firework",
    "gunpowder",
    "dynamite",
    "tnt",
    "bomb",
    "weapon",
    "knife",
    "sword",
    "gun",
    "bullet",
    "shell",
    "grenade",
    "mine",
    "trap",
    "snare",
    "hook",
    "line",

    // Common typos or misidentified items
    "soap",
    "shampoo",
    "conditioner",
    "lotion",
    "cream",
    "gel",
    "foam",
    "spray",
    "powder",
    "tablet",
    "capsule",
    "pill",
    "medicine",
    "drug",
    "chemical",
  ]);

  // Main recipe generation function with AI-only generation
  async generateRecipe(request: RecipeGenerationRequest): Promise<RecipeGenerationResponse> {
    try {
      console.log("🤖 Starting AI recipe generation...");

      // Step 1: Validate ingredients for edibility
      const validationResult = await this.validateIngredients(request.ingredients);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: `Cannot create recipe: ${validationResult.error}`,
        };
      }

      // Step 2: Check if AI service is configured
      console.log("🚀 ~ RecipeGeneratorService ~ generateRecipe ~ !huggingFaceService.isConfigured():", !huggingFaceService.isConfigured());
      if (!huggingFaceService.isConfigured()) {
        return {
          success: false,
          error: "AI service is not configured. Please check your HUGGINGFACE API key.",
        };
      }

      // Step 3: Generate recipe using AI only
      const recipe = await this.generateWithAI(request);

      if (!recipe) {
        return {
          success: false,
          error: "Failed to generate recipe using AI. Please try again with different ingredients.",
        };
      }

      // Step 4: Enhance with generation metadata
      recipe.isGenerated = true;
      recipe.tags = [...(recipe.tags || []), "ai-generated"];

      console.log("✅ AI recipe generation completed successfully!");
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

  // Validate ingredients using both basic and AI validation to ensure they are edible
  private async validateIngredients(ingredients: string[]): Promise<{ isValid: boolean; error?: string }> {
    if (!ingredients || ingredients.length === 0) {
      return { isValid: false, error: "No ingredients provided" };
    }

    // Step 1: Basic validation against known non-edible items
    const basicValidation = this.validateIngredientsBasic(ingredients);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    // Step 2: AI validation if service is available
    if (!huggingFaceService.isConfigured()) {
      console.log("⚠️ AI service not configured, using basic validation only");
      return { isValid: true }; // Allow ingredients if AI is not available
    }

    try {
      const validationResult = await this.validateIngredientsWithAI(ingredients);
      return validationResult;
    } catch (error) {
      console.error("Error validating ingredients with AI:", error);
      // Fallback to basic validation result if AI validation fails
      return basicValidation;
    }
  }

  // Basic validation against known non-edible items
  private validateIngredientsBasic(ingredients: string[]): { isValid: boolean; error?: string } {
    const invalidIngredients: string[] = [];

    for (const ingredient of ingredients) {
      const normalizedIngredient = ingredient.toLowerCase().trim();

      // Check for exact matches first
      if (this.NON_EDIBLE_ITEMS.has(normalizedIngredient)) {
        invalidIngredients.push(ingredient);
        continue;
      }

      // Check for partial matches only if the non-edible item is longer than 3 characters
      // and the ingredient contains the non-edible item as a whole word
      for (const nonEdibleItem of this.NON_EDIBLE_ITEMS) {
        if (nonEdibleItem.length > 3 && normalizedIngredient.includes(nonEdibleItem)) {
          // Check if it's a whole word match (not just a substring)
          const regex = new RegExp(`\\b${nonEdibleItem}\\b`, "i");
          if (regex.test(normalizedIngredient)) {
            invalidIngredients.push(ingredient);
            break;
          }
        }
      }
    }

    if (invalidIngredients.length > 0) {
      return {
        isValid: false,
        error: `The following ingredients are not suitable for cooking: ${invalidIngredients.join(", ")}`,
      };
    }

    return { isValid: true };
  }

  // Use AI to validate if ingredients are safe and edible
  private async validateIngredientsWithAI(ingredients: string[]): Promise<{ isValid: boolean; error?: string }> {
    const validationPrompt = this.buildIngredientValidationPrompt(ingredients);

    try {
      const response = await huggingFaceService.validateIngredients(validationPrompt);

      if (response.success && response.result) {
        const result = response.result;

        if (result.allEdible) {
          return { isValid: true };
        } else {
          return {
            isValid: false,
            error: `The following ingredients are not suitable for cooking: ${result.inedibleIngredients.join(", ")}. ${result.reason || "Please use only safe, edible ingredients."}`,
          };
        }
      } else {
        // If AI validation fails, allow ingredients (fail-safe approach)
        console.warn("AI ingredient validation failed, allowing ingredients");
        return { isValid: true };
      }
    } catch (error) {
      console.error("AI ingredient validation error:", error);
      return { isValid: true }; // Fail-safe approach
    }
  }

  // Build prompt for AI ingredient validation
  private buildIngredientValidationPrompt(ingredients: string[]): string {
    let prompt = "Analyze the following ingredients and determine if they are ALL safe and edible for cooking:\n\n";
    prompt += `INGREDIENTS: ${ingredients.join(", ")}\n\n`;
    prompt += "Please respond in this exact format:\n";
    prompt += "RESULT: [SAFE/UNSAFE]\n";
    prompt += "EDIBLE_INGREDIENTS: [list of safe ingredients]\n";
    prompt += "INEDIBLE_INGREDIENTS: [list of unsafe/inedible ingredients]\n";
    prompt += "REASON: [brief explanation if any ingredients are unsafe]\n\n";
    prompt += "Consider the following as UNSAFE/INEDIBLE:\n";
    prompt += "- Non-food items (paper, plastic, metal, electronics, etc.)\n";
    prompt += "- Cleaning products and chemicals\n";
    prompt += "- Personal care items (soap, shampoo, etc.)\n";
    prompt += "- Toxic substances and medicines\n";
    prompt += "- Raw meat/poultry/fish without proper preparation\n";
    prompt += "- Unknown or potentially poisonous plants\n";
    prompt += "- Any item not meant for human consumption\n\n";
    prompt += "Mark as SAFE only ingredients that are clearly food items suitable for cooking.";

    return prompt;
  }

  // Generate original recipe using AI (Hugging Face)
  private async generateWithAI(request: RecipeGenerationRequest): Promise<Omit<Recipe, "id" | "userId" | "createdAt" | "updatedAt"> | null> {
    try {
      // Convert our request format to AI request format with focus on original creation
      const aiRequest: AIRecipeRequest = {
        ingredients: request.ingredients,
        preferences: {
          cuisine: request.preferences?.cuisine || "Filipino", // Use preference or default to Filipino
          category: request.preferences?.category,
          difficulty: request.preferences?.difficulty,
          maxPrepTime: request.preferences?.maxPrepTime,
          dietary: request.preferences?.dietary,
        },
        context: {
          useFilipinoBias: request.preferences?.cuisine === "Filipino" || !request.preferences?.cuisine, // Only use Filipino bias if Filipino cuisine or no preference
          creativityLevel: "creative", // Encourage original recipes
          fusionAllowed: true,
        },
      };

      const response = await huggingFaceService.generateRecipe(aiRequest);
      console.log("🚀 ~ RecipeGeneratorService ~ generateWithAI ~ response:", response);

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
          cuisine: response.recipe.cuisine,
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

  // Get ingredient suggestions for autocomplete (common ingredients)
  getIngredientSuggestions(input: string): string[] {
    // Common cooking ingredients for suggestions
    const commonIngredients = [
      "chicken",
      "beef",
      "pork",
      "fish",
      "shrimp",
      "eggs",
      "rice",
      "noodles",
      "onion",
      "garlic",
      "ginger",
      "tomato",
      "carrot",
      "potato",
      "cabbage",
      "bell pepper",
      "mushroom",
      "corn",
      "beans",
      "spinach",
      "lettuce",
      "soy sauce",
      "vinegar",
      "oil",
      "salt",
      "pepper",
      "sugar",
      "flour",
      "coconut milk",
      "lemon",
      "lime",
      "chili",
      "basil",
      "oregano",
      "paprika",
      "milk",
      "cheese",
      "butter",
      "cream",
      "yogurt",
      "bread",
      "pasta",
      "apple",
      "banana",
      "orange",
      "mango",
      "pineapple",
      "coconut",
      "cucumber",
      "eggplant",
      "zucchini",
      "broccoli",
      "cauliflower",
    ];

    const inputLower = input.toLowerCase();
    return commonIngredients.filter((ing) => ing.includes(inputLower)).slice(0, 10); // Limit to 10 suggestions
  }

  // Test function to verify ingredient validation (for development/testing)
  testIngredientValidation(ingredients: string[]): { isValid: boolean; error?: string } {
    return this.validateIngredientsBasic(ingredients);
  }
}

// Singleton instance
export const recipeGenerator = new RecipeGeneratorService();
