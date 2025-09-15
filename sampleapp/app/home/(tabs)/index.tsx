import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import RecipeGenerator from "../../../components/recipe/RecipeGenerator";
import { useAuthContext } from "../../../contexts/AuthContext";

export default function Home() {
  const { userProfile } = useAuthContext();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeTitle}>Welcome{userProfile ? `, ${userProfile.firstName}` : ""}!</Text>
        <Text style={styles.welcomeSubtitle}>What delicious recipe would you like to create today?</Text>
      </View>

      {/* Recipe Generator */}
      <RecipeGenerator />

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>🇵🇭 Filipino-Inspired Recipes</Text>
        <Text style={styles.infoText}>
          Our AI focuses on Filipino cuisine while keeping options open for international fusion dishes. Add your available ingredients and let us suggest authentic Filipino recipes or creative fusion
          ideas!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
  },
  welcomeSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginBottom: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
  },
  infoSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginTop: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
