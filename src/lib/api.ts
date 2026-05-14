import { useAppStore } from "@/stores/app-store";

export interface OrderUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  imageUrl?: string;
  quantity: number;
  itemPriceCNY?: number;
  deliveryPriceRUB?: number;
  totalPriceRUB?: number;
  note?: string;
}

export interface Order {
  id: string;
  trackingNumber?: string;
  status: string;
  totalPriceRUB?: number;
  deliveryPriceRUB?: number;
  itemPriceCNY?: number;
  adminNote?: string;
  clientNote?: string;
  items: OrderItem[];
  messages: Message[];
  user: OrderUser;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  user: { id: string; name: string; role: string };
  createdAt: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminStats {
  totalOrders: number;
  newOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  totalRevenue: number;
}

export interface ClientStats {
  totalOrders: number;
  newOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface ClientProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  role: string;
  createdAt: string;
  _count: { orders: number };
}

export interface ProfileData {
  name: string;
  phone?: string;
  city?: string;
}

function getAuthHeaders(): Record<string, string> {
  const token = useAppStore.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const authAPI = {
  login: async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ошибка входа");
    return data;
  },
  register: async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Ошибка регистрации");
    return data;
  },
  getMe: async () => {
    const res = await fetch("/api/auth/me", { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Не авторизован");
    return res.json();
  },
};

export const ordersAPI = {
  getAll: async (page = 1, limit = 20, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set("status", status);
    const res = await fetch(`/api/orders?${params}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Ошибка загрузки заявок");
    return res.json() as Promise<OrdersResponse>;
  },
  getById: async (id: string) => {
    const res = await fetch(`/api/orders/${id}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Заявка не найдена");
    return res.json() as Promise<Order>;
  },
  create: async (data: {
    clientNote?: string;
    items: { name: string; quantity: number; imageUrl?: string; note?: string }[];
  }) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Ошибка создания заявки");
    }
    return res.json() as Promise<Order>;
  },
  update: async (id: string, data: Record<string, unknown>) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Ошибка обновления заявки");
    return res.json() as Promise<Order>;
  },
  delete: async (id: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Ошибка удаления заявки");
    return res.json();
  },
  getMessages: async (orderId: string) => {
    const res = await fetch(`/api/orders/${orderId}/messages`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Ошибка загрузки сообщений");
    return res.json() as Promise<Message[]>;
  },
  sendMessage: async (orderId: string, content: string) => {
    const res = await fetch(`/api/orders/${orderId}/messages`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error("Ошибка отправки сообщения");
    return res.json() as Promise<Message>;
  },
};

export const profileAPI = {
  get: async () => {
    const res = await fetch("/api/profile", { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Ошибка загрузки профиля");
    return res.json() as Promise<ProfileData & { id: string; email: string; role: string }>;
  },
  update: async (data: ProfileData) => {
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Ошибка обновления профиля");
    return res.json();
  },
};

export const uploadAPI = {
  upload: async (file: File) => {
    const token = useAppStore.getState().token;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/image-proxy", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) throw new Error("Ошибка загрузки файла");
    return res.json() as Promise<{ url: string }>;
  },
};

export const adminAPI = {
  getStats: async () => {
    const res = await fetch("/api/admin/stats", { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Ошибка загрузки статистики");
    return res.json() as Promise<AdminStats>;
  },
  getClientStats: async (clientId: string) => {
    const res = await fetch(`/api/admin/client-stats?clientId=${clientId}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Ошибка загрузки статистики клиента");
    return res.json() as Promise<ClientStats>;
  },
  getClientProfile: async (clientId: string) => {
    const res = await fetch(`/api/admin/client-profile/${clientId}`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Ошибка загрузки профиля клиента");
    return res.json() as Promise<ClientProfile>;
  },
};
