import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Alert, FlatList, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RecipeCard from "../../../components/recipe/RecipeCard";
import RecipeDetailsModal from "../../../components/recipe/RecipeDetailsModal";
import { useRecipeGenerator } from "../../../hooks/useRecipeGenerator";
import { Recipe, RECIPE_CATEGORIES } from "../../../types/recipe";

export default function RecipeDashboard() {
  const { savedRecipes, searchResults, isLoading, isSearching, searchRecipes, filterRecipes, toggleFavorite, deleteRecipe, loadUserRecipes, getRecipeStats } = useRecipeGenerator();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<{
    category?: string;
    difficulty?: string;
    isFavorite?: boolean;
  }>({});

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stats = getRecipeStats();

  // Handle search with loading state
  const handleSearch = useCallback(
    async (query: string) => {
      if (query.trim()) {
        setActiveSearchQuery(query);
        const result = await searchRecipes(query);
        if (!result.success) {
          Alert.alert("Search Error", result.error || "Failed to search recipes");
        }
      } else {
        setActiveSearchQuery("");
      }
    },
    [searchRecipes]
  );

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(searchQuery);
      }, 500); // 500ms debounce
    } else {
      setActiveSearchQuery("");
      // Don't call searchRecipes("") here as it causes infinite loop
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, handleSearch]);

  // Get filtered and searched recipes
  const displayedRecipes = useMemo(() => {
    let recipes = savedRecipes;

    // Apply search using active search query
    if (activeSearchQuery.trim()) {
      recipes = searchResults;
    }

    // Apply filters - but only if we're not in search mode or if we have filters
    if (Object.keys(selectedFilter).length > 0) {
      // If we're in search mode, filter the search results
      if (activeSearchQuery.trim()) {
        recipes = searchResults.filter((recipe) => {
          if (selectedFilter.category && recipe.category !== selectedFilter.category) return false;
          if (selectedFilter.difficulty && recipe.difficulty !== selectedFilter.difficulty) return false;
          if (selectedFilter.isFavorite !== undefined && recipe.isFavorite !== selectedFilter.isFavorite) return false;
          return true;
        });
      } else {
        // If we're not in search mode, use the filterRecipes function
        recipes = filterRecipes(selectedFilter);
      }
    }

    return recipes;
  }, [savedRecipes, activeSearchQuery, searchResults, selectedFilter]);

  const handleRecipePress = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleFavorite = async (recipeId: string) => {
    const result = await toggleFavorite(recipeId);
    if (!result.success) {
      Alert.alert("Error", result.error || "Failed to update favorite status");
    }
  };

  const handleDelete = async (recipeId: string) => {
    Alert.alert("Delete Recipe", "Are you sure you want to delete this recipe?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const result = await deleteRecipe(recipeId);
          if (!result.success) {
            Alert.alert("Error", result.error || "Failed to delete recipe");
          }
        },
      },
    ]);
  };

  const clearFilters = useCallback(() => {
    setSelectedFilter({});
    setSearchQuery("");
    setActiveSearchQuery("");
    // Clear search results by resetting state - no need to call searchRecipes
  }, []);

  const difficulties = ["Easy", "Medium", "Hard"];

  const renderRecipe = ({ item }: { item: Recipe }) => <RecipeCard recipe={item} onPress={handleRecipePress} onFavorite={handleFavorite} onDelete={handleDelete} />;

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="restaurant-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No recipes yet</Text>
      <Text style={styles.emptySubtitle}>Start creating recipes by adding ingredients on the Home tab!</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalRecipes}</Text>
          <Text style={styles.statLabel}>Total Recipes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.favoriteRecipes}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar - Moved outside FlatList */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            keyboardType="default"
            selectTextOnFocus={false}
            caretHidden={false}
            enablesReturnKeyAutomatically={true}
            clearButtonMode="never"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setActiveSearchQuery("");
              }}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
          {isSearching && <Ionicons name="hourglass-outline" size={16} color="#007AFF" />}
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="options" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Category:</Text>
            <View style={styles.filterOptions}>
              {RECIPE_CATEGORIES.slice(0, 4).map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[styles.filterChip, selectedFilter.category === category && styles.selectedFilterChip]}
                  onPress={() =>
                    setSelectedFilter((prev) => ({
                      ...prev,
                      category: prev.category === category ? undefined : category,
                    }))
                  }>
                  <Text style={[styles.filterChipText, selectedFilter.category === category && styles.selectedFilterChipText]}>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Quick Filters:</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterChip, selectedFilter.isFavorite && styles.selectedFilterChip]}
                onPress={() =>
                  setSelectedFilter((prev) => ({
                    ...prev,
                    isFavorite: prev.isFavorite ? undefined : true,
                  }))
                }>
                <Ionicons name="heart" size={14} color={selectedFilter.isFavorite ? "white" : "#666"} />
                <Text style={[styles.filterChipText, selectedFilter.isFavorite && styles.selectedFilterChipText]}>Favorites</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {displayedRecipes.length} recipe{displayedRecipes.length !== 1 ? "s" : ""} found
        </Text>
      </View>

      <FlatList
        data={displayedRecipes}
        renderItem={renderRecipe}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={savedRecipes.length === 0 ? renderEmptyState : null}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadUserRecipes} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Recipe Details Modal */}
      <RecipeDetailsModal visible={selectedRecipe !== null} recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} onFavorite={handleFavorite} onDelete={handleDelete} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  listContainer: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
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
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",

    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  filterButton: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  filtersContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  filterRow: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  selectedFilterChip: {
    backgroundColor: "#007AFF",
  },
  filterChipText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  selectedFilterChipText: {
    color: "white",
  },
  clearFiltersButton: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    color: "#FF3B30",
    fontWeight: "500",
  },
  resultsInfo: {
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  resultsText: {
    fontSize: 14,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 280,
  },
});
