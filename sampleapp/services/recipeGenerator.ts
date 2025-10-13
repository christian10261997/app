import { AIRecipeRequest } from "../types/api";
import { Recipe, RecipeGenerationRequest, RecipeGenerationResponse } from "../types/recipe";
import { huggingFaceService } from "./huggingface";

// AI-focused recipe generation service
export class RecipeGeneratorService {
  // Comprehensive list of non-edible and potentially dangerous items
  public readonly NON_EDIBLE_ITEMS = new Set([
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

  // Search for a recipe by name using AI
  async searchRecipe(recipeName: string): Promise<RecipeGenerationResponse> {
    try {
      console.log("🔍 Starting AI recipe search...");

      // Check if AI service is configured
      if (!huggingFaceService.isConfigured()) {
        return {
          success: false,
          error: "AI service is not configured. Please check your HUGGINGFACE API key.",
        };
      }

      // Validate recipe name input
      if (!recipeName || recipeName.trim().length === 0) {
        return {
          success: false,
          error: "Please enter a recipe name to search for.",
        };
      }

      // Generate recipe using AI search
      const recipe = await this.searchWithAI(recipeName.trim());

      if (!recipe) {
        return {
          success: false,
          error: `Recipe "${recipeName}" does not exist or could not be found. Please try a different recipe name.`,
        };
      }

      // Enhance with generation metadata
      recipe.isGenerated = true;
      recipe.tags = [...(recipe.tags || []), "ai-searched"];

      console.log("✅ AI recipe search completed successfully!");
      return {
        success: true,
        recipe,
      };
    } catch (error: any) {
      console.error("Recipe search error:", error);
      return {
        success: false,
        error: error.message || "Failed to search for recipe",
      };
    }
  }

  // Search for recipe using AI (Hugging Face)
  private async searchWithAI(recipeName: string): Promise<Omit<Recipe, "id" | "userId" | "createdAt" | "updatedAt"> | null> {
    try {
      // Normalize the dish name for better accuracy
      const normalizedDishName = this.normalizeDishName(recipeName);
      const searchPrompt = this.buildRecipeSearchPrompt(normalizedDishName);

      const response = await huggingFaceService.generateRecipe({
        ingredients: [], // No specific ingredients for search
        preferences: {
          cuisine: undefined, // Allow any cuisine
          category: undefined,
          difficulty: undefined,
          maxPrepTime: undefined,
          dietary: undefined,
        },
        context: {
          useFilipinoBias: false, // Disable Filipino bias for global search
          creativityLevel: "conservative", // Use conservative to avoid fusion
          fusionAllowed: false, // Disable fusion to ensure authentic recipes
        },
        searchQuery: searchPrompt, // Add search query to the request
      });

      console.log("🚀 ~ RecipeGeneratorService ~ searchWithAI ~ response:", response);

      if (response.success && response.recipe) {
        // Validate that the response is actually authentic cuisine
        const recipe = response.recipe;

        // Check if the AI returned "RECIPE_NOT_FOUND" in the name or description
        if (recipe.name?.toLowerCase().includes("recipe_not_found") || recipe.description?.toLowerCase().includes("recipe_not_found")) {
          console.log("AI indicated recipe not found");
          return null;
        }

        // Convert AI response to our recipe format
        return {
          name: recipe.name,
          description: recipe.description,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          cuisine: recipe.cuisine || "Unknown", // Use the cuisine from AI response
          category: recipe.category,
          difficulty: recipe.difficulty,
          tags: [...(recipe.tags || []), "authentic"],
          isFavorite: false,
          isGenerated: true,
          sourceIngredients: [], // No source ingredients for search
        };
      }

      return null;
    } catch (error) {
      console.error("AI search error:", error);
      return null;
    }
  }

  // Build prompt for AI recipe search
  private buildRecipeSearchPrompt(recipeName: string): string {
    let prompt = `You are a culinary expert. Provide an authentic, traditional recipe for "${recipeName}".\n\n`;
    prompt += "IMPORTANT: Provide ONLY the authentic, traditional version of this dish from its country of origin. Do not create fusion recipes or mix regional variations.\n\n";
    prompt += "Requirements for authentic recipes:\n";
    prompt += "- Use traditional ingredients and cooking methods from the dish's origin\n";
    prompt += "- Follow authentic preparation techniques\n";
    prompt += "- Use proper measurements and serving sizes\n";
    prompt += "- Include traditional garnishes and accompaniments\n";
    prompt += "- Maintain cultural authenticity\n\n";
    prompt += "If this is not a recognized dish or you're unsure about its authenticity, respond with 'RECIPE_NOT_FOUND'.\n\n";
    prompt += "Please respond in this exact format:\n";
    prompt += "NAME: [authentic recipe name]\n";
    prompt += "DESCRIPTION: [brief description of this traditional dish]\n";
    prompt += "INGREDIENTS: [list of authentic ingredients with quantities]\n";
    prompt += "INSTRUCTIONS: [step-by-step traditional cooking instructions]\n";
    prompt += "PREP_TIME: [preparation time in minutes]\n";
    prompt += "COOK_TIME: [cooking time in minutes]\n";
    prompt += "SERVINGS: [number of servings]\n";
    prompt += "CUISINE: [country/region of origin]\n";
    prompt += "CATEGORY: [meal category]\n";
    prompt += "DIFFICULTY: [easy/medium/hard]\n";
    prompt += "TAGS: [comma-separated tags]\n\n";
    prompt += "Ensure the recipe is 100% authentic and traditional. If you cannot provide an authentic version, respond with 'RECIPE_NOT_FOUND'.";

    return prompt;
  }

  // Validate and normalize dish names for better search accuracy
  private normalizeDishName(dishName: string): string {
    const normalizedName = dishName.toLowerCase().trim();

    // Common dish name mappings for better search accuracy (Filipino and international)
    const dishMappings: { [key: string]: string } = {
      // Filipino dishes
      caldereta: "caldereta",
      "caldereta beef": "caldereta",
      "beef caldereta": "caldereta",
      kaldereta: "caldereta",
      adobo: "adobo",
      "chicken adobo": "adobo",
      "pork adobo": "adobo",
      sinigang: "sinigang",
      "sinigang na baboy": "sinigang",
      "sinigang na isda": "sinigang",
      "kare-kare": "kare-kare",
      karekare: "kare-kare",
      lechon: "lechon",
      "lechon kawali": "lechon kawali",
      sisig: "sisig",
      "pork sisig": "sisig",
      "chicken sisig": "sisig",
      tinola: "tinola",
      "chicken tinola": "tinola",
      nilaga: "nilaga",
      "beef nilaga": "nilaga",
      "pork nilaga": "nilaga",
      bulalo: "bulalo",
      "beef bulalo": "bulalo",
      afritada: "afritada",
      "chicken afritada": "afritada",
      "pork afritada": "afritada",
      menudo: "menudo",
      "pork menudo": "menudo",
      bistek: "bistek",
      "beef bistek": "bistek",
      pancit: "pancit",
      "pancit canton": "pancit canton",
      "pancit bihon": "pancit bihon",
      lumpia: "lumpia",
      "lumpiang shanghai": "lumpiang shanghai",
      "lumpiang gulay": "lumpiang gulay",
      dinuguan: "dinuguan",
      "pork dinuguan": "dinuguan",
      laing: "laing",
      "ginataang laing": "laing",
      ginataang: "ginataang",
      "ginataang manok": "ginataang manok",
      "ginataang gulay": "ginataang gulay",
      "halo-halo": "halo-halo",
      halohalo: "halo-halo",
      bibingka: "bibingka",
      puto: "puto",
      "puto bumbong": "puto bumbong",
      suman: "suman",
      "buko pandan": "buko pandan",
      "leche flan": "leche flan",
      "maja blanca": "maja blanca",
      palitaw: "palitaw",
      "pitsi-pitsi": "pitsi-pitsi",

      // International dishes
      spaghetti: "spaghetti",
      pasta: "pasta",
      pizza: "pizza",
      lasagna: "lasagna",
      risotto: "risotto",
      paella: "paella",
      sushi: "sushi",
      ramen: "ramen",
      "pad thai": "pad thai",
      curry: "curry",
      "chicken curry": "curry",
      "beef curry": "curry",
      tacos: "tacos",
      burrito: "burrito",
      quesadilla: "quesadilla",
      enchiladas: "enchiladas",
      chili: "chili",
      gumbo: "gumbo",
      jambalaya: "jambalaya",
      ratatouille: "ratatouille",
      "coq au vin": "coq au vin",
      "boeuf bourguignon": "boeuf bourguignon",
      carbonara: "carbonara",
      bolognese: "bolognese",
      alfredo: "alfredo",
      pesto: "pesto",
      gnocchi: "gnocchi",
      ravioli: "ravioli",
      fettuccine: "fettuccine",
      penne: "penne",
      macaroni: "macaroni",
      cheese: "mac and cheese",
      "mac and cheese": "mac and cheese",
      "shepherd's pie": "shepherd's pie",
      "cottage pie": "cottage pie",
      "fish and chips": "fish and chips",
      "bangers and mash": "bangers and mash",
      "roast beef": "roast beef",
      "roast chicken": "roast chicken",
      "fried chicken": "fried chicken",
      "chicken parmesan": "chicken parmesan",
      "chicken marsala": "chicken marsala",
      "chicken piccata": "chicken piccata",
      meatballs: "meatballs",
      meatloaf: "meatloaf",
      hamburger: "hamburger",
      cheeseburger: "cheeseburger",
      "hot dog": "hot dog",
      sandwich: "sandwich",
      "club sandwich": "club sandwich",
      blt: "blt",
      reuben: "reuben",
      "philly cheesesteak": "philly cheesesteak",
      "cuban sandwich": "cuban sandwich",
      "grilled cheese": "grilled cheese",
      "french toast": "french toast",
      pancakes: "pancakes",
      waffles: "waffles",
      omelet: "omelet",
      "scrambled eggs": "scrambled eggs",
      quiche: "quiche",
      frittata: "frittata",
      soup: "soup",
      "chicken soup": "chicken soup",
      "tomato soup": "tomato soup",
      "clam chowder": "clam chowder",
      gazpacho: "gazpacho",
      minestrone: "minestrone",
      pho: "pho",
      "miso soup": "miso soup",
      salad: "salad",
      "caesar salad": "caesar salad",
      "greek salad": "greek salad",
      "cobb salad": "cobb salad",
      "waldorf salad": "waldorf salad",
      "nicoise salad": "nicoise salad",
    };

    return dishMappings[normalizedName] || dishName;
  }

  // Test function to verify ingredient validation (for development/testing)
  testIngredientValidation(ingredients: string[]): { isValid: boolean; error?: string } {
    return this.validateIngredientsBasic(ingredients);
  }
}

// Singleton instance
export const recipeGenerator = new RecipeGeneratorService();
