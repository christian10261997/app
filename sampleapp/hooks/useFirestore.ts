import { useState } from 'react';

export function useFirestore() {
  const [loading, setLoading] = useState(false);

  const unsupported = async () => ({ success: false, error: 'Firestore disabled' } as const);

  const addDocument = async (_collectionName: string, _data: any) => unsupported();
  const updateDocument = async (_collectionName: string, _docId: string, _data: any) => unsupported();
  const deleteDocument = async (_collectionName: string, _docId: string) => unsupported();
  const getDocument = async (_collectionName: string, _docId: string) => unsupported();
  const getDocuments = async (_collectionName: string, _constraints: any[] = []) => unsupported();
  const getDocumentsWhere = async (_collectionName: string, _field: string, _operator: any, _value: any) => unsupported();
  const getDocumentsOrdered = async (_collectionName: string, _field: string, _direction: 'asc' | 'desc' = 'asc') => unsupported();
  const getDocumentsLimited = async (_collectionName: string, _limitCount: number) => unsupported();

  return {
    loading,
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    getDocuments,
    getDocumentsWhere,
    getDocumentsOrdered,
    getDocumentsLimited,
  };
}
