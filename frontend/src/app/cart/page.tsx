"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCart();
  const gst = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = subtotal + gst;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <ShoppingBag className="w-16 h-16 text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-primary-dark mb-2">
          Your cart is empty
        </h1>
        <p className="text-muted mb-8">
          Browse our delicious chocolates and return gifts
        </p>
        <Link
          href="/catalog"
          className="inline-block px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-primary-dark mb-2">
        Shopping Cart
      </h1>
      <p className="text-muted mb-8">{itemCount} items in your cart</p>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variant || ""}`}
              className="flex gap-4 p-4 bg-card rounded-2xl border border-border"
            >
              <div className="relative w-24 h-24 bg-accent-light/20 rounded-xl overflow-hidden flex-shrink-0">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl">
                    🍫
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-primary-dark">{item.name}</h3>
                <p className="text-accent font-bold mt-1">
                  {formatPrice(item.price)}
                </p>
                {item.customization && (
                  <div className="text-xs text-muted mt-1">
                    {Object.entries(item.customization)
                      .filter(([k]) => k !== "photo")
                      .map(([k, v]) => (
                        <span key={k} className="block">
                          {k}: {v.substring(0, 50)}
                          {v.length > 50 ? "..." : ""}
                        </span>
                      ))}
                  </div>
                )}

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-border rounded-full">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity - 1,
                          item.variant
                        )
                      }
                      className="p-1.5 hover:bg-accent-light/20 rounded-l-full"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.quantity + 1,
                          item.variant
                        )
                      }
                      className="p-1.5 hover:bg-accent-light/20 rounded-r-full"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      removeItem(item.productId, item.variant)
                    }
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right font-bold text-primary-dark">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold text-primary-dark mb-4">
            Order Summary
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">GST (5%)</span>
              <span>{formatPrice(gst)}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
              <span>Grand Total</span>
              <span className="text-accent">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block w-full mt-6 py-3 bg-primary text-white text-center rounded-full font-semibold hover:bg-primary-dark transition-colors"
          >
            Proceed to Checkout
          </Link>
          <Link
            href="/catalog"
            className="block w-full mt-3 py-3 text-center text-muted hover:text-primary transition-colors text-sm"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
