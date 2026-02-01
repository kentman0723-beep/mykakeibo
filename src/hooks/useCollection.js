import { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";

export function useCollection(collectionName, _query, _orderBy) {
    const [documents, setDocuments] = useState(null);
    const [error, setError] = useState(null);

    // We rely on the caller to memoize _query and _orderBy using useMemo.
    // If they are not memoized, this effect will re-run on every render.

    useEffect(() => {
        // Guard: If any value in the query is undefined, do not execute
        if (_query && _query.some(val => val === undefined)) {
            console.log("Query skipped due to undefined value:", _query);
            return;
        }

        let ref = collection(db, collectionName);

        if (_query) {
            ref = query(ref, where(..._query));
        }

        if (_orderBy) {
            ref = query(ref, orderBy(..._orderBy));
        }

        const unsubscribe = onSnapshot(ref, (snapshot) => {
            let results = [];
            snapshot.docs.forEach(doc => {
                results.push({ ...doc.data(), id: doc.id });
            });

            setDocuments(results);
            setError(null);
        }, (error) => {
            console.error(error);
            setError(error.message);
        });

        return () => unsubscribe();

    }, [collectionName, _query, _orderBy]);

    return { documents, error };
}
