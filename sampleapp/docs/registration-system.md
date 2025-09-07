# Registration System Documentation

## Overview

KitchenPal's registration system provides secure user authentication with Firebase Auth and comprehensive user profile storage in Firestore.

## User Data Structure

### UserProfile Interface

```typescript
interface UserProfile {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthday: Date;
  gender: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### UserSignupData Interface

```typescript
interface UserSignupData {
  firstName: string;
  middleName?: string;
  lastName: string;
  birthday: Date;
  gender: string;
  email: string;
  password: string;
}
```

## Registration Flow

### 1. User Input Validation

- **Required fields**: firstName, lastName, birthday, gender, email, password, confirmPassword
- **Email validation**: Standard email format regex
- **Age validation**: Must be 13+ years old (calculated from birthday)
- **Password validation**: Minimum 6 characters
- **Password confirmation**: Must match original password

### 2. Account Creation Process

```
User Submits Form → Validate Data → Create Firebase Auth User → Store Profile in Firestore → Success
```

### 3. Data Storage

- **Firebase Authentication**: Handles email/password authentication
- **Firestore Database**: Stores complete user profile in `users` collection
- **Document ID**: Uses Firebase Auth UID as document identifier

## Key Features

### Birthday Input

- **iOS**: Modal with spinner-style date picker
- **Android**: Native date picker dialog
- **Validation**: Must be between 1900-present, user must be 13+ years old

### Security

- Passwords hashed and managed by Firebase Auth
- User profile data stored separately in Firestore
- Automatic session persistence with AsyncStorage

### Error Handling

- Comprehensive Firebase Auth error mapping
- User-friendly error messages
- Form validation with specific error feedback

## File Structure

```
/types/user.ts              # TypeScript interfaces
/contexts/AuthContext.tsx   # Auth context provider
/hooks/useAuth.ts           # Authentication hook
/app/signup.tsx             # Registration screen UI
/components/AuthDebug.tsx   # Debug component for testing
```

## Authentication Context

### Available Methods

```typescript
const {
  user, // Firebase User object
  userProfile, // Complete user profile from Firestore
  loading, // Loading state
  signUp, // Registration function
  signIn, // Login function
  logout, // Logout function
  resetPassword, // Password reset function
} = useAuthContext();
```

## Dependencies

- `firebase/auth` - Authentication
- `firebase/firestore` - User profile storage
- `@react-native-community/datetimepicker` - Birthday input
- `@react-native-async-storage/async-storage` - Session persistence

## Testing

Use the `AuthDebug` component to verify:

- Firebase Auth user creation
- Firestore profile data storage
- Profile data loading on login

## Future Enhancements

- Email verification
- Social login (Google, Facebook)
- Profile picture upload
- Username availability checking
