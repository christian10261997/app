import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, ImageBackground, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedButton } from "../components/ThemedButton";
import { useAuthContext } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 state for show/hide
  const { signIn } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      if (!email || !password) {
        showToast({
          type: "error",
          title: "Validation Error",
          message: "Please fill in all fields",
        });
        return;
      }

      const result = await signIn(email.trim(), password.trim());
      if (result.success) {
        showToast({
          type: "success",
          title: "Login Successful",
          message: "Welcome back!",
        });
        // Routing will be handled by index.tsx
        router.replace("/");
      } else {
        showToast({
          type: "error",
          title: "Login Failed",
          message: result.error || "Please check your credentials and try again.",
        });
      }
    } catch (error: any) {
      // Handle any unexpected errors
      showToast({
        type: "error",
        title: "Login Error",
        message: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Keyboard.dismiss();
    setTimeout(() => {
      router.replace("/forgotPassword");
    }, 100);
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <ImageBackground source={require("../assets/images/front1.png")} style={styles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
          <View style={styles.content}>
            <Image source={require("../assets/images/kitchenpalLogo.png")} style={{ width: 250, height: 250, alignSelf: "center" }} resizeMode="contain" />
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />

            {/* Password Input with Show/Hide Toggle */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword} // 👈 toggle here
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" style={{ marginLeft: -40, marginTop: 15 }} />
              </TouchableOpacity>
            </View>

            <ThemedButton variant="ghost" style={styles.forgotPassword} onPress={handleForgotPassword} textLightColor="#FFFFFF" textDarkColor="#FFFFFF">
              Forgot Password?
            </ThemedButton>

            <ThemedButton variant="success" style={styles.button} onPress={handleLogin} disabled={isLoading} loading={isLoading}>
              Login
            </ThemedButton>

            <ThemedButton variant="ghost" style={styles.signUp} onPress={handleSignUp} textLightColor="#FFFFFF" textDarkColor="#FFFFFF">
              Sign up?
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
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  forgotPassword: {
    alignItems: "flex-end",
    marginTop: 0,
    marginRight: 1,
  },
  signUp: {
    marginTop: 20,
    alignItems: "center",
  },
  signUpText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
