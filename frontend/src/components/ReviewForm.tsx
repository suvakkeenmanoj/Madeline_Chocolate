"use client";

import { useState } from "react";
import { reviewApi } from "@/lib/api";
import toast from "react-hot-toast";

export default function ReviewForm({ productId, orderItemId, onSaved }: { productId: string; orderItemId: string; onSaved?: () => void }) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!comment.trim()) return toast.error("Please add a comment");
    setLoading(true);
    try {
      await reviewApi.create({ productId, orderItemId, rating, title, comment, suggestion });
      toast.success("Review submitted");
      setRating(5);
      setTitle("");
      setComment("");
      setSuggestion("");
      onSaved?.();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-card rounded-2xl border border-border">
      <div className="flex items-center gap-2 mb-3">
        {[1, 2, 3, 4, 5].map((s) => (
          <button key={s} onClick={() => setRating(s)} className={`w-9 h-9 rounded-full ${s <= rating ? "bg-accent text-white" : "bg-border text-muted"}`}>{s}</button>
        ))}
      </div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className="w-full px-4 py-2 rounded-xl border border-border mb-2" />
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Write your review" className="w-full px-4 py-2 rounded-xl border border-border mb-2" />
      <input value={suggestion} onChange={(e) => setSuggestion(e.target.value)} placeholder="Suggestion (optional)" className="w-full px-4 py-2 rounded-xl border border-border mb-3" />
      <div className="flex items-center justify-end gap-2">
        <button onClick={submit} disabled={loading} className="py-2 px-4 bg-primary text-white rounded-full">{loading ? "Saving..." : "Submit Review"}</button>
      </div>
    </div>
  );
}
