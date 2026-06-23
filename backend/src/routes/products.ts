import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";

const router = Router();

// Public: list products with optional search & category filter
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;
    const where: Record<string, unknown> = {};

    if (category && category !== "all") {
      where.category = category as string;
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "asc" },
      include: {
        reviews: { select: { rating: true } },
      },
    });

    const enriched = products.map((p) => {
      const ratings = p.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0;
      const { reviews, ...product } = p;
      return {
        ...product,
        avgRating: Math.round(avgRating * 10) / 10,
        reviewCount: ratings.length,
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error("Products list error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Categories list (must be before /:id)
router.get("/meta/categories", async (_req, res) => {
  try {
    const categories = await prisma.product.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    res.json(categories.map((c) => c.category));
  } catch {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// Public: get single product with reviews
router.get("/:id", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id as string },
      include: {
        reviews: {
          include: {
            user: { select: { name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const ratings = product.reviews.map((r) => r.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    res.json({
      ...product,
      avgRating: Math.round(avgRating * 10) / 10,
      reviewCount: ratings.length,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// Admin: create product
router.post("/", authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json(product);
  } catch {
    res.status(500).json({ message: "Failed to create product" });
  }
});

// Admin: update product
router.put("/:id", authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id as string },
      data: req.body,
    });
    res.json(product);
  } catch {
    res.status(500).json({ message: "Failed to update product" });
  }
});

// Admin: delete product
router.delete("/:id", authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id as string } });
    res.json({ message: "Product deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

export default router;
