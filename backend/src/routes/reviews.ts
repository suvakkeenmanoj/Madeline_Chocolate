import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

// Create review (only verified customers)
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const { orderItemId, productId, rating, title, comment, suggestion } = req.body;

    if (!orderItemId || !productId || !rating) {
      return res.status(400).json({ message: "orderItemId, productId and rating are required" });
    }

    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
    }

    // Verify the orderItem exists and belongs to the user and the order is DELIVERED
    const orderItem = await prisma.orderItem.findUnique({ where: { id: orderItemId }, include: { order: true } });
    if (!orderItem) return res.status(404).json({ message: "Order item not found" });
    if (orderItem.order.userId !== user.id) return res.status(403).json({ message: "Not authorized to review this item" });
    if (orderItem.order.status !== "DELIVERED") return res.status(400).json({ message: "Only delivered orders can be reviewed" });
    if (orderItem.productId !== productId) return res.status(400).json({ message: "productId does not match order item" });

    // Prevent duplicate reviews for the same order item
    const existing = await prisma.review.findUnique({ where: { orderItemId } });
    if (existing) return res.status(400).json({ message: "Review already submitted for this purchased item" });

    const created = await prisma.review.create({
      data: {
        userId: user.id,
        productId,
        orderId: orderItem.orderId,
        orderItemId,
        rating: parsedRating,
        title: title ? String(title).trim() : null,
        comment: comment ? String(comment).trim() : null,
        suggestion: suggestion ? String(suggestion).trim() : null,
        verified: true,
      },
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create review" });
  }
});

// Get reviews for a product with pagination and sorting
router.get("/product/:id", async (req, res) => {
  try {
    const productId = String(req.params.id);
    const page = Number(req.query.page || 1);
    const limit = Math.min(Number(req.query.limit || 10), 50);
    const sort = req.query.sort === "oldest" ? { createdAt: "asc" as const } : { createdAt: "desc" as const };

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where: { productId, hidden: false } }),
      prisma.review.findMany({
        where: { productId, hidden: false },
        include: { user: { select: { id: true, name: true } } },
        orderBy: sort,
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    // rating distribution
    const distribution = await prisma.review.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { _all: true },
    });

    res.json({ total, reviews, distribution });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// Update a review (owner only)
router.put("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const id = req.params.id;
    const { rating, title, comment, suggestion } = req.body;

    const existing = await prisma.review.findUnique({ where: { id: String(id) } });
    if (!existing) return res.status(404).json({ message: "Review not found" });
    if (existing.userId !== user.id) return res.status(403).json({ message: "Not authorized" });

    const data: any = {};
    if (rating !== undefined) {
      const parsed = Number(rating);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) return res.status(400).json({ message: "Invalid rating" });
      data.rating = parsed;
    }
    if (title !== undefined) data.title = title ? String(title).trim() : null;
    if (comment !== undefined) data.comment = comment ? String(comment).trim() : null;
    if (suggestion !== undefined) data.suggestion = suggestion ? String(suggestion).trim() : null;

    const updated = await prisma.review.update({ where: { id: String(id) }, data });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update review" });
  }
});

// Delete a review (owner or admin) - soft delete by default by setting hidden=true
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const user = req.user!;
    const id = req.params.id;
    const existing = await prisma.review.findUnique({ where: { id: String(id) } });
    if (!existing) return res.status(404).json({ message: "Review not found" });
    if (existing.userId !== user.id && !user.isAdmin) return res.status(403).json({ message: "Not authorized" });

    const deleted = await prisma.review.update({ where: { id: String(id) }, data: { hidden: true } });
    res.json({ message: "Review hidden", review: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete review" });
  }
});

export default router;
