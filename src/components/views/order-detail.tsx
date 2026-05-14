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
  XCircle,
  User as UserIcon,
  Hash,
  Package,
  StickyNote,
  BadgeCheck,
  MapPin,
  PackageOpen,
  Trash2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAppStore } from "@/stores/app-store";
import { ordersAPI, type Order, type Message } from "@/lib/api";
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

export function OrderDetailView() {
  const { selectedOrderId, user, setView } = useAppStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const isAdmin = user?.role === "ADMIN";

  const fetchOrder = useCallback(async () => {
    if (!selectedOrderId) return;
    try {
      setLoading(true);
      const data = await ordersAPI.getOrder(selectedOrderId);
      setOrder(data);
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevMessageCountRef = useRef(0);

  const fetchMessages = useCallback(async () => {
    if (!selectedOrderId) return;
    try {
      const msgs = await ordersAPI.getMessages(selectedOrderId);
      // Only update if new messages arrived
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
    // Use firstChild to account for ScrollArea's inner viewport
    const scrollEl = el.querySelector("[data-radix-scroll-area-viewport]") as HTMLElement;
    if (scrollEl) {
      isAtBottomRef.current = scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight < 60;
    }
  }, []);

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

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    setCancelling(true);
    try {
      const updated = await ordersAPI.updateOrder(selectedOrderId, { status: "CANCELLED" });
      setOrder(updated);
      toast({
        title: "Заявка отменена",
        description: "Заявка успешно отменена",
      });
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось отменить заявку",
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
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
      setView(isAdmin ? "admin-dashboard" : "client-dashboard");
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
        <Button
          variant="outline"
          onClick={() => setView(isAdmin ? "admin-dashboard" : "client-dashboard")}
          className="mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Назад
        </Button>
      </div>
    );
  }

  const status = STATUS_MAP[order.status] || { label: order.status, className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" };

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => setView(isAdmin ? "admin-dashboard" : "client-dashboard")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Назад
      </Button>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left Column - Order Info */}
        <div className="lg:col-span-3 space-y-6">
          {/* Order Header */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
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
                {!isAdmin && order.status === "NEW" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleCancelOrder}
                    disabled={cancelling}
                    className="shrink-0"
                  >
                    {cancelling ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <XCircle className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Отменить
                  </Button>
                )}
                {order.status === "CANCELLED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(true)}
                    disabled={deleting}
                    className="shrink-0 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
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
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Description */}
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
                  {/* Image */}
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

                  {/* Store Info */}
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
                          <p className="text-xs text-muted-foreground">Ссылка на товар</p>
                          <a
                            href={order.storeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-orange-600 hover:underline truncate block dark:text-orange-400"
                          >
                            Открыть {order.storeName || "ссылку"}
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

          {/* Messages/Chat */}
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
                      <p className="text-xs text-muted-foreground">
                        Начните обсуждение по этой заявке
                      </p>
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

              {/* Message Input */}
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

        {/* Right Column - Sidebar Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pricing */}
          {(order.itemPriceCNY || order.deliveryPriceRUB || order.totalPriceRUB) && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-emerald-500" />
                  Стоимость
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.itemPriceCNY && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Цена товара</span>
                    <span className="text-sm font-semibold">
                      {order.itemPriceCNY.toLocaleString("ru-RU")} CNY
                    </span>
                  </div>
                )}
                {order.deliveryPriceRUB && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Доставка</span>
                    <span className="text-sm font-semibold">
                      {order.deliveryPriceRUB.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>
                )}
                {order.totalPriceRUB && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Итого</span>
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {order.totalPriceRUB.toLocaleString("ru-RU")} ₽
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Admin Notes */}
          {order.adminNote && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-amber-500" />
                  Заметка менеджера
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {order.adminNote}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Client Info (for admin) */}
          {isAdmin && order.user && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-orange-500" />
                  Информация о клиенте
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Имя</span>
                  <span className="text-sm font-medium">{order.user.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{order.user.email}</span>
                </div>
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
