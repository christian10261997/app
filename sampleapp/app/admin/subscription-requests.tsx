import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Modal, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { useAuthContext } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useFirestore } from "../../hooks/useFirestore";
import { SubscriptionRequest, UserProfile } from "../../types/user";
import AdminLayout from "./_layout";

export default function SubscriptionRequestsScreen() {
  const { userProfile } = useAuthContext();
  const { showToast } = useToast();
  const { getDocuments, updateDocument, searchDocuments } = useFirestore();
  const { requestId } = useLocalSearchParams<{ requestId?: string }>();

  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  const loadRequests = async () => {
    try {
      setLoading(true);

      let result;
      if (filter === "all") {
        result = await getDocuments("subscription_requests");
      } else {
        result = await searchDocuments("subscription_requests", [{ field: "status", operator: "==", value: filter }]);
      }

      if (result.success && result.data) {
        const requestsData = result.data
          .map((doc: any) => ({
            id: doc.id,
            ...doc,
            submittedAt: doc.submittedAt?.toDate ? doc.submittedAt.toDate() : new Date(doc.submittedAt),
            reviewedAt: doc.reviewedAt?.toDate ? doc.reviewedAt.toDate() : doc.reviewedAt ? new Date(doc.reviewedAt) : undefined,
          }))
          .sort((a: SubscriptionRequest, b: SubscriptionRequest) => b.submittedAt.getTime() - a.submittedAt.getTime()) as SubscriptionRequest[];

        setRequests(requestsData);

        // If requestId is provided, auto-select that request
        if (requestId) {
          const targetRequest = requestsData.find((req) => req.id === requestId);
          if (targetRequest) {
            setSelectedRequest(targetRequest);
          }
        }
      }
    } catch (error) {
      console.error("Error loading subscription requests:", error);
      showToast({
        type: "error",
        title: "Error",
        message: "Failed to load subscription requests",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userProfile?.userType === "admin") {
      loadRequests();
    }
  }, [userProfile, filter]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRequests();
  }, [filter]);

  const approveRequest = async (request: SubscriptionRequest) => {
    Alert.alert("Approve Subscription", `Are you sure you want to approve ${request.userName}'s subscription?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        style: "default",
        onPress: () => processRequest(request, "approved"),
      },
    ]);
  };

  const rejectRequest = async (request: SubscriptionRequest) => {
    Alert.alert("Reject Subscription", `Are you sure you want to reject ${request.userName}'s subscription?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reject",
        style: "destructive",
        onPress: () => processRequest(request, "rejected"),
      },
    ]);
  };

  const processRequest = async (request: SubscriptionRequest, status: "approved" | "rejected") => {
    if (!userProfile) return;

    setProcessingId(request.id);
    try {
      const now = new Date();

      // Calculate expiry date (30 days for monthly, 365 for yearly)
      const expiryDate = new Date(now);
      if (request.planType === "monthly") {
        expiryDate.setDate(expiryDate.getDate() + 30);
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      // Update subscription request
      const updatedRequest = {
        status,
        reviewedAt: now,
        reviewedBy: userProfile.id,
        adminNotes: status === "approved" ? "Payment verified and approved" : "Payment could not be verified",
      };

      await updateDocument("subscription_requests", request.id, updatedRequest);

      // Update user profile
      if (status === "approved") {
        const userProfileUpdate: Partial<UserProfile> = {
          userType: "subscribed",
          subscription: {
            status: "active",
            planType: request.planType,
            submittedAt: request.submittedAt,
            approvedAt: now,
            expiresAt: expiryDate,
            referenceImageUrl: request.referenceImageUrl,
            referenceNumber: request.referenceNumber,
            adminNotes: "Payment verified and approved",
          },
          updatedAt: now,
        };

        await updateDocument("users", request.userId, userProfileUpdate);
      }

      showToast({
        type: "success",
        title: status === "approved" ? "Request Approved" : "Request Rejected",
        message: `${request.userName}'s subscription has been ${status}`,
      });

      // Refresh the list
      loadRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error("Error processing request:", error);
      showToast({
        type: "error",
        title: "Error",
        message: `Failed to ${status} subscription request`,
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#FF9500";
      case "approved":
        return "#34C759";
      case "rejected":
        return "#FF3B30";
      default:
        return "#8E8E93";
    }
  };

  const renderRequest = ({ item }: { item: SubscriptionRequest }) => (
    <TouchableOpacity style={[styles.requestCard, { borderLeftColor: getStatusColor(item.status) }]} onPress={() => setSelectedRequest(item)}>
      <View style={styles.requestHeader}>
        <ThemedText style={styles.requestUserName}>{item.userName}</ThemedText>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "20" }]}>
          <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</ThemedText>
        </View>
      </View>

      <ThemedText style={styles.requestEmail}>{item.userEmail}</ThemedText>
      <ThemedText style={styles.requestRef}>Ref: {item.referenceNumber}</ThemedText>
      <View style={styles.requestFooter}>
        <ThemedText style={styles.requestPlan}>{item.planType} Plan</ThemedText>
        <ThemedText style={styles.requestDate}>{formatDate(item.submittedAt)}</ThemedText>
      </View>
    </TouchableOpacity>
  );

  const renderFilterButton = (filterType: typeof filter, label: string) => (
    <TouchableOpacity style={[styles.filterButton, filter === filterType && styles.activeFilterButton]} onPress={() => setFilter(filterType)}>
      <ThemedText style={[styles.filterButtonText, filter === filterType && styles.activeFilterButtonText]}>{label}</ThemedText>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <AdminLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading requests...</ThemedText>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Subscription Requests</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {renderFilterButton("pending", "Pending")}
          {renderFilterButton("approved", "Approved")}
          {renderFilterButton("rejected", "Rejected")}
          {renderFilterButton("all", "All")}
        </View>

        {/* Requests List */}
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {/* Request Detail Modal */}
        <Modal visible={!!selectedRequest} animationType="slide" presentationStyle="pageSheet">
          {selectedRequest && (
            <ThemedView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setSelectedRequest(null)}>
                  <Ionicons name="close" size={24} color="#8E8E93" />
                </TouchableOpacity>
                <ThemedText style={styles.modalTitle}>Request Details</ThemedText>
                <View style={styles.placeholder} />
              </View>

              <View style={styles.modalContent}>
                <View style={styles.detailSection}>
                  <ThemedText style={styles.detailLabel}>User Information</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedRequest.userName}</ThemedText>
                  <ThemedText style={styles.detailSubValue}>{selectedRequest.userEmail}</ThemedText>
                </View>

                <View style={styles.detailSection}>
                  <ThemedText style={styles.detailLabel}>Subscription Plan</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedRequest.planType} Plan</ThemedText>
                </View>

                <View style={styles.detailSection}>
                  <ThemedText style={styles.detailLabel}>Reference Number</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedRequest.referenceNumber}</ThemedText>
                </View>

                <View style={styles.detailSection}>
                  <ThemedText style={styles.detailLabel}>Payment Reference Image</ThemedText>
                  <TouchableOpacity style={styles.imageContainer} onPress={() => setImageModalVisible(true)}>
                    <Image source={{ uri: selectedRequest.referenceImageUrl }} style={styles.referenceImage} resizeMode="cover" />
                    <View style={styles.imageOverlay}>
                      <Ionicons name="expand" size={24} color="#fff" />
                    </View>
                  </TouchableOpacity>
                </View>

                <View style={styles.detailSection}>
                  <ThemedText style={styles.detailLabel}>Status</ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedRequest.status) + "20" }]}>
                    <ThemedText style={[styles.statusText, { color: getStatusColor(selectedRequest.status) }]}>{selectedRequest.status.toUpperCase()}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <ThemedText style={styles.detailLabel}>Submitted</ThemedText>
                  <ThemedText style={styles.detailValue}>{formatDate(selectedRequest.submittedAt)}</ThemedText>
                </View>

                {selectedRequest.reviewedAt && (
                  <View style={styles.detailSection}>
                    <ThemedText style={styles.detailLabel}>Reviewed</ThemedText>
                    <ThemedText style={styles.detailValue}>{formatDate(selectedRequest.reviewedAt)}</ThemedText>
                  </View>
                )}

                {selectedRequest.adminNotes && (
                  <View style={styles.detailSection}>
                    <ThemedText style={styles.detailLabel}>Admin Notes</ThemedText>
                    <ThemedText style={styles.detailValue}>{selectedRequest.adminNotes}</ThemedText>
                  </View>
                )}
              </View>

              {/* Action Buttons */}
              {selectedRequest.status === "pending" && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => rejectRequest(selectedRequest)} disabled={processingId === selectedRequest.id}>
                    {processingId === selectedRequest.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="close-circle" size={20} color="#fff" />
                        <ThemedText style={styles.actionButtonText}>Reject</ThemedText>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => approveRequest(selectedRequest)} disabled={processingId === selectedRequest.id}>
                    {processingId === selectedRequest.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                        <ThemedText style={styles.actionButtonText}>Approve</ThemedText>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ThemedView>
          )}
        </Modal>

        {/* Image Viewer Modal */}
        <Modal visible={imageModalVisible} animationType="fade" transparent={true}>
          <View style={styles.imageModalContainer}>
            <TouchableOpacity style={styles.imageModalOverlay} onPress={() => setImageModalVisible(false)}>
              <View style={styles.imageModalHeader}>
                <TouchableOpacity onPress={() => setImageModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
              {selectedRequest && <Image source={{ uri: selectedRequest.referenceImageUrl }} style={styles.fullImage} resizeMode="contain" />}
            </TouchableOpacity>
          </View>
        </Modal>
      </ThemedView>
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
  requestCard: {
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
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  requestUserName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  requestEmail: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  requestRef: {
    fontSize: 14,
    color: "#5D6D7E",
    marginBottom: 8,
  },
  requestFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestPlan: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007AFF",
  },
  requestDate: {
    fontSize: 12,
    color: "#8E8E93",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8E8E93",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  detailSubValue: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 2,
  },
  imageContainer: {
    position: "relative",
    marginTop: 8,
  },
  referenceImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  imageOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  approveButton: {
    backgroundColor: "#34C759",
  },
  rejectButton: {
    backgroundColor: "#FF3B30",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imageModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  imageModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalHeader: {
    position: "absolute",
    top: 60,
    right: 20,
    zIndex: 1,
  },
  fullImage: {
    width: "90%",
    height: "70%",
  },
});
