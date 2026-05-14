"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Calendar,
  Store,
  ExternalLink,
  MessageSquare,
  Send,
  Loader2,
  Package,
  StickyNote,
  Receipt,
  ListChecks,
  Hash,
  Save,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
  MapPin,
  PackageOpen,
  Trash2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/stores/app-store";
import { ordersAPI, adminAPI, type Order, type Message, type ClientStats } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { proxyImageUrl, isSafeUrl } from "@/lib/utils";
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

const STATUS_OPTIONS = [
  { value: "NEW", label: "Новая" },
  { value: "APPROVED", label: "Принята" },
  { value: "SHIPPED", label: "Отправлена" },
  { value: "DELIVERED", label: "Доставлена" },
  { value: "CANCELLED", label: "Отменена" },
];

export function AdminOrderDetailView() {
  const { selectedOrderId, user, setView, selectClient } = useAppStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [editStatus, setEditStatus] = useState("");
  const [editItemPriceCNY, setEditItemPriceCNY] = useState("");
  const [editDeliveryPriceRUB, setEditDeliveryPriceRUB] = useState("");
  const [editTotalPriceRUB, setEditTotalPriceRUB] = useState("");
  const [editAdminNote, setEditAdminNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Warn about unsaved changes before leaving
  useEffect(() => {
    if (!hasChanges) {
      window.onbeforeunload = null;
      return;
    }
    window.onbeforeunload = () => true;
    return () => { window.onbeforeunload = null; };
  }, [hasChanges]);

  // Per-item pricing state (for multi-item orders)
  const [editItemPrices, setEditItemPrices] = useState<Record<string, {
    itemPriceCNY: string;
    deliveryPriceRUB: string;
    totalPriceRUB: string;
  }>>({});

  // Client stats
  const [showClientStats, setShowClientStats] = useState(false);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [loadingClientStats, setLoadingClientStats] = useState(false);

  // Delete
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);
  const { toast } = useToast();

  const fetchOrder = useCallback(async () => {
    if (!selectedOrderId) return;
    try {
      setLoading(true);
      const data = await ordersAPI.getOrder(selectedOrderId);
      setOrder(data);
      setEditStatus(data.status);
      setEditItemPriceCNY(data.itemPriceCNY?.toString() || "");
      setEditDeliveryPriceRUB(data.deliveryPriceRUB?.toString() || "");
      setEditTotalPriceRUB(data.totalPriceRUB?.toString() || "");
      setEditAdminNote(data.adminNote || "");
      // Initialize per-item prices
      if (data.items && data.items.length > 0) {
        const prices: Record<string, { itemPriceCNY: string; deliveryPriceRUB: string; totalPriceRUB: string }> = {};
        for (const item of data.items) {
          prices[item.id] = {
            itemPriceCNY: item.itemPriceCNY?.toString() || "",
            deliveryPriceRUB: item.deliveryPriceRUB?.toString() || "",
            totalPriceRUB: item.totalPriceRUB?.toString() || "",
          };
        }
        setEditItemPrices(prices);
      } else {
        setEditItemPrices({});
      }
      setHasChanges(false);

      const msgs = await ordersAPI.getMessages(selectedOrderId);
      setMessages(msgs);
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить заявку",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedOrderId, toast]);

  // Poll for new messages every 5 seconds
  const fetchMessages = useCallback(async () => {
    if (!selectedOrderId) return;
    try {
      const msgs = await ordersAPI.getMessages(selectedOrderId);
      if (msgs.length !== prevMessageCountRef.current) {
        prevMessageCountRef.current = msgs.length;
        setMessages(msgs);
      }
    } catch {
      // Silent fail for polling
    }
  }, [selectedOrderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Start polling after initial load
  useEffect(() => {
    if (!selectedOrderId || loading) return;
    prevMessageCountRef.current = messages.length;
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [selectedOrderId, loading, messages.length, fetchMessages]);

  useEffect(() => {
    if (isAtBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Track if user is at bottom of chat
  const handleChatScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const scrollEl = el.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement;
    if (scrollEl) {
      isAtBottomRef.current = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 60;
    }
  }, []);

  // Track changes
  useEffect(() => {
    if (!order) return;
    const changed =
      editStatus !== order.status ||
      editItemPriceCNY !== (order.itemPriceCNY?.toString() || "") ||
      editDeliveryPriceRUB !== (order.deliveryPriceRUB?.toString() || "") ||
      editTotalPriceRUB !== (order.totalPriceRUB?.toString() || "") ||
      editAdminNote !== (order.adminNote || "");

    // Also check item-level price changes
    let itemPricesChanged = false;
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        const edited = editItemPrices[item.id];
        if (!edited) continue;
        if (
          edited.itemPriceCNY !== (item.itemPriceCNY?.toString() || "") ||
          edited.deliveryPriceRUB !== (item.deliveryPriceRUB?.toString() || "") ||
          edited.totalPriceRUB !== (item.totalPriceRUB?.toString() || "")
        ) {
          itemPricesChanged = true;
          break;
        }
      }
    }

    setHasChanges(changed || itemPricesChanged);
  }, [editStatus, editItemPriceCNY, editDeliveryPriceRUB, editTotalPriceRUB, editAdminNote, editItemPrices, order]);

  const handleSave = async () => {
    if (!selectedOrderId || !hasChanges) return;
    setSaving(true);
    try {
      const updateData: Partial<Order> = {};
      if (editStatus !== order?.status) updateData.status = editStatus;
      if (editItemPriceCNY !== (order?.itemPriceCNY?.toString() || "")) {
        updateData.itemPriceCNY = editItemPriceCNY ? parseFloat(editItemPriceCNY) : null;
      }
      if (editDeliveryPriceRUB !== (order?.deliveryPriceRUB?.toString() || "")) {
        updateData.deliveryPriceRUB = editDeliveryPriceRUB ? parseFloat(editDeliveryPriceRUB) : null;
      }
      if (editTotalPriceRUB !== (order?.totalPriceRUB?.toString() || "")) {
        updateData.totalPriceRUB = editTotalPriceRUB ? parseFloat(editTotalPriceRUB) : null;
      }
      if (editAdminNote !== (order?.adminNote || "")) {
        updateData.adminNote = editAdminNote || null;
      }

      // Include per-item price updates
      if (order?.items && order.items.length > 0) {
        const itemsData = order.items.map((item) => {
          const edited = editItemPrices[item.id];
          return {
            id: item.id,
            itemPriceCNY: edited ? (edited.itemPriceCNY ? parseFloat(edited.itemPriceCNY) : null) : item.itemPriceCNY,
            deliveryPriceRUB: edited ? (edited.deliveryPriceRUB ? parseFloat(edited.deliveryPriceRUB) : null) : item.deliveryPriceRUB,
            totalPriceRUB: edited ? (edited.totalPriceRUB ? parseFloat(edited.totalPriceRUB) : null) : item.totalPriceRUB,
          };
        });
        (updateData as Record<string, unknown>).items = itemsData;
      }

      const updated = await ordersAPI.updateOrder(selectedOrderId, updateData);
      setOrder(updated);
      setHasChanges(false);
      toast({
        title: "Сохранено",
        description: "Изменения успешно сохранены",
      });
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить изменения",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedOrderId) return;
    setSending(true);
    try {
      const newMsg = await ordersAPI.sendMessage(selectedOrderId, messageText.trim());
      setMessages((prev) => [...prev, newMsg]);
      setMessageText("");
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleToggleClientStats = async () => {
    if (showClientStats) {
      setShowClientStats(false);
      return;
    }
    if (!order?.userId || clientStats) {
      setShowClientStats(true);
      return;
    }
    setLoadingClientStats(true);
    setShowClientStats(true);
    try {
      const data = await adminAPI.getClientStats(order.userId);
      setClientStats(data);
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить статистику клиента",
        variant: "destructive",
      });
      setShowClientStats(false);
    } finally {
      setLoadingClientStats(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrderId) return;
    setDeleting(true);
    try {
      await ordersAPI.deleteOrder(selectedOrderId);
      toast({
        title: "Заявка удалена",
        description: "Отменённая заявка успешно удалена",
      });
      setView("admin-dashboard");
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить заявку",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold">Заявка не найдена</h2>
        <Button variant="outline" onClick={() => setView("admin-dashboard")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
      </div>
    );
  }

  const status = STATUS_MAP[order.status] || { label: order.status, className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };

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
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold md:text-2xl">Управление заявкой</h1>
              {order.orderNumber && (
                <span className="hidden sm:inline-flex items-center gap-1 font-mono text-sm rounded-md px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50">
                  <Hash className="h-3.5 w-3.5" />
                  {order.orderNumber}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{order.title}</p>
          </div>
        </div>
        {hasChanges && (
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-500 hover:bg-orange-600 text-white shadow-md"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Сохранить
          </Button>
        )}
        {order.status === "CANCELLED" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={deleting}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
          >
            {deleting ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Удалить
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column */}
        <div className="lg:col-span-3 space-y-6">
          {/* Order Info */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                  <Package className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{order.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {order.orderNumber && (
                      <Badge variant="outline" className="font-mono text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50">
                        <Hash className="mr-1 h-3 w-3" />
                        {order.orderNumber}
                      </Badge>
                    )}
                    <Badge variant="outline" className={status.className}>
                      {status.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Описание</p>
                  <p className="text-sm">{order.description}</p>
                </div>
              )}

              {/* Items List (multi-item orders) */}
              {order.items && order.items.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
                      <PackageOpen className="h-4 w-4" />
                      Товары ({order.items.length})
                    </p>
                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex gap-3 rounded-lg border p-3 bg-muted/30 dark:bg-muted/10"
                        >
                          {item.imageUrl ? (
                            <div className="h-16 w-16 shrink-0 rounded-md overflow-hidden bg-muted">
                              <img
                                src={proxyImageUrl(item.imageUrl)}
                                alt={item.title}
                                loading="lazy"
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = "none";
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-16 w-16 shrink-0 rounded-md bg-muted flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            {item.description && (
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                            )}
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                              <span>{item.quantity} шт.</span>
                              {item.storeName && <span>Магазин: {item.storeName}</span>}
                              {item.totalPriceRUB && (
                                <span className="font-medium text-orange-600 dark:text-orange-400">
                                  {item.totalPriceRUB.toLocaleString("ru-RU")} ₽
                                </span>
                              )}
                              {item.itemPriceCNY && !item.totalPriceRUB && (
                                <span className="font-medium">
                                  {item.itemPriceCNY.toLocaleString("ru-RU")} CNY
                                </span>
                              )}
                            </div>
                            {item.storeUrl && isSafeUrl(item.storeUrl) && (
                              <a
                                href={item.storeUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1 inline-flex items-center gap-1 text-xs text-orange-600 hover:underline dark:text-orange-400"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Открыть товар
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Store Info (legacy single-item) */}
              {(!order.items || order.items.length === 0) && (
                <>
                  {order.imageUrl && (
                    <div className="rounded-lg border overflow-hidden">
                      <img
                        src={proxyImageUrl(order.imageUrl)}
                        alt={order.title}
                        loading="lazy"
                        className="h-48 w-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {order.storeName && (
                      <div className="flex items-start gap-2">
                        <Store className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">Магазин</p>
                          <p className="text-sm font-medium">{order.storeName}</p>
                        </div>
                      </div>
                    )}
                    {order.storeUrl && isSafeUrl(order.storeUrl) && (
                      <div className="flex items-start gap-2">
                        <ExternalLink className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Ссылка</p>
                          <a
                            href={order.storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-orange-600 hover:underline truncate block dark:text-orange-400"
                          >
                            Открыть
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <Layers className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Количество</p>
                        <p className="text-sm font-medium">{order.quantity} шт.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Order metadata (always show) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Создана</p>
                    <p className="text-sm font-medium">
                      {format(new Date(order.createdAt), "d MMM yyyy, HH:mm", { locale: ru })}
                    </p>
                  </div>
                </div>
                {order.deliveryCity && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Город доставки</p>
                      <p className="text-sm font-medium">{order.deliveryCity}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Messages */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                Сообщения ({messages.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[350px] pr-1" onScrollCapture={handleChatScroll}>
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Нет сообщений</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMyMessage = msg.senderId === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                              isMyMessage
                                ? "bg-orange-500 text-white rounded-br-md"
                                : "bg-muted rounded-bl-md"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-semibold ${isMyMessage ? "text-white/90" : "text-foreground"}`}>
                                {msg.user.name}
                              </span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] px-1 py-0 ${
                                  isMyMessage
                                    ? msg.user.role === "ADMIN"
                                      ? "border-orange-300 text-orange-300"
                                      : "border-white/30 text-white/70"
                                    : msg.user.role === "ADMIN"
                                      ? "border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-400"
                                      : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-400"
                                }`}
                              >
                                {msg.user.role === "ADMIN" ? "Менеджер" : "Клиент"}
                              </Badge>
                            </div>
                            <p className="text-sm leading-relaxed">{msg.text}</p>
                            <p className={`text-[10px] mt-1 ${isMyMessage ? "text-white/70" : "text-muted-foreground"}`}>
                              {format(new Date(msg.createdAt), "d MMM, HH:mm", { locale: ru })}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder="Введите сообщение..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={sending || !messageText.trim()}
                  className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Admin Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status */}
          <Card className="shadow-sm border-orange-200 dark:border-orange-800/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ListChecks className="h-4 w-4 text-orange-500" />
                Управление статусом
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Статус заявки</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Receipt className="h-4 w-4 text-emerald-500" />
                Стоимость
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Multi-item pricing */}
              {order.items && order.items.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {order.items.map((item) => {
                    const prices = editItemPrices[item.id] || { itemPriceCNY: "", deliveryPriceRUB: "", totalPriceRUB: "" };
                    const updatePrice = (field: "itemPriceCNY" | "deliveryPriceRUB" | "totalPriceRUB", value: string) => {
                      setEditItemPrices((prev) => ({
                        ...prev,
                        [item.id]: { ...prev[item.id], [field]: value },
                      }));
                    };
                    return (
                      <div key={item.id} className="space-y-3 rounded-lg border p-3 bg-muted/30 dark:bg-muted/10">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Цена товара (CNY)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={prices.itemPriceCNY}
                              onChange={(e) => updatePrice("itemPriceCNY", e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Доставка (RUB)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={prices.deliveryPriceRUB}
                              onChange={(e) => updatePrice("deliveryPriceRUB", e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Итого (RUB)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={prices.totalPriceRUB}
                              onChange={(e) => updatePrice("totalPriceRUB", e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  {/* Legacy single-item pricing */}
                  <div className="space-y-2">
                    <Label htmlFor="itemPriceCNY">Цена товара (CNY)</Label>
                    <Input
                      id="itemPriceCNY"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={editItemPriceCNY}
                      onChange={(e) => setEditItemPriceCNY(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryPriceRUB">Доставка (RUB)</Label>
                    <Input
                      id="deliveryPriceRUB"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={editDeliveryPriceRUB}
                      onChange={(e) => setEditDeliveryPriceRUB(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalPriceRUB">Итого (RUB)</Label>
                    <Input
                      id="totalPriceRUB"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={editTotalPriceRUB}
                      onChange={(e) => setEditTotalPriceRUB(e.target.value)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Admin Notes */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-amber-500" />
                Заметка менеджера
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Внутренняя заметка (видна клиенту)"
                value={editAdminNote}
                onChange={(e) => setEditAdminNote(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Client Info + Stats */}
          {order.user && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-sky-500" />
                    <button
                      onClick={() => selectClient(order.userId)}
                      className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                    >
                      Клиент
                    </button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                    onClick={handleToggleClientStats}
                  >
                    Статистика
                    {showClientStats ? (
                      <ChevronUp className="ml-1 h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="ml-1 h-3.5 w-3.5" />
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Имя</span>
                  <button
                    onClick={() => selectClient(order.userId)}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    {order.user.name}
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <button
                    onClick={() => selectClient(order.userId)}
                    className="text-sm font-medium text-orange-600 hover:text-orange-700 hover:underline text-right truncate max-w-[200px] dark:text-orange-400 dark:hover:text-orange-300"
                  >
                    {order.user.email}
                  </button>
                </div>

                {/* Expanded Client Stats */}
                {showClientStats && (
                  <>
                    <Separator className="my-3" />

                    {loadingClientStats ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                        <span className="ml-2 text-sm text-muted-foreground">Загрузка...</span>
                      </div>
                    ) : clientStats ? (
                      <div className="space-y-4">
                        {/* Contact Details */}
                        <div className="space-y-2">
                          {clientStats.client.phone && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Телефон</span>
                              <span className="text-sm font-medium">{clientStats.client.phone}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Регистрация</span>
                            <span className="text-sm font-medium">
                              {format(new Date(clientStats.client.createdAt), "d MMM yyyy", { locale: ru })}
                            </span>
                          </div>
                        </div>

                        <Separator />

                        {/* Financial Stats */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Потрачено всего</span>
                            <span className="font-semibold">
                              {clientStats.stats.totalSpent.toLocaleString("ru-RU")} ₽
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">На доставку</span>
                            <span className="font-semibold">
                              {clientStats.stats.totalDeliverySpent.toLocaleString("ru-RU")} ₽
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Средний чек</span>
                            <span className="font-semibold">
                              {Math.round(clientStats.stats.avgOrderValue).toLocaleString("ru-RU")} ₽
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Товаров доставлено</span>
                            <span className="font-semibold">{clientStats.stats.totalItems} шт.</span>
                          </div>
                        </div>

                        {/* Recent Orders */}
                        {clientStats.recentOrders.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Последние заявки
                              </p>
                              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {clientStats.recentOrders.map((ro) => {
                                  const s = STATUS_MAP[ro.status] || { label: ro.status, className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };
                                  const isCurrentOrder = ro.id === order?.id;
                                  return (
                                    <button
                                      key={ro.id}
                                      onClick={() => {
                                        if (!isCurrentOrder) {
                                          selectOrder(ro.id);
                                          useAppStore.getState().setView("admin-order-detail");
                                          setShowClientStats(false);
                                        }
                                      }}
                                      disabled={isCurrentOrder}
                                      className={`w-full flex items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                                        isCurrentOrder
                                          ? "bg-orange-50 border border-orange-200 cursor-default dark:bg-orange-950/30 dark:border-orange-800/50"
                                          : "hover:bg-muted cursor-pointer"
                                      }`}
                                    >
                                      <span className="truncate flex-1 font-medium">{ro.title}</span>
                                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${s.className}`}>
                                        {s.label}
                                      </Badge>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Не удалось загрузить статистику
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Trash2 className="h-5 w-5" />
              Удалить заявку?
            </DialogTitle>
            <DialogDescription>
              {order.orderNumber ? `Заявка #${order.orderNumber} будет удалена безвозвратно.` : "Эта заявка будет удалена безвозвратно."}
              Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteOrder}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Удаление...
                </>
              ) : (
                "Удалить"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
