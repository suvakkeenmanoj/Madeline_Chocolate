"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { validateEmail } from "@/lib/validation";
import toast from "react-hot-toast";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextEmailError = validateEmail(email);
    setEmailError(nextEmailError || "");
    if (nextEmailError) {
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.push(redirect);
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🍫</span>
          <h1 className="text-2xl font-bold text-foreground mt-2">Welcome Back</h1>
          <p className="text-muted text-sm mt-1">Login to your Madeline_chocolate account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="surface-card p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/85">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/85">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base"
            />
          </div>
          <div className="text-right">
            <Link href="/forgot-password" className="text-accent font-medium hover:text-accent-light transition-colors">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 btn-primary hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-accent font-medium hover:text-accent-light transition-colors">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
