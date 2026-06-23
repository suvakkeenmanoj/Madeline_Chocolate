"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Users,
  IndianRupee,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

interface Stats {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  ordersToday: number;
  revenueToday: number;
  pendingOrders: number;
  codOrders: number;
  averageOrderValue: number;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    if (!loading && user && !user.isAdmin) router.push("/dashboard");
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.isAdmin) {
      adminApi.getStats().then(({ data }) => setStats(data)).catch(console.error);
    }
  }, [user]);

  if (loading || !user?.isAdmin) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  const statCards = stats
    ? [
        { icon: IndianRupee, label: "Total Revenue", value: formatPrice(stats.totalRevenue), color: "text-green-600" },
        { icon: ShoppingBag, label: "Total Orders", value: stats.totalOrders, color: "text-blue-600" },
        { icon: Users, label: "Total Customers", value: stats.totalCustomers, color: "text-purple-600" },
        { icon: Package, label: "Pending Orders", value: stats.pendingOrders, color: "text-orange-600" },
        { icon: TrendingUp, label: "Orders Today", value: stats.ordersToday, color: "text-accent" },
        { icon: IndianRupee, label: "Revenue Today", value: formatPrice(stats.revenueToday), color: "text-green-600" },
      ]
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary-dark">Admin Dashboard</h1>
          <p className="text-muted">Manage Madeline_chocolate store</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/orders"
            className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Manage Orders
          </Link>
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-border rounded-full text-sm font-medium hover:border-accent transition-colors"
          >
            Manage Products
          </Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            className="p-6 bg-card rounded-2xl border border-border"
          >
            <div className="flex items-center gap-3 mb-3">
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-sm text-muted">{label}</span>
            </div>
            <p className="text-2xl font-bold text-primary-dark">{value}</p>
          </div>
        ))}
      </div>

      {stats && (
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="p-6 bg-card rounded-2xl border border-border">
            <h3 className="font-semibold mb-2">Quick Stats</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>COD Orders: {stats.codOrders}</li>
              <li>Avg Order Value: {formatPrice(stats.averageOrderValue)}</li>
            </ul>
          </div>
          <div className="p-6 bg-card rounded-2xl border border-border">
            <h3 className="font-semibold mb-2">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/admin/orders?status=ORDER_PLACED" className="block text-sm text-primary hover:text-accent">
                View Pending Orders →
              </Link>
              <Link href="/admin/orders?paymentMethod=COD" className="block text-sm text-primary hover:text-accent">
                View COD Orders →
              </Link>
              <Link href="/admin/products/new" className="block text-sm text-primary hover:text-accent">
                Add New Product →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
