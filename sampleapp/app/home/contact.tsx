import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedButton } from "../../components/ThemedButton";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { useAuthContext } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useMessages } from "../../hooks/useMessages";
import { MessageCategory } from "../../types/message";

const CATEGORIES: { value: MessageCategory; label: string; icon: string }[] = [
  { value: "general_inquiry", label: "General Inquiry", icon: "help-circle-outline" },
  { value: "technical_support", label: "Technical Support", icon: "construct-outline" },
  { value: "subscription_issue", label: "Subscription Issue", icon: "card-outline" },
  { value: "account_help", label: "Account Help", icon: "person-outline" },
  { value: "feature_request", label: "Feature Request", icon: "bulb-outline" },
  { value: "bug_report", label: "Bug Report", icon: "bug-outline" },
  { value: "billing_question", label: "Billing Question", icon: "receipt-outline" },
  { value: "other", label: "Other", icon: "ellipsis-horizontal-outline" },
];

export default function ContactScreen() {
  const { userProfile } = useAuthContext();
  const { showToast } = useToast();
  const { createMessage, loading, loadUserMessages } = useMessages();

  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MessageCategory>("general_inquiry");

  const handleSubmit = async () => {
    if (!subject.trim()) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please enter a subject for your message.",
      });
      return;
    }

    if (!content.trim()) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please enter your message content.",
      });
      return;
    }

    if (content.trim().length < 10) {
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please provide more details in your message (at least 10 characters).",
      });
      return;
    }

    const result = await createMessage({
      subject: subject.trim(),
      content: content.trim(),
      category: selectedCategory,
      priority: "medium", // Default to medium priority
    });

    if (result.success) {
      // Reset form
      setSubject("");
      setContent("");
      setSelectedCategory("general_inquiry");

      // Refresh messages list for when user visits messages page
      loadUserMessages();

      // Go back or to messages list
      router.back();
    } else {
      showToast({
        type: "error",
        title: "Failed to Send Message",
        message: result.error || "Please try again later.",
      });
    }
  };

  const handleViewMessages = () => {
    router.push("/home/messages");
  };

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>Please log in to contact support</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#28a745" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Contact Support</ThemedText>
          <TouchableOpacity style={styles.messagesButton} onPress={handleViewMessages}>
            <Ionicons name="mail-outline" size={24} color="#28a745" />
          </TouchableOpacity>
        </ThemedView>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Welcome Message */}
          <ThemedView style={styles.welcomeSection}>
            <Ionicons name="chatbubbles-outline" size={48} color="#28a745" />
            <ThemedText style={styles.welcomeTitle}>How can we help you?</ThemedText>
            <ThemedText style={styles.welcomeSubtitle}>Send us a message and our support team will get back to you as soon as possible.</ThemedText>
          </ThemedView>

          {/* Form */}
          <ThemedView style={styles.formSection}>
            {/* Category Selection */}
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Category</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.value}
                    style={[styles.categoryChip, selectedCategory === category.value && styles.selectedCategoryChip]}
                    onPress={() => setSelectedCategory(category.value)}>
                    <Ionicons name={category.icon as any} size={16} color={selectedCategory === category.value ? "#fff" : "#28a745"} />
                    <ThemedText style={[styles.categoryChipText, selectedCategory === category.value && styles.selectedCategoryChipText]}>{category.label}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Subject */}
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Subject *</ThemedText>
              <TextInput style={styles.textInput} value={subject} onChangeText={setSubject} placeholder="Brief description of your issue or question" placeholderTextColor="#8E8E93" maxLength={100} />
              <ThemedText style={styles.characterCount}>{subject.length}/100</ThemedText>
            </View>

            {/* Message Content */}
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.fieldLabel}>Message *</ThemedText>
              <TextInput
                style={[styles.textInput, styles.messageInput]}
                value={content}
                onChangeText={setContent}
                placeholder="Please provide as much detail as possible about your issue or question. This helps us provide better support."
                placeholderTextColor="#8E8E93"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                maxLength={1000}
              />
              <ThemedText style={styles.characterCount}>{content.length}/1000</ThemedText>
            </View>

            {/* Submit Button */}
            <ThemedButton
              onPress={handleSubmit}
              disabled={loading || !subject.trim() || !content.trim()}
              style={[styles.submitButton, (loading || !subject.trim() || !content.trim()) && styles.disabledButton]}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#fff" />
                  <ThemedText style={styles.submitButtonText}>Send Message</ThemedText>
                </>
              )}
            </ThemedButton>

            {/* Info */}
            <View style={styles.infoSection}>
              <Ionicons name="information-circle-outline" size={20} color="#28a745" />
              <ThemedText style={styles.infoText}>We typically respond within 24 hours. All messages are prioritized by our support team.</ThemedText>
            </View>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
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
    color: "#333",
  },
  messagesButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
    color: "#333",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  formSection: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#28a745",
    backgroundColor: "#fff",
    marginRight: 8,
  },
  selectedCategoryChip: {
    backgroundColor: "#28a745",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#28a745",
    marginLeft: 6,
    fontWeight: "500",
  },
  selectedCategoryChipText: {
    color: "#fff",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    minHeight: 48,
    color: "#333",
  },
  messageInput: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  characterCount: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "right",
    marginTop: 4,
  },
  submitButton: {
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
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    padding: 12,
    backgroundColor: "#e8f5e8",
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#2d5a3d",
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
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
});
