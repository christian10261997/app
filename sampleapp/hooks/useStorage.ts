import { useState } from 'react';

export function useStorage() {
  const [loading, setLoading] = useState(false);

  const unsupported = async () => ({ success: false, error: 'Storage disabled' } as const);

  const uploadFile = async (_file: any, _path: string, _metadata?: any) => unsupported();
  const getFileURL = async (_path: string) => unsupported();
  const deleteFile = async (_path: string) => unsupported();
  const listFiles = async (_path: string) => unsupported();
  const uploadImage = async (_imageUri: string, _path: string, _quality: number = 0.8) => unsupported();

  return {
    loading,
    uploadFile,
    uploadImage,
    getFileURL,
    deleteFile,
    listFiles,
  };
}
