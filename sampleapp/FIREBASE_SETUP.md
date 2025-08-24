# Firebase Setup for Expo Go

This project is configured with Firebase JS SDK v10+ for use with Expo Go. The setup includes Authentication, Firestore, and Storage services.

## 🔧 Configuration Steps

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication, Firestore, and Storage services

### 2. Get Firebase Config

1. In Firebase Console, go to Project Settings > General
2. Add a web app if you haven't already
3. Copy the Firebase configuration object
4. Replace the placeholder values in `config/firebase.ts`

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id", // Optional
};
```

### 3. Enable Authentication Methods

1. In Firebase Console, go to Authentication > Sign-in method
2. Enable "Email/Password" provider
3. Add authorized domains if needed for web testing

### 4. Configure Firestore Security Rules

Add thrs to get started (update for production):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Configure Storage Security Rules

Add these rules to get started (update for production):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 Features Implemented

### ✅ Authentication

- Email/Password sign up and sign in
- User state persistence (automatic in Firebase v12+ for Expo Go)
- Password reset functionality
- Proper error handling with user-friendly messages

### ✅ Firestore Database

- CRUD operations (Create, Read, Update, Delete)
- Real-time listeners
- Query support (where, orderBy, limit)
- Automatic timestamp management

### ✅ Storage

- File upload with progress tracking
- Image upload for React Native
- File download URL generation
- File deletion and listing

## 🚀 Usage Examples

### Authentication

```typescript
import { useAuthContext } from "./contexts/AuthContext";

const { user, signIn, signUp, logout } = useAuthContext();

// Sign up
const result = await signUp(email, password);

// Sign in
const result = await signIn(email, password);

// Logout
await logout();
```

### Firestore

```typescript
import { useFirestore } from "./hooks/useFirestore";

const { addDocument, getDocuments, updateDocument } = useFirestore();

// Add document
const result = await addDocument("users", { name: "John", email: "john@example.com" });

// Get documents
const result = await getDocuments("users");

// Real-time listener
import { useFirestoreRealtime } from "./hooks/useFirestore";
const { documents, loading } = useFirestoreRealtime("users");
```

### Storage

```typescript
import { useStorage } from "./hooks/useStorage";

const { uploadFile, uploadImage, getFileURL } = useStorage();

// Upload image (React Native)
const result = await uploadImage(imageUri, "images/profile.jpg");

// Get download URL
const result = await getFileURL("images/profile.jpg");
```

## 🧪 Testing

The `FirebaseExample` component demonstrates all Firebase features:

1. Authentication flow
2. Firestore operations
3. Real-time data updates

To test:

1. Replace Firebase config values in `config/firebase.ts`
2. Use the `FirebaseExample` component in your app
3. Try signing up, adding data, and see real-time updates

## 🔐 Security Notes

1. **Never commit real Firebase config to public repos**
2. Use environment variables for sensitive data in production
3. Configure proper Firestore and Storage security rules
4. Implement proper user authorization in your app logic

## 🛠 Troubleshooting

### Common Issues:

1. **"Firebase: Error (auth/configuration-not-found)"**

   - Make sure you've replaced all placeholder values in `config/firebase.ts`

2. **"Firebase: Error (auth/network-request-failed)"**

   - Check your internet connection
   - Verify Firebase project is active

3. **"Missing or insufficient permissions"**

   - Update Firestore security rules
   - Make sure user is authenticated

4. **"Unable to resolve firebase/auth/react-native"**

   - This import doesn't exist in Firebase v12+
   - Use the standard `firebase/auth` imports instead
   - Ensure `metro.config.js` is configured for `.cjs` modules

5. **Metro bundler issues**
   - Clear cache: `expo start --clear`
   - Delete `node_modules` and reinstall
   - Check `metro.config.js` configuration

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
- [React Native Firebase](https://rnfirebase.io/) (Alternative SDK)

## 🔄 Migration Notes

This setup uses Firebase JS SDK v10+ (modular SDK) which is:

- Tree-shakeable (smaller bundle size)
- Compatible with Expo Go
- Future-proof with Firebase's direction
- Works on all platforms (iOS, Android, Web)
