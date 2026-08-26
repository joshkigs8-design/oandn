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

type WishlistContextValue = {
  items: Product[];
  count: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
};

const defaultFallback: WishlistContextValue = {
  items: [],
  count: 0,
  isInWishlist: () => false,
  toggleWishlist: () => {},
  removeFromWishlist: () => {},
  clearWishlist: () => {},
};

const WishlistContext = createContext<WishlistContextValue>(defaultFallback);
const STORAGE_KEY = "on-wishlist-v1";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as Product[]);
    } catch {
      /* ignore storage parsing errors */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota errors */
    }
  }, [items]);

  const isInWishlist = useCallback(
    (productId: string) => items.some((item) => item.id === productId),
    [items],
  );

  const toggleWishlist = useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const clearWishlist = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo<WishlistContextValue>(() => {
    return {
      items,
      count: items.length,
      isInWishlist,
      toggleWishlist,
      removeFromWishlist,
      clearWishlist,
    };
  }, [items, isInWishlist, toggleWishlist, removeFromWishlist, clearWishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  return ctx ?? defaultFallback;
}
