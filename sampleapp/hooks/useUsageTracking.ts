import { useCallback, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { UserProfile } from "../types/user";
import { useFirestore } from "./useFirestore";

export function useUsageTracking() {
  const { user, userProfile, refreshUserProfile } = useAuthContext();
  const { updateDocument } = useFirestore();
  const [loading, setLoading] = useState(false);

  // Check if user can generate recipes (within limits or subscribed)
  const canGenerateRecipe = useCallback((): {
    canGenerate: boolean;
    reason?: string;
    usageCount: number;
    limit: number;
  } => {
    if (!userProfile) {
      return {
        canGenerate: false,
        reason: "User profile not loaded",
        usageCount: 0,
        limit: 0,
      };
    }

    // Admin and Pro users have unlimited access
    if (userProfile.userType === "admin" || userProfile.userType === "pro") {
      return {
        canGenerate: true,
        usageCount: userProfile.usageStats?.recipeGenerationsCount || 0,
        limit: -1, // -1 indicates unlimited
      };
    }

    // Set limits based on user type
    const currentCount = userProfile.usageStats?.recipeGenerationsCount || 0;
    let limit: number;

    if (userProfile.userType === "premium") {
      limit = 300; // Premium: 300 searches per month
    } else {
      limit = 10; // Free: 10 searches total
    }

    if (currentCount >= limit) {
      const message =
        userProfile.userType === "premium"
          ? `You have reached your monthly limit of ${limit} recipe generations. Please upgrade to Pro for unlimited access.`
          : `You have reached your limit of ${limit} free recipe generations. Please subscribe for more access.`;

      return {
        canGenerate: false,
        reason: message,
        usageCount: currentCount,
        limit,
      };
    }

    return {
      canGenerate: true,
      usageCount: currentCount,
      limit,
    };
  }, [userProfile]);

  // Increment usage count after successful recipe generation
  const incrementUsageCount = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user || !userProfile) {
      return { success: false, error: "User must be logged in" };
    }

    // Don't track usage for admin or pro users (unlimited)
    if (userProfile.userType === "admin" || userProfile.userType === "pro") {
      return { success: true };
    }

    setLoading(true);
    try {
      const currentStats = userProfile.usageStats || {
        recipeGenerationsCount: 0,
        lastGenerationAt: undefined,
        monthlyGenerations: 0,
        currentMonthStart: new Date(),
      };

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Convert Firestore timestamp to Date if needed
      const currentMonthStartDate = currentStats.currentMonthStart
        ? (currentStats.currentMonthStart as any)?.toDate
          ? (currentStats.currentMonthStart as any).toDate()
          : new Date(currentStats.currentMonthStart)
        : new Date();

      const statsMonth = currentMonthStartDate.getMonth();
      const statsYear = currentMonthStartDate.getFullYear();

      // Reset monthly count if it's a new month
      let monthlyGenerations = currentStats.monthlyGenerations;
      let currentMonthStart = currentMonthStartDate;

      if (currentMonth !== statsMonth || currentYear !== statsYear) {
        monthlyGenerations = 0;
        currentMonthStart = new Date(currentYear, currentMonth, 1);
      }

      const updatedStats = {
        recipeGenerationsCount: currentStats.recipeGenerationsCount + 1,
        lastGenerationAt: now,
        monthlyGenerations: monthlyGenerations + 1,
        currentMonthStart,
      };

      const userUpdate: Partial<UserProfile> = {
        usageStats: updatedStats,
        updatedAt: now,
      };

      const result = await updateDocument("users", user.uid, userUpdate);
      if (!result.success) {
        return { success: false, error: result.error || "Failed to update usage statistics" };
      }

      // Refresh user profile to get updated usage stats
      await refreshUserProfile();

      return { success: true };
    } catch (error: any) {
      console.error("Error incrementing usage count:", error);
      return { success: false, error: error.message || "An unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  }, [user, userProfile, updateDocument, refreshUserProfile]);

  // Reset usage count (admin function)
  const resetUsageCount = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!user || !userProfile) {
      return { success: false, error: "User must be logged in" };
    }

    setLoading(true);
    try {
      const resetStats = {
        recipeGenerationsCount: 0,
        lastGenerationAt: undefined,
        monthlyGenerations: 0,
        currentMonthStart: new Date(),
      };

      const userUpdate: Partial<UserProfile> = {
        usageStats: resetStats,
        updatedAt: new Date(),
      };

      const result = await updateDocument("users", user.uid, userUpdate);
      if (!result.success) {
        return { success: false, error: result.error || "Failed to reset usage statistics" };
      }

      // Refresh user profile to get updated usage stats
      await refreshUserProfile();

      return { success: true };
    } catch (error: any) {
      console.error("Error resetting usage count:", error);
      return { success: false, error: error.message || "An unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  }, [user, userProfile, updateDocument, refreshUserProfile]);

  // Get usage statistics for display
  const getUsageStats = useCallback(() => {
    if (!userProfile) {
      return {
        count: 0,
        limit: 10,
        isUnlimited: false,
        remaining: 10,
        percentage: 0,
      };
    }

    const isUnlimited = userProfile.userType === "admin" || userProfile.userType === "pro";
    const count = userProfile.usageStats?.recipeGenerationsCount || 0;

    let limit: number;
    if (isUnlimited) {
      limit = -1;
    } else if (userProfile.userType === "premium") {
      limit = 300;
    } else {
      limit = 10; // free users
    }

    const remaining = isUnlimited ? -1 : Math.max(0, limit - count);
    const percentage = isUnlimited ? 0 : Math.min(100, (count / limit) * 100);

    return {
      count,
      limit,
      isUnlimited,
      remaining,
      percentage,
      lastGenerationAt: userProfile.usageStats?.lastGenerationAt,
      monthlyGenerations: userProfile.usageStats?.monthlyGenerations || 0,
    };
  }, [userProfile]);

  // Check if user is approaching limit (80% usage)
  const isApproachingLimit = useCallback((): boolean => {
    if (!userProfile || userProfile.userType !== "free") {
      return false;
    }

    const count = userProfile.usageStats?.recipeGenerationsCount || 0;
    return count >= 8; // 80% of 10
  }, [userProfile]);

  // Check if user has hit the limit
  const hasHitLimit = useCallback((): boolean => {
    if (!userProfile || userProfile.userType !== "free") {
      return false;
    }

    const count = userProfile.usageStats?.recipeGenerationsCount || 0;
    return count >= 10;
  }, [userProfile]);

  return {
    loading,
    canGenerateRecipe,
    incrementUsageCount,
    resetUsageCount,
    getUsageStats,
    isApproachingLimit,
    hasHitLimit,
  };
}
