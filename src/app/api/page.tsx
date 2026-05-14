"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LandingView } from "@/components/views/landing";
import { LoginView } from "@/components/views/login";
import { RegisterView } from "@/components/views/register";
import { ClientDashboardView } from "@/components/views/client-dashboard";
import { OrderCreateView } from "@/components/views/order-create";
import { OrderDetailView } from "@/components/views/order-detail";
import { AdminDashboardView } from "@/components/views/admin-dashboard";
import { AdminOrderDetailView } from "@/components/views/admin-order-detail";
import { AdminClientProfileView } from "@/components/views/admin-client-profile";
import { ClientProfileView } from "@/components/views/client-profile";
import { useAppStore, type UserSession } from "@/stores/app-store";

const PROTECTED_VIEWS = [
  "client-dashboard",
  "order-create",
  "order-detail",
  "admin-dashboard",
  "admin-order-detail",
  "admin-client-profile",
  "profile",
] as const;

export default function Home() {
  const { currentView, user, token, setView, setUser, logout } = useAppStore();
  const [authChecked, setAuthChecked] = useState(false);
  const hasCheckedRef = useRef(false);

  // Check session on mount — validate stored token via /api/auth/me
  const checkAuth = useCallback(async () => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const store = useAppStore.getState();

    // If no token in store, nothing to validate
    if (!store.token) {
      if (store.user) {
        store.logout();
      }
      setAuthChecked(true);
      return;
    }

    try {
      const res = await fetch("/api/auth/me", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        const sessionUser: UserSession = {
          id: data.id,
          email: data.email,
          name: data.name,
          role: (data.role as "CLIENT" | "ADMIN") || "CLIENT",
          city: data.city || undefined,
        };

        // Only update if user data changed — preserve token
        if (!store.user || store.user.id !== sessionUser.id || store.user.name !== sessionUser.name || store.user.role !== sessionUser.role) {
          store.setUser(sessionUser, store.token);
        }
      } else {
        // Token invalid — clear store
        if (store.user) {
          store.logout();
        }
      }
    } catch {
      // Network error — keep existing session, don't logout
    } finally {
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Auth guard for protected views
  useEffect(() => {
    if (!authChecked) return;
    const isProtected = PROTECTED_VIEWS.includes(currentView as (typeof PROTECTED_VIEWS)[number]);
    if (isProtected && !user) {
      setView("login");
 }

    // Role-based guard: admin views require ADMIN role
    const ADMIN_VIEWS = ["admin-dashboard", "admin-order-detail", "admin-client-profile"];
    if (ADMIN_VIEWS.includes(currentView) && user && user.role !== "ADMIN") {
      setView(user.role === "CLIENT" ? "client-dashboard" : "landing");
    }
  }, [currentView, user, authChecked, setView]);

  const renderView = () => {
    // Don't render protected views while checking auth
    if (!authChecked) {
      const isProtected = PROTECTED_VIEWS.includes(currentView as (typeof PROTECTED_VIEWS)[number]);
      if (isProtected) {
        return (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              <p className="text-muted-foreground text-sm">Загрузка...</p>
            </div>
          </div>
        );
      }
    }

    switch (currentView) {
      case "landing":
        return <LandingView />;
      case "login":
        return <LoginView />;
      case "register":
        return <RegisterView />;
      case "client-dashboard":
        return <ClientDashboardView />;
      case "order-create":
        return <OrderCreateView />;
      case "order-detail":
        return <OrderDetailView />;
      case "admin-dashboard":
        return <AdminDashboardView />;
      case "admin-order-detail":
        return <AdminOrderDetailView />;
      case "admin-client-profile":
        return <AdminClientProfileView />;
      case "profile":
        return <ClientProfileView />;
      default:
        return <LandingView />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{renderView()}</main>
      <Footer />
    </div>
  );
}
