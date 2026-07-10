"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  Download,
  Printer,
  Package,
  MessageCircle,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { orderApi } from "@/lib/api";
import { Order, ORDER_STATUS_LABELS, OrderMessage, OrderStatusHistoryItem, PaymentVerification, TrackingInfo } from "@/types";
import { formatPrice, formatDate, formatDateTime, getPaymentStatusLabel } from "@/lib/utils";
import toast from "react-hot-toast";

function OrderConfirmationContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const paymentMethod = searchParams.get("payment");
  const [order, setOrder] = useState<Order | null>(null);
  const [upiQr, setUpiQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [history, setHistory] = useState<OrderStatusHistoryItem[]>([]);
  const [paymentVerification, setPaymentVerification] = useState<PaymentVerification | null>(null);
  const [tracking, setTracking] = useState<TrackingInfo | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const isUpiOrder = paymentMethod === "UPI" || order?.paymentMethod === "UPI";

  useEffect(() => {
    let cancelled = false;

    async function fetchOrderDetails() {
      if (!id) return;

      setLoading(true);
      setQrError(null);
      setUpiQr(null);

      try {
        console.log("[OrderConfirmation] fetching order", id);
        const { data: orderData } = await orderApi.getById(id as string);
        if (cancelled) return;
        console.log("[OrderConfirmation] order data", orderData);
        setOrder(orderData);

        const [messagesRes, updatesRes] = await Promise.all([
          orderApi.getMessages(id as string),
          orderApi.getUpdates(id as string),
        ]);

        if (cancelled) return;
        console.log("[OrderConfirmation] messages", messagesRes.data);
        console.log("[OrderConfirmation] updates", updatesRes.data);

        setMessages(messagesRes.data || []);
        setHistory(updatesRes.data?.statusHistory || []);
        setPaymentVerification(updatesRes.data?.paymentVerification || null);
        setTracking(updatesRes.data?.tracking || null);

        if (orderData.paymentMethod === "UPI" || paymentMethod === "UPI") {
          setQrLoading(true);
          try {
            const { data: qrRes } = await orderApi.getUpiQr(id as string);
            if (cancelled) return;
            console.log("[OrderConfirmation] UPI QR response", qrRes);
            setUpiQr(qrRes.qrDataUrl);
          } catch (qrError) {
            console.error("[OrderConfirmation] failed to load UPI QR", qrError);
            setQrError("Unable to load UPI QR code. Please refresh.");
          } finally {
            if (!cancelled) setQrLoading(false);
          }
        }
      } catch (error) {
        console.error("[OrderConfirmation] failed to load order details", error);
        toast.error("Failed to load order");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchOrderDetails();

    return () => {
      cancelled = true;
    };
  }, [id, paymentMethod]);

  const handleUploadProof = async () => {
    if (!paymentProofFile) {
      toast.error("Please select a payment screenshot");
      return;
    }

    setSubmittingProof(true);
    try {
      const formData = new FormData();
      formData.append("file", paymentProofFile);
      await orderApi.uploadPaymentProof(id as string, formData);
      toast.success("Payment proof uploaded. Admin will verify it shortly.");
      setPaymentProofFile(null);
      setPaymentProofPreview(null);
      if (order) {
        setOrder({ ...order, paymentStatus: "PENDING" });
      }
    } catch {
      toast.error("Failed to upload payment proof");
    } finally {
      setSubmittingProof(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const { data } = await orderApi.getInvoice(id as string);
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${order?.orderNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download invoice");
    }
  };

  const handlePrint = () => window.print();

  const handleSendMessage = async () => {
    if (!messageDraft.trim()) return;
    setSendingMessage(true);
    try {
      const { data } = await orderApi.sendMessage(id as string, { message: messageDraft.trim() });
      setMessages((prev) => [...prev, data]);
      setMessageDraft("");
      toast.success("Message sent");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        Loading order details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center text-muted">
        Order not found
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-primary-dark">
          Order Confirmed!
        </h1>
        <p className="text-muted mt-2">
          Thank you for your order, {order.user?.name}
        </p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6 mb-6">
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-sm text-muted">Order ID</p>
            <p className="font-bold text-primary-dark">{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Date</p>
            <p className="font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Payment Method</p>
            <p className="font-medium">{order.paymentMethod}</p>
          </div>
          <div>
            <p className="text-sm text-muted">Order Status</p>
            <p className="font-medium text-accent">
              {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ||
                order.status}
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h3 className="font-semibold mb-3">Products Ordered</h3>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between py-2 text-sm border-b border-border last:border-0"
            >
              <span>
                {item.product.name} x {item.quantity}
              </span>
              <span className="font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="flex justify-between pt-4 font-bold text-lg">
            <span>Total Amount</span>
            <span className="text-accent">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {(isUpiOrder || paymentMethod === "UPI") && (
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 text-center">
          <h3 className="font-semibold mb-4">Scan to Pay via UPI</h3>
          {upiQr ? (
            <div className="mx-auto h-[250px] w-[250px] overflow-hidden rounded-xl border border-border">
              <img
                src={upiQr}
                alt="UPI QR Code"
                className="h-full w-full object-contain"
              />
            </div>
          ) : qrLoading ? (
            <div className="mx-auto flex h-[250px] w-[250px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
              Loading QR code...
            </div>
          ) : qrError ? (
            <div className="mx-auto flex h-[250px] w-[250px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-red-500">
              {qrError}
            </div>
          ) : (
            <div className="mx-auto flex h-[250px] w-[250px] items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted">
              QR code unavailable
            </div>
          )}
          <p className="text-lg font-bold mt-4 text-accent">
            {formatPrice(order.totalAmount)}
          </p>
          <p className="text-sm text-muted mt-2">
            After payment, upload your screenshot and we will verify it manually.
          </p>
          <div className="mt-4 space-y-3 text-left">
            <div>
              <label className="block text-sm font-medium mb-1">UTR Number</label>
              <input
                type="text"
                value={order.utrNumber || ""}
                readOnly
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payment Screenshot</label>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPaymentProofFile(file);
                  if (file) {
                    setPaymentProofPreview(URL.createObjectURL(file));
                  } else {
                    setPaymentProofPreview(null);
                  }
                }}
                className="w-full text-sm"
              />
              {paymentProofPreview && (
                <img src={paymentProofPreview} alt="Payment proof preview" className="mt-3 h-32 w-auto rounded-xl border border-border" />
              )}
            </div>
            <button
              onClick={handleUploadProof}
              disabled={submittingProof}
              className="w-full px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {submittingProof ? "Uploading..." : "Submit for Verification"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-accent-light/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <Package className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <p className="font-medium text-sm">Expected Delivery Date</p>
          <p className="text-sm text-muted">
            {order.deliveryDate
              ? formatDate(order.deliveryDate)
              : "Expected Delivery Date will be updated by Admin"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Payment Status</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Status</span><span className="font-medium">{getPaymentStatusLabel(order.paymentStatus)}</span></div>
            {paymentVerification?.rejectionReason && <div className="rounded-lg bg-red-50 p-2 text-red-700">{paymentVerification.rejectionReason}</div>}
            {paymentVerification?.screenshotRequested && <p className="text-muted">Admin requested a payment screenshot.</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" />
            <h3 className="font-semibold">Tracking</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Courier</span><span className="font-medium">{tracking?.courierName || "Pending"}</span></div>
            <div className="flex justify-between"><span>Tracking</span><span className="font-medium">{tracking?.trackingNumber || "—"}</span></div>
            <div className="flex justify-between"><span>Expected</span><span className="font-medium">{tracking?.expectedDelivery ? formatDate(tracking.expectedDelivery) : "Pending"}</span></div>
            {tracking?.trackingLink ? (
              <a href={tracking.trackingLink} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-primary hover:text-accent">
                Track Package
              </a>
            ) : (
              <p className="text-muted">Tracking link will appear here once admin adds it.</p>
            )}
            {tracking?.deliveryNotes ? (
              <div className="rounded-lg bg-background p-2 text-muted">{tracking.deliveryNotes}</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 mb-6">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Order Updates</h3>
        </div>
        <div className="space-y-3">
          {history.length === 0 ? <p className="text-sm text-muted">No updates yet.</p> : history.map((entry) => (
            <div key={entry.id} className="rounded-xl border border-border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{entry.status}</span>
                <span className="text-xs text-muted">{formatDateTime(entry.createdAt)}</span>
              </div>
              {entry.message && <p className="mt-1 text-muted">{entry.message}</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 mb-6">
        <div className="mb-3 flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Order Conversation</h3>
        </div>
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={`rounded-xl border border-border p-3 text-sm ${message.senderType === "ADMIN" ? "bg-accent-light/20" : "bg-background"}`}>
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-medium">{message.senderType === "ADMIN" ? "Admin" : "You"}</span>
                <span className="text-xs text-muted">{formatDateTime(message.createdAt)}</span>
              </div>
              <p className="text-muted">{message.message}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <textarea
            value={messageDraft}
            onChange={(e) => setMessageDraft(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
            placeholder="Send a message to the admin"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={sendingMessage}
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {sendingMessage ? "Sending..." : "Send Message"}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleDownloadInvoice}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
        >
          <Download className="w-4 h-4" />
          Download PDF Invoice
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-full font-medium hover:bg-card transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print Invoice
        </button>
        <Link
          href="/dashboard/orders"
          className="flex items-center gap-2 px-5 py-2.5 text-primary font-medium hover:text-accent transition-colors"
        >
          View All Orders
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
