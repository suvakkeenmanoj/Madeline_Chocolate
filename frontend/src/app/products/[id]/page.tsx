"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { productApi } from "@/lib/api";
import { Product, ProductVariant } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [customization, setCustomization] = useState<Record<string, string>>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      productApi
        .getById(id as string)
        .then(({ data }) => {
          setProduct(data);
          if (data.variants?.options?.length) {
            setSelectedVariant(data.variants.options[0]);
          }
        })
        .catch(() => toast.error("Product not found"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const currentPrice = selectedVariant?.price ?? product?.price ?? 0;

  const handleImageUpload = (fieldName: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setCustomization((prev) => ({ ...prev, [fieldName]: dataUrl }));
      setPreviewImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.customizable && product.customFields?.fields) {
      for (const field of product.customFields.fields) {
        if (field.required && !customization[field.name]) {
          toast.error(`${field.label} is required`);
          return;
        }
      }
    }

    const variantLabel = selectedVariant?.label;
    addItem({
      productId: product.id,
      name: variantLabel ? `${product.name} (${variantLabel})` : product.name,
      price: currentPrice,
      quantity,
      image: product.image,
      variant: variantLabel,
      customization: Object.keys(customization).length ? customization : undefined,
    });
    router.push("/cart");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-10">
          <div className="aspect-square bg-border/50 rounded-2xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-border/50 rounded animate-pulse w-2/3" />
            <div className="h-4 bg-border/50 rounded animate-pulse" />
            <div className="h-4 bg-border/50 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 text-muted">Product not found</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="relative aspect-square bg-accent-light/20 rounded-2xl overflow-hidden">
          {previewImage || product.image ? (
            <Image
              src={previewImage || product.image!}
              alt={product.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-8xl">
              🍫
            </div>
          )}
        </div>

        <div>
          <span className="text-sm text-accent font-medium">{product.category}</span>
          <h1 className="text-3xl font-bold text-primary-dark mt-1">{product.name}</h1>

          {product.avgRating !== undefined && product.avgRating > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(product.avgRating!)
                        ? "fill-accent text-accent"
                        : "text-border"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted">
                {product.avgRating} ({product.reviewCount} reviews)
              </span>
            </div>
          )}

          <p className="text-muted mt-4 leading-relaxed">{product.description}</p>

          <div className="mt-6">
            <span className="text-3xl font-bold text-primary-dark">
              {formatPrice(currentPrice)}
            </span>
          </div>

          {product.variants?.options && (
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Select Option</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.variants.options.map((variant) => (
                  <button
                    key={variant.label}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-3 rounded-xl border text-left transition-colors ${
                      selectedVariant?.label === variant.label
                        ? "border-accent bg-accent-light/20"
                        : "border-border hover:border-accent"
                    }`}
                  >
                    <div className="font-medium text-sm">{variant.label}</div>
                    <div className="text-accent font-bold">
                      {formatPrice(variant.price)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.customizable && product.customFields?.fields && (
            <div className="mt-6 space-y-4">
              <h3 className="font-medium">Customization</h3>
              {product.customFields.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-1">
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  {field.type === "image" ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(field.name, file);
                      }}
                      className="w-full text-sm"
                    />
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={customization[field.name] || ""}
                      onChange={(e) =>
                        setCustomization((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  ) : (
                    <input
                      type="text"
                      value={customization[field.name] || ""}
                      onChange={(e) =>
                        setCustomization((prev) => ({
                          ...prev,
                          [field.name]: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 rounded-xl border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border border-border rounded-full">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-accent-light/20 rounded-l-full transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-3 hover:bg-accent-light/20 rounded-r-full transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart — {formatPrice(currentPrice * quantity)}
            </button>
          </div>
        </div>
      </div>

      {product.reviews && product.reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-primary-dark mb-6">
            Customer Reviews
          </h2>
          <div className="grid gap-4">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="p-4 bg-card rounded-xl border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= review.rating
                            ? "fill-accent text-accent"
                            : "text-border"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.user.name}</span>
                </div>
                {review.review && (
                  <p className="text-sm text-muted">{review.review}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
