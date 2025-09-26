import { useCallback, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { SubscriptionRequest, UserProfile } from "../types/user";
import { useFirestore } from "./useFirestore";
import { useStorage } from "./useStorage";

export function useSubscription() {
  const { user, userProfile } = useAuthContext();
  const { addDocument, updateDocument, getDocumentsWhere } = useFirestore();
  const { uploadImage } = useStorage();
  const [loading, setLoading] = useState(false);

  // Submit subscription request
  const submitSubscriptionRequest = useCallback(
    async (planType: "premium_monthly" | "pro_monthly", referenceNumber: string, imageUri: string): Promise<{ success: boolean; error?: string }> => {
      if (!user || !userProfile) {
        return { success: false, error: "User must be logged in" };
      }

      if (userProfile.userType === "premium" || userProfile.userType === "pro") {
        return { success: false, error: "User already has an active subscription" };
      }

      setLoading(true);
      try {
        // Upload reference image to Firebase Storage
        const imagePath = `subscription_references/${user.uid}/${Date.now()}_${referenceNumber}.jpg`;
        const uploadResult = await uploadImage(imageUri, imagePath);

        if (!uploadResult.success || !uploadResult.downloadURL) {
          return { success: false, error: uploadResult.error || "Failed to upload reference image" };
        }

        // Create subscription request document
        const subscriptionRequest: Omit<SubscriptionRequest, "id"> = {
          userId: user.uid,
          userEmail: userProfile.email,
          userName: `${userProfile.firstName} ${userProfile.lastName}`,
          planType,
          referenceNumber,
          referenceImageUrl: uploadResult.downloadURL,
          status: "pending",
          submittedAt: new Date(),
        };

        const requestResult = await addDocument("subscription_requests", subscriptionRequest);
        if (!requestResult.success) {
          return { success: false, error: requestResult.error || "Failed to submit subscription request" };
        }

        // Update user profile to indicate pending subscription
        const userUpdate: Partial<UserProfile> = {
          subscription: {
            status: "pending",
            planType,
            submittedAt: new Date(),
            referenceImageUrl: uploadResult.downloadURL,
            referenceNumber,
          },
          updatedAt: new Date(),
        };

        const updateResult = await updateDocument("users", user.uid, userUpdate);
        if (!updateResult.success) {
          console.warn("Failed to update user profile, but subscription request was submitted");
        }

        return { success: true };
      } catch (error: any) {
        console.error("Error submitting subscription request:", error);
        return { success: false, error: error.message || "An unexpected error occurred" };
      } finally {
        setLoading(false);
      }
    },
    [user, userProfile, addDocument, updateDocument, uploadImage]
  );

  // Get user's subscription requests
  const getUserSubscriptionRequests = useCallback(async (): Promise<SubscriptionRequest[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      const result = await getDocumentsWhere("subscription_requests", "userId", "==", user.uid);

      if (result.success && result.data) {
        return result.data
          .map((doc: any) => ({
            id: doc.id,
            ...doc,
            submittedAt: doc.submittedAt?.toDate ? doc.submittedAt.toDate() : new Date(doc.submittedAt),
            reviewedAt: doc.reviewedAt?.toDate ? doc.reviewedAt.toDate() : doc.reviewedAt ? new Date(doc.reviewedAt) : undefined,
          }))
          .sort((a: SubscriptionRequest, b: SubscriptionRequest) => b.submittedAt.getTime() - a.submittedAt.getTime()) as SubscriptionRequest[];
      }
      return [];
    } catch (error) {
      console.error("Error getting user subscription requests:", error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, getDocumentsWhere]);

  // Check if user can subscribe (not already subscribed or pending)
  const canSubscribe = useCallback((): boolean => {
    if (!userProfile) return false;

    return userProfile.userType === "free" && (!userProfile.subscription || userProfile.subscription.status === "rejected");
  }, [userProfile]);

  // Get subscription status info
  const getSubscriptionStatus = useCallback(() => {
    if (!userProfile) return { status: "unknown", message: "User profile not loaded" };

    switch (userProfile.userType) {
      case "premium":
        return {
          status: "active",
          message: "Your Premium subscription is active (300 generations/month)",
          subscription: userProfile.subscription,
        };
      case "pro":
        return {
          status: "active",
          message: "Your Pro subscription is active (unlimited generations)",
          subscription: userProfile.subscription,
        };
      case "admin":
        return {
          status: "admin",
          message: "Admin account - unlimited access",
        };
      case "free":
        if (userProfile.subscription) {
          switch (userProfile.subscription.status) {
            case "pending":
              return {
                status: "pending",
                message: "Your subscription request is being reviewed",
                subscription: userProfile.subscription,
              };
            case "rejected":
              return {
                status: "rejected",
                message: "Your subscription request was rejected. You can submit a new request.",
                subscription: userProfile.subscription,
              };
            case "expired":
              return {
                status: "expired",
                message: "Your subscription has expired. Please renew to continue unlimited access.",
                subscription: userProfile.subscription,
              };
          }
        }
        return {
          status: "free",
          message: "You have a free account with limited access",
        };
      default:
        return { status: "unknown", message: "Unknown account status" };
    }
  }, [userProfile]);

  return {
    loading,
    submitSubscriptionRequest,
    getUserSubscriptionRequests,
    canSubscribe,
    getSubscriptionStatus,
  };
}
