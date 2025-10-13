import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRecipeGenerator } from "../../hooks/useRecipeGenerator";
import { useToastHelpers } from "../../hooks/useToastHelpers";
import { PaywallModal } from "../PaywallModal";
import { ThemedButton } from "../ThemedButton";

export default function RecipeGenerator() {
  const { generateRecipe, searchRecipe, saveRecipe, isGenerating, isSearchingRecipe, canGenerateRecipe, getUsageStats } = useRecipeGenerator();
  const { recipeToasts } = useToastHelpers();

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRecipeName, setEditingRecipeName] = useState(false);
  const [tempRecipeName, setTempRecipeName] = useState("");

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
    if (ingredients.length < 5) {
      Alert.alert("Error", "Please add at least 5 ingredients to generate a recipe");
      return;
    }

    // Check usage limits before attempting generation
    const usageCheck = canGenerateRecipe();
    if (!usageCheck.canGenerate) {
      setShowPaywall(true);
      return;
    }

    const result = await generateRecipe({
      ingredients,
    });

    if (result.success && result.recipe) {
      setGeneratedRecipe(result.recipe);
      setTempRecipeName(result.recipe.name); // Initialize temp name with generated name
      setShowRecipeModal(true);
    } else if (result.usageLimit?.hasHitLimit) {
      // Show paywall if limit was hit during generation
      setShowPaywall(true);
    } else {
      // Check if it's an ingredient validation error
      const isIngredientError = result.error?.includes("not suitable for cooking") || result.error?.includes("Cannot create recipe");

      if (isIngredientError) {
        Alert.alert("Invalid Ingredients", result.error || "Please check your ingredients and try again.", [
          {
            text: "OK",
            style: "default",
          },
        ]);
      } else {
        Alert.alert("Generation Failed", result.error || "Could not generate recipe");
      }
    }
  };

  const handleSearchRecipe = async () => {
    if (!searchInput.trim()) {
      Alert.alert("Error", "Please enter a recipe name to search for");
      return;
    }

    // Check usage limits before attempting search
    const usageCheck = canGenerateRecipe();
    if (!usageCheck.canGenerate) {
      setShowPaywall(true);
      return;
    }

    const result = await searchRecipe(searchInput.trim());

    if (result.success && result.recipe) {
      setGeneratedRecipe(result.recipe);
      setTempRecipeName(result.recipe.name); // Initialize temp name with searched recipe name
      setShowRecipeModal(true);
      setSearchInput(""); // Clear search input after successful search
    } else if (result.usageLimit?.hasHitLimit) {
      // Show paywall if limit was hit during search
      setShowPaywall(true);
    } else {
      // Show error for non-existent recipes or other errors
      Alert.alert("Recipe Not Found", result.error || "Could not find the requested recipe. Please try a different recipe name.", [
        {
          text: "OK",
          style: "default",
        },
      ]);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe) return;

    // Check if recipe name is provided and not just placeholder
    const recipeName = tempRecipeName.trim();
    if (!recipeName || recipeName === "Enter Recipe Name" || recipeName === generatedRecipe.name) {
      Alert.alert("Recipe Name Required", "Please enter a name for your recipe before saving.", [
        {
          text: "OK",
          style: "default",
        },
      ]);
      return;
    }

    setIsSaving(true);
    try {
      // Use the edited recipe name
      const recipeToSave = {
        ...generatedRecipe,
        name: recipeName,
      };

      const result = await saveRecipe(recipeToSave);
      if (result.success) {
        recipeToasts.recipeSaved();
        setShowRecipeModal(false);
        setGeneratedRecipe(null);
        setEditingRecipeName(false);
        setTempRecipeName("");
        // Clear form
        setIngredients([]);
        setInput("");
      } else {
        recipeToasts.recipeSaveFailed(result.error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecipeNameEdit = () => {
    setEditingRecipeName(true);
  };

  const handleRecipeNameSave = () => {
    if (tempRecipeName.trim()) {
      setGeneratedRecipe((prev: any) => ({
        ...prev,
        name: tempRecipeName.trim(),
      }));
    }
    setEditingRecipeName(false);
  };

  const handleRecipeNameCancel = () => {
    setTempRecipeName(generatedRecipe?.name || "");
    setEditingRecipeName(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Generate Recipe</Text>
      </View>

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

        {/* Minimum Ingredients Indicator - Only show when less than 5 ingredients */}
        {ingredients.length !== 0 && ingredients.length < 5 && (
          <View style={styles.minIngredientsIndicator}>
            <Text style={styles.minIngredientsText}>{5 - ingredients.length} more ingredients needed</Text>
          </View>
        )}
      </View>

      {/* Generate Button */}
      <ThemedButton lightColor="#FF6B35" darkColor="#FF6B35" style={styles.generateButton} onPress={handleGenerateRecipe} disabled={isGenerating || ingredients.length < 5} loading={isGenerating}>
        <Ionicons name="restaurant" size={20} color="white" style={{ marginRight: 8 }} />
        Generate Recipe
      </ThemedButton>

      {/* Recipe Search Section */}
      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>Search Recipe</Text>
        <View style={styles.searchRow}>
          <TextInput style={styles.input} placeholder="Enter recipe name..." value={searchInput} onChangeText={setSearchInput} onSubmitEditing={handleSearchRecipe} />
          <ThemedButton
            lightColor="#FF6B35"
            darkColor="#FF6B35"
            size="small"
            style={styles.searchButton}
            onPress={handleSearchRecipe}
            disabled={isSearchingRecipe || !searchInput.trim()}
            loading={isSearchingRecipe}>
            <Ionicons name="search" size={16} color="white" />
          </ThemedButton>
        </View>
      </View>

      {/* Usage Indicator */}
      {(() => {
        const usageStats = getUsageStats();
        if (!usageStats.isUnlimited && usageStats.limit > 0) {
          return (
            <View style={styles.usageContainer}>
              <View style={styles.usageInfo}>
                <Text style={styles.usageText}>
                  {usageStats.remaining} of {usageStats.limit} free generations remaining
                </Text>
                <View style={styles.usageBar}>
                  <View
                    style={[
                      styles.usageProgress,
                      { width: `${usageStats.percentage}%` },
                      usageStats.percentage >= 80 && { backgroundColor: "#FF9500" },
                      usageStats.percentage >= 100 && { backgroundColor: "#FF3B30" },
                    ]}
                  />
                </View>
              </View>
            </View>
          );
        }
        return null;
      })()}

      {/* Recipe Modal */}
      <Modal visible={showRecipeModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowRecipeModal(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView style={styles.modalKeyboardContainer} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowRecipeModal(false)} disabled={isSaving}>
                <Ionicons name="close" size={24} color={isSaving ? "#ccc" : "#000"} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Generated Recipe</Text>
              <TouchableOpacity
                onPress={handleSaveRecipe}
                disabled={isSaving || !tempRecipeName.trim() || tempRecipeName.trim() === "Enter Recipe Name"}
                style={[styles.saveButton, (!tempRecipeName.trim() || tempRecipeName.trim() === "Enter Recipe Name") && styles.disabledSaveButton]}>
                {isSaving ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.savingText}>Saving...</Text>
                  </View>
                ) : (
                  <View style={styles.saveContainer}>
                    <Ionicons name="bookmark" size={20} color={!tempRecipeName.trim() || tempRecipeName.trim() === "Enter Recipe Name" ? "#ccc" : "#007AFF"} />
                    <Text style={[styles.saveText, (!tempRecipeName.trim() || tempRecipeName.trim() === "Enter Recipe Name") && styles.disabledSaveText]}>Save</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {generatedRecipe && (
              <ScrollView style={styles.modalContent} contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={true} bounces={true}>
                <View style={styles.recipeNameContainer}>
                  {editingRecipeName ? (
                    <View style={styles.nameEditContainer}>
                      <TextInput
                        style={styles.nameInput}
                        value={tempRecipeName}
                        onChangeText={setTempRecipeName}
                        placeholder="Enter your recipe name..."
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={handleRecipeNameSave}
                      />
                      <View style={styles.nameEditButtons}>
                        <TouchableOpacity onPress={handleRecipeNameSave} style={styles.nameEditButton}>
                          <Ionicons name="checkmark" size={20} color="#28A745" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleRecipeNameCancel} style={styles.nameEditButton}>
                          <Ionicons name="close" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={handleRecipeNameEdit} style={styles.nameDisplayContainer}>
                      <Text style={[styles.recipeName, (generatedRecipe.name === "Enter Recipe Name" || !generatedRecipe.name) && styles.placeholderText]}>
                        {generatedRecipe.name || "Enter Recipe Name"}
                      </Text>
                      <Ionicons name="pencil" size={18} color="#007AFF" style={styles.editIcon} />
                    </TouchableOpacity>
                  )}
                </View>
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
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Paywall Modal */}
      <PaywallModal visible={showPaywall} onClose={() => setShowPaywall(false)} usageCount={getUsageStats().count} limit={getUsageStats().limit} />
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
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
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
  minIngredientsIndicator: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#FFF3CD",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FFEAA7",
  },
  minIngredientsText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#856404",
    textAlign: "center",
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
  searchSection: {
    marginTop: 16,
    marginBottom: 4,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 50,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  modalKeyboardContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 40, // Extra bottom padding to ensure content is visible
  },
  recipeName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  placeholderText: {
    color: "#999",
    fontStyle: "italic",
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
  usageContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  usageInfo: {
    alignItems: "center",
  },
  usageText: {
    fontSize: 14,
    color: "#5D6D7E",
    marginBottom: 8,
    fontWeight: "500",
  },
  usageBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#e9ecef",
    borderRadius: 3,
    overflow: "hidden",
  },
  usageProgress: {
    height: "100%",
    backgroundColor: "#34C759",
    borderRadius: 3,
  },
  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saveContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  saveText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "600",
  },
  disabledSaveButton: {
    opacity: 0.5,
  },
  disabledSaveText: {
    color: "#ccc",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  savingText: {
    fontSize: 14,
    color: "#999",
    fontWeight: "600",
  },
  recipeNameContainer: {
    marginBottom: 8,
  },
  nameDisplayContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editIcon: {
    opacity: 0.6,
  },
  nameEditContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  nameInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  nameEditButtons: {
    flexDirection: "row",
    gap: 8,
  },
  nameEditButton: {
    padding: 4,
  },
});
