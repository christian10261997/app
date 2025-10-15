import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedButton } from "../components/ThemedButton";
import { genderOptions } from "../constants/Gender";
import { useAuthContext } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";

export default function SignupScreen() {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);

  const [gender, setGender] = useState("");
  const [genderOpen, setGenderOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuthContext();
  const { showToast } = useToast();

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
      showToast({
        type: "error",
        title: "Validation Error",
        message: "Please fill in all required fields",
      });
      return;
    }

    // Email validation
    if (!isValidEmail(trimmedEmail)) {
      showToast({
        type: "error",
        title: "Invalid Email",
        message: "Please enter a valid email address",
      });
      return;
    }

    // Age validation (check if user is at least 13 years old)
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();
    const calculatedAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    if (calculatedAge < 13) {
      showToast({
        type: "error",
        title: "Age Restriction",
        message: "You must be at least 13 years old to sign up",
      });
      return;
    }

    if (calculatedAge > 120) {
      showToast({
        type: "error",
        title: "Invalid Date",
        message: "Please enter a valid birth date",
      });
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      showToast({
        type: "error",
        title: "Password Mismatch",
        message: "Passwords do not match",
      });
      return;
    }

    if (trimmedPassword.length < 6) {
      showToast({
        type: "error",
        title: "Weak Password",
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        birthday: date,
        gender: trimmedGender,
        email: trimmedEmail,
        password: trimmedPassword,
        ...(middleName.trim() && { middleName: middleName.trim() }), // Only include if not empty
      };

      const result = await signUp(userData);
      if (result.success) {
        showToast({
          type: "success",
          title: "Account Created",
          message: "Welcome! Your account has been created successfully",
        });
        router.push("/login");
      } else {
        showToast({
          type: "error",
          title: "Signup Failed",
          message: result.error || "Failed to create account. Please try again.",
        });
      }
    } catch (error: any) {
      showToast({
        type: "error",
        title: "Signup Error",
        message: error.message || "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and start your culinary journey</Text>
          </View>

          {/* Name Fields */}
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.halfInput]} placeholder="First Name *" placeholderTextColor="#94a3b8" value={firstName} onChangeText={setFirstName} />
            <TextInput style={[styles.input, styles.halfInput]} placeholder="Middle Name" placeholderTextColor="#94a3b8" value={middleName} onChangeText={setMiddleName} />
          </View>

          <TextInput style={[styles.input, styles.fullWidthInput]} placeholder="Last Name *" placeholderTextColor="#94a3b8" value={lastName} onChangeText={setLastName} />

          {/* Birthday and Gender */}
          <View style={styles.row}>
            <TouchableOpacity style={[styles.input, styles.halfInput, styles.datePickerButton]} onPress={() => setOpen(true)}>
              <Text style={styles.datePickerText}>{date ? date.toLocaleDateString() : "Birthday *"}</Text>
            </TouchableOpacity>
            <View style={[styles.halfInput, { zIndex: genderOpen ? 1000 : 1 }]}>
              <DropDownPicker
                open={genderOpen}
                value={gender}
                items={genderOptions}
                setOpen={setGenderOpen}
                setValue={setGender}
                placeholder="Gender *"
                style={styles.dropdownStyle}
                textStyle={styles.dropdownTextStyle}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                placeholderStyle={styles.dropdownPlaceholderStyle}
                zIndex={1000}
                zIndexInverse={3000}
              />
            </View>
          </View>

          {/* Email */}
          <TextInput
            style={[styles.input, styles.fullWidthInput]}
            placeholder="Email *"
            placeholderTextColor="#94a3b8"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Password Fields */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password *"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Confirm Password *"
              placeholderTextColor="#94a3b8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ThemedButton variant="success" style={isLoading ? styles.buttonDisabled : styles.button} onPress={handleSignup} disabled={isLoading} loading={isLoading}>
            Sign Up
          </ThemedButton>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1e293b",
    minHeight: 56,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  halfInput: {
    flex: 1,
  },
  fullWidthInput: {
    marginBottom: 16,
  },
  datePickerButton: {
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  datePickerText: {
    fontSize: 16,
    color: "#1e293b",
  },
  button: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
    shadowColor: "#10b981",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 16,
    color: "#64748b",
    marginRight: 4,
  },
  loginLink: {
    fontSize: 16,
    color: "#10b981",
    fontWeight: "600",
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
  modalCancelButton: {
    marginTop: 20,
    paddingVertical: 15,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  dropdownStyle: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    minHeight: 56,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownTextStyle: {
    fontSize: 16,
    color: "#1e293b",
  },
  dropdownContainerStyle: {
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownPlaceholderStyle: {
    fontSize: 16,
    color: "#94a3b8",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 16,
    minHeight: 56,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    paddingVertical: 16,
    minHeight: 24,
  },
  eyeIcon: {
    padding: 4,
  },
});
