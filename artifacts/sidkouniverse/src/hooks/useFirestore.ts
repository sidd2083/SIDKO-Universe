import { useEffect, useState } from 'react';
import { collection, query, limit, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFirestore<T>(collectionName: string, queryConstraints: any[] = []) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionName), ...queryConstraints);
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        setData(results);
        setLoading(false);
      },
      (err) => {
        console.error(`Error fetching ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
}