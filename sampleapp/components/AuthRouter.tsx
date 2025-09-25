import { router } from "expo-router";
import { useEffect } from "react";
import { useAuthContext } from "../contexts/AuthContext";

export function AuthRouter() {
  const { user, userProfile, loading } = useAuthContext();

  useEffect(() => {
    // Don't route while loading
    if (loading) return;

    // If no user, go to login
    if (!user) {
      router.replace("/login");
      return;
    }

    // If user exists but no profile yet, wait
    if (user && !userProfile) return;

    // Route based on user type
    if (userProfile) {
      if (userProfile.userType === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/home/(tabs)");
      }
    }
  }, [user, userProfile, loading]);

  return null; // This component doesn't render anything
}
