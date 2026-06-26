import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { validatePhone } from "../utils/validation";

const router = Router();

router.get("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        createdAt: true,
      },
    });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

router.put("/profile", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, address, city, state, pincode } = req.body;
    const phoneError = validatePhone(phone || "");
    if (phoneError) {
      return res.status(400).json({ message: phoneError });
    }

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, phone, address, city, state, pincode },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
      },
    });
    res.json(user);
  } catch {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

router.get("/orders", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, image: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Wishlist
router.get("/wishlist", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.id },
      include: { product: true },
    });
    res.json(items);
  } catch {
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
});

router.post("/wishlist/:productId", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const item = await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: req.user!.id,
          productId: req.params.productId as string,
        },
      },
      create: {
        userId: req.user!.id,
        productId: req.params.productId as string,
      },
      update: {},
      include: { product: true },
    });
    res.json(item);
  } catch {
    res.status(500).json({ message: "Failed to add to wishlist" });
  }
});

router.delete("/wishlist/:productId", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: {
        userId: req.user!.id,
        productId: req.params.productId as string,
      },
    });
    res.json({ message: "Removed from wishlist" });
  } catch {
    res.status(500).json({ message: "Failed to remove from wishlist" });
  }
});

export default router;
