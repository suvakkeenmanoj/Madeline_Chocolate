import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";
import {
  createNotification,
  createOrderMessage,
  createStatusHistory,
  ensurePaymentVerification,
  ensureTracking,
} from "../utils/orderUpdates";

const router = Router();

router.use(authenticate, requireAdmin);

// Dashboard stats
router.get("/stats", async (_req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      totalOrders,
      totalRevenue,
      ordersToday,
      revenueToday,
      pendingOrders,
      codOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { isAdmin: false } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        where: { createdAt: { gte: today } },
        _sum: { totalAmount: true },
      }),
      prisma.order.count({
        where: { status: { in: ["ORDER_PLACED", "PREPARING"] } },
      }),
      prisma.order.count({ where: { paymentMethod: "COD" } }),
    ]);

    const returningCustomers = await prisma.user.count({
      where: {
        isAdmin: false,
        orders: { some: {} },
      },
    });

    res.json({
      totalCustomers,
      totalOrders,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      ordersToday,
      revenueToday: revenueToday._sum.totalAmount || 0,
      pendingOrders,
      codOrders,
      returningCustomers,
      averageOrderValue:
        totalOrders > 0
          ? Math.round(((totalRevenue._sum.totalAmount || 0) / totalOrders) * 100) / 100
          : 0,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// List orders with filters
router.get("/orders", async (req, res) => {
  try {
    const { status, paymentMethod } = req.query;
    const where: Record<string, unknown> = {};

    if (status) where.status = status;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: { include: { product: { select: { name: true } } } },
        tracking: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Update order status
router.patch("/orders/:id/status", async (req, res) => {
  try {
    const { status, deliveryDate } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id as string },
      data: {
        status,
        ...(deliveryDate && { deliveryDate: new Date(deliveryDate) }),
      },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
      },
    });
    res.json(order);
  } catch {
    res.status(500).json({ message: "Failed to update order status" });
  }
});

// Update payment verification status
router.patch("/orders/:id/payment-status", async (req: AuthRequest, res: Response) => {
  try {
    const { paymentStatus, rejectionReason, screenshotRequested } = req.body;
    const orderId = req.params.id as string;

    if (!paymentStatus || !["PAID", "REJECTED", "PENDING", "COD_PENDING", "COD_CONFIRMED"].includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const currentOrder = await prisma.order.findUnique({ where: { id: orderId } });
    if (!currentOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    const paymentVerification = await ensurePaymentVerification(orderId, paymentStatus === "PAID" ? "VERIFIED" : "PENDING");

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        verifiedAt: paymentStatus === "PAID" ? new Date() : null,
        status: paymentStatus === "REJECTED" ? currentOrder.status : currentOrder.status,
      },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
      },
    });

    await prisma.paymentVerification.update({
      where: { orderId },
      data: {
        verificationStatus: paymentStatus === "PAID" ? "VERIFIED" : paymentStatus === "REJECTED" ? "REJECTED" : paymentStatus,
        verifiedBy: req.user!.id,
        verificationDate: new Date(),
        rejectionReason: paymentStatus === "REJECTED" ? rejectionReason || null : null,
        screenshotRequested: Boolean(screenshotRequested),
      },
    });

    if (paymentStatus === "PAID") {
      await createStatusHistory(orderId, "PAID", "Payment accepted by admin", req.user!.id);
      await createNotification({
        userId: order.userId,
        orderId,
        title: "Payment Accepted",
        message: "Your QR payment has been verified successfully.",
        type: "PAYMENT_ACCEPTED",
      });
    }

    if (paymentStatus === "REJECTED") {
      await createStatusHistory(orderId, "REJECTED", `Payment rejected: ${rejectionReason || "No reason provided"}`, req.user!.id);
      await createNotification({
        userId: order.userId,
        orderId,
        title: "Payment Rejected",
        message: rejectionReason || "Payment could not be verified.",
        type: "PAYMENT_REJECTED",
      });
      if (screenshotRequested) {
        await createOrderMessage({
          orderId,
          senderType: "ADMIN",
          senderId: req.user!.id,
          message: "Please upload your payment screenshot for review.",
        });
        await createNotification({
          userId: order.userId,
          orderId,
          title: "Screenshot Requested",
          message: "Please upload your payment screenshot for verification.",
          type: "SCREENSHOT_REQUESTED",
        });
      }
    }

    res.json(order);
  } catch {
    res.status(500).json({ message: "Failed to update payment status" });
  }
});

