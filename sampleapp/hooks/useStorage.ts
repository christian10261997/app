import { deleteObject, getDownloadURL, getMetadata, listAll, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";
import { storage } from "../config/firebase";

export function useStorage() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Test storage connection
  const testStorageConnection = async () => {
    try {
      console.log("Testing storage connection...");
      const testRef = ref(storage, "test-connection");
      console.log("Storage reference created successfully:", testRef);
      return { success: true, message: "Storage connection working" };
    } catch (error: any) {
      console.error("Storage connection test failed:", error);
      return { success: false, error: error.message };
    }
  };

  // Upload a file to Firebase Storage
  const uploadFile = async (file: any, path: string, metadata?: any) => {
    setLoading(true);
    setUploadProgress(0);

    try {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload error:", error);
            setLoading(false);
            reject({ success: false, error: error.message });
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setLoading(false);
              resolve({ success: true, downloadURL, path });
            } catch (error: any) {
              setLoading(false);
              reject({ success: false, error: error.message });
            }
          }
        );
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Upload image with compression support (for React Native)
  const uploadImage = async (imageUri: string, path: string, quality: number = 0.8) => {
    setLoading(true);

    try {
      console.log("Starting image upload...", { imageUri, path });

      // Validate inputs
      if (!imageUri) {
        throw new Error("Image URI is required");
      }
      if (!path) {
        throw new Error("Storage path is required");
      }

      // For React Native, we need to fetch the image as a blob
      console.log("Fetching image as blob...");
      const response = await fetch(imageUri);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log("Image blob created:", { size: blob.size, type: blob.type });

      console.log("Creating storage reference...");
      const storageRef = ref(storage, path);
      console.log("Storage reference created:", storageRef);

      console.log("Uploading to Firebase Storage...");
      const snapshot = await uploadBytes(storageRef, blob);
      console.log("Upload completed, getting download URL...");

      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log("Download URL obtained:", downloadURL);

      setLoading(false);
      return { success: true, downloadURL, path };
    } catch (error: any) {
      console.error("Image upload error:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack,
      });
      setLoading(false);
      return { success: false, error: error.message || "Unknown upload error" };
    }
  };

  // Get download URL for a file
  const getFileURL = async (path: string) => {
    try {
      const storageRef = ref(storage, path);
      const downloadURL = await getDownloadURL(storageRef);
      return { success: true, downloadURL };
    } catch (error: any) {
      console.error("Get file URL error:", error);
      return { success: false, error: error.message };
    }
  };

  // Delete a file
  const deleteFile = async (path: string) => {
    setLoading(true);

    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
      setLoading(false);
      return { success: true };
    } catch (error: any) {
      console.error("Delete file error:", error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // List files in a directory
  const listFiles = async (path: string) => {
    setLoading(true);

    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);

      const files = await Promise.all(
        result.items.map(async (itemRef) => {
          const metadata = await getMetadata(itemRef);
          const downloadURL = await getDownloadURL(itemRef);
          return {
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            downloadURL,
            metadata,
          };
        })
      );

      setLoading(false);
      return { success: true, files };
    } catch (error: any) {
      console.error("List files error:", error);
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  return {
    loading,
    uploadProgress,
    uploadFile,
    uploadImage,
    getFileURL,
    deleteFile,
    listFiles,
    testStorageConnection,
  };
}
