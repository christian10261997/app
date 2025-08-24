import React, { useCallback, useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuthContext } from "../contexts/AuthContext";
import { useFirestore } from "../hooks/useFirestore";
import { useStorage } from "../hooks/useStorage";

const FirebaseExample = () => {
  const { user, signIn, signUp, logout } = useAuthContext();
  const { addDocument, getDocuments, loading: firestoreLoading } = useFirestore();
  const { loading: storageLoading } = useStorage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [testData, setTestData] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);

  // Test Firestore functionality
  const testFirestore = async () => {
    if (!testData.trim()) {
      Alert.alert("Error", "Please enter some test data");
      return;
    }

    try {
      const result = await addDocument("test_collection", {
        message: testData,
        userId: user?.uid,
        timestamp: new Date(),
      });

      if (result.success) {
        Alert.alert("Success", "Document added to Firestore!");
        setTestData("");
        loadDocuments();
      } else {
        Alert.alert("Error", result.error);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  // Load documents from Firestore
  const loadDocuments = useCallback(async () => {
    try {
      const result = await getDocuments("test_collection");
      if (result.success) {
        setDocuments(result.data || []);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  }, [getDocuments]);

  // Load documents when component mounts
  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user, loadDocuments]);

  const handleSignIn = async () => {
    const result = await signIn(email, password);
    if (result.success) {
      Alert.alert("Success", "Signed in successfully!");
    } else {
      Alert.alert("Error", result.error);
    }
  };

  const handleSignUp = async () => {
    const result = await signUp(email, password);
    if (result.success) {
      Alert.alert("Success", "Account created successfully!");
    } else {
      Alert.alert("Error", result.error);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      Alert.alert("Success", "Logged out successfully!");
      setDocuments([]);
    } else {
      Alert.alert("Error", result.error);
    }
  };

  if (!user) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Firebase Authentication Test</Text>

        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity style={styles.button} onPress={handleSignIn}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>Firebase JS SDK is configured and ready to use!</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Firebase Example - Authenticated</Text>

      <View style={styles.userInfo}>
        <Text style={styles.userText}>User: {user.email}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Test Firestore</Text>
      <TextInput style={styles.input} placeholder="Enter test data" value={testData} onChangeText={setTestData} multiline />

      <TouchableOpacity style={[styles.button, (firestoreLoading || storageLoading) && styles.disabledButton]} onPress={testFirestore} disabled={firestoreLoading || storageLoading}>
        <Text style={styles.buttonText}>{firestoreLoading ? "Adding..." : "Add to Firestore"}</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Documents ({documents.length})</Text>
      {documents.map((doc, index) => (
        <View key={doc.id || index} style={styles.documentItem}>
          <Text style={styles.documentText}>{doc.message}</Text>
          <Text style={styles.timestampText}>{doc.timestamp?.toDate?.()?.toLocaleString() || "No timestamp"}</Text>
        </View>
      ))}

      <Text style={styles.infoText}>
        ✅ Firebase Authentication working
        {"\n"}✅ Firebase Firestore working
        {"\n"}✅ Firebase Storage configured
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    padding: 10,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  userInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
  },
  userText: {
    fontSize: 16,
    fontWeight: "500",
  },
  documentItem: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  documentText: {
    fontSize: 16,
    marginBottom: 5,
  },
  timestampText: {
    fontSize: 12,
    color: "#666",
  },
  infoText: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
});

export default FirebaseExample;
