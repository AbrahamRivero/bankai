"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  image: string;
  size: string | null;
  quantity: number;
  slug: string;
  stock: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string | null) => void;
  updateQuantity: (
    productId: string,
    size: string | null,
    quantity: number,
  ) => void;
  clearCart: () => void;
  itemCount: number;
  uniqueItemCount: number;
  subtotal: number;
};

const STORAGE_KEY = "bankai-cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const key = (i: CartItem) => `${i.productId}-${i.size ?? ""}`;
      const existing = prev.find((i) => key(i) === key(newItem));
      if (existing) {
        return prev.map((i) =>
          key(i) === key(newItem)
            ? {
                ...i,
                quantity: Math.min(i.quantity + newItem.quantity, i.stock),
              }
            : i,
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const removeItem = useCallback((productId: string, size: string | null) => {
    setItems((prev) =>
      prev.filter(
        (i) => !(i.productId === productId && (i.size ?? "") === (size ?? "")),
      ),
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, size: string | null, quantity: number) => {
      setItems((prev) =>
        prev.map((i) =>
          i.productId === productId && (i.size ?? "") === (size ?? "")
            ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) }
            : i,
        ),
      );
    },
    [],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const uniqueItemCount = items.length;
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        uniqueItemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
