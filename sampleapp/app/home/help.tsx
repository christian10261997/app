import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { recipeGenerator } from "@/services/recipeGenerator";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HelpScreen() {
  // Get NON_EDIBLE_ITEMS from the recipe generator service
  const nonEdibleItems = Array.from(recipeGenerator.NON_EDIBLE_ITEMS);

  // Categorize non-edible items for better organization
  const categorizedNonEdibleItems = {
    "Cleaning Products & Chemicals": nonEdibleItems.filter((item) =>
      [
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
      ].some((keyword) => item.includes(keyword))
    ),
    "Personal Care Items": nonEdibleItems.filter((item) =>
      [
        "deodorant",
        "perfume",
        "cologne",
        "lotion",
        "sunscreen",
        "makeup",
        "lipstick",
        "nail polish",
        "rubbing alcohol",
        "hydrogen peroxide",
        "antiseptic",
        "bandage",
        "gauze",
        "cotton swab",
        "tampon",
        "pad",
        "diaper",
      ].some((keyword) => item.includes(keyword))
    ),
    "Household Items": nonEdibleItems.filter((item) =>
      [
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
      ].some((keyword) => item.includes(keyword))
    ),
    "Medical Items": nonEdibleItems.filter((item) =>
      ["medicine", "pill", "tablet", "capsule", "syringe", "needle", "thermometer", "medical tape", "surgical mask", "gloves", "condom"].some((keyword) => item.includes(keyword))
    ),
    "Toxic Substances": nonEdibleItems.filter((item) =>
      [
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
      ].some((keyword) => item.includes(keyword))
    ),
    "Non-Food Items": nonEdibleItems.filter((item) =>
      [
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
      ].some((keyword) => item.includes(keyword))
    ),
    "Raw/Unsafe Food": nonEdibleItems.filter((item) =>
      ["raw meat", "raw chicken", "raw fish", "raw eggs", "raw milk", "raw shellfish", "moldy", "rotten", "spoiled", "expired", "contaminated", "dirty", "unwashed"].some((keyword) =>
        item.includes(keyword)
      )
    ),
    "Poisonous Plants": nonEdibleItems.filter((item) =>
      [
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
      ].some((keyword) => item.includes(keyword))
    ),
    "Dangerous Items": nonEdibleItems.filter((item) =>
      [
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
      ].some((keyword) => item.includes(keyword))
    ),
  };

  const helpSections = [
    {
      title: "Getting Started",
      icon: "rocket-outline" as const,
      items: [
        "Complete your profile to get personalized recipe recommendations",
        "Browse through our extensive collection of Filipino recipes",
        "Use the recipe generator to create custom recipes based on your preferences",
        "Subscribe to unlock premium features and unlimited recipe generation",
      ],
    },
    {
      title: "Recipe Features",
      icon: "restaurant-outline" as const,
      items: [
        "Generate recipes based on ingredients you have at home",
        "Filter recipes by difficulty level, cooking time, or dietary preferences",
        "Save your favorite recipes for easy access later",
        "View detailed cooking instructions and ingredient lists",
      ],
    },
    {
      title: "Profile Management",
      icon: "person-outline" as const,
      items: [
        "Update your personal information anytime",
        "Set dietary preferences for better recipe recommendations",
        "Track your cooking history and favorite cuisines",
        "Manage your subscription and billing information",
      ],
    },
    {
      title: "Subscription Benefits",
      icon: "card-outline" as const,
      items: [
        "Unlimited recipe generation with AI",
        "Access to premium recipe collections",
        "Advanced filtering and search options",
        "Priority customer support",
        "No ads and enhanced user experience",
      ],
    },
    {
      title: "Troubleshooting",
      icon: "help-circle-outline" as const,
      items: [
        "If recipes aren't loading, check your internet connection",
        "Clear app cache if you experience slow performance",
        "Make sure your profile is complete for best recommendations",
        "Contact support if you encounter any billing issues",
      ],
    },
    {
      title: "Safety Guidelines",
      icon: "shield-checkmark-outline" as const,
      items: [
        "Only use safe, edible ingredients when generating recipes",
        "Avoid non-food items, chemicals, and potentially dangerous substances",
        "Check the list below for items that should never be used in cooking",
        "When in doubt, consult with a culinary expert or nutritionist",
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Help & Support</ThemedText>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedView style={styles.welcomeSection}>
          <Ionicons name="information-circle" size={48} color="#28a745" />
          <ThemedText style={styles.welcomeTitle}>Welcome to KitchenPal!</ThemedText>
          <ThemedText style={styles.welcomeText}>Your personal cooking assistant for discovering and creating delicious Filipino recipes.</ThemedText>
        </ThemedView>

        {helpSections.map((section, index) => (
          <ThemedView key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon} size={24} color="#28a745" />
              <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            </View>

            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.listItem}>
                <View style={styles.bullet} />
                <ThemedText style={styles.listText}>{item}</ThemedText>
              </View>
            ))}
          </ThemedView>
        ))}

        {/* Non-Edible Items Section */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning-outline" size={24} color="#dc3545" />
            <ThemedText style={styles.sectionTitle}>Items NOT Safe for Cooking</ThemedText>
          </View>

          <ThemedText style={styles.warningText}>The following items should NEVER be used in cooking or recipe generation:</ThemedText>

          <ScrollView style={styles.nonEdibleScrollView} showsVerticalScrollIndicator={true} nestedScrollEnabled={true}>
            {Object.entries(categorizedNonEdibleItems).map(([category, items]) => (
              <View key={category} style={styles.categoryContainer}>
                <ThemedText style={styles.categoryTitle}>{category}</ThemedText>
                <View style={styles.itemsGrid}>
                  {items.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.nonEdibleItem}>
                      <ThemedText style={styles.nonEdibleItemText}>{item}</ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </ThemedView>

        <ThemedView style={styles.contactSection}>
          <ThemedText style={styles.contactTitle}>Need More Help?</ThemedText>
          <ThemedText style={styles.contactText}>If you can't find what you're looking for, feel free to contact our support team through the app.</ThemedText>

          <TouchableOpacity style={styles.contactButton} onPress={() => router.push("/home/contact")}>
            <ThemedText style={styles.contactButtonText}>Contact Support</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>KitchenPal v1.0.0</ThemedText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "green",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  welcomeSection: {
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    marginLeft: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#28a745",
    marginTop: 8,
    marginRight: 12,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: "#e8f5e8",
    borderRadius: 12,
    padding: 24,
    marginTop: 8,
    marginBottom: 24,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  contactText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  footer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#999",
  },
  warningText: {
    fontSize: 14,
    color: "#dc3545",
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 20,
  },
  nonEdibleScrollView: {
    maxHeight: 400,
    backgroundColor: "#fff5f5",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc3545",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#fecaca",
  },
  itemsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  nonEdibleItem: {
    backgroundColor: "#fef2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 4,
  },
  nonEdibleItemText: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "500",
  },
});
