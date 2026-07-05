"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import { Order, ORDER_STATUS_LABELS, OrderStatus, OrderMessage } from "@/types";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";
import RejectPaymentModal from "@/components/RejectPaymentModal";
import { MessageCircle } from "lucide-react";

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
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, { courierName: string; trackingNumber: string; trackingLink: string; expectedDelivery: string; deliveryNotes: string }>>({});
  const [conversationOrderId, setConversationOrderId] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Record<string, OrderMessage[]>>({});
  const [conversationDraft, setConversationDraft] = useState("");
  const [sendingConversation, setSendingConversation] = useState(false);

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

  const updatePaymentStatus = async (orderId: string, paymentStatus: string, rejectionReason?: string, screenshotRequested?: boolean) => {
    try {
      await adminApi.updatePaymentStatus(orderId, { paymentStatus, rejectionReason, screenshotRequested });
      toast.success("Payment status updated");
      fetchOrders();
    } catch {
      toast.error("Failed to update payment status");
    }
  };

  const openRejectModal = (orderId: string) => {
    setActiveOrderId(orderId);
    setRejectModalOpen(true);
  };

  const submitRejectPayment = async (reason: string, screenshotRequested: boolean) => {
    if (!activeOrderId) return;
    await updatePaymentStatus(activeOrderId, "REJECTED", reason, screenshotRequested);
    setRejectModalOpen(false);
    setActiveOrderId(null);
  };

  const updateTracking = async (orderId: string) => {
    const draft = trackingDrafts[orderId];
    if (!draft) return;
    try {
      await adminApi.updateOrderTracking(orderId, draft);
      toast.success("Tracking updated");
      fetchOrders();
    } catch {
      toast.error("Failed to update tracking");
    }
  };

  const openConversation = async (orderId: string) => {
    try {
      const { data } = await adminApi.getOrderDetails(orderId);
      setConversationOrderId(orderId);
      setConversationMessages((prev) => ({ ...prev, [orderId]: data.messages || [] }));
      setConversationDraft("");
    } catch {
      toast.error("Failed to load conversation");
    }
  };

  const sendConversationReply = async (orderId: string) => {
    if (!conversationDraft.trim()) return;
    setSendingConversation(true);
    try {
      const { data } = await adminApi.sendOrderMessage(orderId, { message: conversationDraft.trim() });
      setConversationMessages((prev) => ({ ...prev, [orderId]: [...(prev[orderId] || []), data] }));
      setConversationDraft("");
      toast.success("Reply sent");
    } catch {
      toast.error("Failed to send reply");
    } finally {
      setSendingConversation(false);
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
        {orders.map((order) => {
          const expectedDelivery = order.tracking?.expectedDelivery || order.deliveryDate;

          return (
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

            <div className="text-sm space-y-2 mb-4">
              <div>
                <span className="font-medium">Customer:</span> {order.user?.name} · {order.user?.email}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">Payment:</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${order.paymentStatus === "PAID" ? "bg-green-100 text-green-700" : order.paymentStatus === "REJECTED" ? "bg-red-100 text-red-700" : order.paymentStatus === "COD_PENDING" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}>
                  {order.paymentStatus}
                </span>
                {order.utrNumber ? ` · UTR: ${order.utrNumber}` : ""}
              </div>
              {order.paymentScreenshot && (
                <div>
                  <a href={order.paymentScreenshot} target="_blank" rel="noreferrer" className="text-primary hover:text-accent">
                    View payment screenshot
                  </a>
                </div>
              )}
              <div className="text-xs text-muted">
                Expected delivery: {expectedDelivery ? formatDate(expectedDelivery) : "Not set"}
              </div>
            </div>

            <div className="text-sm mb-4">
              {order.items.map((item) => (
                <span key={item.id} className="mr-3">
                  {item.product.name} x{item.quantity}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => updatePaymentStatus(order.id, "PAID")}
                  className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                >
                  Mark Paid
                </button>
                <button
                  type="button"
                  onClick={() => openRejectModal(order.id)}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                >
                  Reject Payment
                </button>
                <button
                  type="button"
                  onClick={() => openConversation(order.id)}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-background"
                >
                  <span className="inline-flex items-center gap-2"><MessageCircle className="h-4 w-4" /> View Conversation</span>
                </button>
              </div>
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
            </div>

            {conversationOrderId === order.id && (
              <div className="mt-4 rounded-xl border border-border bg-background/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Conversation</span>
                </div>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {(conversationMessages[order.id] || []).map((message) => (
                    <div key={message.id} className={`rounded-lg border border-border p-2 text-sm ${message.senderType === "ADMIN" ? "bg-accent-light/20" : "bg-card"}`}>
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="font-medium">{message.senderType === "ADMIN" ? "You" : "Customer"}</span>
                        <span className="text-xs text-muted">{formatDateTime(message.createdAt)}</span>
                      </div>
                      <p className="text-muted">{message.message}</p>
                    </div>
                  ))}
                  {(conversationMessages[order.id] || []).length === 0 && (
                    <p className="text-sm text-muted">No messages yet.</p>
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  <textarea
                    value={conversationDraft}
                    onChange={(e) => setConversationDraft(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
                    placeholder="Reply to customer"
                  />
                  <button
                    type="button"
                    onClick={() => sendConversationReply(order.id)}
                    disabled={sendingConversation}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {sendingConversation ? "Sending..." : "Send Reply"}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 rounded-xl border border-border bg-background/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium">Tracking</span>
                <button
                  type="button"
                  onClick={() => updateTracking(order.id)}
                  className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-white"
                >
                  Save Tracking
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  placeholder="Courier"
                  value={trackingDrafts[order.id]?.courierName || ""}
                  onChange={(e) => setTrackingDrafts((prev) => ({ ...prev, [order.id]: { courierName: e.target.value, trackingNumber: prev[order.id]?.trackingNumber || "", trackingLink: prev[order.id]?.trackingLink || "", expectedDelivery: prev[order.id]?.expectedDelivery || "", deliveryNotes: prev[order.id]?.deliveryNotes || "" } }))}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-card"
                />
                <input
                  placeholder="Tracking Number"
                  value={trackingDrafts[order.id]?.trackingNumber || ""}
                  onChange={(e) => setTrackingDrafts((prev) => ({ ...prev, [order.id]: { courierName: prev[order.id]?.courierName || "", trackingNumber: e.target.value, trackingLink: prev[order.id]?.trackingLink || "", expectedDelivery: prev[order.id]?.expectedDelivery || "", deliveryNotes: prev[order.id]?.deliveryNotes || "" } }))}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-card"
                />
                <input
                  placeholder="Tracking Link"
                  value={trackingDrafts[order.id]?.trackingLink || ""}
                  onChange={(e) => setTrackingDrafts((prev) => ({ ...prev, [order.id]: { courierName: prev[order.id]?.courierName || "", trackingNumber: prev[order.id]?.trackingNumber || "", trackingLink: e.target.value, expectedDelivery: prev[order.id]?.expectedDelivery || "", deliveryNotes: prev[order.id]?.deliveryNotes || "" } }))}
                  className="px-3 py-2 text-sm rounded-lg border border-border bg-card"
                />
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted">Expected delivery</label>
                  <input
                    type="date"
                    value={trackingDrafts[order.id]?.expectedDelivery || ""}
                    onChange={(e) => setTrackingDrafts((prev) => ({ ...prev, [order.id]: { courierName: prev[order.id]?.courierName || "", trackingNumber: prev[order.id]?.trackingNumber || "", trackingLink: prev[order.id]?.trackingLink || "", expectedDelivery: e.target.value, deliveryNotes: prev[order.id]?.deliveryNotes || "" } }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-card"
                  />
                </div>
                <textarea
                  placeholder="Delivery notes"
                  value={trackingDrafts[order.id]?.deliveryNotes || ""}
                  onChange={(e) => setTrackingDrafts((prev) => ({ ...prev, [order.id]: { courierName: prev[order.id]?.courierName || "", trackingNumber: prev[order.id]?.trackingNumber || "", trackingLink: prev[order.id]?.trackingLink || "", expectedDelivery: prev[order.id]?.expectedDelivery || "", deliveryNotes: e.target.value } }))}
                  className="md:col-span-2 px-3 py-2 text-sm rounded-lg border border-border bg-card"
                  rows={2}
                />
              </div>
            </div>
          </div>
          );
        })}

        {orders.length === 0 && (
          <p className="text-center py-10 text-muted">No orders found</p>
        )}
      </div>

      <RejectPaymentModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={submitRejectPayment}
      />
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
