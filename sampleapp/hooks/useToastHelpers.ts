import { useToast } from "../contexts/ToastContext";

/**
 * Convenience hook that provides common toast scenarios with predefined configurations
 */
export function useToastHelpers() {
  const { showToast, hideToast } = useToast();

  const showSuccess = (title: string, message?: string) => {
    showToast({
      type: "success",
      title,
      message,
      duration: 3000,
    });
  };

  const showError = (title: string, message?: string) => {
    showToast({
      type: "error",
      title,
      message,
      duration: 5000, // Slightly longer for errors
    });
  };

  const showInfo = (title: string, message?: string) => {
    showToast({
      type: "info",
      title,
      message,
      duration: 4000,
    });
  };

  const showWarning = (title: string, message?: string) => {
    showToast({
      type: "warning",
      title,
      message,
      duration: 4000,
    });
  };

  // Common authentication toast messages
  const authToasts = {
    loginSuccess: () => showSuccess("Login Successful", "Welcome back!"),
    loginFailed: (error?: string) => showError("Login Failed", error || "Please check your credentials and try again."),
    signupSuccess: () => showSuccess("Account Created", "Welcome! Your account has been created successfully"),
    signupFailed: (error?: string) => showError("Signup Failed", error || "Failed to create account. Please try again."),
    resetEmailSent: () => showSuccess("Email Sent", "Check your inbox for password reset instructions"),
    resetEmailFailed: (error?: string) => showError("Reset Failed", error || "Unable to send reset email. Please try again."),
    logoutSuccess: () => showInfo("Logged Out", "You have been successfully logged out"),
    sessionExpired: () => showWarning("Session Expired", "Please log in again to continue"),
  };

  // Common validation toast messages
  const validationToasts = {
    requiredFields: () => showError("Validation Error", "Please fill in all required fields"),
    invalidEmail: () => showError("Invalid Email", "Please enter a valid email address"),
    passwordMismatch: () => showError("Password Mismatch", "Passwords do not match"),
    weakPassword: () => showError("Weak Password", "Password must be at least 6 characters long"),
    ageRestriction: () => showError("Age Restriction", "You must be at least 13 years old to sign up"),
    invalidDate: () => showError("Invalid Date", "Please enter a valid birth date"),
  };

  // Network and general error toasts
  const systemToasts = {
    networkError: () => showError("Network Error", "Please check your internet connection and try again"),
    unexpectedError: () => showError("Unexpected Error", "An unexpected error occurred. Please try again"),
    operationSuccess: (operation: string) => showSuccess("Success", `${operation} completed successfully`),
    operationFailed: (operation: string) => showError("Failed", `${operation} failed. Please try again`),
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    hideToast,
    authToasts,
    validationToasts,
    systemToasts,
  };
}
