"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/lib/api";
import { validatePhone } from "@/lib/validation";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pincode: user.pincode || "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneError = validatePhone(form.phone);
    const nextErrors: Record<string, string> = {};
    if (phoneError) nextErrors.phone = phoneError;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await userApi.updateProfile(form);
      await refreshUser();
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-primary-dark mb-6">My Profile</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-2xl border border-border p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            disabled
            value={user.email}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 text-muted"
          />
        </div>
        {[
          { name: "name", label: "Full Name" },
          { name: "phone", label: "Phone Number" },
          { name: "address", label: "Delivery Address" },
          { name: "city", label: "City" },
          { name: "state", label: "State" },
          { name: "pincode", label: "Pincode" },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">{field.label}</label>
            <input
              type="text"
              value={form[field.name as keyof typeof form]}
              onChange={(e) => {
                setForm({ ...form, [field.name]: e.target.value });
                if (errors[field.name]) {
                  setErrors((prev) => ({ ...prev, [field.name]: "" }));
                }
              }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
            />
            {errors[field.name] ? (
              <p className="text-sm text-red-600 mt-1">{errors[field.name]}</p>
            ) : null}
          </div>
        ))}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}
