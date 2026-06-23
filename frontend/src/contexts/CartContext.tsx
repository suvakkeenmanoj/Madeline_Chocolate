"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CartItem } from "@/types";
import toast from "react-hot-toast";

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const CART_KEY = "madeline_cart";

function itemKey(productId: string, variant?: string) {
  return variant ? `${productId}::${variant}` : productId;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        localStorage.removeItem(CART_KEY);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  const addItem = (item: CartItem) => {
    setItems((prev) => {
      const key = itemKey(item.productId, item.variant);
      const existing = prev.find(
        (i) => itemKey(i.productId, i.variant) === key
      );
      if (existing) {
        return prev.map((i) =>
          itemKey(i.productId, i.variant) === key
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
    toast.success("Added to cart!");
  };

  const removeItem = (productId: string, variant?: string) => {
    const key = itemKey(productId, variant);
    setItems((prev) =>
      prev.filter((i) => itemKey(i.productId, i.variant) !== key)
    );
    toast.success("Removed from cart");
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    variant?: string
  ) => {
    if (quantity <= 0) {
      removeItem(productId, variant);
      return;
    }
    const key = itemKey(productId, variant);
    setItems((prev) =>
      prev.map((i) =>
        itemKey(i.productId, i.variant) === key ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
