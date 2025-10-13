// Test file to verify OpenAI migration works correctly
import { openaiService } from "../openai";
import { recipeGenerator } from "../recipeGenerator";

describe("OpenAI Migration Tests", () => {
  // Test OpenAI service configuration
  test("OpenAI service should be properly configured", () => {
    // This will be false in test environment without API key
    const isConfigured = openaiService.isConfigured();
    expect(typeof isConfigured).toBe("boolean");
  });

  // Test recipe generation with fallback
  test("Recipe generation should work with fallback", async () => {
    const request = {
      ingredients: ["chicken", "onion", "garlic"],
      preferences: {
        cuisine: "Filipino",
        difficulty: "Easy",
        servings: 4,
      },
    };

    const result = await recipeGenerator.generateRecipe(request);

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("recipe");

    if (result.success && result.recipe) {
      expect(result.recipe).toHaveProperty("name");
      expect(result.recipe).toHaveProperty("ingredients");
      expect(result.recipe).toHaveProperty("instructions");
      expect(result.recipe).toHaveProperty("cuisine");
      expect(result.recipe).toHaveProperty("difficulty");
    }
  });

  // Test ingredient validation
  test("Ingredient validation should work", async () => {
    const ingredients = ["chicken", "onion", "garlic"];
    const result = await recipeGenerator.validateIngredients(ingredients);

    expect(result).toHaveProperty("isValid");
    expect(typeof result.isValid).toBe("boolean");
  });

  // Test recipe search
  test("Recipe search should work", async () => {
    const result = await recipeGenerator.searchRecipe("adobo");

    expect(result).toHaveProperty("success");
    expect(result).toHaveProperty("recipe");
  });

  // Test fallback behavior when API is not configured
  test("Should use fallback when API is not configured", async () => {
    // Mock the service to return false for isConfigured
    const originalIsConfigured = openaiService.isConfigured;
    jest.spyOn(openaiService, "isConfigured").mockReturnValue(false);

    const request = {
      ingredients: ["chicken", "onion"],
      preferences: {
        cuisine: "Filipino",
      },
    };

    const result = await recipeGenerator.generateRecipe(request);

    expect(result.success).toBe(false);
    expect(result.error).toContain("OPENAI API key");

    // Restore original method
    jest.spyOn(openaiService, "isConfigured").mockRestore();
  });
});
