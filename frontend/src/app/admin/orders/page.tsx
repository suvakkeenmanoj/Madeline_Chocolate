"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import { Order, ORDER_STATUS_LABELS, OrderStatus } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

const STATUSES: OrderStatus[] = [
  "ORDER_PLACED",
  "PREPARING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

function AdminOrdersContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState(searchParams.get("status") || "");
  const [paymentFilter, setPaymentFilter] = useState(
    searchParams.get("paymentMethod") || ""
  );

  useEffect(() => {
    if (!loading && !user?.isAdmin) router.push("/login");
  }, [user, loading, router]);

  const fetchOrders = () => {
    adminApi
      .getOrders({
        status: filter || undefined,
        paymentMethod: paymentFilter || undefined,
      })
      .then(({ data }) => setOrders(data))
      .catch(console.error);
  };

  useEffect(() => {
    if (user?.isAdmin) fetchOrders();
  }, [user, filter, paymentFilter]);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, { status });
      toast.success("Order status updated");
      fetchOrders();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const setDeliveryDate = async (orderId: string, date: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, { deliveryDate: date });
      toast.success("Delivery date updated");
      fetchOrders();
    } catch {
      toast.error("Failed to update delivery date");
    }
  };

  if (loading || !user?.isAdmin) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-primary-dark mb-6">Order Management</h1>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-border bg-card"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="px-4 py-2 rounded-xl border border-border bg-card"
        >
          <option value="">All Payment Methods</option>
          <option value="COD">COD</option>
          <option value="UPI">UPI</option>
        </select>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-5 bg-card rounded-2xl border border-border"
          >
            <div className="flex flex-wrap justify-between gap-2 mb-3">
              <div>
                <span className="font-bold">{order.orderNumber}</span>
                <span className="text-sm text-muted ml-3">
                  {order.user?.name} · {order.phone}
                </span>
              </div>
              <span className="font-bold text-accent">
                {formatPrice(order.totalAmount)}
              </span>
            </div>

            <div className="text-sm text-muted mb-3">
              {formatDate(order.createdAt)} · {order.paymentMethod} ·{" "}
              {order.deliveryAddress}
            </div>

            <div className="text-sm mb-4">
              {order.items.map((item) => (
                <span key={item.id} className="mr-3">
                  {item.product.name} x{item.quantity}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>

              <input
                type="date"
                onChange={(e) => setDeliveryDate(order.id, e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-border bg-background"
                title="Set expected delivery date"
              />
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <p className="text-center py-10 text-muted">No orders found</p>
        )}
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
