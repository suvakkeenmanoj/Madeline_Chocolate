"use client";

import { useState } from "react";

interface RejectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, screenshotRequested: boolean) => void;
}

export default function RejectPaymentModal({ isOpen, onClose, onSubmit }: RejectPaymentModalProps) {
  const [reason, setReason] = useState("");
  const [screenshotRequested, setScreenshotRequested] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-primary-dark">Reject Payment</h3>
        <p className="mt-2 text-sm text-muted">Please explain why the payment is being rejected.</p>

        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Reason *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none"
              placeholder="Payment not received, wrong UTR, amount mismatch..."
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={screenshotRequested}
              onChange={(e) => setScreenshotRequested(e.target.checked)}
            />
            Request screenshot from customer
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-border px-4 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (!reason.trim()) return;
              onSubmit(reason.trim(), screenshotRequested);
            }}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white"
          >
            Reject Order
          </button>
        </div>
      </div>
    </div>
  );
}
