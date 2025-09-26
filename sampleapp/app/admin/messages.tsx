import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedButton } from "../../components/ThemedButton";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { useAuthContext } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useMessages } from "../../hooks/useMessages";
import { Message, MessageCategory, MessageFilters, MessageStatus } from "../../types/message";
import AdminLayout from "./_layout";

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

const FILTER_OPTIONS = {
  status: [
    { value: "unread", label: "Unread" },
    { value: "read", label: "Read" },
    { value: "responded", label: "Responded" },
  ] as { value: MessageStatus; label: string }[],
  category: [
    { value: "general_inquiry", label: "General Inquiry" },
    { value: "technical_support", label: "Technical Support" },
    { value: "subscription_issue", label: "Subscription Issue" },
    { value: "account_help", label: "Account Help" },
    { value: "feature_request", label: "Feature Request" },
    { value: "bug_report", label: "Bug Report" },
    { value: "billing_question", label: "Billing Question" },
    { value: "other", label: "Other" },
  ] as { value: MessageCategory; label: string }[],
};

export default function AdminMessagesScreen() {
  const { userProfile } = useAuthContext();
  const { showToast } = useToast();
  const { messages, loading, stats, loadAllMessages, respondToMessage, markAsRead } = useMessages();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [responseText, setResponseText] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [responding, setResponding] = useState(false);
  const [filters, setFilters] = useState<MessageFilters>({});
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (userProfile?.userType === "admin") {
      loadAllMessages(filters);
    }
  }, [userProfile?.id, userProfile?.userType]); // Remove loadAllMessages from deps to prevent loops

  // Separate effect for filter changes
  useEffect(() => {
    if (userProfile?.userType === "admin" && Object.keys(filters).length > 0) {
      loadAllMessages(filters);
    }
  }, [filters]); // Only re-run when filters change

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllMessages(filters);
    setRefreshing(false);
  };

  const handleMessagePress = (message: Message) => {
    setSelectedMessage(message);
    if (message.status === "unread") {
      markAsRead(message.id);
    }
  };

  const handleResponsePress = (message: Message) => {
    setSelectedMessage(message);
    setResponseText("");
    setInternalNotes("");
    setResponseModalVisible(true);
  };

  const handleSendResponse = async () => {
    if (!selectedMessage || !responseText.trim()) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please enter a response message.",
      });
      return;
    }

    setResponding(true);
    try {
      const result = await respondToMessage({
        messageId: selectedMessage.id,
        response: responseText.trim(),
        internalNotes: internalNotes.trim() || undefined,
      });

      if (result.success) {
        setResponseModalVisible(false);
        setSelectedMessage(null);
        setResponseText("");
        setInternalNotes("");
      }
    } catch (error) {
      console.error("Error sending response:", error);
    } finally {
      setResponding(false);
    }
  };

  const applyFilters = () => {
    const newFilters: MessageFilters = {};

    if (searchTerm.trim()) {
      newFilters.searchTerm = searchTerm.trim();
    }

    setFilters(newFilters);
    setFiltersVisible(false);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setFiltersVisible(false);
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

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <TouchableOpacity style={styles.messageCard} onPress={() => handleMessagePress(item)}>
      <View style={styles.messageHeader}>
        <View style={styles.messageIconContainer}>
          <Ionicons name={CATEGORY_ICONS[item.category] as any} size={24} color="#007AFF" />
        </View>

        <View style={styles.messageMainContent}>
          <View style={styles.messageTitleRow}>
            <ThemedText style={styles.messageSubject} numberOfLines={1}>
              {item.subject}
            </ThemedText>
            <View style={styles.categoryBadge}>
              <ThemedText style={styles.categoryText}>{item.category.replace("_", " ").toUpperCase()}</ThemedText>
            </View>
          </View>

          <View style={styles.messageUserRow}>
            <ThemedText style={styles.messageUserName}>{item.userName}</ThemedText>
            <ThemedText style={styles.messageUserEmail}>({item.userEmail})</ThemedText>
          </View>

          <ThemedText style={styles.messagePreview} numberOfLines={2}>
            {item.content}
          </ThemedText>

          <View style={styles.messageFooter}>
            <ThemedText style={styles.messageDate}>{formatDate(item.createdAt)}</ThemedText>
            <View style={styles.messageActions}>
              <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] }]}>
                <ThemedText style={styles.statusText}>{STATUS_LABELS[item.status]}</ThemedText>
              </View>
              {item.status !== "responded" && (
                <TouchableOpacity
                  style={styles.respondButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleResponsePress(item);
                  }}>
                  <Ionicons name="chatbubble-outline" size={16} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMessageDetail = () => {
    if (!selectedMessage) return null;

    return (
      <Modal visible={!!selectedMessage} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedMessage(null)}>
        <SafeAreaView style={styles.detailContainer}>
          {/* Detail Header */}
          <ThemedView style={styles.detailHeader}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedMessage(null)}>
              <Ionicons name="close" size={24} color="#007AFF" />
            </TouchableOpacity>
            <ThemedText style={styles.detailHeaderTitle}>Message Details</ThemedText>
            {selectedMessage.status !== "responded" && (
              <TouchableOpacity style={styles.respondHeaderButton} onPress={() => handleResponsePress(selectedMessage)}>
                <Ionicons name="chatbubble" size={20} color="#007AFF" />
                <ThemedText style={styles.respondHeaderButtonText}>Respond</ThemedText>
              </TouchableOpacity>
            )}
            {selectedMessage.status === "responded" && <View style={styles.detailHeaderRight} />}
          </ThemedView>

          <ScrollView style={styles.detailContent} showsVerticalScrollIndicator={false}>
            <ThemedView style={styles.detailCard}>
              {/* Message Info */}
              <View style={styles.detailInfoSection}>
                <View style={styles.detailInfoRow}>
                  <Ionicons name="person-circle-outline" size={24} color="#007AFF" />
                  <View style={styles.detailInfoContent}>
                    <ThemedText style={styles.detailInfoLabel}>From:</ThemedText>
                    <ThemedText style={styles.detailInfoValue}>{selectedMessage.userName}</ThemedText>
                    <ThemedText style={styles.detailInfoValueSecondary}>{selectedMessage.userEmail}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailInfoRow}>
                  <Ionicons name="document-text-outline" size={24} color="#007AFF" />
                  <View style={styles.detailInfoContent}>
                    <ThemedText style={styles.detailInfoLabel}>Subject:</ThemedText>
                    <ThemedText style={styles.detailInfoValue}>{selectedMessage.subject}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailInfoRow}>
                  <Ionicons name="time-outline" size={24} color="#007AFF" />
                  <View style={styles.detailInfoContent}>
                    <ThemedText style={styles.detailInfoLabel}>Received:</ThemedText>
                    <ThemedText style={styles.detailInfoValue}>{formatFullDate(selectedMessage.createdAt)}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailInfoRow}>
                  <Ionicons name="folder-outline" size={24} color="#28a745" />
                  <View style={styles.detailInfoContent}>
                    <ThemedText style={styles.detailInfoLabel}>Category:</ThemedText>
                    <ThemedText style={styles.detailInfoValue}>{selectedMessage.category.replace("_", " ")}</ThemedText>
                  </View>
                </View>

                <View style={styles.detailInfoRow}>
                  <Ionicons name="checkmark-circle-outline" size={24} color={STATUS_COLORS[selectedMessage.status]} />
                  <View style={styles.detailInfoContent}>
                    <ThemedText style={styles.detailInfoLabel}>Status:</ThemedText>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[selectedMessage.status] }]}>
                      <ThemedText style={styles.statusText}>{STATUS_LABELS[selectedMessage.status]}</ThemedText>
                    </View>
                  </View>
                </View>
              </View>

              {/* Message Content */}
              <View style={styles.detailMessageSection}>
                <ThemedText style={styles.detailSectionTitle}>User Message:</ThemedText>
                <ThemedView style={styles.messageContentCard}>
                  <ThemedText style={styles.messageContentText}>{selectedMessage.content}</ThemedText>
                </ThemedView>
              </View>

              {/* Admin Response */}
              {selectedMessage.adminResponse && (
                <View style={styles.detailResponseSection}>
                  <ThemedText style={styles.detailSectionTitle}>Your Response:</ThemedText>
                  <ThemedView style={styles.responseContentCard}>
                    <View style={styles.responseHeader}>
                      <Ionicons name="person-circle" size={24} color="#28a745" />
                      <View style={styles.responseHeaderText}>
                        <ThemedText style={styles.responseName}>{selectedMessage.adminName || "Support Team"}</ThemedText>
                        <ThemedText style={styles.responseDate}>{selectedMessage.respondedAt ? formatFullDate(selectedMessage.respondedAt) : ""}</ThemedText>
                      </View>
                    </View>
                    <ThemedText style={styles.responseContentText}>{selectedMessage.adminResponse}</ThemedText>
                  </ThemedView>
                </View>
              )}

              {/* Internal Notes */}
              {selectedMessage.internalNotes && (
                <View style={styles.detailNotesSection}>
                  <ThemedText style={styles.detailSectionTitle}>Internal Notes:</ThemedText>
                  <ThemedView style={styles.notesContentCard}>
                    <ThemedText style={styles.notesContentText}>{selectedMessage.internalNotes}</ThemedText>
                  </ThemedView>
                </View>
              )}
            </ThemedView>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderResponseModal = () => (
    <Modal visible={responseModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setResponseModalVisible(false)}>
      <SafeAreaView style={styles.responseContainer}>
        <ThemedView style={styles.responseHeader}>
          <TouchableOpacity onPress={() => setResponseModalVisible(false)}>
            <Ionicons name="close" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.responseHeaderTitle}>Send Response</ThemedText>
          <View style={styles.responseHeaderRight} />
        </ThemedView>

        <ScrollView style={styles.responseContent} showsVerticalScrollIndicator={false}>
          {selectedMessage && (
            <ThemedView style={styles.responseCard}>
              <View style={styles.originalMessageSection}>
                <ThemedText style={styles.originalMessageTitle}>Original Message:</ThemedText>
                <ThemedView style={styles.originalMessageCard}>
                  <ThemedText style={styles.originalMessageSubject}>{selectedMessage.subject}</ThemedText>
                  <ThemedText style={styles.originalMessageFrom}>From: {selectedMessage.userName}</ThemedText>
                  <ThemedText style={styles.originalMessageContent}>{selectedMessage.content}</ThemedText>
                </ThemedView>
              </View>

              <View style={styles.responseFormSection}>
                <ThemedText style={styles.responseFormLabel}>Your Response *</ThemedText>
                <TextInput
                  style={styles.responseInput}
                  value={responseText}
                  onChangeText={setResponseText}
                  placeholder="Type your response to the user..."
                  placeholderTextColor="#8E8E93"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  maxLength={2000}
                />
                <ThemedText style={styles.characterCount}>{responseText.length}/2000</ThemedText>
              </View>

              <View style={styles.notesFormSection}>
                <ThemedText style={styles.notesFormLabel}>Internal Notes (Optional)</ThemedText>
                <TextInput
                  style={styles.notesInput}
                  value={internalNotes}
                  onChangeText={setInternalNotes}
                  placeholder="Add internal notes for your team (not visible to user)..."
                  placeholderTextColor="#8E8E93"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  maxLength={500}
                />
                <ThemedText style={styles.characterCount}>{internalNotes.length}/500</ThemedText>
              </View>

              <ThemedButton onPress={handleSendResponse} disabled={responding || !responseText.trim()} style={[styles.sendButton, (responding || !responseText.trim()) && styles.disabledButton]}>
                {responding ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color="#fff" />
                    <ThemedText style={styles.sendButtonText}>Send Response</ThemedText>
                  </>
                )}
              </ThemedButton>
            </ThemedView>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (!userProfile || userProfile.userType !== "admin") {
    return (
      <AdminLayout>
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Admin access required</ThemedText>
        </View>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <View style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.headerTitle}>Support Messages</ThemedText>
            {stats && (
              <ThemedText style={styles.headerSubtitle}>
                {stats.unreadMessages} unread of {stats.totalMessages} total
              </ThemedText>
            )}
          </View>
          <TouchableOpacity style={styles.searchButton} onPress={() => setFiltersVisible(true)}>
            <Ionicons name="search" size={24} color="#007AFF" />
          </TouchableOpacity>
        </ThemedView>

        {/* Search Bar */}
        <ThemedView style={styles.searchSection}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color="#8E8E93" />
            <TextInput style={styles.searchInput} value={searchTerm} onChangeText={setSearchTerm} placeholder="Search messages..." placeholderTextColor="#8E8E93" onSubmitEditing={applyFilters} />
            {searchTerm.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchTerm("");
                  setFilters({});
                }}>
                <Ionicons name="close-circle" size={20} color="#8E8E93" />
              </TouchableOpacity>
            )}
          </View>
        </ThemedView>

        {/* Messages List */}
        {loading && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <ThemedText style={styles.loadingText}>Loading messages...</ThemedText>
          </View>
        ) : messages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="mail-outline" size={64} color="#8E8E93" />
            <ThemedText style={styles.emptyTitle}>No Messages</ThemedText>
            <ThemedText style={styles.emptySubtitle}>{Object.keys(filters).length > 0 ? "No messages match your current filters." : "No support messages have been received yet."}</ThemedText>
            {Object.keys(filters).length > 0 && (
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                <ThemedText style={styles.clearFiltersText}>Clear Filters</ThemedText>
              </TouchableOpacity>
            )}
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

        {/* Modals */}
        {renderMessageDetail()}
        {renderResponseModal()}
      </View>
    </AdminLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 2,
  },
  searchButton: {
    padding: 8,
  },
  searchSection: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: "#2c3e50",
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
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  clearFiltersButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearFiltersText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
    alignItems: "flex-start",
    padding: 16,
  },
  messageIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e3f2fd",
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
  },
  messageUserRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  messageUserName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#007AFF",
    marginRight: 4,
  },
  messageUserEmail: {
    fontSize: 14,
    color: "#6c757d",
  },
  messagePreview: {
    fontSize: 14,
    color: "#6c757d",
    lineHeight: 20,
    marginBottom: 12,
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
  messageActions: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "#28a745",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  respondButton: {
    padding: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#dc3545",
    textAlign: "center",
  },
  // Detail modal styles
  detailContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  detailHeader: {
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
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  respondHeaderButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  respondHeaderButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  detailHeaderRight: {
    width: 80,
  },
  detailContent: {
    flex: 1,
  },
  detailCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
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
    alignItems: "flex-start",
    marginBottom: 16,
  },
  detailInfoContent: {
    marginLeft: 12,
    flex: 1,
  },
  detailInfoLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6c757d",
    marginBottom: 2,
  },
  detailInfoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  detailInfoValueSecondary: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 2,
  },
  detailMessageSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  messageContentCard: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
  },
  messageContentText: {
    fontSize: 15,
    lineHeight: 22,
  },
  detailResponseSection: {
    marginBottom: 24,
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
    color: "#28a745",
  },
  responseDate: {
    fontSize: 12,
    color: "#6c757d",
  },
  responseContentText: {
    fontSize: 15,
    lineHeight: 22,
  },
  detailNotesSection: {
    marginBottom: 16,
  },
  notesContentCard: {
    backgroundColor: "#fff8dc",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  notesContentText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
  // Response modal styles
  responseContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  responseHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  responseHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  responseHeaderRight: {
    width: 40,
  },
  responseContent: {
    flex: 1,
  },
  responseCard: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  originalMessageSection: {
    marginBottom: 24,
  },
  originalMessageTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  originalMessageCard: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#6c757d",
  },
  originalMessageSubject: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  originalMessageFrom: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 8,
  },
  originalMessageContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  responseFormSection: {
    marginBottom: 24,
  },
  responseFormLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  responseInput: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 120,
    textAlignVertical: "top",
  },
  notesFormSection: {
    marginBottom: 24,
  },
  notesFormLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#6c757d",
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: "#fff",
    minHeight: 80,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "right",
    marginTop: 4,
  },
  sendButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    paddingVertical: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: "#8E8E93",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
