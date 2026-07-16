"use client";

import { Star } from "lucide-react";

export default function ReviewCard({ review }: { review: any }) {
  return (
    <div className="p-4 bg-card rounded-2xl border border-border">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-light/30 flex items-center justify-center text-sm font-medium">
            {review.user?.name?.charAt(0) || "U"}
          </div>
          <div>
            <div className="font-medium">{review.user?.name || "Unknown"}</div>
            <div className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString()}</div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="flex mr-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "fill-accent text-accent" : "text-border"}`} />
            ))}
          </div>
          {review.verified && (
            <span className="text-xs px-2 py-1 bg-accent-light/30 rounded-full text-accent">Verified Purchase</span>
          )}
        </div>
      </div>

      {review.title && <div className="font-semibold mb-1">{review.title}</div>}
      {review.comment && <div className="text-sm text-muted mb-2">{review.comment}</div>}
      {review.suggestion && (
        <div className="text-sm text-muted italic">Suggestion: {review.suggestion}</div>
      )}
    </div>
  );
}
