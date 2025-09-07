import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRecipeGenerator } from "../../hooks/useRecipeGenerator";
import { RECIPE_CATEGORIES } from "../../types/recipe";
import { ThemedButton } from "../ThemedButton";

interface RecipeGeneratorProps {
  onRecipeGenerated?: (recipe: any) => void;
}

export default function RecipeGenerator({ onRecipeGenerated }: RecipeGeneratorProps) {
  const { generateRecipe, saveRecipe, isGenerating } = useRecipeGenerator();

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Preferences
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [maxPrepTime, setMaxPrepTime] = useState("");

  const cuisineOptions = ["Filipino", "Italian", "Chinese", "Japanese", "American", "Mexican"];
  const difficultyOptions = ["Easy", "Medium", "Hard"];

  const addIngredient = () => {
    const trimmed = input.trim();
    if (trimmed !== "" && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setInput("");
    }
  };

  const removeIngredient = (item: string) => {
    setIngredients(ingredients.filter((i) => i !== item));
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      Alert.alert("Error", "Please add at least one ingredient");
      return;
    }

    const preferences = {
      ...(selectedCuisine && { cuisine: selectedCuisine }),
      ...(selectedCategory && { category: selectedCategory }),
      ...(selectedDifficulty && { difficulty: selectedDifficulty }),
      ...(maxPrepTime && { maxPrepTime: parseInt(maxPrepTime) }),
    };

    const result = await generateRecipe({
      ingredients,
      preferences: Object.keys(preferences).length > 0 ? preferences : undefined,
    });

    if (result.success && result.recipe) {
      setGeneratedRecipe(result.recipe);
      setShowRecipeModal(true);
      onRecipeGenerated?.(result.recipe);
    } else {
      Alert.alert("Generation Failed", result.error || "Could not generate recipe");
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;

    const result = await saveRecipe(generatedRecipe);
    if (result.success) {
      Alert.alert("Success", "Recipe saved successfully!");
      setShowRecipeModal(false);
      setGeneratedRecipe(null);
      // Clear form
      setIngredients([]);
      setInput("");
    } else {
      Alert.alert("Error", result.error || "Failed to save recipe");
    }
  };

  const clearPreferences = () => {
    setSelectedCuisine("");
    setSelectedCategory("");
    setSelectedDifficulty("");
    setMaxPrepTime("");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Generate Recipe</Text>
        <TouchableOpacity style={styles.preferencesButton} onPress={() => setShowPreferences(!showPreferences)}>
          <Ionicons name="options" size={20} color="#007AFF" />
          <Text style={styles.preferencesText}>Preferences</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      {showPreferences && (
        <View style={styles.preferencesSection}>
          <Text style={styles.preferencesTitle}>Recipe Preferences</Text>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Cuisine:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
              {cuisineOptions.map((cuisine) => (
                <TouchableOpacity
                  key={cuisine}
                  style={[styles.optionChip, selectedCuisine === cuisine && styles.selectedOptionChip]}
                  onPress={() => setSelectedCuisine(selectedCuisine === cuisine ? "" : cuisine)}>
                  <Text style={[styles.optionText, selectedCuisine === cuisine && styles.selectedOptionText]}>{cuisine}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Category:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionScroll}>
              {RECIPE_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.optionChip, selectedCategory === category && styles.selectedOptionChip]}
                  onPress={() => setSelectedCategory(selectedCategory === category ? "" : category)}>
                  <Text style={[styles.optionText, selectedCategory === category && styles.selectedOptionText]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Difficulty:</Text>
            <View style={styles.optionRow}>
              {difficultyOptions.map((difficulty) => (
                <TouchableOpacity
                  key={difficulty}
                  style={[styles.optionChip, selectedDifficulty === difficulty && styles.selectedOptionChip]}
                  onPress={() => setSelectedDifficulty(selectedDifficulty === difficulty ? "" : difficulty)}>
                  <Text style={[styles.optionText, selectedDifficulty === difficulty && styles.selectedOptionText]}>{difficulty}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceLabel}>Max Prep Time (minutes):</Text>
            <TextInput style={styles.timeInput} placeholder="e.g. 30" value={maxPrepTime} onChangeText={setMaxPrepTime} keyboardType="numeric" />
          </View>

          <TouchableOpacity style={styles.clearButton} onPress={clearPreferences}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Ingredients Input */}
      <View style={styles.ingredientsSection}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <View style={styles.searchRow}>
          <TextInput style={styles.input} placeholder="Enter ingredient..." value={input} onChangeText={setInput} onSubmitEditing={addIngredient} />
          <ThemedButton variant="success" size="small" style={styles.addButton} onPress={addIngredient}>
            ADD
          </ThemedButton>
        </View>

        {/* Ingredients List */}
        <View style={styles.ingredientBox}>
          {ingredients.map((item, index) => (
            <View key={index} style={styles.ingredientChip}>
              <Text style={styles.chipText}>{item}</Text>
              <TouchableOpacity onPress={() => removeIngredient(item)}>
                <Ionicons name="close-circle" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      {/* Generate Button */}
      <ThemedButton lightColor="#FF6B35" darkColor="#FF6B35" style={styles.generateButton} onPress={handleGenerateRecipe} disabled={isGenerating || ingredients.length === 0} loading={isGenerating}>
        <Ionicons name="restaurant" size={20} color="white" style={{ marginRight: 8 }} />
        Generate Recipe
      </ThemedButton>

      {/* Recipe Modal */}
      <Modal visible={showRecipeModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowRecipeModal(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowRecipeModal(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Generated Recipe</Text>
            <TouchableOpacity onPress={handleSaveRecipe}>
              <Ionicons name="bookmark" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {generatedRecipe && (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.recipeName}>{generatedRecipe.name}</Text>
              <Text style={styles.recipeDescription}>{generatedRecipe.description}</Text>

              <View style={styles.recipeInfo}>
                <View style={styles.infoItem}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.infoText}>Prep: {generatedRecipe.prepTime}m</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="flame" size={16} color="#666" />
                  <Text style={styles.infoText}>Cook: {generatedRecipe.cookTime}m</Text>
                </View>
                <View style={styles.infoItem}>
                  <Ionicons name="people" size={16} color="#666" />
                  <Text style={styles.infoText}>Serves: {generatedRecipe.servings}</Text>
                </View>
              </View>

              <Text style={styles.sectionHeader}>Ingredients:</Text>
              {generatedRecipe.ingredients.map((ingredient: string, index: number) => (
                <Text key={index} style={styles.ingredientItem}>
                  • {ingredient}
                </Text>
              ))}

              <Text style={styles.sectionHeader}>Instructions:</Text>
              {generatedRecipe.instructions.map((instruction: string, index: number) => (
                <Text key={index} style={styles.instructionItem}>
                  {index + 1}. {instruction}
                </Text>
              ))}
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  preferencesButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  preferencesText: {
    color: "#007AFF",
    fontSize: 14,
  },
  preferencesSection: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  preferencesTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  preferenceRow: {
    marginBottom: 12,
  },
  preferenceLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    color: "#666",
  },
  optionScroll: {
    flexDirection: "row",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  selectedOptionChip: {
    backgroundColor: "#007AFF",
  },
  optionText: {
    fontSize: 12,
    color: "#333",
  },
  selectedOptionText: {
    color: "white",
  },
  timeInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    backgroundColor: "white",
    width: 80,
  },
  clearButton: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  clearButtonText: {
    color: "#FF3B30",
    fontSize: 14,
  },
  ingredientsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  searchRow: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "white",
  },
  addButton: {
    backgroundColor: "#28a745",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  ingredientBox: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    minHeight: 50,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 8,
  },
  ingredientChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  chipText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  generateButton: {
    backgroundColor: "#FF6B35",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  generateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
    lineHeight: 22,
  },
  recipeInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
    marginBottom: 12,
  },
  ingredientItem: {
    fontSize: 16,
    color: "#555",
    marginBottom: 4,
    lineHeight: 20,
  },
  instructionItem: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
    lineHeight: 22,
  },
});
