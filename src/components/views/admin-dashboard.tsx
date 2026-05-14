"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  CheckCircle2,
  Users,
  TrendingUp,
  Hourglass,
  Activity,
  FileText,
  Loader2,
  Eye,
  Hash,
  Copy,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppStore } from "@/stores/app-store";
import { adminAPI, ordersAPI, type Order } from "@/lib/api";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  NEW: { label: "Новая", className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50" },
  APPROVED: { label: "Принята", className: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800/50" },
  SHIPPED: { label: "Отправлена", className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50" },
  DELIVERED: { label: "Доставлена", className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50" },
  CANCELLED: { label: "Отменена", className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50" },
};

const STATUS_FILTERS = [
  { value: "ALL", label: "Все" },
  { value: "NEW", label: "Новые" },
  { value: "APPROVED", label: "Принятые" },
  { value: "SHIPPED", label: "Отправленные" },
  { value: "DELIVERED", label: "Доставленные" },
  { value: "CANCELLED", label: "Отменённые" },
];

export function AdminDashboardView() {
  const { setView, selectOrder, selectClient } = useAppStore();
  const [stats, setStats] = useState<{
    totalOrders: number;
    newOrders: number;
    inProgressOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    totalRevenue: number;
    totalClients: number;
    recentOrders: Order[];
  } | null>(null);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingMoreOrders, setLoadingMoreOrders] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [statsError, setStatsError] = useState(false);

  const ORDERS_PAGE_SIZE = 20;

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      setStatsError(false);
      const data = await adminAPI.getStats();
      setStats(data);
    } catch {
      setStatsError(true);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // Fetch orders with pagination — filtering is done client-side
  const fetchOrders = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMoreOrders(true);
      } else {
        setLoadingOrders(true);
      }
      const data = await ordersAPI.getOrders({ page: pageNum, limit: ORDERS_PAGE_SIZE });
      setAllOrders((prev) => (append ? [...prev, ...data.orders] : data.orders));
      setOrdersTotal(data.total);
      setOrdersPage(pageNum);
    } catch {
      if (!append) setAllOrders([]);
    } finally {
      setLoadingOrders(false);
      setLoadingMoreOrders(false);
    }
  }, []);

  const loadMoreOrders = useCallback(() => {
    fetchOrders(ordersPage + 1, true);
  }, [fetchOrders, ordersPage]);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatusFilter(value);
    // Reset pagination when status filter changes
    setOrdersPage(1);
    setAllOrders([]);
    setOrdersTotal(0);
    fetchOrders(1, false);
  }, [fetchOrders]);

  useEffect(() => {
    fetchStats();
    fetchOrders(1, false);
  }, [fetchStats, fetchOrders]);

  // Client-side filtering
  const filteredOrders = statusFilter === "ALL"
    ? allOrders
    : allOrders.filter((o) => o.status === statusFilter);

  const handleOrderClick = (orderId: string) => {
    selectOrder(orderId);
    setView("admin-order-detail");
  };

  const handleClientClick = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    selectClient(clientId);
  };

  const handleCopyOrderNumber = (e: React.MouseEvent, orderNumber: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(orderNumber).then(() => {
      // Brief visual feedback could be added here
    }).catch(() => {
      // Clipboard API not available (e.g., not HTTPS)
    });
  };

  const renderStatusBadge = (status: string) => {
    const s = STATUS_MAP[status] || { label: status, className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    return (
      <Badge variant="outline" className={s.className}>
        {s.label}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold md:text-3xl">Панель управления</h1>
        <p className="mt-1 text-muted-foreground">
          Управление заявками, статистика и клиенты
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => {
        setActiveTab(val);
        if (val === "orders" && allOrders.length === 0) fetchOrders(1, false);
      }}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="orders">Заявки</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          {loadingStats ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : statsError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-sm text-muted-foreground">Не удалось загрузить статистику</p>
              <Button variant="outline" size="sm" onClick={fetchStats}>Повторить</Button>
            </div>
          ) : stats && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-orange-500" />
                    </div>
                    <p className="text-2xl font-bold">{stats.totalOrders}</p>
                    <p className="text-xs text-muted-foreground">Всего заявок</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Hourglass className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="text-2xl font-bold">{stats.newOrders}</p>
                    <p className="text-xs text-muted-foreground">Новых</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-violet-500" />
                    </div>
                    <p className="text-2xl font-bold">{stats.inProgressOrders}</p>
                    <p className="text-xs text-muted-foreground">В работе</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold">{stats.completedOrders}</p>
                    <p className="text-xs text-muted-foreground">Выполнено</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold">{stats.totalRevenue.toLocaleString("ru-RU")}</p>
                    <p className="text-xs text-muted-foreground">₽ Выручка</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-sky-500" />
                    </div>
                    <p className="text-2xl font-bold">{stats.totalClients}</p>
                    <p className="text-xs text-muted-foreground">Клиентов</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Последние заявки</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.recentOrders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Нет заявок</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Заявка</TableHead>
                            <TableHead className="hidden lg:table-cell">Номер</TableHead>
                            <TableHead className="hidden md:table-cell">Клиент</TableHead>
                            <TableHead>Статус</TableHead>
                            <TableHead className="hidden sm:table-cell">Дата</TableHead>
                            <TableHead className="hidden sm:table-cell">Сумма</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.recentOrders.map((order) => (
                            <TableRow key={order.id} className="cursor-pointer hover:bg-orange-50/50 dark:hover:bg-orange-950/30">
                              <TableCell className="font-medium max-w-[200px] truncate">
                                <div>
                                  <span className="truncate block">{order.title}</span>
                                  {(order._count?.items ?? 0) > 0 && (
                                    <span className="text-xs text-muted-foreground">{(order._count?.items ?? 0)} товар(ов)</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                {order.orderNumber ? (
                                  <button
                                    onClick={(e) => handleCopyOrderNumber(e, order.orderNumber)}
                                    className="inline-flex items-center gap-1 font-mono text-xs rounded px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50 dark:hover:bg-emerald-900/50"
                                    title="Нажмите для копирования"
                                  >
                                    <Hash className="h-3 w-3" />
                                    {order.orderNumber}
                                    <Copy className="h-2.5 w-2.5 opacity-50" />
                                  </button>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="hidden md:table-cell text-sm">
                                {order.user?.id ? (
                                  <button
                                    onClick={(e) => handleClientClick(e, order.user.id)}
                                    className="text-orange-600 hover:text-orange-700 hover:underline font-medium dark:text-orange-400 dark:hover:text-orange-300"
                                  >
                                    {order.user.name}
                                  </button>
                                ) : (
                                  <span className="text-muted-foreground">{order.user?.name || "—"}</span>
                                )}
                              </TableCell>
                              <TableCell>{renderStatusBadge(order.status)}</TableCell>
                              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                                {format(new Date(order.createdAt), "d MMM yyyy", { locale: ru })}
                              </TableCell>
                              <TableCell className="hidden sm:table-cell text-sm font-medium">
                                {order.totalPriceRUB
                                  ? `${order.totalPriceRUB.toLocaleString("ru-RU")} ₽`
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOrderClick(order.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg">
                  Все заявки
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    Показано {filteredOrders.length} из {ordersTotal}
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {/* Status Filter */}
              <div className="mb-6 overflow-x-auto -mx-6 px-6">
                <Tabs value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <TabsList className="w-full sm:w-auto flex-wrap">
                    {STATUS_FILTERS.map((tab) => (
                      <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {loadingOrders ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    {statusFilter === "ALL" ? "Нет заявок" : "Нет заявок с выбранным статусом"}
                  </p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Заявка</TableHead>
                          <TableHead className="hidden lg:table-cell">Номер</TableHead>
                          <TableHead className="hidden md:table-cell">Клиент</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead className="hidden sm:table-cell">Дата</TableHead>
                          <TableHead className="hidden sm:table-cell">Сумма</TableHead>
                          <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredOrders.map((order) => (
                          <TableRow key={order.id} className="cursor-pointer hover:bg-orange-50/50 dark:hover:bg-orange-950/30">
                            <TableCell className="font-medium max-w-[200px] truncate">
                              <div>
                                <span className="truncate block">{order.title}</span>
                                {(order._count?.items ?? 0) > 0 && (
                                  <span className="text-xs text-muted-foreground">{(order._count?.items ?? 0)} товар(ов)</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {order.orderNumber ? (
                                <button
                                  onClick={(e) => handleCopyOrderNumber(e, order.orderNumber)}
                                  className="inline-flex items-center gap-1 font-mono text-xs rounded px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50 dark:hover:bg-emerald-900/50"
                                  title="Нажмите для копирования"
                                >
                                  <Hash className="h-3 w-3" />
                                  {order.orderNumber}
                                  <Copy className="h-2.5 w-2.5 opacity-50" />
                                </button>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="hidden md:table-cell text-sm">
                              {order.user?.id ? (
                                <button
                                  onClick={(e) => handleClientClick(e, order.user.id)}
                                  className="text-orange-600 hover:text-orange-700 hover:underline font-medium dark:text-orange-400 dark:hover:text-orange-300"
                                >
                                  {order.user.name || "—"}
                                </button>
                              ) : (
                                <span className="text-muted-foreground">{order.user?.name || "—"}</span>
                              )}
                            </TableCell>
                            <TableCell>{renderStatusBadge(order.status)}</TableCell>
                            <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                              {format(new Date(order.createdAt), "d MMM yyyy", { locale: ru })}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell text-sm font-medium">
                              {order.totalPriceRUB
                                ? `${order.totalPriceRUB.toLocaleString("ru-RU")} ₽`
                                : "—"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOrderClick(order.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Load More */}
                  {allOrders.length < ordersTotal && (
                    <div className="flex flex-col items-center gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={loadMoreOrders}
                        disabled={loadingMoreOrders}
                        className="gap-2"
                      >
                        {loadingMoreOrders ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        {loadingMoreOrders ? "Загрузка..." : "Загрузить ещё"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
