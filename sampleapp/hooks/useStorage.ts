import { deleteObject, getDownloadURL, getMetadata, listAll, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { useState } from "react";
import { storage } from "../config/firebase";

export function useStorage() {
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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
      // For React Native, we need to fetch the image as a blob
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      setLoading(false);
      return { success: true, downloadURL, path };
    } catch (error: any) {
      console.error("Image upload error:", error);
      setLoading(false);
      return { success: false, error: error.message };
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
  };
}
