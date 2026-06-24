import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const authApi = {
  register: (data: object) => api.post("/auth/register", data),
  login: (data: object) => api.post("/auth/login", data),
  forgotPassword: (email: string) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data: object) => api.post("/auth/reset-password", data),
  me: () => api.get("/auth/me"),
};

export const productApi = {
  getAll: (params?: { search?: string; category?: string }) =>
    api.get("/products", { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getCategories: () => api.get("/products/meta/categories"),
  create: (data: object) => api.post("/products", data),
  update: (id: string, data: object) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const orderApi = {
  create: (data: object) => api.post("/orders", data),
  getById: (id: string) => api.get(`/orders/${id}`),
  getUpiQr: (id: string) => api.get(`/orders/${id}/upi-qr`),
  confirmUpi: (id: string) => api.post(`/orders/${id}/confirm-upi`),
  uploadPaymentProof: (id: string, formData: FormData) =>
    api.post(`/orders/${id}/payment-proof`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getInvoice: (id: string) =>
    api.get(`/orders/${id}/invoice`, { responseType: "blob" }),
};

export const userApi = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: object) => api.put("/users/profile", data),
  getOrders: () => api.get("/users/orders"),
  getWishlist: () => api.get("/users/wishlist"),
  addToWishlist: (productId: string) => api.post(`/users/wishlist/${productId}`),
  removeFromWishlist: (productId: string) =>
    api.delete(`/users/wishlist/${productId}`),
};

export const adminApi = {
  getStats: () => api.get("/admin/stats"),
  getOrders: (params?: { status?: string; paymentMethod?: string }) =>
    api.get("/admin/orders", { params }),
  updateOrderStatus: (id: string, data: object) =>
    api.patch(`/admin/orders/${id}/status`, data),
  updatePaymentStatus: (id: string, data: object) =>
    api.patch(`/admin/orders/${id}/payment-status`, data),
  getCustomers: (search?: string) =>
    api.get("/admin/customers", { params: { search } }),
  getAnalytics: (period?: string) =>
    api.get("/admin/analytics", { params: { period } }),
};
