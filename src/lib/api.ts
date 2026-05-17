import { useAppStore } from "@/stores/app-store";

const API_BASE = "/api";

/**
 * Get the Authorization header from the persisted store token.
 * This is used for all authenticated API requests.
 */
function getAuthHeaders(): Record<string, string> {
  const store = useAppStore.getState();
  const token = store.token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const mergedHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (options?.body instanceof FormData) {
    delete mergedHeaders["Content-Type"];
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...mergedHeaders,
      ...(options?.headers as Record<string, string> | undefined),
    },
  });

  console.log(`[api] ${options?.method || "GET"} ${endpoint} → ${res.status}`);

  if (!res.ok) {
    // If 401 — user session expired or invalid
    if (res.status === 401) {
      console.log(`[api] 401 on ${endpoint} — logging out`);
      const store = useAppStore.getState();
      if (store.user) {
        store.logout();
      }
    }
    const error = await res.json().catch(() => ({ error: "Ошибка запроса" }));
    throw new Error(error.error || `Ошибка ${res.status}`);
  }

  return res.json();
}

// Auth
export const authAPI = {
  register: async (data: {
    email: string;
    name: string;
    password: string;
    phone?: string;
    city?: string;
  }) => {
    return fetchAPI<{ id: string; email: string; name: string; role: string }>(
      "/auth/register",
      { method: "POST", body: JSON.stringify(data) }
    );
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Ошибка запроса" }));
      throw new Error(error.error || `Ошибка ${res.status}`);
    }

    return res.json() as Promise<{
      id: string;
      email: string;
      name: string;
      role: string;
      token: string;
    }>;
  },

  me: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });

    if (!res.ok) return null;
    return res.json() as Promise<{
      id: string;
      email: string;
      name: string;
      role: string;
      city?: string;
    }>;
  },

  logout: async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: "POST" });
  },
};

// Orders
export interface OrderUser {
  id: string;
  name: string;
  email: string;
  city?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  title: string;
  description?: string;
  storeUrl?: string;
  storeName?: string;
  quantity: number;
  imageUrl?: string;
  itemPriceCNY?: number;
  deliveryPriceRUB?: number;
  totalPriceRUB?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  title: string;
  description?: string;
  status: string;
  adminNote?: string;
  deliveryCity?: string;
  itemPriceCNY?: number;
  deliveryPriceRUB?: number;
  totalPriceRUB?: number;
  imageUrl?: string;
  storeUrl?: string;
  storeName?: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  user?: OrderUser;
  items?: OrderItem[];
  _count?: { messages: number; items: number };
  messages?: Message[];
}

export interface Message {
  id: string;
  orderId: string;
  senderId: string;
  text: string;
  createdAt: string;
  user: { id: string; name: string; role: string };
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

export const ordersAPI = {
  getOrders: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<OrdersResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.search) searchParams.set("search", params.search);
    const query = searchParams.toString();
    return fetchAPI<OrdersResponse>(`/orders${query ? `?${query}` : ""}`);
  },

  getOrder: async (id: string): Promise<Order> => {
    return fetchAPI<Order>(`/orders/${id}`);
  },

  createOrder: async (data: {
    items: {
      title: string;
      description?: string;
      storeUrl?: string;
      storeName?: string;
      quantity?: number;
      imageUrl?: string;
    }[];
    deliveryCity?: string;
  }): Promise<Order> => {
    return fetchAPI<Order>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateOrder: async (
    id: string,
    data: Partial<Order>
  ): Promise<Order> => {
    return fetchAPI<Order>(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteOrder: async (id: string): Promise<void> => {
    await fetchAPI<{ success: true }>(`/orders/${id}`, {
      method: "DELETE",
    });
  },

  getMessages: async (orderId: string): Promise<Message[]> => {
    return fetchAPI<Message[]>(`/orders/${orderId}/messages`);
  },

  sendMessage: async (
    orderId: string,
    text: string
  ): Promise<Message> => {
    return fetchAPI<Message>(`/orders/${orderId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    });
  },
};

// Admin
export interface AdminStats {
  totalOrders: number;
  newOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalDeliveryRevenue: number;
  totalClients: number;
  recentOrders: Order[];
  statusCounts: { status: string; _count: number }[];
}

export interface ClientStats {
  client: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    createdAt: string;
  };
  stats: {
    totalOrders: number;
    newOrders: number;
    activeOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalSpent: number;
    totalDeliverySpent: number;
    totalItems: number;
    totalMessages: number;
    avgOrderValue: number;
    firstOrder: string | null;
    lastOrder: string | null;
  };
  recentOrders: {
    id: string;
    orderNumber: string;
    title: string;
    status: string;
    itemPriceCNY?: number;
    deliveryPriceRUB?: number;
    totalPriceRUB?: number;
    quantity: number;
    createdAt: string;
    storeName?: string;
  }[];
}

export interface ClientProfile {
  client: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    totalOrders: number;
    newOrders: number;
    activeOrders: number;
    deliveredOrders: number;
    cancelledOrders: number;
    totalSpent: number;
    totalDeliverySpent: number;
    totalItems: number;
    totalMessages: number;
    avgOrderValue: number;
    firstOrder: string | null;
    lastOrder: string | null;
  };
  orders: {
    id: string;
    orderNumber: string;
    title: string;
    status: string;
    totalPriceRUB?: number;
    itemPriceCNY?: number;
    deliveryPriceRUB?: number;
    quantity: number;
    deliveryCity?: string;
    createdAt: string;
    storeName?: string;
    storeUrl?: string;
  }[];
}

// Profile
export interface ProfileData {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  city?: string;
  createdAt: string;
  updatedAt: string;
}

export const profileAPI = {
  getProfile: async (): Promise<ProfileData> => {
    return fetchAPI<ProfileData>("/profile");
  },

  updateProfile: async (data: {
    name: string;
    phone?: string | null;
    city?: string | null;
  }): Promise<ProfileData> => {
    return fetchAPI<ProfileData>("/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};

// Upload
export const uploadAPI = {
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const store = useAppStore.getState();
    const token = store.token;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      if (res.status === 401) {
        if (store.user) {
          store.logout();
        }
      }
      const error = await res.json().catch(() => ({ error: "Ошибка запроса" }));
      throw new Error(error.error || `Ошибка ${res.status}`);
    }

    return res.json();
  },
};

// Admin
export const adminAPI = {
  getStats: async (): Promise<AdminStats> => {
    return fetchAPI<AdminStats>("/admin/stats");
  },

  getClientStats: async (clientId: string): Promise<ClientStats> => {
    return fetchAPI<ClientStats>(`/admin/client-stats?clientId=${clientId}`);
  },

  getClientProfile: async (clientId: string): Promise<ClientProfile> => {
    return fetchAPI<ClientProfile>(`/admin/client-profile/${clientId}`);
  },
};
