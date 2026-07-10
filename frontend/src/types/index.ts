export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isAdmin?: boolean;
  createdAt?: string;
}

export interface ProductVariant {
  label: string;
  price: number;
  unit: string;
}

export interface CustomField {
  name: string;
  type: "text" | "textarea" | "image";
  label: string;
  required: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  category: string;
  stock: number;
  variants?: { options: ProductVariant[] };
  customizable?: boolean;
  customFields?: { fields: CustomField[] };
  avgRating?: number;
  reviewCount?: number;
  reviews?: Review[];
}

export interface Review {
  id: string;
  rating: number;
  review?: string;
  image?: string;
  createdAt: string;
  user: { name: string };
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  variant?: string;
  customization?: Record<string, string>;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  orderId?: string | null;
}

export interface OrderMessage {
  id: string;
  orderId: string;
  senderType: string;
  senderId: string;
  message: string;
  attachment?: string | null;
  createdAt: string;
}

export interface OrderStatusHistoryItem {
  id: string;
  status: string;
  message?: string | null;
  updatedBy?: string | null;
  createdAt: string;
}

export interface PaymentVerification {
  id: string;
  orderId: string;
  verificationStatus: string;
  verifiedBy?: string | null;
  verificationDate?: string | null;
  rejectionReason?: string | null;
  screenshotRequested: boolean;
  paymentScreenshot?: string | null;
}

export interface TrackingInfo {
  id: string;
  orderId: string;
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingLink?: string | null;
  expectedDelivery?: string | null;
  deliveryNotes?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  gstAmount: number;
  paymentMethod: "UPI" | "COD";
  paymentStatus: string;
  utrNumber?: string | null;
  paymentScreenshot?: string | null;
  verifiedAt?: string | null;
  status: string;
  deliveryAddress: string;
  phone: string;
  city?: string;
  state?: string;
  pincode?: string;
  deliveryDate?: string;
  createdAt: string;
  items: OrderItem[];
  user?: { id?: string; name: string; email: string; phone?: string };
  messages?: OrderMessage[];
  statusHistory?: OrderStatusHistoryItem[];
  paymentVerification?: PaymentVerification;
  tracking?: TrackingInfo;
}

export interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  customization?: Record<string, string>;
  product: { id: string; name: string; image?: string };
}

export type OrderStatus =
  | "ORDER_PLACED"
  | "PREPARING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  ORDER_PLACED: "Order Placed",
  PREPARING: "Preparing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out For Delivery",
  DELIVERED: "Delivered",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending Verification",
  PAID: "Payment Accepted",
  REJECTED: "Payment Rejected",
  FAILED: "Payment Failed",
  COD_PENDING: "COD Pending",
  COD_CONFIRMED: "COD Confirmed",
  REFUND_INITIATED: "Refund Initiated",
  REFUND_COMPLETED: "Refund Completed",
};

export const PAYMENT_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  PAID: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  FAILED: "bg-amber-100 text-amber-700",
  COD_PENDING: "bg-orange-100 text-orange-700",
  COD_CONFIRMED: "bg-blue-100 text-blue-700",
  REFUND_INITIATED: "bg-purple-100 text-purple-700",
  REFUND_COMPLETED: "bg-emerald-100 text-emerald-700",
};
