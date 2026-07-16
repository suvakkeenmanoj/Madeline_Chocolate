"use client";

import { useEffect, useState } from "react";
import { userApi, reviewApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import ReviewCard from "@/components/ReviewCard";
import toast from "react-hot-toast";

export default function MyReviewsPage() {
  const { user, loading } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const fetch = () => {
    userApi
      .getProfile()
      .catch(() => null)
      .finally(() => {});
    fetchReviews();
  };

  const fetchReviews = () => {
    userApi
      .getReviews()
      .then(({ data }) => setReviews(data || []))
      .catch(() => setReviews([]));
  };

  useEffect(() => {
    if (!loading && !user) return; // user must be loaded
    fetch();
  }, [user, loading]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hide this review?")) return;
    setSaving(true);
    try {
      await reviewApi.delete(id);
      toast.success("Review hidden");
      fetchReviews();
    } catch (err) {
      toast.error("Failed to hide review");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-primary-dark mb-6">My Reviews</h1>
      {reviews.length === 0 ? (
        <div className="text-center py-10 text-muted">You haven't written any reviews yet.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="relative">
              <ReviewCard review={r} />
              <div className="absolute top-2 right-2 flex gap-2">
                <button onClick={() => handleDelete(r.id)} disabled={saving} className="text-sm text-red-500">Hide</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
