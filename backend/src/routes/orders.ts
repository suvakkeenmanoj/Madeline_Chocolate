import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, AuthRequest } from "../middleware/auth";
import { generateUpiQr } from "../utils/upi";
import { generateInvoicePdf } from "../utils/pdf";
import { sendOrderConfirmationEmail } from "../utils/email";

const router = Router();

const generateOrderNumber = () => {
  const date = new Date();
  const prefix = "MC";
  const timestamp = date.getTime().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Create order
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      items,
      paymentMethod,
      deliveryAddress,
      phone,
      city,
      state,
      pincode,
      applyGst,
    } = req.body;

    if (!items?.length || !paymentMethod || !deliveryAddress || !phone) {
      return res.status(400).json({ message: "Missing required order fields" });
    }

    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });
      if (!product) {
        return res.status(400).json({ message: `Product ${item.productId} not found` });
      }

      const price = item.price ?? product.price;
      subtotal += price * item.quantity;
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        price,
        customization: item.customization || null,
      });
    }

    const gstAmount = applyGst ? Math.round(subtotal * 0.05 * 100) / 100 : 0;
    const totalAmount = subtotal + gstAmount;

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: req.user!.id,
        totalAmount,
        gstAmount,
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
        status: "ORDER_PLACED",
        deliveryAddress,
        phone,
        city,
        state,
        pincode,
        items: { create: orderItemsData },
      },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true } },
      },
    });

    // Update user profile with delivery info
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { phone, address: deliveryAddress, city, state, pincode },
    });

    // Send confirmation email (non-blocking)
    sendOrderConfirmationEmail(order).catch(console.error);

    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
});

// Get order by ID
router.get("/:id", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id as string },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId !== req.user!.id && !req.user!.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(order);
  } catch {
    res.status(500).json({ message: "Failed to fetch order" });
  }
});

// Generate UPI QR for order
router.get("/:id/upi-qr", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id as string },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId !== req.user!.id && !req.user!.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    const qrDataUrl = await generateUpiQr(order.totalAmount, order.orderNumber);
    res.json({
      qrDataUrl,
      upiId: process.env.UPI_ID,
      amount: order.totalAmount,
      orderNumber: order.orderNumber,
    });
  } catch {
    res.status(500).json({ message: "Failed to generate UPI QR" });
  }
});

// Confirm UPI payment
router.post("/:id/confirm-upi", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.update({
      where: { id: req.params.id as string },
      data: { paymentStatus: "PAID" },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true } },
      },
    });
    res.json(order);
  } catch {
    res.status(500).json({ message: "Failed to confirm payment" });
  }
});

// Download PDF invoice
router.get("/:id/invoice", authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id as string },
      include: {
        items: { include: { product: true } },
        user: { select: { name: true, email: true, phone: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId !== req.user!.id && !req.user!.isAdmin) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${order.orderNumber}.pdf`
    );

    generateInvoicePdf(order, res);
  } catch (error) {
    console.error("Invoice error:", error);
    res.status(500).json({ message: "Failed to generate invoice" });
  }
});

export default router;
