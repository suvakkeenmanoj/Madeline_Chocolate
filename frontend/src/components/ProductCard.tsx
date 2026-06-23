"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/lib/api";
import toast from "react-hot-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { user } = useAuth();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to add to wishlist");
      return;
    }
    try {
      await userApi.addToWishlist(product.id);
      toast.success("Added to wishlist!");
    } catch {
      toast.error("Failed to add to wishlist");
    }
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-square bg-accent-light/20 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🍫
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent hover:text-white"
        >
          <Heart className="w-4 h-4" />
        </button>
        <span className="absolute top-3 left-3 px-2 py-1 bg-accent text-primary-dark text-xs font-semibold rounded-full">
          {product.category}
        </span>
      </div>

      <div className="p-4">
        {product.avgRating !== undefined && product.avgRating > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            <span className="text-xs text-muted">
              {product.avgRating} ({product.reviewCount} reviews)
            </span>
          </div>
        )}

        <h3 className="font-semibold text-primary-dark group-hover:text-accent transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-sm text-muted mt-1 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-lg font-bold text-primary-dark">
              {formatPrice(product.price)}
            </span>
            {product.variants && (
              <span className="text-xs text-muted block">Multiple options</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary-dark transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </Link>
  );
}
