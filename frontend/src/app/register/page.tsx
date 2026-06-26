"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { validateEmail, validatePhone } from "@/lib/validation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    const emailError = validateEmail(form.email);
    const phoneError = validatePhone(form.phone);

    if (emailError) nextErrors.email = emailError;
    if (phoneError) nextErrors.phone = phoneError;

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
    setLoading(true);
    try {
      await register(form);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🍫</span>
          <h1 className="text-2xl font-bold text-primary-dark mt-2">Create Account</h1>
          <p className="text-muted text-sm mt-1">Join Madeline_chocolate today</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl border border-border p-6 space-y-4"
        >
          {[
            { name: "name", label: "Full Name", type: "text" },
            { name: "email", label: "Email", type: "email" },
            { name: "phone", label: "Phone Number", type: "tel" },
            { name: "password", label: "Password", type: "password" },
            { name: "confirmPassword", label: "Confirm Password", type: "password" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              <input
                type={field.type}
                required
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
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:text-accent">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
