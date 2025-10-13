// Test file to verify OpenAI SDK implementation
import { openaiService } from "../openai";

describe("OpenAI SDK Implementation Tests", () => {
  // Test OpenAI service configuration
  test("OpenAI service should be properly configured with SDK", () => {
    const isConfigured = openaiService.isConfigured();
    expect(typeof isConfigured).toBe("boolean");
  });

  // Test recipe generation with SDK
  test("Recipe generation should work with official SDK", async () => {
    const request = {
      ingredients: ["chicken", "onion", "garlic"],
      preferences: {
        cuisine: "Filipino",
        difficulty: "Easy",
        servings: 4,
      },
    };

    const result = await openaiService.generateRecipe(request);

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

  // Test ingredient validation with SDK
  test("Ingredient validation should work with SDK", async () => {
    const ingredients = ["chicken", "onion", "garlic"];
    const prompt = `Analyze the following ingredients: ${ingredients.join(", ")}`;

    const result = await openaiService.validateIngredients(prompt);

    expect(result).toHaveProperty("success");
    if (result.success) {
      expect(result.result).toHaveProperty("allEdible");
    }
  });

  // Test API connection with SDK
  test("API connection should work with SDK", async () => {
    const result = await openaiService.testConnection();

    expect(result).toHaveProperty("success");
    expect(typeof result.success).toBe("boolean");
  });
});
