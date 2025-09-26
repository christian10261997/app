import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { SubscriptionRequest, UserProfile } from "../types/user";
import { useFirestore } from "./useFirestore";

export function useAdmin() {
  const { userProfile } = useAuthContext();
  const { getDocuments, updateDocument, searchDocuments } = useFirestore();

  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsAdmin(userProfile?.userType === "admin");
  }, [userProfile]);

  // Get dashboard statistics
  const getDashboardStats = useCallback(async () => {
    if (!isAdmin) return null;

    setLoading(true);
    try {
      // Get all users
      const usersResult = await getDocuments("users");
      if (!usersResult.success || !usersResult.data) return null;

      const users = usersResult.data;
      const totalUsers = users.length;
      const freeUsers = users.filter((user: any) => user.userType === "free" || !user.userType).length;
      const premiumUsers = users.filter((user: any) => user.userType === "premium").length;
      const proUsers = users.filter((user: any) => user.userType === "pro").length;
      const adminUsers = users.filter((user: any) => user.userType === "admin").length;

      // Get pending subscription requests
      const requestsResult = await searchDocuments("subscription_requests", [{ field: "status", operator: "==", value: "pending" }]);

      const pendingRequests = requestsResult.success && requestsResult.data ? requestsResult.data.length : 0;

      return {
        totalUsers,
        freeUsers,
        premiumUsers,
        proUsers,
        adminUsers,
        pendingRequests,
      };
    } catch (error) {
      console.error("Error getting dashboard stats:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAdmin, getDocuments, searchDocuments]);

  // Get all subscription requests
  const getSubscriptionRequests = useCallback(
    async (status?: "pending" | "approved" | "rejected") => {
      if (!isAdmin) return [];

      setLoading(true);
      try {
        let result;
        if (status) {
          result = await searchDocuments("subscription_requests", [{ field: "status", operator: "==", value: status }]);
        } else {
          result = await getDocuments("subscription_requests");
        }

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
        console.error("Error getting subscription requests:", error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, getDocuments, searchDocuments]
  );

  // Approve subscription request
  const approveSubscriptionRequest = useCallback(
    async (request: SubscriptionRequest): Promise<boolean> => {
      if (!isAdmin || !userProfile) return false;

      setLoading(true);
      try {
        const now = new Date();

        // Calculate expiry date (30 days for monthly plans)
        const expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + 30); // Monthly billing for both plans

        // Update subscription request
        const updatedRequest = {
          status: "approved" as const,
          reviewedAt: now,
          reviewedBy: userProfile.id,
          adminNotes: "Payment verified and approved",
        };

        await updateDocument("subscription_requests", request.id, updatedRequest);

        // Determine user type based on plan
        let newUserType: "premium" | "pro";
        if (request.planType === "premium_monthly") {
          newUserType = "premium";
        } else {
          newUserType = "pro";
        }

        // Update user profile
        const userProfileUpdate: Partial<UserProfile> = {
          userType: newUserType,
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
        return true;
      } catch (error) {
        console.error("Error approving subscription request:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, userProfile, updateDocument]
  );

  // Reject subscription request
  const rejectSubscriptionRequest = useCallback(
    async (request: SubscriptionRequest, reason?: string): Promise<boolean> => {
      if (!isAdmin || !userProfile) return false;

      setLoading(true);
      try {
        const now = new Date();

        // Update subscription request
        const updatedRequest = {
          status: "rejected" as const,
          reviewedAt: now,
          reviewedBy: userProfile.id,
          adminNotes: reason || "Payment could not be verified",
        };

        await updateDocument("subscription_requests", request.id, updatedRequest);
        return true;
      } catch (error) {
        console.error("Error rejecting subscription request:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, userProfile, updateDocument]
  );

  // Get all users with filtering
  const getUsers = useCallback(
    async (userType?: "free" | "subscribed" | "admin") => {
      if (!isAdmin) return [];

      setLoading(true);
      try {
        let result;
        if (userType) {
          result = await searchDocuments("users", [{ field: "userType", operator: "==", value: userType }]);
        } else {
          result = await getDocuments("users");
        }

        if (result.success && result.data) {
          return result.data
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
                lastGenerationAt: undefined,
                monthlyGenerations: 0,
                currentMonthStart: new Date(),
              },
            }))
            .sort((a: UserProfile, b: UserProfile) => b.createdAt.getTime() - a.createdAt.getTime()) as UserProfile[];
        }
        return [];
      } catch (error) {
        console.error("Error getting users:", error);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, getDocuments, searchDocuments]
  );

  // Update user type
  const updateUserType = useCallback(
    async (userId: string, newUserType: "free" | "premium" | "pro" | "admin"): Promise<boolean> => {
      if (!isAdmin) return false;

      setLoading(true);
      try {
        const updates: Partial<UserProfile> = {
          userType: newUserType,
          updatedAt: new Date(),
        };

        // Reset usage stats if changing to free
        if (newUserType === "free") {
          updates.usageStats = {
            recipeGenerationsCount: 0,
            lastGenerationAt: undefined,
            monthlyGenerations: 0,
            currentMonthStart: new Date(),
          };
          // Clear subscription if downgrading to free
          updates.subscription = undefined;
        }

        await updateDocument("users", userId, updates);
        return true;
      } catch (error) {
        console.error("Error updating user type:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, updateDocument]
  );

  // Reset user usage statistics
  const resetUserUsage = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!isAdmin) return false;

      setLoading(true);
      try {
        const updates: Partial<UserProfile> = {
          usageStats: {
            recipeGenerationsCount: 0,
            lastGenerationAt: undefined,
            monthlyGenerations: 0,
            currentMonthStart: new Date(),
          },
          updatedAt: new Date(),
        };

        await updateDocument("users", userId, updates);
        return true;
      } catch (error) {
        console.error("Error resetting user usage:", error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, updateDocument]
  );

  return {
    isAdmin,
    loading,
    getDashboardStats,
    getSubscriptionRequests,
    approveSubscriptionRequest,
    rejectSubscriptionRequest,
    getUsers,
    updateUserType,
    resetUserUsage,
  };
}
