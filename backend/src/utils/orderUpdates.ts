import prisma from "../lib/prisma";

export async function ensurePaymentVerification(orderId: string, initialStatus = "PENDING") {
  return prisma.paymentVerification.upsert({
    where: { orderId },
    create: {
      orderId,
      verificationStatus: initialStatus,
    },
    update: {
      verificationStatus: initialStatus,
    },
  });
}

export async function ensureTracking(orderId: string) {
  return prisma.tracking.upsert({
    where: { orderId },
    create: { orderId },
    update: {},
  });
}

export async function createStatusHistory(
  orderId: string,
  status: string,
  message: string,
  updatedBy?: string
) {
  return prisma.orderStatusHistory.create({
    data: {
      orderId,
      status,
      message,
      updatedBy,
    },
  });
}

export async function createNotification({
  userId,
  orderId,
  title,
  message,
  type = "INFO",
}: {
  userId: string;
  orderId?: string;
  title: string;
  message: string;
  type?: string;
}) {
  return prisma.notification.create({
    data: {
      userId,
      orderId,
      title,
      message,
      type,
    },
  });
}

export async function createOrderMessage({
  orderId,
  senderType,
  senderId,
  message,
  attachment,
}: {
  orderId: string;
  senderType: string;
  senderId: string;
  message: string;
  attachment?: string | null;
}) {
  return prisma.orderMessage.create({
    data: {
      orderId,
      senderType,
      senderId,
      message,
      attachment,
    },
  });
}
