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
  user?: { name: string; email: string };
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
