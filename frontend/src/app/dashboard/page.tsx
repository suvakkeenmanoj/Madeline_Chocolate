"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, Heart, MapPin } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { href: "/dashboard/profile", icon: User, label: "My Profile", desc: "Update your details" },
  { href: "/dashboard/orders", icon: Package, label: "My Orders", desc: "Track your orders" },
  { href: "/dashboard/wishlist", icon: Heart, label: "Wishlist", desc: "Saved products" },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && user?.isAdmin) router.push("/admin");
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-primary-dark mb-2">
        Hello, {user.name}! 👋
      </h1>
      <p className="text-muted mb-8">Manage your account and orders</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map(({ href, icon: Icon, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="p-6 bg-card rounded-2xl border border-border hover:border-accent transition-colors group"
          >
            <div className="inline-flex p-3 bg-accent-light/30 rounded-full mb-4 group-hover:bg-accent/20 transition-colors">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-primary-dark">{label}</h3>
            <p className="text-sm text-muted mt-1">{desc}</p>
          </Link>
        ))}
      </div>

      {user.address && (
        <div className="mt-8 p-6 bg-card rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Saved Address</h3>
          </div>
          <p className="text-sm text-muted">
            {user.address}, {user.city}, {user.state} - {user.pincode}
          </p>
        </div>
      )}
    </div>
  );
}
