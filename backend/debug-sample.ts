import prisma from "./src/lib/prisma";
(async () => {
  const orders = await prisma.order.findMany({ take: 20, include: { user: true } });
  console.log('orders count', orders.length);
  for (const o of orders) {
    console.log({ id: o.id, orderNumber: o.orderNumber, userId: o.userId, paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus, status: o.status });
  }
  const users = await prisma.user.findMany({ take: 20 });
  console.log('users count', users.length);
  for (const u of users) {
    console.log({ id: u.id, email: u.email, isAdmin: u.isAdmin });
  }
  await prisma.$disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
