"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { productApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function EditProductPage() {
  const { id } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });

  useEffect(() => {
    if (!loading && !user?.isAdmin) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (id) {
      productApi.getById(id as string).then(({ data }) => {
        setForm({
          name: data.name,
          description: data.description,
          price: String(data.price),
          category: data.category,
          stock: String(data.stock),
          image: data.image || "",
        });
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await productApi.update(id as string, {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
      });
      toast.success("Product updated!");
      router.push("/admin/products");
    } catch {
      toast.error("Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !user?.isAdmin) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/admin/products" className="text-sm text-primary hover:text-accent mb-4 inline-block">
        ← Back to Products
      </Link>
      <h1 className="text-2xl font-bold text-primary-dark mb-6">Edit Product</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-2xl border border-border p-6 space-y-4"
      >
        {[
          { name: "name", label: "Product Name", type: "text" },
          { name: "description", label: "Description", type: "textarea" },
          { name: "price", label: "Price (₹)", type: "number" },
          { name: "category", label: "Category", type: "text" },
          { name: "stock", label: "Stock", type: "number" },
          { name: "image", label: "Image URL", type: "text" },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">{field.label}</label>
            {field.type === "textarea" ? (
              <textarea
                required={field.name !== "image"}
                rows={3}
                value={form[field.name as keyof typeof form]}
                onChange={(e) =>
                  setForm({ ...form, [field.name]: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
            ) : (
              <input
                type={field.type}
                required={field.name !== "image"}
                value={form[field.name as keyof typeof form]}
                onChange={(e) =>
                  setForm({ ...form, [field.name]: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
