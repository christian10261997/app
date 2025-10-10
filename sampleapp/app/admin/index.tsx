import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Modal, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { ThemedButton } from "../../components/ThemedButton";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { useAuthContext } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useFirestore } from "../../hooks/useFirestore";
import { useMessages } from "../../hooks/useMessages";
import { Message } from "../../types/message";
import { SubscriptionRequest } from "../../types/user";

interface DashboardData {
  pendingRequests: SubscriptionRequest[];
  unreadMessages: Message[];
}

export default function AdminDashboard() {
  const { userProfile } = useAuthContext();
  const { showToast } = useToast();
  const { searchDocuments, updateDocument } = useFirestore();
  const { messages, loadAllMessages, respondToMessage } = useMessages();
  const [pendingRequests, setPendingRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [quickResponseModal, setQuickResponseModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [quickResponse, setQuickResponse] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);

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
      loadAllMessages();
    }
  }, [userProfile?.id, userProfile?.userType]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
    loadAllMessages();
  };

  const navigateToMessages = () => {
    router.push("/admin/messages");
  };

  const navigateToSubscriptionRequests = () => {
    router.push("/admin/subscription-requests");
  };

  const handleQuickResponse = (message: Message) => {
    setSelectedMessage(message);
    setQuickResponse("");
    setQuickResponseModal(true);
  };

  const sendQuickResponse = async () => {
    if (!selectedMessage || !quickResponse.trim()) {
      showToast({
        type: "error",
        title: "Response Required",
        message: "Please enter a response message.",
      });
      return;
    }

    try {
      const result = await respondToMessage({
        messageId: selectedMessage.id,
        response: quickResponse.trim(),
      });

      if (result.success) {
        setQuickResponseModal(false);
        setSelectedMessage(null);
        setQuickResponse("");
        showToast({
          type: "success",
          title: "Response Sent",
          message: "Your response has been sent to the user.",
        });
        loadAllMessages();
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Failed to Send",
        message: "Could not send response. Please try again.",
      });
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const now = new Date();

      // Find the request to get its details
      const request = pendingRequests.find((req) => req.id === requestId);
      if (!request) {
        throw new Error("Request not found");
      }

      // Calculate expiry date (30 days for monthly plans)
      const expiryDate = new Date(now);
      if (request.planType === "premium_monthly" || request.planType === "pro_monthly") {
        expiryDate.setDate(expiryDate.getDate() + 30);
      } else {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      // Update subscription request
      const result = await updateDocument("subscription_requests", requestId, {
        status: "approved",
        reviewedAt: now,
        reviewedBy: userProfile?.id,
        adminNotes: "Payment verified and approved",
      });

      if (result.success) {
        // Update user profile
        const userProfileUpdate = {
          userType: request.planType === "premium_monthly" ? "premium" : "pro",
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

        showToast({
          type: "success",
          title: "Request Approved",
          message: "Subscription request has been approved and user status updated.",
        });
        loadDashboardData(); // Refresh the list
      } else {
        throw new Error("Failed to approve request");
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Approval Failed",
        message: "Could not approve the request. Please try again.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const result = await updateDocument("subscription_requests", requestId, {
        status: "rejected",
        reviewedAt: new Date(),
        reviewedBy: userProfile?.id,
        adminNotes: "Payment could not be verified",
      });

      if (result.success) {
        showToast({
          type: "success",
          title: "Request Rejected",
          message: "Subscription request has been rejected.",
        });
        loadDashboardData(); // Refresh the list
      } else {
        throw new Error("Failed to reject request");
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Rejection Failed",
        message: "Could not reject the request. Please try again.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  const renderPendingRequest = ({ item }: { item: SubscriptionRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestContent}>
        <View style={styles.requestImageContainer}>
          {item.referenceImageUrl ? (
            <Image source={{ uri: item.referenceImageUrl }} style={styles.requestImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="image-outline" size={32} color="#8E8E93" />
            </View>
          )}
        </View>

        <View style={styles.requestInfo}>
          <ThemedText style={styles.requestUserName}>{item.userName}</ThemedText>
          <ThemedText style={styles.requestPlan}>{item.planType.replace("_", " ").toUpperCase()}</ThemedText>
          <ThemedText style={styles.requestEmail}>{item.userEmail}</ThemedText>
          <ThemedText style={styles.requestRef}>Ref: {item.referenceNumber}</ThemedText>
          <ThemedText style={styles.requestDate}>Submitted: {formatDate(item.submittedAt)}</ThemedText>
        </View>
      </View>

      <View style={styles.requestActions}>
        <TouchableOpacity style={[styles.actionBtn, styles.approveBtn]} onPress={() => handleApproveRequest(item.id)} disabled={processingId === item.id}>
          {processingId === item.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <ThemedText style={styles.actionBtnText}>Approve</ThemedText>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.rejectBtn]} onPress={() => handleRejectRequest(item.id)} disabled={processingId === item.id}>
          {processingId === item.id ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="close" size={18} color="#fff" />
              <ThemedText style={styles.actionBtnText}>Reject</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUnreadMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity style={styles.messageCard} onPress={() => router.push("/admin/messages")}>
      <View style={styles.messageHeader}>
        <View style={styles.messageIconContainer}>
          <Ionicons name="mail-unread" size={24} color="#DC3545" />
        </View>

        <View style={styles.messageMainContent}>
          <View style={styles.messageTopRow}>
            <ThemedText style={styles.messageSubject} numberOfLines={1} ellipsizeMode="tail">
              {item.subject}
            </ThemedText>
            <View style={styles.urgentBadge}>
              <ThemedText style={styles.urgentText}>NEW</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.messageUserName}>{item.userName}</ThemedText>
          <ThemedText style={styles.messagePreview} numberOfLines={2} ellipsizeMode="tail">
            {item.content}
          </ThemedText>

          <View style={styles.messageFooter}>
            <ThemedText style={styles.messageDate}>{formatDate(item.createdAt)}</ThemedText>
            <TouchableOpacity
              style={styles.quickReplyButton}
              onPress={(e) => {
                e.stopPropagation();
                handleQuickResponse(item);
              }}>
              <Ionicons name="chatbubble-outline" size={16} color="#28a745" />
              <ThemedText style={styles.quickReplyText}>Quick Reply</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <ThemedText style={styles.loadingText}>Loading user profile...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      {/* Header Section */}

      {/* Unread Messages Section */}
      <ThemedView style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>
            <Ionicons name="mail-unread" size={20} color="#28a745" /> Support Messages
            {messages && messages.filter((msg) => msg.status === "unread").length > 0 && (
              <View style={styles.badgeContainer}>
                <ThemedText style={styles.badgeText}>{messages.filter((msg) => msg.status === "unread").length}</ThemedText>
              </View>
            )}
          </ThemedText>
          <TouchableOpacity onPress={navigateToMessages}>
            <ThemedText style={styles.viewAllText}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        {messages && messages.filter((msg) => msg.status === "unread").length > 0 ? (
          <FlatList
            data={messages.filter((msg) => msg.status === "unread").slice(0, 3)}
            renderItem={renderUnreadMessage}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color="#28a745" />
            <ThemedText style={styles.emptyStateText}>No new messages</ThemedText>
          </View>
        )}
      </ThemedView>

      {/* Pending Subscription Requests */}
      <ThemedView style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>
            <Ionicons name="card" size={20} color="#28a745" /> Subscription Requests
            {pendingRequests.length > 0 && (
              <View style={styles.badgeContainer}>
                <ThemedText style={styles.badgeText}>{pendingRequests.length}</ThemedText>
              </View>
            )}
          </ThemedText>
          <TouchableOpacity onPress={navigateToSubscriptionRequests}>
            <ThemedText style={styles.viewAllText}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        {pendingRequests.length > 0 ? (
          <FlatList data={pendingRequests} renderItem={renderPendingRequest} keyExtractor={(item) => item.id} scrollEnabled={false} showsVerticalScrollIndicator={false} />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle" size={48} color="#28a745" />
            <ThemedText style={styles.emptyStateText}>No pending requests</ThemedText>
          </View>
        )}
      </ThemedView>

      {/* Quick Response Modal */}
      <Modal visible={quickResponseModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setQuickResponseModal(false)}>
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setQuickResponseModal(false)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Quick Response</ThemedText>
            <View style={styles.modalHeaderRight} />
          </View>

          {selectedMessage && (
            <View style={styles.modalContent}>
              <ThemedView style={styles.messagePreviewCard}>
                <ThemedText style={styles.previewLabel}>Responding to:</ThemedText>
                <ThemedText style={styles.previewSubject}>{selectedMessage.subject}</ThemedText>
                <ThemedText style={styles.previewFrom}>From: {selectedMessage.userName}</ThemedText>
                <ThemedText style={styles.previewContent} numberOfLines={3} ellipsizeMode="tail">
                  {selectedMessage.content}
                </ThemedText>
              </ThemedView>

              <View style={styles.responseSection}>
                <ThemedText style={styles.responseLabel}>Your Response:</ThemedText>
                <TextInput
                  style={styles.responseInput}
                  value={quickResponse}
                  onChangeText={setQuickResponse}
                  placeholder="Type your response here..."
                  placeholderTextColor="#8E8E93"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                />
              </View>

              <ThemedButton onPress={sendQuickResponse} disabled={!quickResponse.trim()} style={[styles.sendButton, !quickResponse.trim() && styles.disabledButton]}>
                <Ionicons name="send" size={18} color="#28a745" />
                <ThemedText style={styles.sendButtonText}>Send Response</ThemedText>
              </ThemedButton>
            </View>
          )}
        </ThemedView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 5,
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
  headerSection: {
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  badgeContainer: {
    backgroundColor: "#DC3545",
    borderRadius: 25,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    paddingHorizontal: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2c3e50",
    padding: 5,
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  requestContent: {
    flexDirection: "row",
    marginBottom: 12,
  },
  requestImageContainer: {
    marginRight: 12,
  },
  requestImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: "#e9ecef",
    alignItems: "center",
    justifyContent: "center",
  },
  requestInfo: {
    flex: 1,
  },
  requestActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e1e5e9",
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  approveBtn: {
    backgroundColor: "#28a745",
  },
  rejectBtn: {
    backgroundColor: "#dc3545",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  requestUserName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  requestPlan: {
    fontSize: 12,
    color: "#007AFF",
    backgroundColor: "#E5F3FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    fontWeight: "500",
    alignSelf: "flex-start",
    marginBottom: 8,
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
  // Message Card Styles
  messageCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e1e5e9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  messageIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffeaea",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  messageMainContent: {
    flex: 1,
  },
  messageTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  messageSubject: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  urgentBadge: {
    backgroundColor: "#DC3545",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  urgentText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  messageUserName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#28a745",
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 20,
    marginBottom: 8,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  messageDate: {
    fontSize: 12,
    color: "#8E8E93",
  },
  quickReplyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  quickReplyText: {
    fontSize: 12,
    color: "#28a745",
    fontWeight: "600",
    marginLeft: 4,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e5e9",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalHeaderRight: {
    width: 24,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  messagePreviewCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  previewLabel: {
    fontSize: 12,
    color: "#6c757d",
    fontWeight: "600",
    marginBottom: 8,
  },
  previewSubject: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  previewFrom: {
    fontSize: 14,
    color: "#28a745",
    marginBottom: 8,
  },
  previewContent: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 20,
  },
  responseSection: {
    marginBottom: 24,
  },
  responseLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  responseInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e1e5e9",
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: "top",
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    borderRadius: 12,
    padding: 16,
  },
  disabledButton: {
    backgroundColor: "#6c757d",
    opacity: 0.5,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
