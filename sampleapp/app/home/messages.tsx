import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { useAuthContext } from "../../contexts/AuthContext";
import { useMessages } from "../../hooks/useMessages";
import { Message } from "../../types/message";

const STATUS_COLORS = {
  unread: "#dc3545",
  read: "#ffc107",
  responded: "#28a745",
};

const STATUS_LABELS = {
  unread: "Unread",
  read: "Read",
  responded: "Responded",
};

const CATEGORY_ICONS = {
  general_inquiry: "help-circle-outline",
  technical_support: "construct-outline",
  subscription_issue: "card-outline",
  account_help: "person-outline",
  feature_request: "bulb-outline",
  bug_report: "bug-outline",
  billing_question: "receipt-outline",
  other: "ellipsis-horizontal-outline",
};

export default function MessagesScreen() {
  const { userProfile } = useAuthContext();
  const { messages, loading, loadUserMessages, markAsRead } = useMessages();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  // Remove this useEffect entirely since useMessages hook already handles auto-loading
  // The hook will automatically load messages when userProfile is available

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserMessages();
    setRefreshing(false);
  };

  const handleMessagePress = (message: Message) => {
    setSelectedMessage(message);
    if (message.status === "unread") {
      markAsRead(message.id);
    }
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString();
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity style={styles.messageCard} onPress={() => handleMessagePress(item)}>
      <View style={styles.messageHeader}>
        <View style={styles.messageIconContainer}>
          <Ionicons name={CATEGORY_ICONS[item.category] as any} size={24} color="#28a745" />
        </View>

        <View style={styles.messageMainContent}>
          <View style={styles.messageTitleRow}>
            <ThemedText style={styles.messageSubject} numberOfLines={1}>
              {item.subject}
            </ThemedText>
            <View style={styles.categoryBadge}>
              <ThemedText style={styles.categoryText}>
                {item.category
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(" ")}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={styles.messagePreview} numberOfLines={2}>
            {item.content}
          </ThemedText>

          <View style={styles.messageFooter}>
            <ThemedText style={styles.messageDate}>{formatDate(item.createdAt)}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
              <ThemedText style={styles.statusText}>{STATUS_LABELS[item.status]}</ThemedText>
            </View>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
      </View>
    </TouchableOpacity>
  );

  const renderMessageDetail = () => {
    if (!selectedMessage) return null;

    return (
      <View style={styles.container}>
        {/* Detail Header */}
        <ThemedView style={styles.detailHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackToList}>
            <Ionicons name="arrow-back" size={24} color="#28a745" />
          </TouchableOpacity>
          <ThemedText style={styles.detailHeaderTitle}>Message Details</ThemedText>
          <View style={styles.detailHeaderRight} />
        </ThemedView>

        <FlatList
          style={styles.detailContent}
          data={[selectedMessage]}
          renderItem={() => (
            <ThemedView style={styles.detailCard}>
              {/* Message Info */}
              <View style={styles.detailInfoSection}>
                <View style={styles.detailInfoRow}>
                  <Ionicons name="document-text-outline" size={20} color="#28a745" />
                  <ThemedText style={styles.detailInfoLabel}>Subject:</ThemedText>
                  <ThemedText style={styles.detailInfoValue}>{selectedMessage.subject}</ThemedText>
                </View>

                <View style={styles.detailInfoRow}>
                  <Ionicons name="time-outline" size={20} color="#28a745" />
                  <ThemedText style={styles.detailInfoLabel}>Sent:</ThemedText>
                  <ThemedText style={styles.detailInfoValue}>
                    {selectedMessage.createdAt.toLocaleDateString()} at {selectedMessage.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </ThemedText>
                </View>

                <View style={styles.detailInfoRow}>
                  <Ionicons name="folder-outline" size={20} color="#28a745" />
                  <ThemedText style={styles.detailInfoLabel}>Category:</ThemedText>
                  <ThemedText style={styles.detailInfoValue}>{selectedMessage.category.replace("_", " ")}</ThemedText>
                </View>

                <View style={styles.detailInfoRow}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={STATUS_COLORS[selectedMessage.status]} />
                  <ThemedText style={styles.detailInfoLabel}>Status:</ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[selectedMessage.status] }]}>
                    <ThemedText style={styles.statusText}>{STATUS_LABELS[selectedMessage.status]}</ThemedText>
                  </View>
                </View>
              </View>

              {/* Message Content */}
              <View style={styles.detailMessageSection}>
                <ThemedText style={styles.detailSectionTitle}>Your Message:</ThemedText>
                <ThemedView style={styles.messageContentCard}>
                  <ThemedText style={styles.messageContentText}>{selectedMessage.content}</ThemedText>
                </ThemedView>
              </View>

              {/* Admin Response */}
              {selectedMessage.adminResponse && (
                <View style={styles.detailResponseSection}>
                  <ThemedText style={styles.detailSectionTitle}>Support Response:</ThemedText>
                  <ThemedView style={styles.responseContentCard}>
                    <View style={styles.responseHeader}>
                      <Ionicons name="person-circle-outline" size={24} color="#28a745" />
                      <View style={styles.responseHeaderText}>
                        <ThemedText style={styles.responseName}>{selectedMessage.adminName || "Support Team"}</ThemedText>
                        <ThemedText style={styles.responseDate}>{selectedMessage.respondedAt ? formatDate(selectedMessage.respondedAt) : ""}</ThemedText>
                      </View>
                    </View>
                    <ThemedText style={styles.responseContentText}>{selectedMessage.adminResponse}</ThemedText>
                  </ThemedView>
                </View>
              )}

              {/* No Response Yet */}
              {!selectedMessage.adminResponse && selectedMessage.status !== "responded" && (
                <View style={styles.detailResponseSection}>
                  <ThemedView style={styles.noResponseCard}>
                    <Ionicons name="time-outline" size={32} color="#ffc107" />
                    <ThemedText style={styles.noResponseTitle}>Waiting for Response</ThemedText>
                    <ThemedText style={styles.noResponseText}>Our support team will respond to your message as soon as possible. We typically respond within 24 hours.</ThemedText>
                  </ThemedView>
                </View>
              )}
            </ThemedView>
          )}
          keyExtractor={() => selectedMessage.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  if (!userProfile || userProfile.userType === "admin") {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Access not available for admin users</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  // Show message detail if selected
  if (selectedMessage) {
    return renderMessageDetail();
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#28a745" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Messages</ThemedText>
        <TouchableOpacity style={styles.newMessageButton} onPress={() => router.push("/home/contact")}>
          <Ionicons name="add" size={24} color="#28a745" />
        </TouchableOpacity>
      </ThemedView>

      {/* Messages List */}
      {loading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <ThemedText style={styles.loadingText}>Loading your messages...</ThemedText>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="mail-outline" size={64} color="#8E8E93" />
          <ThemedText style={styles.emptyTitle}>No Messages Yet</ThemedText>
          <ThemedText style={styles.emptySubtitle}>When you contact our support team, your messages will appear here.</ThemedText>
          <TouchableOpacity style={styles.contactButton} onPress={() => router.push("/home/contact")}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" />
            <ThemedText style={styles.contactButtonText}>Contact Support</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={styles.messagesList}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesListContent}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
    color: "black",
  },
  newMessageButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "black",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
    color: "black",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesListContent: {
    padding: 16,
  },
  messageCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  messageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e8f5e8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  messageMainContent: {
    flex: 1,
  },
  messageTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
    color: "black",
  },
  messagePreview: {
    fontSize: 14,
    color: "black",
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
    color: "black",
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#e8f5e8",
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "black",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "black",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "black",
    textAlign: "center",
  },
  // Detail view styles
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
    color: "black",
  },
  detailHeaderRight: {
    width: 40,
  },
  detailContent: {
    flex: 1,
  },
  detailCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailInfoSection: {
    marginBottom: 24,
  },
  detailInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
    color: "black",
  },
  detailInfoValue: {
    fontSize: 14,
    flex: 1,
    color: "black",
  },
  detailMessageSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    color: "black",
  },
  messageContentCard: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  messageContentText: {
    fontSize: 15,
    lineHeight: 22,
    color: "black",
  },
  detailResponseSection: {
    marginBottom: 16,
  },
  responseContentCard: {
    backgroundColor: "#e8f5e8",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  responseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  responseHeaderText: {
    marginLeft: 8,
  },
  responseName: {
    fontSize: 14,
    fontWeight: "600",
    color: "black",
  },
  responseDate: {
    fontSize: 12,
    color: "black",
  },
  responseContentText: {
    fontSize: 15,
    lineHeight: 22,
    color: "black",
  },
  noResponseCard: {
    backgroundColor: "#fff8e1",
    padding: 20,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffc107",
  },
  noResponseTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    color: "black",
  },
  noResponseText: {
    fontSize: 14,
    color: "black",
    textAlign: "center",
    lineHeight: 20,
  },
});
