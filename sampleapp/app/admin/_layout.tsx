import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { useAuthContext } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, logout } = useAuthContext();
  const { showToast } = useToast();

  useEffect(() => {
    // Check if user is admin, if not redirect
    if (userProfile && userProfile.userType !== "admin") {
      showToast({
        type: "error",
        title: "Access Denied",
        message: "You don't have admin privileges",
      });
      router.replace("/home/(tabs)");
    }
  }, [userProfile]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      showToast({
        type: "error",
        title: "Logout Failed",
        message: "Failed to logout. Please try again.",
      });
    }
  };

  if (!userProfile || userProfile.userType !== "admin") {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Access Denied</ThemedText>
          <ThemedText style={styles.errorSubtext}>Admin privileges required</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.headerTitle}>Admin Dashboard</ThemedText>
          <ThemedText style={styles.headerSubtitle}>Welcome, {userProfile.firstName}</ThemedText>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF6B6B" />
          <ThemedText style={styles.logoutText}>Logout</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <ThemedView style={styles.content}>{children}</ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#fff5f5",
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  logoutText: {
    marginLeft: 6,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  content: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#e74c3c",
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 10,
  },
});
