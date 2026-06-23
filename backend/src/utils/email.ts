import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: process.env.SMTP_USER
    ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    : undefined,
});

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  if (!process.env.SMTP_USER) {
    console.log(`[Email] Password reset link for ${email}: ${resetUrl}`);
    return;
  }

  await transporter.sendMail({
    from: `"Madeline_chocolate" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Your Password - Madeline_chocolate",
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `,
  });
}

export async function sendOrderConfirmationEmail(order: {
  orderNumber: string;
  totalAmount: number;
  paymentMethod: string;
  user: { name: string; email: string };
  items: Array<{ quantity: number; product: { name: string }; price: number }>;
}) {
  if (!process.env.SMTP_USER) {
    console.log(`[Email] Order confirmation sent to ${order.user.email} for ${order.orderNumber}`);
    return;
  }

  const itemsList = order.items
    .map(
      (i) =>
        `<li>${i.product.name} x ${i.quantity} — ₹${(i.price * i.quantity).toFixed(2)}</li>`
    )
    .join("");

  await transporter.sendMail({
    from: `"Madeline_chocolate" <${process.env.SMTP_USER}>`,
    to: order.user.email,
    subject: `Order Confirmed - ${order.orderNumber}`,
    html: `
      <h2>Thank you, ${order.user.name}!</h2>
      <p>Your order <strong>${order.orderNumber}</strong> has been placed successfully.</p>
      <ul>${itemsList}</ul>
      <p><strong>Total:</strong> ₹${order.totalAmount.toFixed(2)}</p>
      <p><strong>Payment:</strong> ${order.paymentMethod}</p>
      <p>Expected Delivery Date will be updated by Admin.</p>
    `,
  });

  // Notify admin
  if (process.env.ADMIN_EMAIL) {
    await transporter.sendMail({
      from: `"Madeline_chocolate" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Order - ${order.orderNumber}`,
      html: `<p>New order from ${order.user.name} (${order.user.email}) — ₹${order.totalAmount.toFixed(2)}</p>`,
    });
  }
}
