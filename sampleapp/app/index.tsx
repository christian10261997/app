import { router } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { ThemedText } from "../components/ThemedText";
import { useAuthContext } from "../contexts/AuthContext";

export default function IndexScreen() {
  const { user, userProfile, loading } = useAuthContext();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user, go to login
        router.replace("/login");
      } else if (userProfile) {
        // User exists and profile loaded, route based on type
        if (userProfile.userType === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/home/(tabs)");
        }
      }
      // If user exists but no profile yet, stay on loading screen
    }
  }, [user, userProfile, loading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa" }}>
      <ActivityIndicator size="large" color="#007AFF" />
      <ThemedText style={{ marginTop: 16, fontSize: 16, color: "#8E8E93" }}>Loading...</ThemedText>
    </View>
  );
}
