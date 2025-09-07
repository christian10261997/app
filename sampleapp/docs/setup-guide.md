# KitchenPal Setup Guide

## Prerequisites

- Node.js (v18+)
- Expo CLI
- Firebase Project
- React Native development environment

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create Firestore Database
4. Update `config/firebase.ts` with your Firebase config

### 3. Required Firebase Rules

#### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can read/write their own recipes
    match /recipes/{recipeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

#### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Development

### Start Development Server

```bash
npm start
```

### Run on Device

```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Testing Registration

1. Launch the app
2. Navigate to Sign Up screen
3. Fill out the registration form:
   - First Name, Last Name (required)
   - Birthday (date picker, must be 13+ years old)
   - Gender (required)
   - Email (valid email format)
   - Password (6+ characters)
4. Submit registration
5. Check Firestore console for user profile data

## Troubleshooting

### Common Issues

**Build Errors:**

- Ensure all dependencies are installed: `npm install`
- Clear cache: `expo start --clear`

**Firebase Connection:**

- Verify Firebase config in `config/firebase.ts`
- Check Firebase project settings
- Ensure Firestore and Auth are enabled

**Date Picker Issues:**

- iOS: Uses modal presentation
- Android: Uses native picker
- Verify `@react-native-community/datetimepicker` is installed

## File Structure

```
/app/
  ├── login.tsx              # Login screen
  ├── signup.tsx             # Registration screen
  ├── forgotPassword.tsx     # Password reset
  └── home/                  # Protected routes
/components/
  └── AuthDebug.tsx          # Testing component
/contexts/
  └── AuthContext.tsx        # Auth state management
/hooks/
  ├── useAuth.ts             # Authentication logic
  └── useFirestore.ts        # Database operations
/types/
  └── user.ts                # TypeScript interfaces
/config/
  └── firebase.ts            # Firebase configuration
```
