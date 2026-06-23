import PDFDocument from "pdfkit";
import { Response } from "express";

interface OrderForPdf {
  orderNumber: string;
  totalAmount: number;
  gstAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  deliveryAddress: string;
  phone: string;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  createdAt: Date;
  user: { name: string; email: string; phone?: string | null };
  items: Array<{
    quantity: number;
    price: number;
    product: { name: string };
    customization?: unknown;
  }>;
}

export function generateInvoicePdf(order: OrderForPdf, res: Response) {
  const doc = new PDFDocument({ margin: 50, size: "A4" });
  doc.pipe(res);

  const chocolate = "#3E2723";
  const gold = "#D4AF37";

  // Header
  doc.rect(0, 0, doc.page.width, 100).fill(chocolate);
  doc.fillColor("#FFFFFF")
    .fontSize(24)
    .font("Helvetica-Bold")
    .text("Madeline_chocolate", 50, 30);
  doc.fontSize(10)
    .font("Helvetica")
    .text("Handcrafted Chocolates & Return Gifts", 50, 60);
  doc.text("Budget-friendly gifts starting from ₹20", 50, 75);

  doc.fillColor("#000000").moveDown(3);

  // Invoice title
  doc.fontSize(18).font("Helvetica-Bold").fillColor(chocolate).text("INVOICE");
  doc.moveDown(0.5);

  // Order info
  doc.fontSize(10).font("Helvetica").fillColor("#333333");
  doc.text(`Invoice No: ${order.orderNumber}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })}`);
  doc.text(`Payment: ${order.paymentMethod} (${order.paymentStatus})`);
  doc.text(`Status: ${order.status.replace(/_/g, " ")}`);
  doc.moveDown();

  // Customer details
  doc.font("Helvetica-Bold").text("Bill To:");
  doc.font("Helvetica");
  doc.text(order.user.name);
  doc.text(order.user.email);
  doc.text(`Phone: ${order.phone}`);
  doc.text(`Address: ${order.deliveryAddress}`);
  if (order.city) doc.text(`${order.city}, ${order.state || ""} - ${order.pincode || ""}`);
  doc.moveDown();

  // Table header
  const tableTop = doc.y;
  doc.rect(50, tableTop, 495, 25).fill(gold);
  doc.fillColor(chocolate).font("Helvetica-Bold").fontSize(10);
  doc.text("Product", 55, tableTop + 8);
  doc.text("Qty", 300, tableTop + 8);
  doc.text("Price", 370, tableTop + 8);
  doc.text("Total", 450, tableTop + 8);

  let y = tableTop + 30;
  doc.fillColor("#333333").font("Helvetica");

  for (const item of order.items) {
    const lineTotal = item.price * item.quantity;
    doc.text(item.product.name, 55, y, { width: 230 });
    doc.text(String(item.quantity), 300, y);
    doc.text(`₹${item.price.toFixed(2)}`, 370, y);
    doc.text(`₹${lineTotal.toFixed(2)}`, 450, y);
    y += 25;
  }

  // Totals
  y += 10;
  doc.moveTo(350, y).lineTo(545, y).stroke("#CCCCCC");
  y += 10;

  const subtotal = order.totalAmount - order.gstAmount;
  doc.text("Subtotal:", 370, y);
  doc.text(`₹${subtotal.toFixed(2)}`, 450, y);
  y += 20;

  if (order.gstAmount > 0) {
    doc.text("GST (5%):", 370, y);
    doc.text(`₹${order.gstAmount.toFixed(2)}`, 450, y);
    y += 20;
  }

  doc.font("Helvetica-Bold").fontSize(12).fillColor(chocolate);
  doc.text("Grand Total:", 370, y);
  doc.text(`₹${order.totalAmount.toFixed(2)}`, 450, y);

  // Footer
  doc.fontSize(9).font("Helvetica").fillColor("#666666");
  doc.text(
    "Thank you for choosing Madeline_chocolate! For queries, contact us on WhatsApp.",
    50,
    doc.page.height - 80,
    { align: "center", width: 495 }
  );

  doc.end();
}
