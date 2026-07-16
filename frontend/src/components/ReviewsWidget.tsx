"use client";

import { useEffect, useState } from "react";
import { reviewApi } from "@/lib/api";
import ReviewCard from "./ReviewCard";

export default function ReviewsWidget({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    reviewApi
      .getByProduct(productId, { page: 1, limit: 10, sort: "newest" })
      .then(({ data }) => setReviews(data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch();
  }, [productId]);

  if (loading) return <div className="text-center py-6">Loading reviews...</div>;
  if (reviews.length === 0) return <div className="text-center py-6 text-muted">No reviews yet</div>;

  return (
    <div className="space-y-4">
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} />
      ))}
    </div>
  );
}
