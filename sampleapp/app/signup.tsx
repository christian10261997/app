import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Image, ImageBackground, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthContext } from "../contexts/AuthContext";

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  const [gender, setGender] = useState("");
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
    const trimmedGender = gender.trim();

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Basic validation
    if (!trimmedFirstName || !trimmedLastName || !date || !trimmedGender || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    // Email validation
    if (!isValidEmail(trimmedEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Age validation (check if user is at least 13 years old)
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();
    const calculatedAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (calculatedAge < 13) {
      Alert.alert("Error", "You must be at least 13 years old to sign up");
      return;
    }

    if (calculatedAge > 120) {
      Alert.alert("Error", "Please enter a valid birth date");
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

    setIsLoading(true);

    try {
      const userData = {
        firstName: trimmedFirstName,
        middleName: middleName.trim() || undefined,
        lastName: trimmedLastName,
        birthday: date,
        gender: trimmedGender,
        email: trimmedEmail,
        password: trimmedPassword,
      };

      const result = await signUp(userData);
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

            {/* Birthday and Gender */}
            <View style={styles.row}>
              <TouchableOpacity style={[styles.input, styles.halfInput, styles.datePickerButton]} onPress={() => setOpen(true)}>
                <Text style={styles.datePickerText}>{date ? date.toLocaleDateString() : "Birthday *"}</Text>
              </TouchableOpacity>
              <TextInput style={[styles.input, styles.halfInput]} placeholder="Gender *" value={gender} onChangeText={setGender} />
            </View>

            {/* Email */}

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

        {open && Platform.OS === "ios" && (
          <Modal transparent={true} animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setOpen(false)}>
                    <Text style={styles.modalButton}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setOpen(false)}>
                    <Text style={styles.modalButton}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  onChange={(event, selectedDate) => {
                    if (selectedDate) {
                      setDate(selectedDate);
                    }
                  }}
                />
              </View>
            </View>
          </Modal>
        )}

        {open && Platform.OS === "android" && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
            onChange={(event, selectedDate) => {
              setOpen(false);
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
          />
        )}
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
  datePickerButton: {
    justifyContent: "center",
  },
  datePickerText: {
    fontSize: 16,
    color: "#333",
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
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
});
