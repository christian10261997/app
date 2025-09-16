# Toast System Implementation Guide

## Overview

This project now uses a universal toast notification system that replaces the native `Alert.alert()` calls with more user-friendly, non-blocking toast messages. The system provides consistent styling, better user experience, and easier customization.

## Features

- ✅ **4 Toast Types**: Success, Error, Info, Warning
- ✅ **Custom Styling**: Themed with icons and colors
- ✅ **Non-blocking**: Users can continue interacting with the app
- ✅ **Customizable Duration**: Different durations for different message types
- ✅ **Firebase Error Mapping**: Comprehensive error handling for authentication
- ✅ **Helper Functions**: Pre-configured toasts for common scenarios

## Basic Usage

### 1. Import the Toast Hook

```typescript
import { useToast } from "../contexts/ToastContext";

export default function MyComponent() {
  const { showToast } = useToast();

  const handleAction = () => {
    showToast({
      type: "success",
      title: "Action Completed",
      message: "Your action was successful!",
    });
  };
}
```

### 2. Toast Types

```typescript
// Success Toast (Green)
showToast({
  type: "success",
  title: "Success!",
  message: "Operation completed successfully",
});

// Error Toast (Red)
showToast({
  type: "error",
  title: "Error",
  message: "Something went wrong",
});

// Info Toast (Blue)
showToast({
  type: "info",
  title: "Information",
  message: "Here is some useful information",
});

// Warning Toast (Orange)
showToast({
  type: "warning",
  title: "Warning",
  message: "Please be careful",
});
```

## Advanced Usage with Helper Hook

For common scenarios, use the `useToastHelpers` hook:

```typescript
import { useToastHelpers } from "../hooks/useToastHelpers";

export default function LoginScreen() {
  const { authToasts, validationToasts } = useToastHelpers();

  const handleLogin = async () => {
    if (!email || !password) {
      validationToasts.requiredFields();
      return;
    }

    const result = await signIn(email, password);
    if (result.success) {
      authToasts.loginSuccess();
    } else {
      authToasts.loginFailed(result.error);
    }
  };
}
```

## Available Helper Functions

### Authentication Toasts

- `authToasts.loginSuccess()`
- `authToasts.loginFailed(error?)`
- `authToasts.signupSuccess()`
- `authToasts.signupFailed(error?)`
- `authToasts.resetEmailSent()`
- `authToasts.resetEmailFailed(error?)`
- `authToasts.logoutSuccess()`
- `authToasts.sessionExpired()`

### Validation Toasts

- `validationToasts.requiredFields()`
- `validationToasts.invalidEmail()`
- `validationToasts.passwordMismatch()`
- `validationToasts.weakPassword()`
- `validationToasts.ageRestriction()`
- `validationToasts.invalidDate()`

### System Toasts

- `systemToasts.networkError()`
- `systemToasts.unexpectedError()`
- `systemToasts.operationSuccess(operation)`
- `systemToasts.operationFailed(operation)`

## Configuration Options

```typescript
interface ToastConfig {
  type: "success" | "error" | "info" | "warning";
  title: string;
  message?: string;
  duration?: number; // milliseconds (default: 4000)
}
```

## Firebase Error Handling

The authentication system now includes comprehensive Firebase error mapping:

### Login Errors

- `auth/user-not-found` → "No account found with this email address"
- `auth/wrong-password` → "Incorrect password. Please try again"
- `auth/invalid-credential` → "Invalid email or password. Please check your credentials"
- `auth/too-many-requests` → "Too many failed login attempts. Please try again later or reset your password"
- `auth/network-request-failed` → "Network error. Please check your internet connection and try again"

### Signup Errors

- `auth/email-already-in-use` → "An account with this email already exists. Please try signing in instead"
- `auth/weak-password` → "Password is too weak. Please use at least 6 characters with a mix of letters and numbers"
- `auth/invalid-email` → "Please enter a valid email address"

### Password Reset Errors

- `auth/user-not-found` → "No account found with this email address"
- `auth/too-many-requests` → "Too many password reset attempts. Please try again later"

## Styling Customization

The toast styling can be customized in `components/ToastConfig.tsx`:

```typescript
const styles = StyleSheet.create({
  successContainer: {
    borderLeftColor: "#4CAF50",
    backgroundColor: "#F1F8E9",
  },
  errorContainer: {
    borderLeftColor: "#F44336",
    backgroundColor: "#FFEBEE",
  },
  // ... other styles
});
```

## Implementation Notes

1. **Setup**: The toast system is initialized in `app/_layout.tsx` with `ToastProvider` and `Toast` component
2. **Context**: Uses React Context for global state management
3. **Positioning**: Toasts appear at the top of the screen with safe area handling
4. **Auto-hide**: Toasts automatically disappear after their duration
5. **Non-blocking**: Users can continue using the app while toasts are shown

## Migration from Alert.alert()

### Before (Alert):

```typescript
Alert.alert("Error", "Something went wrong");
```

### After (Toast):

```typescript
const { showToast } = useToast();
showToast({
  type: "error",
  title: "Error",
  message: "Something went wrong",
});
```

### Or with helpers:

```typescript
const { showError } = useToastHelpers();
showError("Error", "Something went wrong");
```

## Best Practices

1. **Use appropriate types**: Success for positive actions, error for failures, info for neutral updates, warning for cautions
2. **Keep titles concise**: 1-3 words that clearly identify the message type
3. **Provide helpful messages**: Give users clear information about what happened and next steps
4. **Use helpers for common scenarios**: Leverage pre-built toast messages for authentication and validation
5. **Don't overwhelm**: Avoid showing multiple toasts in quick succession

## Files Modified

- `contexts/ToastContext.tsx` - Toast context and provider
- `components/ToastConfig.tsx` - Custom toast styling
- `hooks/useToastHelpers.ts` - Helper functions for common scenarios
- `app/_layout.tsx` - Toast provider setup
- `app/login.tsx` - Updated to use toast notifications
- `app/signup.tsx` - Updated to use toast notifications
- `app/forgotPassword.tsx` - Updated to use toast notifications
- `hooks/useAuth.ts` - Enhanced Firebase error handling
