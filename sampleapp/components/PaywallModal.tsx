import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import { useAuthContext } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { ThemedButton } from "./ThemedButton";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  usageCount?: number;
  limit?: number;
}

export function PaywallModal({ visible, onClose, usageCount = 10, limit = 10 }: PaywallModalProps) {
  const { logout } = useAuthContext();
  const { showToast } = useToast();

  const handleSubscribe = () => {
    onClose();
    router.push("/home/subscription");
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      showToast({
        type: "info",
        title: "Logged Out",
        message: "You have been logged out. Please subscribe to continue using the app.",
      });
      router.replace("/login");
    } catch (error) {
      showToast({
        type: "error",
        title: "Logout Failed",
        message: "Failed to logout. Please try again.",
      });
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ThemedView style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={48} color="#FF9500" />
            </View>
            <ThemedText style={styles.title}>Recipe Limit Reached</ThemedText>
            <ThemedText style={styles.subtitle}>You've used all {limit} of your free recipe generations</ThemedText>
          </View>

          {/* Usage Statistics */}
          <View style={styles.statsContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: "100%" }]} />
            </View>
            <ThemedText style={styles.statsText}>
              {usageCount} of {limit} recipes generated
            </ThemedText>
          </View>

          {/* Premium Features */}
          <View style={styles.featuresContainer}>
            <ThemedText style={styles.featuresTitle}>Subscribe for unlimited access:</ThemedText>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="infinite" size={20} color="#34C759" />
                <ThemedText style={styles.featureText}>Unlimited recipe generation</ThemedText>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="sparkles" size={20} color="#34C759" />
                <ThemedText style={styles.featureText}>AI-powered recipe suggestions</ThemedText>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="heart" size={20} color="#34C759" />
                <ThemedText style={styles.featureText}>Save unlimited favorite recipes</ThemedText>
              </View>

              <View style={styles.featureItem}>
                <Ionicons name="star" size={20} color="#34C759" />
                <ThemedText style={styles.featureText}>Premium recipe collections</ThemedText>
              </View>
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.pricingContainer}>
            <View style={styles.pricingOption}>
              <ThemedText style={styles.pricingPlan}>Monthly Plan</ThemedText>
              <ThemedText style={styles.pricingPrice}>₱99/month</ThemedText>
            </View>

            <View style={[styles.pricingOption, styles.popularOption]}>
              <View style={styles.popularBadge}>
                <ThemedText style={styles.popularText}>SAVE 20%</ThemedText>
              </View>
              <ThemedText style={styles.pricingPlan}>Yearly Plan</ThemedText>
              <View style={styles.priceRow}>
                <ThemedText style={styles.pricingPrice}>₱999/year</ThemedText>
                <ThemedText style={styles.originalPrice}>₱1,188</ThemedText>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <ThemedButton onPress={handleSubscribe} style={styles.subscribeButton}>
              Get Unlimited Access
            </ThemedButton>

            <View style={styles.bottomActions}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                <Ionicons name="log-out-outline" size={16} color="#FF3B30" />
                <ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Help Text */}
          <ThemedText style={styles.helpText}>Need help? Contact us at support@kitchenpal.com</ThemedText>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF3E0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 22,
  },
  statsContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF9500",
    borderRadius: 4,
  },
  statsText: {
    fontSize: 14,
    color: "#5D6D7E",
    textAlign: "center",
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 16,
    textAlign: "center",
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  featureText: {
    fontSize: 16,
    color: "#5D6D7E",
    marginLeft: 12,
    flex: 1,
  },
  pricingContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  pricingOption: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: "transparent",
  },
  popularOption: {
    backgroundColor: "#E5F3FF",
    borderColor: "#007AFF",
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  popularText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  pricingPlan: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  priceRow: {
    alignItems: "center",
  },
  pricingPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  originalPrice: {
    fontSize: 14,
    color: "#8E8E93",
    textDecorationLine: "line-through",
    marginTop: 2,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  subscribeButton: {
    marginBottom: 16,
    backgroundColor: "#007AFF",
  },
  bottomActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  logoutButtonText: {
    fontSize: 16,
    color: "#FF3B30",
    fontWeight: "500",
  },
  helpText: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 16,
  },
});
