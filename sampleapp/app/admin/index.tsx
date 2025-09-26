import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { useAuthContext } from "../../contexts/AuthContext";
import { useFirestore } from "../../hooks/useFirestore";
import { SubscriptionRequest } from "../../types/user";
import AdminLayout from "./_layout";

interface DashboardStats {
  totalUsers: number;
  freeUsers: number;
  subscribedUsers: number;
  pendingRequests: number;
}

export default function AdminDashboard() {
  const { userProfile } = useAuthContext();
  const { getDocuments, searchDocuments } = useFirestore();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    freeUsers: 0,
    subscribedUsers: 0,
    pendingRequests: 0,
  });
  const [pendingRequests, setPendingRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all users to calculate stats
      const usersResult = await getDocuments("users");
      if (usersResult.success && usersResult.data) {
        const users = usersResult.data;
        const totalUsers = users.length;
        const freeUsers = users.filter((user: any) => user.userType === "free" || !user.userType).length;
        const subscribedUsers = users.filter((user: any) => user.userType === "subscribed").length;

        setStats((prev) => ({
          ...prev,
          totalUsers,
          freeUsers,
          subscribedUsers,
        }));
      }

      // Load pending subscription requests
      const requestsResult = await searchDocuments("subscription_requests", [{ field: "status", operator: "==", value: "pending" }]);

      if (requestsResult.success && requestsResult.data) {
        const requests = requestsResult.data.map((doc: any) => ({
          id: doc.id,
          ...doc,
          submittedAt: doc.submittedAt?.toDate ? doc.submittedAt.toDate() : new Date(doc.submittedAt),
          reviewedAt: doc.reviewedAt?.toDate ? doc.reviewedAt.toDate() : doc.reviewedAt ? new Date(doc.reviewedAt) : undefined,
        })) as SubscriptionRequest[];

        setPendingRequests(requests);
        setStats((prev) => ({
          ...prev,
          pendingRequests: requests.length,
        }));
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userProfile?.userType === "admin") {
      loadDashboardData();
    }
  }, [userProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const navigateToSubscriptionRequests = () => {
    router.push("/admin/subscription-requests");
  };

  const navigateToUserManagement = () => {
    router.push("/admin/user-management");
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderPendingRequest = ({ item }: { item: SubscriptionRequest }) => (
    <TouchableOpacity style={styles.requestCard} onPress={() => router.push(`/admin/subscription-requests?requestId=${item.id}`)}>
      <View style={styles.requestHeader}>
        <ThemedText style={styles.requestUserName}>{item.userName}</ThemedText>
        <ThemedText style={styles.requestPlan}>{item.planType}</ThemedText>
      </View>
      <ThemedText style={styles.requestEmail}>{item.userEmail}</ThemedText>
      <ThemedText style={styles.requestRef}>Ref: {item.referenceNumber}</ThemedText>
      <ThemedText style={styles.requestDate}>Submitted: {formatDate(item.submittedAt)}</ThemedText>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <AdminLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading dashboard...</ThemedText>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="people" size={32} color="#007AFF" />
            <ThemedText style={styles.statNumber}>{stats.totalUsers}</ThemedText>
            <ThemedText style={styles.statLabel}>Total Users</ThemedText>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="person" size={32} color="#34C759" />
            <ThemedText style={styles.statNumber}>{stats.subscribedUsers}</ThemedText>
            <ThemedText style={styles.statLabel}>Subscribed</ThemedText>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="person-outline" size={32} color="#FF9500" />
            <ThemedText style={styles.statNumber}>{stats.freeUsers}</ThemedText>
            <ThemedText style={styles.statLabel}>Free Users</ThemedText>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="time" size={32} color="#FF3B30" />
            <ThemedText style={styles.statNumber}>{stats.pendingRequests}</ThemedText>
            <ThemedText style={styles.statLabel}>Pending</ThemedText>
          </View>
        </View>

        {/* Quick Actions */}
        <ThemedView style={styles.actionsContainer}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>

          <TouchableOpacity style={styles.actionButton} onPress={navigateToSubscriptionRequests}>
            <Ionicons name="card" size={24} color="#007AFF" />
            <ThemedText style={styles.actionButtonText}>Manage Subscription Requests</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={navigateToUserManagement}>
            <Ionicons name="people" size={24} color="#34C759" />
            <ThemedText style={styles.actionButtonText}>User Management</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>
        </ThemedView>

        {/* Recent Pending Requests */}
        {pendingRequests.length > 0 && (
          <ThemedView style={styles.recentContainer}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Recent Pending Requests</ThemedText>
              <TouchableOpacity onPress={navigateToSubscriptionRequests}>
                <ThemedText style={styles.viewAllText}>View All</ThemedText>
              </TouchableOpacity>
            </View>

            <FlatList
              data={pendingRequests.slice(0, 5)} // Show only first 5
              renderItem={renderPendingRequest}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </ThemedView>
        )}
      </ScrollView>
    </AdminLayout>
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
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#8E8E93",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    color: "#2c3e50",
  },
  statLabel: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
    textAlign: "center",
  },
  actionsContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2c3e50",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 12,
  },
  actionButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
  },
  recentContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  requestCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#FF9500",
  },
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  requestUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  requestPlan: {
    fontSize: 12,
    color: "#007AFF",
    backgroundColor: "#E5F3FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: "500",
  },
  requestEmail: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  requestRef: {
    fontSize: 14,
    color: "#5D6D7E",
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 12,
    color: "#8E8E93",
  },
});
