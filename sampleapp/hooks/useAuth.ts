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
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
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
      console.error("Sign in error:", error);
      let errorMessage = "Failed to sign in";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/too-many-requests":
          errorMessage = "Too many failed attempts. Please try again later";
          break;
        default:
          errorMessage = error.message || "Failed to sign in";
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
      console.error("Sign up error:", error);
      let errorMessage = "Failed to create account";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak";
          break;
        default:
          errorMessage = error.message || "Failed to create account";
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
      console.error("Logout error:", error);
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
      console.error("Reset password error:", error);
      let errorMessage = "Failed to send reset email";

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        default:
          errorMessage = error.message || "Failed to send reset email";
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
  };
}
