"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Banknote } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { orderApi, userApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { validateEmail, validatePhone } from "@/lib/validation";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "COD">("COD");
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    deliveryAddress: "",
    phone: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const gst = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = subtotal + gst;
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || "sangibregit94@okicici";
  const upiName = process.env.NEXT_PUBLIC_UPI_NAME || "SANGEETHA BREGIT A";
  const upiQrUrl = paymentMethod === "UPI"
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
        `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${grandTotal.toFixed(2)}&cu=INR`
      )}`
    : "";

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      userApi.getProfile().then(({ data }) => {
        setForm((prev) => ({
          ...prev,
          name: data.name || prev.name || user?.name || "",
          email: data.email || prev.email || user?.email || "",
          deliveryAddress: data.address || prev.deliveryAddress || "",
          phone: data.phone || prev.phone || "",
          city: data.city || prev.city || "",
          state: data.state || prev.state || "",
          pincode: data.pincode || prev.pincode || "",
        }));
      }).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && items.length === 0) {
      router.push("/cart");
    }
  }, [items, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!form.name) nextErrors.name = "Customer name is required.";
    if (!form.deliveryAddress) nextErrors.deliveryAddress = "Delivery address is required.";

    const emailError = validateEmail(form.email);
    const phoneError = validatePhone(form.phone);
    if (emailError) nextErrors.email = emailError;
    if (phoneError) nextErrors.phone = phoneError;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (paymentMethod === "UPI" && (!utrNumber || utrNumber.trim().length < 4)) {
      toast.error("Please enter a valid UPI transaction ID (UTR)");
      return;
    }

    setSubmitting(true);
    try {
      const { data: order } = await orderApi.create({
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          customization: item.customization,
        })),
        paymentMethod,
        deliveryAddress: form.deliveryAddress,
        phone: form.phone,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        applyGst: true,
        utrNumber: paymentMethod === "UPI" ? utrNumber.trim() : undefined,
      });

      if (paymentMethod === "UPI" && paymentProofFile) {
        const formData = new FormData();
        formData.append("file", paymentProofFile);
        await orderApi.uploadPaymentProof(order.id, formData);
      }

      clearCart();
      toast.success("Order placed successfully");
      router.push(`/order-confirmation/${order.id}?payment=${paymentMethod}`);
    } catch {
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        Loading checkout...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-primary-dark mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="surface-card p-6">
            <h2 className="text-lg font-bold mb-4">Delivery Details</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-foreground/85">
                    Customer Name *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    className="input-base"
                  />
                  {errors.name ? <p className="text-sm text-red-600 mt-1">{errors.name}</p> : null}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    className="input-base"
                  />
                  {errors.email ? <p className="text-sm text-red-600 mt-1">{errors.email}</p> : null}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Delivery Address *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.deliveryAddress}
                  onChange={(e) => {
                    setForm({ ...form, deliveryAddress: e.target.value });
                    if (errors.deliveryAddress) setErrors((prev) => ({ ...prev, deliveryAddress: "" }));
                  }}
                  className="input-base min-h-[120px] resize-none"
                  placeholder="House/Flat No, Street, Area"
                />
                {errors.deliveryAddress ? <p className="text-sm text-red-600 mt-1">{errors.deliveryAddress}</p> : null}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Phone Number *
                  </label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => {
                      setForm({ ...form, phone: e.target.value });
                      if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    className="input-base"
                  />
                  {errors.phone ? <p className="text-sm text-red-600 mt-1">{errors.phone}</p> : null}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={form.pincode}
                    onChange={(e) =>
                      setForm({ ...form, pincode: e.target.value })
                    }
                    className="input-base"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) =>
                      setForm({ ...form, city: e.target.value })
                    }
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) =>
                      setForm({ ...form, state: e.target.value })
                    }
                    className="input-base"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <h2 className="text-lg font-bold mb-4">Payment Method</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("UPI")}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                  paymentMethod === "UPI"
                    ? "border-accent bg-accent-light/20"
                    : "border-border hover:border-accent"
                }`}
              >
                <CreditCard className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">UPI Payment</div>
                  <div className="text-xs text-muted">Scan QR & pay instantly</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-colors ${
                  paymentMethod === "COD"
                    ? "border-accent bg-accent-light/20"
                    : "border-border hover:border-accent"
                }`}
              >
                <Banknote className="w-6 h-6 text-primary" />
                <div className="text-left">
                  <div className="font-semibold">Cash on Delivery</div>
                  <div className="text-xs text-muted">Pay when you receive</div>
                </div>
              </button>
            </div>

            {paymentMethod === "UPI" && (
              <div className="mt-6 rounded-2xl border border-accent/30 bg-accent-light/20 p-5">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="font-semibold text-primary-dark mb-3">Pay via UPI</h3>
                    <div className="inline-flex items-center justify-center rounded-2xl border border-border bg-surface p-4 shadow-sm">
                      <img src={upiQrUrl} alt="UPI QR code" className="w-56 h-56 object-contain" />
                    </div>
                    <p className="text-sm text-muted mt-3">Scan the QR code with any UPI app</p>
                  </div>
                  <div className="flex-1 w-full space-y-4">
                    <div className="rounded-xl border border-border bg-surface/80 p-3 text-left">
                      <p className="text-sm font-semibold text-primary-dark">Pay To</p>
                      <p className="text-sm text-muted">{upiName}</p>
                      <p className="text-sm font-semibold text-primary-dark mt-2">UPI ID</p>
                      <p className="text-sm text-muted">{upiId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted">Amount</p>
                      <p className="font-semibold text-accent">{formatPrice(grandTotal)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">UPI Transaction ID (UTR) *</label>
                      <input
                        type="text"
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
                        placeholder="Enter UTR after payment"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Payment Screenshot (optional)</label>
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
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl border border-border p-6 h-fit sticky top-24">
          <h2 className="text-lg font-bold mb-4">Cart Summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.variant}`}
                className="flex justify-between text-sm"
              >
                <span className="text-muted">
                  {item.name} x {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">GST (5%)</span>
              <span>{formatPrice(gst)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2">
              <span>Total</span>
              <span className="text-accent">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
