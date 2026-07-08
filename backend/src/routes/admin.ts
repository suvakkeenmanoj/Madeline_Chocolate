import { Router, Response } from "express";
import prisma from "../lib/prisma";
import { authenticate, requireAdmin, AuthRequest } from "../middleware/auth";

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
router.patch("/orders/:id/payment-status", async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    if (!paymentStatus || !["PAID", "REJECTED"].includes(paymentStatus)) {
      return res.status(400).json({ message: "Invalid payment status" });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id as string },
      data: {
        paymentStatus,
        verifiedAt: paymentStatus === "PAID" ? new Date() : null,
      },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: true } },
      },
    });

    res.json(order);
  } catch {
    res.status(500).json({ message: "Failed to update payment status" });
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

export default router;
