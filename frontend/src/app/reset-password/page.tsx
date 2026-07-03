"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password, confirmPassword });
      toast.success("Password reset successful!");
      router.push("/login");
    } catch {
      toast.error("Invalid or expired reset token");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-20 text-muted">
        Invalid reset link.{" "}
        <Link href="/forgot-password" className="text-primary">
          Request a new one
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-foreground text-center mb-6">
          Reset Password
        </h1>
        <form
          onSubmit={handleSubmit}
          className="surface-card p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/85">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground/85">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-base"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 btn-primary hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
