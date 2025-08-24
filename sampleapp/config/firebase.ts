import { default as ReactNativeAsyncStorage } from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { Auth, getAuth, getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Your Firebase configuration
// Replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUtc1mqoZAO-Wyokq60AwB2XZ9F7OH6Eo",
  authDomain: "kitchenpal-49502.firebaseapp.com",
  projectId: "kitchenpal-49502",
  storageBucket: "kitchenpal-49502.firebasestorage.app",
  messagingSenderId: "543039232336",
  appId: "1:543039232336:web:8045653afb4ddb403c3455",
  measurementId: "G-GFWRE5KZ5R"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Create a custom persistence object that mimics what Firebase expects

// Initialize Firebase Auth with custom persistence
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (error) {
  // If auth is already initialized, get the existing instance
  console.warn("Auth already initialized, using existing instance:", error);
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app;
