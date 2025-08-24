import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../config/firebase";

export function useFirestore() {
  const [loading, setLoading] = useState(false);

  // Add a document to a collection
  const addDocument = async (collectionName: string, data: any) => {
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error("Error adding document:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Update a document
  const updateDocument = async (collectionName: string, docId: string, data: any) => {
    setLoading(true);
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date(),
      });
      return { success: true };
    } catch (error: any) {
      console.error("Error updating document:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete a document
  const deleteDocument = async (collectionName: string, docId: string) => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, collectionName, docId));
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting document:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get a single document
  const getDocument = async (collectionName: string, docId: string) => {
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, collectionName, docId));
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: "Document not found" };
      }
    } catch (error: any) {
      console.error("Error getting document:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get multiple documents
  const getDocuments = async (collectionName: string, queryConstraints: any[] = []) => {
    setLoading(true);
    try {
      const q = query(collection(db, collectionName), ...queryConstraints);
      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return { success: true, data: documents };
    } catch (error: any) {
      console.error("Error getting documents:", error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Get documents with where clause
  const getDocumentsWhere = async (collectionName: string, field: string, operator: any, value: any) => {
    return getDocuments(collectionName, [where(field, operator, value)]);
  };

  // Get documents ordered
  const getDocumentsOrdered = async (collectionName: string, field: string, direction: "asc" | "desc" = "asc") => {
    return getDocuments(collectionName, [orderBy(field, direction)]);
  };

  // Get limited documents
  const getDocumentsLimited = async (collectionName: string, limitCount: number) => {
    return getDocuments(collectionName, [limit(limitCount)]);
  };

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

// Hook for real-time data listening
export function useFirestoreRealtime(collectionName: string, queryConstraints: any[] = []) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...queryConstraints);

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const docs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDocuments(docs);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error("Error in real-time listener:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  return { documents, loading, error };
}
