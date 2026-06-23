"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/lib/api";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Array<{ id: string; product: Product }>>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      userApi.getWishlist().then(({ data }) => setItems(data)).catch(console.error);
    }
  }, [user]);

  if (loading || !user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-primary-dark mb-6">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <Heart className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Your wishlist is empty</p>
          <Link href="/catalog" className="text-primary font-medium mt-2 inline-block">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(({ id, product }) => (
            <Link
              key={id}
              href={`/products/${product.id}`}
              className="flex items-center justify-between p-4 bg-card rounded-xl border border-border hover:border-accent transition-colors"
            >
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted">{product.category}</p>
              </div>
              <span className="font-bold text-accent">{formatPrice(product.price)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
