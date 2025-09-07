import { where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { recipeGenerator } from "../services/recipeGenerator";
import { Recipe, RecipeGenerationRequest, RecipeGenerationResponse } from "../types/recipe";
import { useFirestore } from "./useFirestore";

export function useRecipeGenerator() {
  const { user } = useAuthContext();
  const { addDocument, getDocuments, deleteDocument, updateDocument } = useFirestore();

  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load user's saved recipes on mount
  useEffect(() => {
    if (user) {
      loadUserRecipes();
    }
  }, [user]);

  // Generate a new recipe based on ingredients and preferences
  const generateRecipe = async (request: RecipeGenerationRequest): Promise<RecipeGenerationResponse> => {
    if (!user) {
      return {
        success: false,
        error: "User must be logged in to generate recipes",
      };
    }

    setIsGenerating(true);
    try {
      const result = await recipeGenerator.generateRecipe(request);
      return result;
    } catch (error: any) {
      console.error("Recipe generation error:", error);
      return {
        success: false,
        error: error.message || "Failed to generate recipe",
      };
    } finally {
      setIsGenerating(false);
    }
  };

  // Save a generated recipe to Firestore
  const saveRecipe = async (recipe: Omit<Recipe, "id" | "userId" | "createdAt" | "updatedAt">): Promise<{ success: boolean; error?: string; id?: string }> => {
    if (!user) {
      return { success: false, error: "User must be logged in to save recipes" };
    }

    try {
      const recipeData = {
        ...recipe,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await addDocument("recipes", recipeData);

      if (result.success) {
        // Refresh the saved recipes list
        await loadUserRecipes();
        return { success: true, id: result.id };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error("Error saving recipe:", error);
      return { success: false, error: error.message || "Failed to save recipe" };
    }
  };

  // Load all recipes for the current user
  const loadUserRecipes = async (): Promise<void> => {
    if (!user) return;

    setIsLoading(true);
    try {
      const result = await getDocuments("recipes", [where("userId", "==", user.uid)]);

      if (result.success && result.data) {
        const recipes = result.data.map((doc) => ({
          ...doc,
          createdAt: doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date(doc.createdAt),
          updatedAt: doc.updatedAt?.toDate ? doc.updatedAt.toDate() : new Date(doc.updatedAt),
        })) as Recipe[];

        // Sort by creation date (newest first)
        recipes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        setSavedRecipes(recipes);
      }
    } catch (error) {
      console.error("Error loading user recipes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a saved recipe
  const deleteRecipe = async (recipeId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "User must be logged in" };
    }

    try {
      const result = await deleteDocument("recipes", recipeId);

      if (result.success) {
        // Remove from local state
        setSavedRecipes((prev) => prev.filter((recipe) => recipe.id !== recipeId));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error("Error deleting recipe:", error);
      return { success: false, error: error.message || "Failed to delete recipe" };
    }
  };

  // Toggle favorite status of a recipe
  const toggleFavorite = async (recipeId: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: "User must be logged in" };
    }

    try {
      const recipe = savedRecipes.find((r) => r.id === recipeId);
      if (!recipe) {
        return { success: false, error: "Recipe not found" };
      }

      const updatedData = {
        isFavorite: !recipe.isFavorite,
        updatedAt: new Date(),
      };

      const result = await updateDocument("recipes", recipeId, updatedData);

      if (result.success) {
        // Update local state
        setSavedRecipes((prev) => prev.map((r) => (r.id === recipeId ? { ...r, isFavorite: !r.isFavorite, updatedAt: new Date() } : r)));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      console.error("Error toggling favorite:", error);
      return { success: false, error: error.message || "Failed to update favorite status" };
    }
  };

  // Search recipes by name or ingredients
  const searchRecipes = (query: string): Recipe[] => {
    if (!query.trim()) return savedRecipes;

    const searchTerm = query.toLowerCase().trim();
    return savedRecipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(searchTerm) ||
        recipe.ingredients.some((ing) => ing.toLowerCase().includes(searchTerm)) ||
        recipe.cuisine.toLowerCase().includes(searchTerm) ||
        recipe.category.toLowerCase().includes(searchTerm) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
  };

  // Filter recipes by various criteria
  const filterRecipes = (filters: { cuisine?: string; category?: string; difficulty?: string; maxPrepTime?: number; maxCookTime?: number; isFavorite?: boolean; isGenerated?: boolean }): Recipe[] => {
    return savedRecipes.filter((recipe) => {
      if (filters.cuisine && recipe.cuisine !== filters.cuisine) return false;
      if (filters.category && recipe.category !== filters.category) return false;
      if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false;
      if (filters.maxPrepTime && recipe.prepTime > filters.maxPrepTime) return false;
      if (filters.maxCookTime && recipe.cookTime > filters.maxCookTime) return false;
      if (filters.isFavorite !== undefined && recipe.isFavorite !== filters.isFavorite) return false;
      if (filters.isGenerated !== undefined && recipe.isGenerated !== filters.isGenerated) return false;
      return true;
    });
  };

  // Get ingredient suggestions for autocomplete
  const getIngredientSuggestions = (input: string): string[] => {
    return recipeGenerator.getIngredientSuggestions(input);
  };

  // Get recipe statistics
  const getRecipeStats = () => {
    const totalRecipes = savedRecipes.length;
    const favoriteRecipes = savedRecipes.filter((r) => r.isFavorite).length;
    const generatedRecipes = savedRecipes.filter((r) => r.isGenerated).length;
    const manualRecipes = savedRecipes.filter((r) => !r.isGenerated).length;

    const cuisines = [...new Set(savedRecipes.map((r) => r.cuisine))];
    const categories = [...new Set(savedRecipes.map((r) => r.category))];

    return {
      totalRecipes,
      favoriteRecipes,
      generatedRecipes,
      manualRecipes,
      cuisines: cuisines.length,
      categories: categories.length,
      avgPrepTime: totalRecipes > 0 ? Math.round(savedRecipes.reduce((sum, r) => sum + r.prepTime, 0) / totalRecipes) : 0,
      avgCookTime: totalRecipes > 0 ? Math.round(savedRecipes.reduce((sum, r) => sum + r.cookTime, 0) / totalRecipes) : 0,
    };
  };

  return {
    // State
    savedRecipes,
    isGenerating,
    isLoading,

    // Recipe generation
    generateRecipe,
    getIngredientSuggestions,

    // Recipe management
    saveRecipe,
    deleteRecipe,
    toggleFavorite,
    loadUserRecipes,

    // Search and filter
    searchRecipes,
    filterRecipes,

    // Statistics
    getRecipeStats,
  };
}
