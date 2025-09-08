import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedButton } from "../components/ThemedButton";
import { useAuthContext } from "../contexts/AuthContext";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { resetPassword } = useAuthContext();

  const handleReset = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    setIsSubmitting(true);
    const result = await resetPassword(trimmed);
    setIsSubmitting(false);
    if (result.success) {
      Alert.alert("Email sent", "Check your inbox for reset instructions.");
      router.push("/login");
    } else {
      Alert.alert("Failed", result.error || "Unable to send reset email.");
    }
  };

  return (
    <ImageBackground source={require("../assets/images/front1.png")} style={styles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
          <View style={styles.content}>
            <Text style={styles.title}>Reset Password</Text>
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
            <ThemedButton variant="success" style={styles.button} onPress={handleReset} disabled={isSubmitting} loading={isSubmitting}>
              Send Reset Email
            </ThemedButton>
            <ThemedButton variant="ghost" style={styles.back} onPress={() => router.push("/login")} textLightColor="#FFFFFF" textDarkColor="#FFFFFF">
              Back to Login
            </ThemedButton>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "lightgreen",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  back: {
    marginTop: 10,
    alignItems: "center",
  },
  backText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
