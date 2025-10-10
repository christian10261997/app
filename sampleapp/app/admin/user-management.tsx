import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { useAuthContext } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useFirestore } from "../../hooks/useFirestore";
import { UserProfile } from "../../types/user";

export default function UserManagementScreen() {
  const { userProfile } = useAuthContext();
  const { showToast } = useToast();
  const { getDocuments, updateDocument, searchDocuments } = useFirestore();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "free" | "premium" | "pro" | "admin">("all");

  const loadUsers = async () => {
    try {
      setLoading(true);

      let result;
      if (filter === "all") {
        result = await getDocuments("users");
      } else {
        result = await searchDocuments("users", [{ field: "userType", operator: "==", value: filter }]);
      }

      if (result.success && result.data) {
        const usersData = result.data
          .map((doc: any) => ({
            id: doc.id,
            ...doc,
            birthday: doc.birthday?.toDate ? doc.birthday.toDate() : new Date(doc.birthday),
            createdAt: doc.createdAt?.toDate ? doc.createdAt.toDate() : new Date(doc.createdAt),
            updatedAt: doc.updatedAt?.toDate ? doc.updatedAt.toDate() : new Date(doc.updatedAt),
            subscription: doc.subscription
              ? {
                  ...doc.subscription,
                  submittedAt: doc.subscription.submittedAt?.toDate(),
                  approvedAt: doc.subscription.approvedAt?.toDate(),
                  expiresAt: doc.subscription.expiresAt?.toDate(),
                }
              : undefined,
            usageStats: doc.usageStats || {
              recipeGenerationsCount: 0,
              monthlyGenerations: 0,
              currentMonthStart: new Date(),
            },
          }))
          .sort((a: UserProfile, b: UserProfile) => b.createdAt.getTime() - a.createdAt.getTime()) as UserProfile[];

        setUsers(usersData);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load users",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userProfile?.userType === "admin") {
      loadUsers();
    }
  }, [userProfile, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadUsers();
  }, [filter]);

  const changeUserType = async (targetUser: UserProfile, newUserType: "free" | "premium" | "pro" | "admin") => {
    if (targetUser.id === userProfile?.id && newUserType !== "admin") {
      showToast({
        type: "error",
        title: "Error",
        message: "You cannot change your own admin status",
      });
      return;
    }

    Alert.alert("Change User Type", `Are you sure you want to change ${targetUser.firstName} ${targetUser.lastName} to ${newUserType}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Change",
        style: "default",
        onPress: () => updateUserType(targetUser, newUserType),
      },
    ]);
  };

  const updateUserType = async (targetUser: UserProfile, newUserType: "free" | "premium" | "pro" | "admin") => {
    setProcessingId(targetUser.id);
    try {
      const updates: Partial<UserProfile> = {
        userType: newUserType,
        updatedAt: new Date(),
      };

      // Reset usage stats if changing to free
      if (newUserType === "free") {
        updates.usageStats = {
          recipeGenerationsCount: 0,
          monthlyGenerations: 0,
          currentMonthStart: new Date(),
        };
        // Clear subscription if downgrading to free
        updates.subscription = undefined;
      }

      await updateDocument("users", targetUser.id, updates);

      showToast({
        type: "success",
        title: "User Updated",
        message: `${targetUser.firstName}'s account type has been changed to ${newUserType}`,
      });

      // Refresh the list
      loadUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to update user type",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const resetUsageStats = async (targetUser: UserProfile) => {
    Alert.alert("Reset Usage Stats", `Are you sure you want to reset ${targetUser.firstName}'s usage statistics?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "default",
        onPress: () => performResetUsage(targetUser),
      },
    ]);
  };

  const performResetUsage = async (targetUser: UserProfile) => {
    setProcessingId(targetUser.id);
    try {
      const updates: Partial<UserProfile> = {
        usageStats: {
          recipeGenerationsCount: 0,
          monthlyGenerations: 0,
          currentMonthStart: new Date(),
        },
        updatedAt: new Date(),
      };

      await updateDocument("users", targetUser.id, updates);

      showToast({
        type: "success",
        title: "Usage Reset",
        message: `${targetUser.firstName}'s usage statistics have been reset`,
      });

      loadUsers();
    } catch (error) {
      console.error("Error resetting usage:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to reset usage statistics",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const getUserTypeColor = (userType: string) => {
    switch (userType) {
      case "free":
        return "#FF9500";
      case "premium":
        return "#34C759";
      case "pro":
        return "#007AFF";
      case "admin":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  const renderUser = ({ item }: { item: UserProfile }) => (
    <View style={[styles.userCard, { borderLeftColor: getUserTypeColor(item.userType) }]}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <ThemedText style={styles.userName}>
            {item.firstName} {item.lastName}
          </ThemedText>
          <ThemedText style={styles.userEmail}>{item.email}</ThemedText>
        </View>
        <View style={[styles.userTypeBadge, { backgroundColor: getUserTypeColor(item.userType) + "20" }]}>
          <ThemedText style={[styles.userTypeText, { color: getUserTypeColor(item.userType) }]}>{item.userType.toUpperCase()}</ThemedText>
        </View>
      </View>

      <View style={styles.userStats}>
        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Recipe Generations</ThemedText>
          <ThemedText style={styles.statValue}>{item.usageStats?.recipeGenerationsCount || 0}</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statLabel}>Joined</ThemedText>
          <ThemedText style={styles.statValue}>{formatDate(item.createdAt)}</ThemedText>
        </View>
      </View>

      {item.subscription && (
        <View style={styles.subscriptionInfo}>
          <ThemedText style={styles.subscriptionLabel}>Subscription</ThemedText>
          <ThemedText style={styles.subscriptionValue}>
            {item.subscription.planType} - {item.subscription.status}
          </ThemedText>
          {item.subscription.expiresAt && <ThemedText style={styles.subscriptionExpiry}>Expires: {formatDate(item.subscription.expiresAt)}</ThemedText>}
        </View>
      )}

      <View style={styles.userActions}>
        <TouchableOpacity style={[styles.actionButton, styles.freeButton]} onPress={() => changeUserType(item, "free")} disabled={processingId === item.id || item.userType === "free"}>
          <ThemedText style={[styles.actionButtonText, { color: "#FF9500" }]}>Free</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.premiumButton]} onPress={() => changeUserType(item, "premium")} disabled={processingId === item.id || item.userType === "premium"}>
          <ThemedText style={[styles.actionButtonText, { color: "#34C759" }]}>Premium</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.proButton]} onPress={() => changeUserType(item, "pro")} disabled={processingId === item.id || item.userType === "pro"}>
          <ThemedText style={[styles.actionButtonText, { color: "#007AFF" }]}>Pro</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.adminButton]}
          onPress={() => changeUserType(item, "admin")}
          disabled={processingId === item.id || item.userType === "admin" || item.id === userProfile?.id}>
          <ThemedText style={[styles.actionButtonText, { color: "#007AFF" }]}>Admin</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.resetButton]} onPress={() => resetUsageStats(item)} disabled={processingId === item.id}>
          {processingId === item.id ? <ActivityIndicator size="small" color="#FF3B30" /> : <Ionicons name="refresh" size={16} color="#FF3B30" />}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterButton = (filterType: typeof filter, label: string) => (
    <TouchableOpacity style={[styles.filterButton, filter === filterType && styles.activeFilterButton]} onPress={() => setFilter(filterType)}>
      <ThemedText style={[styles.filterButtonText, filter === filterType && styles.activeFilterButtonText]}>{label}</ThemedText>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Loading users...</ThemedText>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>User Management</ThemedText>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton("all", "All")}
        {renderFilterButton("free", "Free")}
        {renderFilterButton("premium", "Premium")}
        {renderFilterButton("pro", "Pro")}
        {renderFilterButton("admin", "Admin")}
      </View>

      {/* Users List */}
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  placeholder: {
    width: 40,
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
  },
  activeFilterButton: {
    backgroundColor: "#007AFF",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#8E8E93",
  },
  activeFilterButtonText: {
    color: "#fff",
  },
  listContainer: {
    padding: 16,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  userEmail: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 2,
  },
  userTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  userTypeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  userStats: {
    flexDirection: "row",
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  subscriptionInfo: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  subscriptionLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "600",
  },
  subscriptionValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
    marginTop: 2,
  },
  subscriptionExpiry: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 2,
  },
  userActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
  },
  freeButton: {
    borderColor: "#FF9500",
  },
  premiumButton: {
    borderColor: "#34C759",
  },
  proButton: {
    borderColor: "#007AFF",
  },
  adminButton: {
    borderColor: "#007AFF",
  },
  resetButton: {
    flex: 0,
    paddingHorizontal: 12,
    borderColor: "#FF3B30",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
