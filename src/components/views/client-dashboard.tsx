"use client";

import { useEffect, useState, useCallback } from "react";
import {
  PlusCircle,
  ClipboardList,
  Hourglass,
  CheckCircle2,
  Inbox,
  Loader2,
  Hash,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppStore } from "@/stores/app-store";
import { ordersAPI, type Order } from "@/lib/api";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  NEW: {
    label: "Новая",
    className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50",
  },
  APPROVED: {
    label: "Принята",
    className: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800/50",
  },
  SHIPPED: {
    label: "Отправлена",
    className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50",
  },
  DELIVERED: {
    label: "Доставлена",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50",
  },
  CANCELLED: {
    label: "Отменена",
    className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50",
  },
};

const STATUS_TABS = [
  { value: "ALL", label: "Все" },
  { value: "NEW", label: "Новые" },
  { value: "APPROVED", label: "В обработке" },
  { value: "SHIPPED", label: "Отправленные" },
  { value: "DELIVERED", label: "Доставленные" },
  { value: "CANCELLED", label: "Отменённые" },
];

const PAGE_SIZE = 20;

export function ClientDashboardView() {
  const { user, setView, selectOrder } = useAppStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState("ALL");

  const fetchOrders = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      const data = await ordersAPI.getOrders({ page: pageNum, limit: PAGE_SIZE });
      setOrders((prev) => (append ? [...prev, ...data.orders] : data.orders));
      setTotal(data.total);
      setPage(pageNum);
    } catch {
      if (!append) setOrders([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    fetchOrders(page + 1, true);
  }, [fetchOrders, page]);

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    // Reset pagination when tab changes
    setPage(1);
    setOrders([]);
    setTotal(0);
    fetchOrders(1, false);
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders(1, false);
  }, [fetchOrders]);

  // Client-side filtering for display
  const filteredOrders = activeTab === "ALL"
    ? orders
    : orders.filter((o) => o.status === activeTab);

  // Stats are calculated from loaded orders; total uses API total
  const stats = {
    total,
    active: orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length,
    completed: orders.filter((o) => o.status === "DELIVERED").length,
  };

  const getStatusBadge = (status: string) => {
    const s = STATUS_MAP[status] || { label: status, className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    return (
      <Badge variant="outline" className={s.className}>
        {s.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Добро пожаловать, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Управляйте вашими заявками на выкуп товаров
          </p>
        </div>
        <Button
          onClick={() => setView("order-create")}
          className="bg-orange-500 hover:bg-orange-600 text-white shadow-md"
          size="lg"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Создать заявку
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 shrink-0">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Всего заявок</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 shrink-0">
              <Hourglass className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-sm text-muted-foreground">Активных</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4 md:p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-muted-foreground">Доставлено</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-orange-500" />
            Мои заявки
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className="mb-4 overflow-x-auto -mx-6 px-6">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full sm:w-auto flex-wrap">
                {STATUS_TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <span className="ml-3 text-muted-foreground">Загрузка...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Нет заявок</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {activeTab === "ALL"
                  ? "У вас пока нет заявок. Создайте первую!"
                  : "Нет заявок с выбранным статусом"}
              </p>
              {activeTab === "ALL" && (
                <Button
                  onClick={() => setView("order-create")}
                  className="mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Создать заявку
                </Button>
              )}
            </div>
          ) : (
            /* Orders List */
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              <div className="mb-2 text-sm text-muted-foreground">
                Показано {filteredOrders.length} из {total} заявок
              </div>
              {filteredOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => { selectOrder(order.id); setView("order-detail"); }}
                  className="w-full rounded-lg border p-4 text-left transition-all duration-200 hover:border-orange-200 hover:bg-orange-50/50 dark:hover:border-orange-800 dark:hover:bg-orange-950/30 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-semibold truncate">{order.title}</h4>
                        {order.orderNumber && (
                          <span className="inline-flex items-center gap-0.5 font-mono text-xs rounded px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50">
                            <Hash className="h-3 w-3" />
                            {order.orderNumber}
                          </span>
                        )}
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                        {order.storeName && (
                          <span className="truncate">Магазин: {order.storeName}</span>
                        )}
                        {(order._count?.items ?? 0) > 0 && (
                          <span className="shrink-0">{(order._count?.items ?? 0)} товар(ов)</span>
                        )}
                        <span className="shrink-0">
                          {format(new Date(order.createdAt), "d MMM yyyy", { locale: ru })}
                        </span>
                      </div>
                    </div>
                    {order.totalPriceRUB && (
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-orange-600 dark:text-orange-400">
                          {order.totalPriceRUB.toLocaleString("ru-RU")} ₽
                        </p>
                      </div>
                    )}
                  </div>
                  {order._count?.messages !== undefined && order._count.messages > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      {order._count.messages} сообщ.
                    </div>
                  )}
                </button>
              ))}
              {/* Load More */}
              {orders.length < total && (
                <div className="flex flex-col items-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="gap-2"
                  >
                    {loadingMore ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {loadingMore ? "Загрузка..." : "Загрузить ещё"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
