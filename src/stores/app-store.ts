"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "CLIENT" | "ADMIN";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  city?: string;
}

export type AppView =
  | "landing"
  | "login"
  | "register"
  | "client-dashboard"
  | "order-create"
  | "order-detail"
  | "admin-dashboard"
  | "admin-order-detail"
  | "admin-client-profile"
  | "profile";

interface AppState {
  currentView: AppView;
  selectedOrderId: string | null;
  selectedClientId: string | null;
  user: UserSession | null;
  token: string | null;
  sidebarOpen: boolean;

  setView: (view: AppView) => void;
  selectOrder: (id: string) => void;
  selectClient: (id: string) => void;
  setUser: (user: UserSession | null, token?: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: "landing",
      selectedOrderId: null,
      selectedClientId: null,
      user: null,
      token: null,
      sidebarOpen: false,

      setView: (view) => set({ currentView: view }),
      selectOrder: (id) => set({ selectedOrderId: id }),
      selectClient: (id) => set({ selectedClientId: id, currentView: "admin-client-profile" }),
      setUser: (user, token) => {
        if (user?.role === "ADMIN") {
          set({ user, token: token ?? null, currentView: "admin-dashboard" });
        } else if (user) {
          set({ user, token: token ?? null, currentView: "client-dashboard" });
        } else {
          set({ user: null, token: null, currentView: "landing", selectedOrderId: null });
        }
      },
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      logout: () => set({ user: null, token: null, currentView: "landing", selectedOrderId: null, selectedClientId: null }),
    }),
    {
      name: "cargo-app-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        currentView: state.currentView,
        selectedOrderId: state.selectedOrderId,
        selectedClientId: state.selectedClientId,
      }),
    }
  )
);
