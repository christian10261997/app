import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuthContext } from "../contexts/AuthContext";

export default function AuthDebug() {
  const { user, userProfile, loading } = useAuthContext();

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading authentication...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Auth Debug Info</Text>

      <Text style={styles.section}>Firebase User:</Text>
      <Text style={styles.text}>{user ? `✅ Authenticated: ${user.email}` : "❌ Not authenticated"}</Text>

      <Text style={styles.section}>User Profile:</Text>
      {userProfile ? (
        <View>
          <Text style={styles.text}>✅ Profile loaded:</Text>
          <Text style={styles.text}>
            Name: {userProfile.firstName} {userProfile.lastName}
          </Text>
          <Text style={styles.text}>Username: {userProfile.username}</Text>
          <Text style={styles.text}>Age: {userProfile.age}</Text>
          <Text style={styles.text}>Gender: {userProfile.gender}</Text>
        </View>
      ) : (
        <Text style={styles.text}>❌ No profile data</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f0f0f0",
    margin: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  section: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    marginBottom: 4,
  },
  text: {
    fontSize: 14,
    marginBottom: 2,
  },
});
