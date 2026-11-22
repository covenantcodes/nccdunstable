import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

export const PAGE_SIZE = 9;

export type PagedCollection<T> = {
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string;
  /** Total documents in the collection (undefined until known). */
  total?: number;
  loadMore: () => void;
};

/**
 * Loads a collection newest-first, one page at a time, using Firestore cursors.
 * Pass `enabled: false` to skip fetching.
 */
export function usePagedCollection<T extends { id: string }>(
  collectionName: string,
  pageSize = PAGE_SIZE,
  enabled = true,
): PagedCollection<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(Boolean(db) && enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState("");
  const [total, setTotal] = useState<number>();
  const cursor = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const busy = useRef(false);

  const fetchPage = useCallback(
    async (initial: boolean) => {
      if (!db || busy.current) return;
      busy.current = true;
      initial ? setLoading(true) : setLoadingMore(true);
      try {
        const ref = collection(db, collectionName);
        const snapshot = await getDocs(
          !initial && cursor.current
            ? query(ref, orderBy("createdAt", "desc"), startAfter(cursor.current), limit(pageSize))
            : query(ref, orderBy("createdAt", "desc"), limit(pageSize)),
        );
        const page = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as unknown as T);
        cursor.current = snapshot.docs[snapshot.docs.length - 1] ?? cursor.current;
        setItems((current) => (initial ? page : [...current, ...page]));
        setHasMore(snapshot.docs.length === pageSize);
        setError("");
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not load content.");
      } finally {
        busy.current = false;
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [collectionName, pageSize],
  );

  useEffect(() => {
    if (!enabled || !db) return;
    cursor.current = null;
    busy.current = false;
    setItems([]);
    setHasMore(false);
    setTotal(undefined);
    void fetchPage(true);
    getCountFromServer(collection(db, collectionName))
      .then((s) => setTotal(s.data().count))
      .catch(() => undefined);
  }, [collectionName, enabled, fetchPage]);

  const loadMore = useCallback(() => void fetchPage(false), [fetchPage]);

  return { items, setItems, loading, loadingMore, hasMore, error, total, loadMore };
}
