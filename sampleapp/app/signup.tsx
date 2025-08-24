import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "../contexts/AuthContext";

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuthContext();

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    // Trim whitespace from all inputs
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedAge = age.trim();
    const trimmedGender = gender.trim();
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Basic validation
    if (!trimmedFirstName || !trimmedLastName || !trimmedAge || !trimmedGender || !trimmedUsername || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Email validation
    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Age validation
    const ageNum = parseInt(trimmedAge);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      Alert.alert("Error", "Please enter a valid age between 13 and 120");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (trimmedPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }

    // Username validation
    if (trimmedUsername.length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(trimmedEmail, trimmedPassword);
      // save the other user details into the firestore database
      if (result.success) {
        Alert.alert("Success", "Account created successfully!");
        router.push("/login");
      } else {
        Alert.alert("Error", result.error || "Failed to create account. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <ImageBackground source={require("../assets/images/front1.png")} style={styles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />

            <Text style={styles.title}>Sign Up</Text>

            {/* Name Fields */}
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.halfInput]} placeholder="First Name *" value={firstName} onChangeText={setFirstName} />
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Middle Name" value={middleName} onChangeText={setMiddleName} />
            </View>

            <TextInput style={styles.input} placeholder="Last Name *" value={lastName} onChangeText={setLastName} />

            {/* Age and Gender */}
            <View style={styles.row}>
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Age *" value={age} onChangeText={setAge} keyboardType="numeric" />
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Gender *" value={gender} onChangeText={setGender} />
            </View>

            {/* Username and Email */}
            <TextInput style={styles.input} placeholder="Username *" value={username} onChangeText={setUsername} autoCapitalize="none" />

            <TextInput style={styles.input} placeholder="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

            {/* Password Fields */}
            <TextInput style={styles.input} placeholder="Password *" value={password} onChangeText={setPassword} secureTextEntry />

            <TextInput style={styles.input} placeholder="Confirm Password *" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

            <TouchableOpacity style={isLoading ? styles.buttonDisabled : styles.button} onPress={handleSignup} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={handleBackToLogin}>
              <Text style={styles.loginText}>Already have an account? Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 15,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  halfInput: {
    flex: 1,
  },
  button: {
    backgroundColor: "lightgreen",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginLink: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
