export interface UserProfile {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthday: Date;
  gender: string;
  email: string;
  userType: "free" | "premium" | "pro" | "admin";
  subscription?: SubscriptionInfo;
  usageStats: UsageStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionInfo {
  status: "pending" | "active" | "expired" | "rejected";
  planType: "premium_monthly" | "pro_monthly";
  submittedAt?: Date;
  approvedAt?: Date;
  expiresAt?: Date;
  referenceImageUrl?: string;
  referenceNumber?: string;
  adminNotes?: string;
}

export interface UsageStats {
  recipeGenerationsCount: number;
  lastGenerationAt?: Date;
  monthlyGenerations: number;
  currentMonthStart: Date;
}

export interface SubscriptionRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planType: "premium_monthly" | "pro_monthly";
  referenceNumber: string;
  referenceImageUrl: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string; // Admin user ID
  adminNotes?: string;
}

export interface UserSignupData {
  firstName: string;
  middleName?: string;
  lastName: string;
  birthday: Date;
  gender: string;
  email: string;
  password: string;
}
