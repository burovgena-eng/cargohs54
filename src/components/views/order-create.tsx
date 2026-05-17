"use client";

import { useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Package,
  LinkIcon,
  Store,
  ImageIcon,
  Loader2,
  CircleHelp,
  Lightbulb,
  Copy,
  ClipboardList,
  Truck,
  MessageSquare,
  CheckCircle2,
  Search,
  Upload,
  X,
  Camera,
  MapPin,
  Plus,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppStore } from "@/stores/app-store";
import { uploadAPI } from "@/lib/api";
import { proxyImageUrl } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const TIPS = {
  title: "Напишите название товара как можно точнее. Например: «Женская сумка из экокожи коричневая», «Мужские кроссовки 43 размер».",
  description: "Укажите детали: цвет, размер, материал, артикул. Чем подробнее — тем точнее мы найдём нужную позицию.",
  storeUrl: "Скопируйте URL из адресной строки браузера на странице товара в китайском магазине. Мы поддерживаем Taobao, 1688, Tmall, POIZON и другие.",
  storeName: "Укажите платформу: Taobao, 1688, Tmall, Pinduoduo, POIZON и т.д. Это помогает менеджеру быстрее обработать заявку.",
  quantity: "Укажите нужное количество. При заказе от 10 шт. возможна скидка от поставщика.",
  image: "Прикрепите фото товара — можно загрузить с устройства или вставить ссылку на изображение. Это поможет менеджеру точно идентифицировать товар.",
  deliveryCity: "Укажите город, куда доставить заказ. Это влияет на стоимость и срок доставки.",
};

interface ItemState {
  title: string;
  description: string;
  storeUrl: string;
  storeName: string;
  quantity: string;
  imageUrl: string;
  previewUrl: string | null;
  uploading: boolean;
  dragOver: boolean;
  imageLoading: boolean;
  imageError: boolean;
}

const createEmptyItem = (): ItemState => ({
  title: "",
  description: "",
  storeUrl: "",
  storeName: "",
  quantity: "1",
  imageUrl: "",
  previewUrl: null,
  uploading: false,
  dragOver: false,
  imageLoading: false,
  imageError: false,
});

function getActiveImageUrl(item: ItemState) {
  if (item.previewUrl) return item.previewUrl;
  if (item.imageUrl) return item.imageUrl;
  return null;
}

function getDisplayImageUrl(item: ItemState) {
  if (item.previewUrl) return item.previewUrl;
  if (item.imageUrl) return proxyImageUrl(item.imageUrl);
  return null;
}

