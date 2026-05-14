"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User as UserIcon,
  Package,
  Wallet,
  Activity,
  ClipboardList,
  Loader2,
  Eye,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/stores/app-store";
import { adminAPI, type ClientProfile } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  NEW: { label: "Новая", className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50" },
  APPROVED: { label: "Принята", className: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800/50" },
  SHIPPED: { label: "Отправлена", className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50" },
  DELIVERED: { label: "Доставлена", className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50" },
  CANCELLED: { label: "Отменена", className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50" },
};

const ORDER_FILTERS = [
  { value: "ALL", label: "Все" },
  { value: "NEW", label: "Новые" },
  { value: "APPROVED", label: "Принятые" },
  { value: "SHIPPED", label: "Отправленные" },
  { value: "DELIVERED", label: "Доставленные" },
  { value: "CANCELLED", label: "Отменённые" },
];

export function AdminClientProfileView() {
  const { selectedClientId, setView, selectOrder } = useAppStore();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderFilter, setOrderFilter] = useState("ALL");
  const { toast } = useToast();

  const fetchProfile = useCallback(async () => {
    if (!selectedClientId) return;
    try {
      setLoading(true);
      const data = await adminAPI.getClientProfile(selectedClientId);
      setProfile(data);
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить профиль клиента",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedClientId, toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleOrderClick = (orderId: string) => {
    selectOrder(orderId);
    // Need to go to admin order detail
    useAppStore.getState().setView("admin-order-detail");
  };

  const renderStatusBadge = (status: string) => {
    const s = STATUS_MAP[status] || { label: status, className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
    return (
      <Badge variant="outline" className={s.className}>
        {s.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold">Клиент не найден</h2>
        <Button variant="outline" onClick={() => setView("admin-dashboard")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
      </div>
    );
  }

  const { client, stats, orders } = profile;
  const filteredOrders = orderFilter === "ALL"
    ? orders
    : orders.filter((o) => o.status === orderFilter);

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setView("admin-dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <div>
            <h1 className="text-xl font-bold md:text-2xl">Профиль клиента</h1>
            <p className="text-sm text-muted-foreground">{client.name}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column — Client Info + Stats */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Card */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-orange-500" />
                Контактная информация
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 shrink-0 text-lg font-bold dark:bg-orange-900/30 dark:text-orange-400">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.role === "ADMIN" ? "Администратор" : "Клиент"}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium truncate">{client.email}</p>
                  </div>
                </div>

                {client.phone && (
                  <div className="flex items-start gap-2.5">
                    <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Телефон</p>
                      <p className="text-sm font-medium">{client.phone}</p>
                    </div>
                  </div>
                )}

                {client.city && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Город</p>
                      <p className="text-sm font-medium">{client.city}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2.5">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Регистрация</p>
                    <p className="text-sm font-medium">
                      {format(new Date(client.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Stats */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-500" />
                Финансы
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Потрачено всего</span>
                <span className="font-semibold">
                  {stats.totalSpent.toLocaleString("ru-RU")} ₽
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">На доставку</span>
                <span className="font-semibold">
                  {stats.totalDeliverySpent.toLocaleString("ru-RU")} ₽
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Средний чек</span>
                <span className="font-semibold">
                  {Math.round(stats.avgOrderValue).toLocaleString("ru-RU")} ₽
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Товаров доставлено</span>
                <span className="font-semibold">{stats.totalItems} шт.</span>
              </div>
            </CardContent>
          </Card>

          {/* Activity Stats */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-sky-500" />
                Активность
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Всего заявок</span>
                <span className="font-semibold">{stats.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Новых</span>
                <span className="font-semibold">{stats.newOrders}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">В работе</span>
                <span className="font-semibold">{stats.activeOrders}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Доставлено</span>
                <span className="font-semibold">{stats.deliveredOrders}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Отменено</span>
                <span className="font-semibold">{stats.cancelledOrders}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Сообщений</span>
                <span className="font-semibold">{stats.totalMessages}</span>
              </div>
              {stats.firstOrder && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Первая заявка</span>
                  <span className="font-medium">
                    {format(new Date(stats.firstOrder), "d MMM yyyy", { locale: ru })}
                  </span>
                </div>
              )}
              {stats.lastOrder && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Последняя заявка</span>
                  <span className="font-medium">
                    {format(new Date(stats.lastOrder), "d MMM yyyy", { locale: ru })}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column — Orders */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-orange-500" />
                Заявки клиента
                <span className="text-sm font-normal text-muted-foreground">
                  ({filteredOrders.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Order Filter */}
              <div className="mb-6 overflow-x-auto -mx-6 px-6">
                <Tabs value={orderFilter} onValueChange={setOrderFilter}>
                  <TabsList className="w-full sm:w-auto flex-wrap">
                    {ORDER_FILTERS.map((tab) => (
                      <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    {orderFilter === "ALL" ? "Нет заявок" : "Нет заявок с выбранным статусом"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
                  {filteredOrders.map((order) => (
                    <button
                      key={order.id}
                      onClick={() => handleOrderClick(order.id)}
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
                            {renderStatusBadge(order.status)}
                          </div>
                          <div className="mt-1.5 flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                            {order.storeName && (
                              <span className="truncate">{order.storeName}</span>
                            )}
                            {(order._count?.items ?? 0) > 0 && (
                              <span className="shrink-0">{(order._count?.items ?? 0)} товар(ов)</span>
                            )}
                            <span className="shrink-0">
                              {format(new Date(order.createdAt), "d MMM yyyy", { locale: ru })}
                            </span>
                            <span className="shrink-0 flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {order.quantity} шт.
                            </span>
                            {order.deliveryCity && (
                              <span className="shrink-0 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {order.deliveryCity}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0 flex items-center gap-3">
                          {order.totalPriceRUB ? (
                            <span className="font-semibold text-orange-600 dark:text-orange-400">
                              {order.totalPriceRUB.toLocaleString("ru-RU")} ₽
                            </span>
                          ) : order.itemPriceCNY ? (
                            <span className="text-sm font-medium text-muted-foreground">
                              {order.itemPriceCNY.toLocaleString("ru-RU")} CNY
                            </span>
                          ) : null}
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
