import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ImageUpload } from "../../components/ImageUpload";
import { SubscriptionPlanCard } from "../../components/SubscriptionPlanCard";
import { ThemedButton } from "../../components/ThemedButton";
import { ThemedText } from "../../components/ThemedText";
import { ThemedView } from "../../components/ThemedView";
import { useAuthContext } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import { useSubscription } from "../../hooks/useSubscription";

const SUBSCRIPTION_PLANS = [
  {
    planType: "monthly" as const,
    title: "Monthly Plan",
    price: "₱99",
    features: ["Unlimited recipe generation", "AI-powered suggestions", "Save favorite recipes", "Priority customer support", "Access to premium content"],
  },
  {
    planType: "yearly" as const,
    title: "Yearly Plan",
    price: "₱999",
    originalPrice: "₱1,188",
    features: ["Everything in Monthly Plan", "20% savings vs monthly", "Exclusive yearly recipes", "Early access to new features", "Premium recipe collections", "Nutrition analysis"],
    isPopular: true,
  },
];

export default function Subscription() {
  const { userProfile } = useAuthContext();
  const { showToast } = useToast();
  const { loading, submitSubscriptionRequest, getSubscriptionStatus } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [referenceImage, setReferenceImage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subscriptionStatus = getSubscriptionStatus();

  useEffect(() => {
    setSelectedPlan("yearly");
  }, []);

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

    Alert.alert("Submit Subscription Request", `You are about to submit a ${selectedPlan} subscription request. This will be reviewed by our admin team.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Submit",
        style: "default",
        onPress: async () => {
          setIsSubmitting(true);
          try {
            const result = await submitSubscriptionRequest(selectedPlan, referenceNumber.trim(), referenceImage);

            if (result.success) {
              showToast({
                type: "success",
                title: "Request Submitted",
                message: "Your subscription request has been submitted for review",
              });

              setReferenceNumber("");
              setReferenceImage("");

              setTimeout(() => {
                router.back();
              }, 2000);
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
            <ThemedText style={styles.statusMessage}>You have unlimited access to all features</ThemedText>
            {subscriptionStatus.subscription?.expiresAt && <ThemedText style={styles.statusExpiry}>Expires: {subscriptionStatus.subscription.expiresAt.toLocaleDateString()}</ThemedText>}
          </View>
        </ThemedView>
      );
    }

    if (status === "pending") {
      return (
        <ThemedView style={styles.statusContainer}>
          <View style={[styles.statusIndicator, { backgroundColor: "#FF9500" }]}>
            <Ionicons name="time" size={24} color="#fff" />
          </View>
          <View style={styles.statusContent}>
            <ThemedText style={styles.statusTitle}>Request Under Review</ThemedText>
            <ThemedText style={styles.statusMessage}>Your subscription request is being reviewed by our admin team</ThemedText>
            {subscriptionStatus.subscription?.submittedAt && <ThemedText style={styles.statusExpiry}>Submitted: {subscriptionStatus.subscription.submittedAt.toLocaleDateString()}</ThemedText>}
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
            <ThemedText style={styles.statusTitle}>Request Rejected</ThemedText>
            <ThemedText style={styles.statusMessage}>Your previous request was rejected. You can submit a new request below.</ThemedText>
            {subscriptionStatus.subscription?.adminNotes && <ThemedText style={styles.statusNote}>Note: {subscriptionStatus.subscription.adminNotes}</ThemedText>}
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
            <ThemedText style={styles.statusMessage}>You have unlimited access as an administrator</ThemedText>
          </View>
        </ThemedView>
      );
    }

    return null;
  };

  const canShowSubscriptionForm = () => {
    return subscriptionStatus.status === "free" || subscriptionStatus.status === "rejected";
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Subscription</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderSubscriptionStatus()}

          {canShowSubscriptionForm() && (
            <>
              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Choose Your Plan</ThemedText>
                <ThemedText style={styles.sectionSubtitle}>Unlock unlimited recipe generation and premium features</ThemedText>

                {SUBSCRIPTION_PLANS.map((plan) => (
                  <SubscriptionPlanCard key={plan.planType} {...plan} isSelected={selectedPlan === plan.planType} onSelect={() => setSelectedPlan(plan.planType)} />
                ))}
              </ThemedView>

              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Payment Information</ThemedText>
                <ThemedText style={styles.paymentInstructions}>Send payment to the following account and upload your reference:</ThemedText>

                <View style={styles.paymentDetails}>
                  <View style={styles.paymentMethod}>
                    <ThemedText style={styles.paymentLabel}>GCash Number:</ThemedText>
                    <ThemedText style={styles.paymentValue}>09XX-XXX-XXXX</ThemedText>
                  </View>
                  <View style={styles.paymentMethod}>
                    <ThemedText style={styles.paymentLabel}>BPI Account:</ThemedText>
                    <ThemedText style={styles.paymentValue}>XXXX-XXXX-XX</ThemedText>
                  </View>
                  <View style={styles.paymentMethod}>
                    <ThemedText style={styles.paymentLabel}>Amount:</ThemedText>
                    <ThemedText style={styles.paymentValue}>{SUBSCRIPTION_PLANS.find((p) => p.planType === selectedPlan)?.price}</ThemedText>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <ThemedText style={styles.inputLabel}>Payment Reference Number *</ThemedText>
                  <TextInput style={styles.textInput} placeholder="Enter transaction/reference number" value={referenceNumber} onChangeText={setReferenceNumber} autoCapitalize="none" />
                </View>

                <ImageUpload imageUri={referenceImage} onImageSelect={setReferenceImage} onImageRemove={() => setReferenceImage("")} disabled={isSubmitting} />
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
            <ThemedText style={styles.contactText}>If you have any questions about your subscription, please contact us at:</ThemedText>
            <ThemedText style={styles.contactEmail}>support@kitchenpal.com</ThemedText>
          </ThemedView>
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
    marginBottom: 16,
    lineHeight: 20,
  },
  paymentDetails: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  paymentMethod: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#5D6D7E",
    fontWeight: "500",
  },
  paymentValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "600",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2c3e50",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e9ecef",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#2c3e50",
  },
  submitContainer: {
    padding: 16,
  },
  submitButton: {
    marginBottom: 12,
  },
  submitNote: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
  },
  contactText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 8,
    lineHeight: 20,
  },
  contactEmail: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
});
