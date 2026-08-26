import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Product } from "./catalog";

type RecentlyViewedContextValue = {
  recentProducts: Product[];
  addRecentlyViewed: (product: Product) => void;
  clearRecentlyViewed: () => void;
};

const defaultFallback: RecentlyViewedContextValue = {
  recentProducts: [],
  addRecentlyViewed: () => {},
  clearRecentlyViewed: () => {},
};

const RecentlyViewedContext = createContext<RecentlyViewedContextValue>(defaultFallback);
const STORAGE_KEY = "on-recently-viewed-v1";

export function RecentlyViewedProvider({ children }: { children: ReactNode }) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setRecentProducts(JSON.parse(raw) as Product[]);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const addRecentlyViewed = useCallback((product: Product) => {
    setRecentProducts((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const next = [product, ...filtered].slice(0, 8);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    setRecentProducts([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      recentProducts,
      addRecentlyViewed,
      clearRecentlyViewed,
    }),
    [recentProducts, addRecentlyViewed, clearRecentlyViewed],
  );

  return <RecentlyViewedContext.Provider value={value}>{children}</RecentlyViewedContext.Provider>;
}

export function useRecentlyViewed() {
  const ctx = useContext(RecentlyViewedContext);
  return ctx ?? defaultFallback;
}
