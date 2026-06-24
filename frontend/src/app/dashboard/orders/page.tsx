"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { userApi } from "@/lib/api";
import { Order, ORDER_STATUS_LABELS } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      userApi.getOrders().then(({ data }) => setOrders(data)).catch(console.error);
    }
  }, [user]);

  if (loading || !user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-primary-dark mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-muted">
          <p>No orders yet</p>
          <Link href="/catalog" className="text-primary font-medium mt-2 inline-block">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/order-confirmation/${order.id}`}
              className="block p-5 bg-card rounded-2xl border border-border hover:border-accent transition-colors"
            >
              <div className="flex flex-wrap justify-between gap-2 mb-3">
                <span className="font-bold text-primary-dark">
                  {order.orderNumber}
                </span>
                <span className="text-sm px-3 py-1 bg-accent-light/30 rounded-full text-primary">
                  {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]}
                </span>
              </div>
              <div className="flex flex-wrap justify-between text-sm text-muted">
                <span>{formatDate(order.createdAt)}</span>
                <span className="font-bold text-accent">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
              <div className="text-xs text-muted mt-2">
                {order.items.length} item(s) · {order.paymentMethod} · {order.paymentStatus}
              </div>
              {order.utrNumber && (
                <div className="text-xs text-muted mt-1">UTR: {order.utrNumber}</div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