// Create order message
router.post("/orders/:id/messages", async (req: AuthRequest, res: Response) => {
  try {
    const { message, attachment } = req.body;
    const orderId = req.params.id as string;
    if (!message?.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const savedMessage = await createOrderMessage({
      orderId,
      senderType: "ADMIN",
      senderId: req.user!.id,
      message: message.trim(),
      attachment: attachment || null,
    });

    await createNotification({
      userId: order.userId,
      orderId,
      title: "Admin Message",
      message: message.trim(),
      type: "ADMIN_MESSAGE",
    });

    res.json(savedMessage);
  } catch {
    res.status(500).json({ message: "Failed to send order message" });
  }
});

// Update tracking
router.patch("/orders/:id/tracking", async (req: AuthRequest, res: Response) => {
  try {
    const { courierName, trackingNumber, trackingLink, expectedDelivery, deliveryNotes } = req.body;
    const orderId = req.params.id as string;
    const tracking = await ensureTracking(orderId);
    const normalizedExpectedDelivery = expectedDelivery
      ? new Date(expectedDelivery)
      : tracking.expectedDelivery
        ? new Date(tracking.expectedDelivery)
        : null;

    const [updatedTracking, updatedOrder] = await prisma.$transaction([
      prisma.tracking.update({
        where: { orderId },
        data: {
          courierName: courierName || tracking.courierName,
          trackingNumber: trackingNumber || tracking.trackingNumber,
          trackingLink: trackingLink || tracking.trackingLink,
          expectedDelivery: normalizedExpectedDelivery,
          deliveryNotes: deliveryNotes || tracking.deliveryNotes,
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          deliveryDate: normalizedExpectedDelivery,
        },
      }),
    ]);

    await createStatusHistory(orderId, "TRACKING_UPDATED", "Tracking information updated", req.user!.id);
    await createNotification({
      userId: (await prisma.order.findUnique({ where: { id: orderId } }))!.userId,
      orderId,
      title: "Tracking Updated",
      message: trackingNumber ? `Tracking number ${trackingNumber} has been added.` : "Tracking details were updated.",
      type: "TRACKING_UPDATED",
    });

    res.json({ tracking: updatedTracking, order: updatedOrder });
  } catch {
    res.status(500).json({ message: "Failed to update tracking" });
  }
});

// Get order details for admin
router.get("/orders/:id/details", async (req: AuthRequest, res: Response) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id as string },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: { include: { product: true } },
        messages: { orderBy: { createdAt: "asc" } },
        statusHistory: { orderBy: { createdAt: "asc" } },
        paymentVerification: true,
        tracking: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch {
    res.status(500).json({ message: "Failed to fetch order details" });
  }
});

// Customer management
router.get("/customers", async (req, res) => {
  try {
    const { search } = req.query;
    const where: Record<string, unknown> = { isAdmin: false };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { email: { contains: search as string, mode: "insensitive" } },
        { phone: { contains: search as string } },
      ];
    }

    const customers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(customers);
  } catch {
    res.status(500).json({ message: "Failed to fetch customers" });
  }
});

// Sales analytics (basic for Phase 1)
router.get("/analytics", async (req, res) => {
  try {
    const { period = "daily" } = req.query;
    const orders = await prisma.order.findMany({
      where: { paymentStatus: { in: ["PAID", "PENDING"] } },
      select: { totalAmount: true, createdAt: true, items: true },
      orderBy: { createdAt: "asc" },
    });

    const grouped: Record<string, { revenue: number; orders: number }> = {};

    for (const order of orders) {
      const date = new Date(order.createdAt);
      let key: string;

      if (period === "yearly") {
        key = date.getFullYear().toString();
      } else if (period === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else if (period === "weekly") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else {
        key = date.toISOString().split("T")[0];
      }

      if (!grouped[key]) grouped[key] = { revenue: 0, orders: 0 };
      grouped[key].revenue += order.totalAmount;
      grouped[key].orders += 1;
    }

    const data = Object.entries(grouped).map(([date, stats]) => ({
      date,
      ...stats,
    }));

    // Top selling products
    const orderItems = await prisma.orderItem.findMany({
      include: { product: { select: { name: true } } },
    });

    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    for (const item of orderItems) {
      const name = item.product.name;
      if (!productSales[name]) {
        productSales[name] = { name, quantity: 0, revenue: 0 };
      }
      productSales[name].quantity += item.quantity;
      productSales[name].revenue += item.price * item.quantity;
    }

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.json({ sales: data, topProducts });
  } catch {
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
});

// Admin: Reviews management
router.get("/reviews", async (req, res) => {
  try {
    const { rating, productId, customerId, search, page = "1", limit = "20", hidden } = req.query as any;
    const where: any = {};
    if (rating) where.rating = Number(rating);
    if (productId) where.productId = productId;
    if (customerId) where.userId = customerId;
    if (hidden !== undefined) where.hidden = hidden === "true";
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { comment: { contains: search, mode: "insensitive" } },
      ];
    }

    const p = Math.max(1, Number(page));
    const l = Math.min(100, Number(limit));

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } }, product: { select: { id: true, name: true } }, order: true, orderItem: true },
        orderBy: { createdAt: "desc" },
        skip: (p - 1) * l,
        take: l,
      }),
    ]);

    res.json({ total, reviews, page: p, limit: l });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

router.patch("/reviews/:id", async (req, res) => {
  try {
    const id = req.params.id as string;
    const { hidden, featured, action } = req.body as any;

    if (action === "delete") {
      await prisma.review.delete({ where: { id } });
      return res.json({ message: "Review deleted" });
    }

    const data: any = {};
    if (hidden !== undefined) data.hidden = Boolean(hidden);
    if (featured !== undefined) data.featured = Boolean(featured);

    const updated = await prisma.review.update({ where: { id }, data });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update review" });
  }
});

export default router;
