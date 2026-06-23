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
} from "lucide-react";
import { orderApi } from "@/lib/api";
import { Order, ORDER_STATUS_LABELS } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

function OrderConfirmationContent() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const paymentMethod = searchParams.get("payment");
  const [order, setOrder] = useState<Order | null>(null);
  const [upiQr, setUpiQr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    if (id) {
      orderApi
        .getById(id as string)
        .then(({ data }) => {
          setOrder(data);
          if (paymentMethod === "UPI") {
            return orderApi.getUpiQr(id as string);
          }
        })
        .then((res) => {
          if (res) setUpiQr(res.data.qrDataUrl);
        })
        .catch(() => toast.error("Failed to load order"))
        .finally(() => setLoading(false));
    }
  }, [id, paymentMethod]);

  const handleConfirmUpi = async () => {
    try {
      await orderApi.confirmUpi(id as string);
      setPaymentConfirmed(true);
      toast.success("Payment confirmed! Thank you.");
    } catch {
      toast.error("Failed to confirm payment");
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

      {paymentMethod === "UPI" && upiQr && !paymentConfirmed && (
        <div className="bg-card rounded-2xl border border-border p-6 mb-6 text-center">
          <h3 className="font-semibold mb-4">Scan to Pay via UPI</h3>
          <Image
            src={upiQr}
            alt="UPI QR Code"
            width={250}
            height={250}
            className="mx-auto rounded-xl"
          />
          <p className="text-lg font-bold mt-4 text-accent">
            {formatPrice(order.totalAmount)}
          </p>
          <p className="text-sm text-muted mt-2">
            After payment, click below to confirm
          </p>
          <button
            onClick={handleConfirmUpi}
            className="mt-4 px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
          >
            I Have Paid
          </button>
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
