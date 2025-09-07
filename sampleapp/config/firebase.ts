import { default as ReactNativeAsyncStorage } from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import * as firebaseAuth from "firebase/auth";

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const reactNativePersistence = (firebaseAuth as any).getReactNativePersistence;

// Your Firebase configuration
// Replace these values with your actual Firebase project configuration

//TODO Transfer keys to appropriate medium
const firebaseConfig = {
  apiKey: "AIzaSyByQtwAn_4jYedE6ZQNYGMUs9uiJV58Z-8",
  authDomain: "kitchenpal-testing.firebaseapp.com",
  projectId: "kitchenpal-testing",
  storageBucket: "kitchenpal-testing.firebasestorage.app",
  messagingSenderId: "412336730027",
  appId: "1:412336730027:web:4d8d74268030a97529ecee",
  measurementId: "G-PPJ3QHTT5K",
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Create a custom persistence object that mimics what Firebase expects

// Initialize Firebase Auth with custom persistence
let auth: firebaseAuth.Auth;
try {
  auth = firebaseAuth.initializeAuth(app, {
    persistence: reactNativePersistence(ReactNativeAsyncStorage),
  });
} catch (error) {
  // If auth is already initialized, get the existing instance
  console.warn("Auth already initialized, using existing instance:", error);
  auth = firebaseAuth.getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { auth, db, storage };
export default app;
