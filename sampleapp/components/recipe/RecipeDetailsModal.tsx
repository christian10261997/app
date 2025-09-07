import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Recipe } from "../../types/recipe";

interface RecipeDetailsModalProps {
  visible: boolean;
  recipe: Recipe | null;
  onClose: () => void;
  onFavorite: (recipeId: string) => void;
  onDelete: (recipeId: string) => void;
}

export default function RecipeDetailsModal({ visible, recipe, onClose, onFavorite, onDelete }: RecipeDetailsModalProps) {
  if (!recipe) return null;

  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recipe Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => onFavorite(recipe.id)} style={styles.headerAction}>
              <Ionicons name={recipe.isFavorite ? "heart" : "heart-outline"} size={24} color={recipe.isFavorite ? "#FF3B30" : "#007AFF"} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(recipe.id)} style={styles.headerAction}>
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recipe Title */}
          <Text style={styles.recipeName}>{recipe.name}</Text>

          {/* Description */}
          {recipe.description && <Text style={styles.description}>{recipe.description}</Text>}

          {/* Recipe Info Cards */}
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <Ionicons name="time" size={20} color="#007AFF" />
              <Text style={styles.infoLabel}>Prep Time</Text>
              <Text style={styles.infoValue}>{recipe.prepTime} min</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="flame" size={20} color="#FF6B35" />
              <Text style={styles.infoLabel}>Cook Time</Text>
              <Text style={styles.infoValue}>{recipe.cookTime} min</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="people" size={20} color="#28A745" />
              <Text style={styles.infoLabel}>Servings</Text>
              <Text style={styles.infoValue}>{recipe.servings}</Text>
            </View>
            <View style={styles.infoCard}>
              <Ionicons name="speedometer" size={20} color="#FFC107" />
              <Text style={styles.infoLabel}>Difficulty</Text>
              <Text style={styles.infoValue}>{recipe.difficulty}</Text>
            </View>
          </View>

          {/* Tags */}
          <View style={styles.tagsSection}>
            <View style={styles.tagRow}>
              <View style={[styles.tag, styles.cuisineTag]}>
                <Text style={styles.cuisineTagText}>{recipe.cuisine}</Text>
              </View>
              <View style={styles.tag}>
                <Text style={styles.tagText}>{recipe.category}</Text>
              </View>
              {recipe.isGenerated && (
                <View style={[styles.tag, styles.generatedTag]}>
                  <Ionicons name="sparkles" size={12} color="#007AFF" />
                  <Text style={styles.generatedTagText}>AI Generated</Text>
                </View>
              )}
            </View>
            {recipe.tags.length > 0 && (
              <View style={styles.tagRow}>
                {recipe.tags.slice(0, 4).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Source Ingredients (What user provided) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Original Ingredients Used</Text>
            <View style={styles.sourceIngredients}>
              {recipe.sourceIngredients.map((ingredient, index) => (
                <View key={index} style={styles.sourceIngredientChip}>
                  <Text style={styles.sourceIngredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientBullet} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.instructionsList}>
              {recipe.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.instructionText}>{instruction}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recipe Metadata */}
          <View style={styles.metadataSection}>
            <Text style={styles.metadataTitle}>Recipe Information</Text>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Created:</Text>
              <Text style={styles.metadataValue}>{recipe.createdAt.toLocaleDateString()}</Text>
            </View>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>Last Updated:</Text>
              <Text style={styles.metadataValue}>{recipe.updatedAt.toLocaleDateString()}</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  recipeName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    lineHeight: 34,
  },
  description: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    marginBottom: 20,
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cuisineTag: {
    backgroundColor: "#E3F2FD",
  },
  generatedTag: {
    backgroundColor: "#E8F4FD",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tagText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  cuisineTagText: {
    fontSize: 13,
    color: "#1976D2",
    fontWeight: "600",
  },
  generatedTagText: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "500",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
  },
  sourceIngredients: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sourceIngredientChip: {
    backgroundColor: "#FFF3CD",
    borderColor: "#FFECB5",
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sourceIngredientText: {
    fontSize: 13,
    color: "#856404",
    fontWeight: "500",
  },
  ingredientsList: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#007AFF",
    marginTop: 7,
    marginRight: 12,
  },
  ingredientText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    lineHeight: 20,
  },
  instructionsList: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  metadataSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  metadataTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  metadataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  metadataLabel: {
    fontSize: 14,
    color: "#666",
  },
  metadataValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
});
