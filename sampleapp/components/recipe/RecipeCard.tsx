import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Recipe } from "../../types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  onFavorite: (recipeId: string) => void;
  onDelete: (recipeId: string) => void;
}

export default function RecipeCard({ recipe, onPress, onFavorite, onDelete }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(recipe)}>
      {/* Header with favorite and delete */}
      <View style={styles.cardHeader}>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => onFavorite(recipe.id)}>
            <Ionicons name={recipe.isFavorite ? "heart" : "heart-outline"} size={20} color={recipe.isFavorite ? "#FF3B30" : "#666"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(recipe.id)}>
            <Ionicons name="trash-outline" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recipe Name */}
      <Text style={styles.recipeName} numberOfLines={2}>
        {recipe.name}
      </Text>

      {/* Recipe Info */}
      <View style={styles.recipeInfo}>
        <View style={styles.infoItem}>
          <Ionicons name="restaurant" size={14} color="#666" />
          <Text style={styles.infoText}>{recipe.cuisine}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time" size={14} color="#666" />
          <Text style={styles.infoText}>{totalTime}m</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="people" size={14} color="#666" />
          <Text style={styles.infoText}>{recipe.servings}</Text>
        </View>
      </View>

      {/* Difficulty and Category */}
      <View style={styles.tagContainer}>
        <View style={[styles.tag, styles.difficultyTag, getDifficultyColor(recipe.difficulty)]}>
          <Text style={[styles.tagText, { color: getDifficultyTextColor(recipe.difficulty) }]}>{recipe.difficulty}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{recipe.category}</Text>
        </View>
      </View>

      {/* Ingredients Preview */}
      <View style={styles.ingredientsPreview}>
        <Text style={styles.ingredientsTitle}>Ingredients:</Text>
        <Text style={styles.ingredientsText} numberOfLines={2}>
          {recipe.sourceIngredients.join(", ")}
        </Text>
      </View>

      {/* Generated Badge */}
    </TouchableOpacity>
  );
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return { backgroundColor: "#E8F5E8", borderColor: "#4CAF50" };
    case "medium":
      return { backgroundColor: "#FFF3E0", borderColor: "#FF9800" };
    case "hard":
      return { backgroundColor: "#FFEBEE", borderColor: "#F44336" };
    default:
      return { backgroundColor: "#F5F5F5", borderColor: "#999" };
  }
}

function getDifficultyTextColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "#2E7D32";
    case "medium":
      return "#F57C00";
    case "hard":
      return "#D32F2F";
    default:
      return "#666";
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
    lineHeight: 24,
  },
  recipeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
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
  tagContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  difficultyTag: {
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  ingredientsPreview: {
    marginBottom: 8,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  ingredientsText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  generatedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: 4,
  },
  generatedText: {
    fontSize: 12,
    color: "#007AFF",
    fontWeight: "500",
  },
});
