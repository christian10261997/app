import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageUpload } from "../../../components/ImageUpload";
import { SubscriptionPlanCard } from "../../../components/SubscriptionPlanCard";
import { ThemedButton } from "../../../components/ThemedButton";
import { ThemedText } from "../../../components/ThemedText";
import { ThemedView } from "../../../components/ThemedView";
import { useAuthContext } from "../../../contexts/AuthContext";
import { useToast } from "../../../contexts/ToastContext";
import { useSubscription } from "../../../hooks/useSubscription";
import { SubscriptionRequest } from "../../../types/user";

const SUBSCRIPTION_PLANS = [
  {
    planType: "premium_monthly" as const,
    title: "Premium Plan",
    price: "₱149/month",
    features: ["300 recipe generations per month", "Advanced filtering options", "Save favorite recipes", "Email customer support"],
    isPopular: true,
  },
  {
    planType: "pro_monthly" as const,
    title: "Pro Plan",
    price: "₱399/month",
    originalPrice: "",
    features: ["Unlimited recipe generations", "Advanced filtering options", "Save favorite recipes", "Priority customer support", "Early access to new features"],
    isPopular: false,
  },
];

export default function Subscription() {
  const { userProfile } = useAuthContext();
  const { showToast } = useToast();
  const { loading, submitSubscriptionRequest, getSubscriptionStatus, getUserSubscriptionRequests } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<"premium_monthly" | "pro_monthly">("premium_monthly");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [referenceImage, setReferenceImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const subscriptionStatus = getSubscriptionStatus();

  useEffect(() => {
    setSelectedPlan("premium_monthly");
    loadSubscriptionHistory();
  }, []);

  const loadSubscriptionHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await getUserSubscriptionRequests();
      setSubscriptionHistory(history);
    } catch (error) {
      console.error("Error loading subscription history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmitSubscription = async () => {
    if (!referenceNumber.trim()) {
      showToast({
        type: "error",
        title: "Missing Information",
        message: "Please enter your payment reference number",
      });
      return;
    }

    if (!referenceImage) {
      showToast({
        type: "error",
        title: "Missing Image",
        message: "Please upload your payment reference image",
      });
      return;
    }

    Alert.alert("Submit Subscription Request", `Are you sure you want to submit your ${selectedPlan === "premium_monthly" ? "Premium" : "Pro"} subscription request?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Submit",
        onPress: async () => {
          setIsSubmitting(true);
          try {
            const result = await submitSubscriptionRequest(selectedPlan, referenceNumber, referenceImage);

            if (result.success) {
              showToast({
                type: "success",
                title: "Request Submitted",
                message: "Your subscription request has been submitted successfully. We'll review it within 24 hours.",
              });
              // Reset form and reload history
              setReferenceNumber("");
              setReferenceImage("");
              loadSubscriptionHistory();
            } else {
              showToast({
                type: "error",
                title: "Submission Failed",
                message: result.error || "Failed to submit subscription request",
              });
            }
          } catch (error) {
            showToast({
              type: "error",
              title: "Error",
              message: "An unexpected error occurred",
            });
          } finally {
            setIsSubmitting(false);
          }
        },
      },
    ]);
  };

  const renderSubscriptionStatus = () => {
    const status = subscriptionStatus.status;

    if (status === "active") {
      return (
        <ThemedView style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: "#34C759" }]}>
            <Ionicons name="checkmark-circle" size={24} color="#fff" />
          </View>
          <View style={styles.statusContent}>
            <ThemedText style={styles.statusTitle}>Subscription Active</ThemedText>
            <ThemedText style={styles.statusMessage}>{subscriptionStatus.message}</ThemedText>
            {subscriptionStatus.subscription?.expiresAt && <ThemedText style={styles.statusExpiry}>Expires: {subscriptionStatus.subscription.expiresAt.toLocaleDateString()}</ThemedText>}
          </View>
        </ThemedView>
      );
    }

    if (status === "pending") {
      return (
        <ThemedView style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: "#FF9500" }]}>
            <Ionicons name="time-outline" size={24} color="#fff" />
          </View>
          <View style={styles.statusContent}>
            <ThemedText style={styles.statusTitle}>Subscription Pending</ThemedText>
            <ThemedText style={styles.statusMessage}>Your subscription request is being reviewed</ThemedText>
            <ThemedText style={styles.statusNote}>We'll notify you once it's approved (usually within 24 hours)</ThemedText>
          </View>
        </ThemedView>
      );
    }

    if (status === "rejected") {
      return (
        <ThemedView style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: "#FF3B30" }]}>
            <Ionicons name="close-circle" size={24} color="#fff" />
          </View>
          <View style={styles.statusContent}>
            <ThemedText style={styles.statusTitle}>Subscription Rejected</ThemedText>
            <ThemedText style={styles.statusMessage}>Your previous request was rejected</ThemedText>
            <ThemedText style={styles.statusNote}>You can submit a new request below</ThemedText>
          </View>
        </ThemedView>
      );
    }

    if (status === "admin") {
      return (
        <ThemedView style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: "#007AFF" }]}>
            <Ionicons name="shield-checkmark" size={24} color="#fff" />
          </View>
          <View style={styles.statusContent}>
            <ThemedText style={styles.statusTitle}>Admin Account</ThemedText>
            <ThemedText style={styles.statusMessage}>You have unlimited access to all features</ThemedText>
          </View>
        </ThemedView>
      );
    }

    return null;
  };

  const canShowSubscriptionForm = () => {
    return subscriptionStatus.status === "free" || subscriptionStatus.status === "rejected";
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "time-outline";
      case "approved":
        return "checkmark-circle";
      case "rejected":
        return "close-circle";
      default:
        return "help-circle";
    }
  };

  const renderSubscriptionHistory = () => {
    if (subscriptionHistory.length === 0) {
      return (
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Subscription History</ThemedText>
          <View style={styles.emptyHistory}>
            <Ionicons name="document-outline" size={48} color="#8E8E93" />
            <ThemedText style={styles.emptyHistoryText}>No subscription requests yet</ThemedText>
          </View>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Subscription History</ThemedText>
        {loadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#34C759" />
            <ThemedText style={styles.loadingText}>Loading history...</ThemedText>
          </View>
        ) : (
          <View style={styles.historyList}>
            {subscriptionHistory.map((request, index) => (
              <View key={request.id} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyStatus}>
                    <Ionicons name={getStatusIcon(request.status) as any} size={20} color={getStatusColor(request.status)} />
                    <ThemedText style={[styles.statusText, { color: getStatusColor(request.status) }]}>{request.status.toUpperCase()}</ThemedText>
                  </View>
                  <ThemedText style={styles.historyDate}>{request.submittedAt.toLocaleDateString()}</ThemedText>
                </View>

                <View style={styles.historyDetails}>
                  <ThemedText style={styles.historyPlan}>{request.planType.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())} Plan</ThemedText>
                  <ThemedText style={styles.historyRef}>Ref: {request.referenceNumber}</ThemedText>

                  {request.reviewedAt && <ThemedText style={styles.historyReviewed}>Reviewed: {request.reviewedAt.toLocaleDateString()}</ThemedText>}

                  {request.adminNotes && (
                    <View style={styles.adminNotesContainer}>
                      <ThemedText style={styles.adminNotesLabel}>Admin Notes:</ThemedText>
                      <ThemedText style={styles.adminNotes}>{request.adminNotes}</ThemedText>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ThemedView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderSubscriptionStatus()}

          {canShowSubscriptionForm() && (
            <>
              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Choose Your Plan</ThemedText>
                <ThemedText style={styles.sectionSubtitle}>Unlock premium features and enhanced recipe generation</ThemedText>

                {SUBSCRIPTION_PLANS.map((plan) => (
                  <SubscriptionPlanCard key={plan.planType} {...plan} isSelected={selectedPlan === plan.planType} onSelect={() => setSelectedPlan(plan.planType)} />
                ))}
              </ThemedView>

              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Payment Information</ThemedText>
                <ThemedText style={styles.paymentInstructions}>Please complete your payment via GCash, then upload your payment reference below for verification.</ThemedText>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Payment Reference Number</ThemedText>
                  <TextInput style={styles.textInput} value={referenceNumber} onChangeText={setReferenceNumber} placeholder="Enter your GCash reference number" placeholderTextColor="#8E8E93" />
                </View>

                <View style={styles.inputContainer}>
                  <ImageUpload imageUri={referenceImage} onImageSelect={setReferenceImage} onImageRemove={() => setReferenceImage("")} disabled={isSubmitting} />
                </View>
              </ThemedView>

              <View style={styles.submitContainer}>
                <ThemedButton onPress={handleSubmitSubscription} disabled={isSubmitting || loading} style={styles.submitButton}>
                  {isSubmitting ? <ActivityIndicator size="small" color="#fff" /> : "Submit Subscription Request"}
                </ThemedButton>

                <ThemedText style={styles.submitNote}>Your request will be reviewed within 24 hours</ThemedText>
              </View>
            </>
          )}

          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Need Help?</ThemedText>
            <ThemedText style={styles.contactText}>If you have any questions about your subscription, please contact our support team.</ThemedText>
            <TouchableOpacity style={styles.contactButton} onPress={() => router.push("/home/contact")}>
              <ThemedText style={styles.contactButtonText}>Contact Support</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {/* Subscription History */}
          {renderSubscriptionHistory()}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2c3e50",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 20,
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 16,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  statusMessage: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
  },
  statusExpiry: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
  },
  statusNote: {
    fontSize: 12,
    color: "#FF3B30",
    marginTop: 4,
    fontStyle: "italic",
  },
  paymentInstructions: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 20,
    lineHeight: 20,
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#34C759",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#2c3e50",
  },
  submitContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  submitButton: {
    marginBottom: 8,
    backgroundColor: "#34C759",
  },
  submitNote: {
    textAlign: "center",
    fontSize: 12,
    color: "#8E8E93",
  },
  contactText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34C759",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  emptyHistory: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyHistoryText: {
    fontSize: 16,
    color: "#8E8E93",
    marginTop: 12,
    textAlign: "center",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: "#8E8E93",
    marginLeft: 8,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#e9ecef",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  historyStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  historyDate: {
    fontSize: 12,
    color: "#8E8E93",
  },
  historyDetails: {
    gap: 4,
  },
  historyPlan: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  historyRef: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  historyReviewed: {
    fontSize: 12,
    color: "#8E8E93",
    fontStyle: "italic",
  },
  adminNotesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#34C759",
  },
  adminNotesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#34C759",
    marginBottom: 4,
  },
  adminNotes: {
    fontSize: 14,
    color: "#2c3e50",
    lineHeight: 18,
  },
});
