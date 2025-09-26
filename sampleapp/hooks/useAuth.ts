import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../config/firebase";
import { UserProfile, UserSignupData } from "../types/user";
import { useFirestore } from "./useFirestore";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { getDocument, setDocument } = useFirestore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Load user profile from Firestore
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const result = await getDocument("users", userId);
      if (result.success && result.data) {
        const data = result.data as any; // Type assertion for Firestore data
        setUserProfile({
          id: data.id,
          firstName: data.firstName,
          ...(data.middleName && { middleName: data.middleName }), // Only include if exists
          lastName: data.lastName,
          birthday: data.birthday?.toDate ? data.birthday.toDate() : data.birthday ? new Date(data.birthday) : new Date(),
          gender: data.gender,
          email: data.email,
          userType: data.userType || "free", // Default to free user
          subscription: data.subscription
            ? {
                status: data.subscription.status,
                planType: data.subscription.planType,
                submittedAt: data.subscription.submittedAt?.toDate(),
                approvedAt: data.subscription.approvedAt?.toDate(),
                expiresAt: data.subscription.expiresAt?.toDate(),
                referenceImageUrl: data.subscription.referenceImageUrl,
                referenceNumber: data.subscription.referenceNumber,
                adminNotes: data.subscription.adminNotes,
              }
            : undefined,
          usageStats: data.usageStats
            ? {
                recipeGenerationsCount: data.usageStats.recipeGenerationsCount || 0,
                lastGenerationAt: data.usageStats.lastGenerationAt?.toDate
                  ? data.usageStats.lastGenerationAt.toDate()
                  : data.usageStats.lastGenerationAt
                  ? new Date(data.usageStats.lastGenerationAt)
                  : undefined,
                monthlyGenerations: data.usageStats.monthlyGenerations || 0,
                currentMonthStart: data.usageStats.currentMonthStart?.toDate
                  ? data.usageStats.currentMonthStart.toDate()
                  : data.usageStats.currentMonthStart
                  ? new Date(data.usageStats.currentMonthStart)
                  : new Date(),
              }
            : {
                recipeGenerationsCount: 0,
                lastGenerationAt: undefined,
                monthlyGenerations: 0,
                currentMonthStart: new Date(),
              },
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      }
    } catch (error) {
      console.log("Error loading user profile:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const trimmedEmail = (email || "").trim();
    const trimmedPassword = (password || "").trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: "Email and password are required" } as const;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      return { success: true, user: userCredential.user } as const;
    } catch (error: any) {
      let errorMessage = "Failed to sign in";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address";
          break;
        case "auth/invalid-credential":
          errorMessage = "Invalid email or password.";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled.";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed login attempts.";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. ";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Email/password sign-in is not enabled.";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak.";
          break;
        case "auth/email-already-exists":
          errorMessage = "An account with this email already exists";
          break;
        case "auth/invalid-password":
          errorMessage = "Invalid password format";
          break;
        case "auth/requires-recent-login":
          errorMessage = "Please log out and log back in to perform this action";
          break;
        default:
          errorMessage = error.message || "Failed to sign in. Please try again";
      }

      return { success: false, error: errorMessage } as const;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData: UserSignupData) => {
    const trimmedEmail = (userData.email || "").trim();
    const trimmedPassword = (userData.password || "").trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: "Email and password are required" } as const;
    }

    if (trimmedPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" } as const;
    }

    setLoading(true);
    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);

      // Create user profile document in Firestore
      const userProfile: Omit<UserProfile, "id"> = {
        firstName: userData.firstName.trim(),
        lastName: userData.lastName.trim(),
        birthday: userData.birthday,
        gender: userData.gender.trim(),
        email: trimmedEmail,
        userType: "free", // New users start as free
        usageStats: {
          recipeGenerationsCount: 0,
          lastGenerationAt: undefined,
          monthlyGenerations: 0,
          currentMonthStart: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        middleName: userData.middleName?.trim() || "",
      };

      const setResult = await setDocument("users", userCredential.user.uid, userProfile);
      if (!setResult.success) {
        throw new Error(setResult.error || "Failed to create user profile");
      }

      return { success: true, user: userCredential.user } as const;
    } catch (error: any) {
      let errorMessage = "Failed to create account";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists. Please try signing in instead";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak. Please use at least 6 characters with a mix of letters and numbers";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Account creation is currently disabled. Please contact support";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your internet connection and try again";
          break;
        case "auth/invalid-password":
          errorMessage = "Invalid password format. Please try a different password";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many attempts. Please try again later";
          break;
        default:
          errorMessage = error.message || "Failed to create account. Please try again";
      }

      return { success: false, error: errorMessage } as const;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true } as const;
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to logout" } as const;
    }
  };

  const resetPassword = async (email: string) => {
    const trimmedEmail = (email || "").trim();

    if (!trimmedEmail) {
      return { success: false, error: "Email is required" } as const;
    }

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      return { success: true } as const;
    } catch (error: any) {
      let errorMessage = "Failed to send reset email";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address";
          break;
        case "auth/network-request-failed":
          errorMessage = "Network error. Please check your internet connection and try again";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many password reset attempts. Please try again later";
          break;
        case "auth/operation-not-allowed":
          errorMessage = "Password reset is currently disabled. Please contact support";
          break;
        default:
          errorMessage = error.message || "Failed to send password reset email. Please try again";
      }

      return { success: false, error: errorMessage } as const;
    }
  };

  return {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword,
    refreshUserProfile: () => (user ? loadUserProfile(user.uid) : Promise.resolve()),
  };
}
