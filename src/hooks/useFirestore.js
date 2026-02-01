import { useState } from "react";
import { db } from "../services/firebase";
import { collection, addDoc, deleteDoc, updateDoc, doc, Timestamp } from "firebase/firestore";

export function useFirestore(collectionName) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Collection reference
    const ref = collection(db, collectionName);

    // Add a document
    const addDocument = async (docData) => {
        setLoading(true);
        try {
            const createdAt = Timestamp.fromDate(new Date());
            const addedDocument = await addDoc(ref, { ...docData, createdAt });
            setLoading(false);
            return addedDocument;
        } catch (err) {
            console.error(err);
            setError(err.message);
            setLoading(false);
            return null;
        }
    };

    // Delete a document
    const deleteDocument = async (id) => {
        setLoading(true);
        try {
            await deleteDoc(doc(ref, id));
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError(err.message);
            setLoading(false);
        }
    };

    // Update a document
    const updateDocument = async (id, updates) => {
        setLoading(true);
        try {
            await updateDoc(doc(ref, id), updates);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError(err.message);
            setLoading(false);
        }
    };

    return { addDocument, deleteDocument, updateDocument, loading, error };
}
