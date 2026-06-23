import QRCode from "qrcode";

export async function generateUpiQr(
  amount: number,
  orderNumber: string
): Promise<string> {
  const upiId = process.env.UPI_ID || "madeline.chocolate@upi";
  const upiName = process.env.UPI_NAME || "Madeline_chocolate";

  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Order ${orderNumber}`)}`;

  return QRCode.toDataURL(upiUrl, {
    width: 300,
    margin: 2,
    color: { dark: "#3E2723", light: "#FFFFFF" },
  });
}