function TipButton({ tip }: { tip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button type="button" className="text-muted-foreground hover:text-orange-500 transition-colors">
          <Lightbulb className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[300px] text-sm">
        <p>{tip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function ItemCard({
  index,
  item,
  onChange,
  onRemove,
  canRemove,
  onUploadClick,
}: {
  index: number;
  item: ItemState;
  onChange: (patch: Partial<ItemState>) => void;
  onRemove: () => void;
  canRemove: boolean;
  onUploadClick: () => void;
}) {
  const activeImageUrl = getActiveImageUrl(item);
  const displayImageUrl = getDisplayImageUrl(item);
  const isFromUrl = !!item.imageUrl && !item.previewUrl;

  const updateField = (field: keyof ItemState, value: string) => {
    onChange({ [field]: value });
  };

  return (
    <div className="relative rounded-xl border border-border/60 bg-card p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 text-xs font-bold dark:bg-orange-900/30 dark:text-orange-400">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            Товар {index + 1}
          </span>
        </div>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>
            Название товара <span className="text-destructive">*</span>
          </Label>
          <TipButton tip={TIPS.title} />
        </div>
        <div className="relative">
          <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Например: Женская сумка из экокожи коричневая"
            value={item.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="pl-10"
            required={index === 0}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>Описание</Label>
          <TipButton tip={TIPS.description} />
        </div>
        <Textarea
          placeholder="Цвет: чёрный, размер: L, материал: хлопок, артикул: SKU12345..."
          value={item.description}
          onChange={(e) => updateField("description", e.target.value)}
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Label>Ссылка на товар</Label>
          <TipButton tip={TIPS.storeUrl} />
        </div>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="url"
            placeholder="https://item.taobao.com/item.htm?id=..."
            value={item.storeUrl}
            onChange={(e) => updateField("storeUrl", e.target.value)}
            className="pl-10"
          />
        </div>
        {item.storeUrl && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Ссылка добавлена — менеджер сможет быстро найти товар
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label>Магазин / Платформа</Label>
            <TipButton tip={TIPS.storeName} />
          </div>
          <div className="relative">
            <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Taobao, 1688, Tmall..."
              value={item.storeName}
              onChange={(e) => updateField("storeName", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <Label>Количество</Label>
            <TipButton tip={TIPS.quantity} />
          </div>
          <div className="relative">
            <Layers className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateField("quantity", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Label>Фото товара</Label>
          <TipButton tip={TIPS.image} />
        </div>

        {!activeImageUrl && (
          <div
            className={`relative rounded-xl border-2 border-dashed transition-colors cursor-pointer ${
              item.dragOver
                ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20"
                : "border-muted-foreground/25 hover:border-orange-300 hover:bg-orange-50/30 dark:hover:bg-orange-950/10"
            } ${item.uploading ? "pointer-events-none opacity-60" : ""}`}
            onDragOver={(e) => { e.preventDefault(); onChange({ dragOver: true }); }}
            onDragLeave={() => onChange({ dragOver: false })}
            onClick={onUploadClick}
          >
            <div className="flex flex-col items-center justify-center gap-2 py-6 px-4">
              {item.uploading ? (
                <>
                  <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                  <p className="text-sm text-muted-foreground">Загрузка...</p>
                </>
              ) : (
                <>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      Перетащите фото сюда или{" "}
                      <span className="text-orange-600 dark:text-orange-400">выберите файл</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG, WebP, GIF до 5 МБ
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeImageUrl && !item.imageError && (
          <div className="space-y-2">
            <div className="relative rounded-xl border overflow-hidden group">
              {item.imageLoading && isFromUrl && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/80">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-6 w-6 text-orange-500 animate-spin" />
                    <p className="text-xs text-muted-foreground">Загрузка изображения...</p>
                  </div>
                </div>
              )}
              <img
                src={displayImageUrl!}
                alt="Фото товара"
                className="h-48 w-full object-cover"
                onLoad={() => onChange({ imageLoading: false, imageError: false })}
                onError={() => onChange({ imageLoading: false, imageError: true })}
              />
              <button
                type="button"
                onClick={() => onChange({ previewUrl: null, imageUrl: "", imageError: false, imageLoading: false })}
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={onUploadClick}
                disabled={item.uploading}
              >
                {item.uploading ? (
                  <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                ) : (
                  <Camera className="mr-1.5 h-3 w-3" />
                )}
                Загрузить другое
              </Button>
            </div>
          </div>
        )}

        {isFromUrl && item.imageError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/30 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 space-y-1.5">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                  Не удалось загрузить изображение
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  Проверьте ссылку или загрузите фото с устройства.
                  Некоторые сайты блокируют загрузку картинок.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400 hover:text-amber-300 dark:hover:bg-amber-900/30 shrink-0"
                onClick={() => onChange({ previewUrl: null, imageUrl: "", imageError: false, imageLoading: false })}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
                onClick={onUploadClick}
              >
                <Upload className="mr-1.5 h-3 w-3" />
                Загрузить с устройства
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => onChange({ imageError: false, imageLoading: true })}
              >
                Попробовать снова
              </Button>
            </div>
          </div>
        )}

        <div className="relative">
          <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Или вставьте ссылку на фото (https://...)"
            value={item.imageUrl}
            onChange={(e) => {
              const val = e.target.value;
              onChange({
                imageUrl: val,
                previewUrl: val ? null : item.previewUrl,
                imageError: false,
                imageLoading: false,
              });
            }}
            onBlur={(e) => {
              if (e.target.value.trim()) onChange({ imageLoading: true, imageError: false });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const val = (e.target as HTMLInputElement).value.trim();
                if (val) onChange({ imageLoading: true, imageError: false });
              }
            }}
            className="pl-10 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

export function OrderCreateView() {
  const { setView, selectOrder, user } = useAppStore();
  const [items, setItems] = useState<ItemState[]>([createEmptyItem()]);
  const [deliveryCity, setDeliveryCity] = useState("");
  const [sameAsHome, setSameAsHome] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [activeUploadIdx, setActiveUploadIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (file: File, idx: number) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Неверный формат", description: "Допускаются JPG, PNG, WebP, GIF", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Файл слишком большой", description: "Максимальный размер — 5 МБ", variant: "destructive" });
      return;
    }

    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, uploading: true } : it)));
    const blobUrl = URL.createObjectURL(file);

    try {
      const { url } = await uploadAPI.uploadImage(file);
      setItems((prev) =>
        prev.map((it, i) =>
          i === idx ? { ...it, previewUrl: blobUrl, imageUrl: url, uploading: false, imageError: false, imageLoading: false } : it
        )
      );
      toast({ title: "Фото загружено", description: "Изображение прикреплено к заявке" });
    } catch (err) {
      URL.revokeObjectURL(blobUrl);
      setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, uploading: false } : it)));
      toast({
        title: "Ошибка загрузки",
        description: err instanceof Error ? err.message : "Не удалось загрузить файл",
        variant: "destructive",
      });
    }
  }, [toast]);

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUploadIdx !== null) handleFileUpload(file, activeUploadIdx);
    if (e.target) e.target.value = "";
    setActiveUploadIdx(null);
  };

  const triggerUpload = (idx: number) => {
    setActiveUploadIdx(idx);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleItemDrop = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file, idx);
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, dragOver: false } : it)));
  };

  const updateItem = (idx: number, patch: Partial<ItemState>) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[order-create] handleSubmit called");

    if (!items[0].title.trim()) {
      toast({ title: "Заполните название товара", description: "Название первого товара обязательно", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const store = useAppStore.getState();
      const token = store.token;

      if (!token) {
        toast({ title: "Ошибка", description: "Вы не авторизованы. Войдите заново.", variant: "destructive" });
        store.logout();
        return;
      }

      const mappedItems = items
        .filter((it) => it.title.trim())
        .map((it) => ({
          title: it.title.trim(),
          description: it.description.trim() || undefined,
          storeUrl: it.storeUrl.trim() || undefined,
          storeName: it.storeName.trim() || undefined,
          quantity: parseInt(it.quantity) || 1,
          imageUrl: it.imageUrl || undefined,
        }));

      if (mappedItems.length === 0) {
        toast({ title: "Заполните название товара", variant: "destructive" });
        return;
      }

      console.log("[order-create] Sending order:", JSON.stringify(mappedItems));

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: mappedItems,
          deliveryCity: deliveryCity.trim() || undefined,
        }),
      });

      console.log("[order-create] Response status:", res.status);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Ошибка сервера" }));
        if (res.status === 401) {
          toast({ title: "Сессия истекла", description: "Войдите заново", variant: "destructive" });
          store.logout();
          return;
        }
        throw new Error(err.error || `Ошибка ${res.status}`);
      }

      const order = await res.json();

      toast({ title: "Заявка создана!", description: "Мы рассмотрим вашу заявку в ближайшее время" });
      selectOrder(order.id);
      setView("order-detail");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ошибка при создании заявки";
      console.error("[order-create] Error:", message);
      toast({ title: "Ошибка", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onFileInputChange}
          className="hidden"
        />

        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => setView("client-dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад к заявкам
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGuide(true)}
            className="gap-1.5 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700 dark:text-orange-400 dark:border-orange-800/50 dark:hover:bg-orange-950/30 dark:hover:text-orange-300"
          >
            <CircleHelp className="h-4 w-4" />
            Инструкция
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">Новая заявка</CardTitle>
                <CardDescription>
                  Добавьте один или несколько товаров для выкупа
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    onDragOver={(e) => { e.preventDefault(); updateItem(idx, { dragOver: true }); }}
                    onDragLeave={() => updateItem(idx, { dragOver: false })}
                    onDrop={(e) => handleItemDrop(e, idx)}
                  >
                    <ItemCard
                      index={idx}
                      item={item}
                      onChange={(patch) => updateItem(idx, patch)}
                      onRemove={() => removeItem(idx)}
                      canRemove={items.length > 1}
                      onUploadClick={() => triggerUpload(idx)}
                    />
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed border-2 border-border/60 hover:border-orange-300 hover:bg-orange-50/50 hover:text-orange-600 dark:hover:border-orange-700 dark:hover:bg-orange-950/20 dark:hover:text-orange-400 transition-colors gap-2"
                onClick={addItem}
              >
                <Plus className="h-4 w-4" />
                Добавить товар
              </Button>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Label>Город доставки</Label>
                  <TipButton tip={TIPS.deliveryCity} />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Город, куда доставить заказ"
                    value={deliveryCity}
                    onChange={(e) => {
                      setDeliveryCity(e.target.value);
                      if (!e.target.value) setSameAsHome(false);
                    }}
                    className="pl-10"
                  />
                </div>
                {user?.city && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={sameAsHome}
                      onChange={(e) => {
                        setSameAsHome(e.target.checked);
                        setDeliveryCity(e.target.checked ? user.city! : "");
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 dark:border-gray-600"
                    />
                    <span className="text-sm text-muted-foreground">
                      Привезти в город проживания
                      {user.city && (
                        <span className="font-medium text-foreground"> ({user.city})</span>
                      )}
                    </span>
                  </label>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <Button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-11"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Создание...
                    </>
                  ) : (
                    "Создать заявку"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setView("client-dashboard")}
                  className="h-11"
                >
                  Отмена
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <InstructionDialog open={showGuide} onOpenChange={setShowGuide} />
      </div>
    </TooltipProvider>
  );
}

function InstructionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
              <CircleHelp className="h-5 w-5" />
            </div>
            Как оформить заявку
          </DialogTitle>
          <DialogDescription>
            Пошаговая инструкция по созданию заявки на выкуп товара из Китая
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white text-sm font-bold">
              1
            </div>
            <div className="space-y-1.5">
              <h4 className="font-semibold text-sm flex items-center gap-1.5">
                <Search className="h-4 w-4 text-orange-500" />
                Найдите товар на китайской площадке
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Перейдите на один из маркетплейсов и найдите нужный товар через поиск.
                Мы работаем с&nbsp;
                <strong>Taobao</strong>, <strong>1688</strong>, <strong>Tmall</strong>,
                <strong>POIZON</strong>, <strong>Pinduoduo</strong> и другими.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white text-sm font-bold">
              2
            </div>
            <div className="space-y-1.5">
              <h4 className="font-semibold text-sm flex items-center gap-1.5">
                <Copy className="h-4 w-4 text-orange-500" />
                Скопируйте ссылку на товар
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Откройте страницу товара и скопируйте ссылку из адресной строки браузера.
                Это будет выглядеть примерно так:
              </p>
              <div className="rounded-lg bg-muted p-2.5 text-xs font-mono break-all text-muted-foreground">
                https://item.taobao.com/item.htm?id=712345678901
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white text-sm font-bold">
              3
            </div>
            <div className="space-y-1.5">
              <h4 className="font-semibold text-sm flex items-center gap-1.5">
                <ClipboardList className="h-4 w-4 text-orange-500" />
                Заполните форму заявки
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                    <span>
                      <strong className="text-foreground">Название</strong> — что это за товар (сумка, обувь, одежда и т.д.)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                    <span>
                      <strong className="text-foreground">Описание</strong> — цвет, размер, материал, особенности
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                    <span>
                      <strong className="text-foreground">Ссылка</strong> — вставьте скопированный URL
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                    <span>
                      <strong className="text-foreground">Фото</strong> — загрузите фото с устройства или вставьте ссылку
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                    <span>
                      <strong className="text-foreground">Магазин</strong> — укажите платформу (Taobao, 1688 и т.д.)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-400" />
                    <span>
                      <strong className="text-foreground">Количество</strong> — сколько штук нужно
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white text-sm font-bold">
              4
            </div>
            <div className="space-y-1.5">
              <h4 className="font-semibold text-sm flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-orange-500" />
                Дождитесь ответа менеджера
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Мы проверим товар, рассчитаем точную стоимость (цена товара + доставка до вас)
                и напишем в чате заявки. Обычно отвечаем в течение <strong>1–2 часов</strong> в рабочее время.
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-500 text-white text-sm font-bold">
              5
            </div>
            <div className="space-y-1.5">
              <h4 className="font-semibold text-sm flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-orange-500" />
                Получите свой заказ
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                После оплаты мы закупим товар, проверим качество и отправим к вам.
                Средний срок доставки — <strong>15–25 дней</strong>.
                Все статусы отображаются в личном кабинете.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-orange-50 border border-orange-200 dark:bg-orange-950/30 dark:border-orange-800/50 p-4">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-300 flex items-center gap-1.5 mb-1">
              <Lightbulb className="h-4 w-4" />
              Совет
            </p>
            <p className="text-sm text-orange-700 dark:text-orange-400 leading-relaxed">
              Нет ссылки на товар? Не проблема! Просто опишите что нужно в названии и описании,
              приложите фото — наши менеджеры сами найдут лучшие варианты на китайских площадках.
              Вы можете добавить несколько товаров в одну заявку.
            </p>
          </div>

          <Button
            onClick={() => onOpenChange(false)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            Понятно, перейти к заявке
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
