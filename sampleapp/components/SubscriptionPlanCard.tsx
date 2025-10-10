import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface SubscriptionPlanCardProps {
  planType: "premium_monthly" | "pro_monthly";
  title: string;
  price: string;
  originalPrice?: string;
  features: string[];
  isPopular?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
}

export function SubscriptionPlanCard({ planType, title, price, originalPrice, features, isPopular = false, isSelected = false, onSelect }: SubscriptionPlanCardProps) {
  return (
    <TouchableOpacity style={[styles.container, isSelected && styles.selectedContainer, isPopular && styles.popularContainer]} onPress={onSelect} activeOpacity={0.8}>
      {isPopular && (
        <View style={styles.popularBadge}>
          <ThemedText style={styles.popularText}>MOST POPULAR</ThemedText>
        </View>
      )}

      <ThemedView style={[styles.content, isPopular && styles.popularContentPadding]}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <View style={styles.checkboxContainer}>
            <View style={[styles.checkbox, isSelected && styles.checkedCheckbox]}>{isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}</View>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <ThemedText style={styles.price}>{price}</ThemedText>
          {originalPrice && <ThemedText style={styles.originalPrice}>{originalPrice}</ThemedText>}
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#34C759" />
              <ThemedText style={styles.featureText}>{feature}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.billingInfo}>
          <Ionicons name="information-circle-outline" size={14} color="#8E8E93" />
          <ThemedText style={styles.billingText}>Billed monthly</ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#e9ecef",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedContainer: {
    borderColor: "#34C759",
    borderWidth: 2,
  },
  popularContainer: {
    borderColor: "#FF9500",
    borderWidth: 2,
  },
  popularBadge: {
    position: "absolute",
    top: -10,
    left: "50%",
    transform: [{ translateX: -50 }],
    backgroundColor: "#FF9500",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  popularText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  content: {
    padding: 20,
    backgroundColor: "transparent",
  },
  popularContentPadding: {
    paddingTop: 28,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e9ecef",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  checkedCheckbox: {
    backgroundColor: "#34C759",
    borderColor: "#34C759",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  originalPrice: {
    fontSize: 18,
    color: "#8E8E93",
    textDecorationLine: "line-through",
    marginLeft: 8,
  },
  period: {
    fontSize: 16,
    color: "#7f8c8d",
    marginLeft: 4,
  },
  savingsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  savingsText: {
    fontSize: 14,
    color: "#34C759",
    fontWeight: "600",
    marginLeft: 4,
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#5D6D7E",
    marginLeft: 8,
    flex: 1,
  },
  billingInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f3f4",
  },
  billingText: {
    fontSize: 12,
    color: "#8E8E93",
    marginLeft: 4,
  },
});
