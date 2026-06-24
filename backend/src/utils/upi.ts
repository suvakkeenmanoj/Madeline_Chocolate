import QRCode from "qrcode";

export async function generateUpiQr(amount: number): Promise<string> {
  const upiId = process.env.UPI_ID || "sangibregit94@okicici";
  const upiName = process.env.UPI_NAME || "SANGEETHA BREGIT A";

  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(upiName)}&am=${amount.toFixed(2)}&cu=INR`;

  return QRCode.toDataURL(upiUrl, {
    width: 300,
    margin: 2,
    color: { dark: "#3E2723", light: "#FFFFFF" },
  });
}
