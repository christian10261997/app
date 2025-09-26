import { useCallback, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { UserProfile } from "../types/user";
import { useFirestore } from "./useFirestore";

export function useUsageTracking() {
  const { user, userProfile } = useAuthContext();
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

    // Admin and subscribed users have unlimited access
    if (userProfile.userType === "admin" || userProfile.userType === "subscribed") {
      return {
        canGenerate: true,
        usageCount: userProfile.usageStats?.recipeGenerationsCount || 0,
        limit: -1, // -1 indicates unlimited
      };
    }

    // Free users have 10 generation limit
    const currentCount = userProfile.usageStats?.recipeGenerationsCount || 0;
    const limit = 10;

    if (currentCount >= limit) {
      return {
        canGenerate: false,
        reason: "You have reached your limit of 10 free recipe generations. Please subscribe for unlimited access.",
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

    // Don't track usage for admin or subscribed users
    if (userProfile.userType === "admin" || userProfile.userType === "subscribed") {
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
      const statsMonth = currentStats.currentMonthStart ? currentStats.currentMonthStart.getMonth() : -1;
      const statsYear = currentStats.currentMonthStart ? currentStats.currentMonthStart.getFullYear() : -1;

      // Reset monthly count if it's a new month
      let monthlyGenerations = currentStats.monthlyGenerations;
      let currentMonthStart = currentStats.currentMonthStart;

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

      return { success: true };
    } catch (error: any) {
      console.error("Error incrementing usage count:", error);
      return { success: false, error: error.message || "An unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  }, [user, userProfile, updateDocument]);

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

      return { success: true };
    } catch (error: any) {
      console.error("Error resetting usage count:", error);
      return { success: false, error: error.message || "An unexpected error occurred" };
    } finally {
      setLoading(false);
    }
  }, [user, userProfile, updateDocument]);

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

    const isUnlimited = userProfile.userType === "admin" || userProfile.userType === "subscribed";
    const count = userProfile.usageStats?.recipeGenerationsCount || 0;
    const limit = isUnlimited ? -1 : 10;
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
