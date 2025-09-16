import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View style={[styles.toastContainer, styles.successContainer]}>
      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      <View style={styles.textContainer}>
        <Text style={[styles.text1, styles.successText]}>{text1}</Text>
        {text2 && <Text style={[styles.text2, styles.successText]}>{text2}</Text>}
      </View>
    </View>
  ),

  error: ({ text1, text2 }: any) => (
    <View style={[styles.toastContainer, styles.errorContainer]}>
      <Ionicons name="close-circle" size={24} color="#F44336" />
      <View style={styles.textContainer}>
        <Text style={[styles.text1, styles.errorText]}>{text1}</Text>
        {text2 && <Text style={[styles.text2, styles.errorText]}>{text2}</Text>}
      </View>
    </View>
  ),

  info: ({ text1, text2 }: any) => (
    <View style={[styles.toastContainer, styles.infoContainer]}>
      <Ionicons name="information-circle" size={24} color="#2196F3" />
      <View style={styles.textContainer}>
        <Text style={[styles.text1, styles.infoText]}>{text1}</Text>
        {text2 && <Text style={[styles.text2, styles.infoText]}>{text2}</Text>}
      </View>
    </View>
  ),

  warning: ({ text1, text2 }: any) => (
    <View style={[styles.toastContainer, styles.warningContainer]}>
      <Ionicons name="warning" size={24} color="#FF9800" />
      <View style={styles.textContainer}>
        <Text style={[styles.text1, styles.warningText]}>{text1}</Text>
        {text2 && <Text style={[styles.text2, styles.warningText]}>{text2}</Text>}
      </View>
    </View>
  ),
};

const styles = StyleSheet.create({
  toastContainer: {
    height: 60,
    width: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
  },
  text1: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  text2: {
    fontSize: 14,
    fontWeight: "400",
    opacity: 0.8,
  },
  successContainer: {
    borderLeftColor: "#4CAF50",
    backgroundColor: "#F1F8E9",
  },
  successText: {
    color: "#2E7D32",
  },
  errorContainer: {
    borderLeftColor: "#F44336",
    backgroundColor: "#FFEBEE",
  },
  errorText: {
    color: "#C62828",
  },
  infoContainer: {
    borderLeftColor: "#2196F3",
    backgroundColor: "#E3F2FD",
  },
  infoText: {
    color: "#1565C0",
  },
  warningContainer: {
    borderLeftColor: "#FF9800",
    backgroundColor: "#FFF3E0",
  },
  warningText: {
    color: "#E65100",
  },
});

export default toastConfig;
