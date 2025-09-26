import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

interface ImageUploadProps {
  imageUri?: string;
  onImageSelect: (uri: string) => void;
  onImageRemove: () => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function ImageUpload({ imageUri, onImageSelect, onImageRemove, label = "Upload Payment Reference", placeholder = "Tap to select image", disabled = false }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Sorry, we need camera roll permissions to upload images.", [{ text: "OK" }]);
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (disabled || isLoading) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        onImageSelect(selectedImage.uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.", [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    if (disabled || isLoading) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Sorry, we need camera permissions to take photos.", [{ text: "OK" }]);
      return;
    }

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        onImageSelect(selectedImage.uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.", [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const showImageOptions = () => {
    if (disabled) return;

    Alert.alert("Select Image", "Choose how you want to add your payment reference image", [
      { text: "Camera", onPress: takePhoto },
      { text: "Photo Library", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleRemoveImage = () => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: onImageRemove },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>

      {imageUri ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.selectedImage} />
          <View style={styles.imageOverlay}>
            <TouchableOpacity style={styles.imageAction} onPress={showImageOptions} disabled={disabled}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.imageAction, styles.removeAction]} onPress={handleRemoveImage} disabled={disabled}>
              <Ionicons name="trash" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadArea, disabled && styles.disabledUploadArea, isLoading && styles.loadingUploadArea]}
          onPress={showImageOptions}
          disabled={disabled || isLoading}
          activeOpacity={0.7}>
          <View style={styles.uploadContent}>
            {isLoading ? (
              <>
                <Ionicons name="hourglass" size={32} color="#8E8E93" />
                <ThemedText style={styles.uploadText}>Loading...</ThemedText>
              </>
            ) : (
              <>
                <Ionicons name="cloud-upload" size={32} color="#007AFF" />
                <ThemedText style={styles.uploadText}>{placeholder}</ThemedText>
                <ThemedText style={styles.uploadSubtext}>JPG, PNG up to 10MB</ThemedText>
              </>
            )}
          </View>
        </TouchableOpacity>
      )}

      <ThemedText style={styles.helpText}>Upload a clear photo of your payment receipt or bank transfer confirmation. This will be reviewed by our admin team.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    backgroundColor: "transparent",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#2c3e50",
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    minHeight: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  disabledUploadArea: {
    borderColor: "#8E8E93",
    backgroundColor: "#F1F3F4",
  },
  loadingUploadArea: {
    borderColor: "#8E8E93",
  },
  uploadContent: {
    alignItems: "center",
    padding: 20,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#007AFF",
    marginTop: 8,
    textAlign: "center",
  },
  uploadSubtext: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 4,
    textAlign: "center",
  },
  imageContainer: {
    position: "relative",
    marginBottom: 8,
  },
  selectedImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#F1F3F4",
  },
  imageOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 8,
  },
  imageAction: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  removeAction: {
    backgroundColor: "rgba(255,59,48,0.8)",
  },
  helpText: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 16,
  },
});
