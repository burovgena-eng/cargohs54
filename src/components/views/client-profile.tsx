"use client";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppStore } from "@/stores/app-store";
import { profileAPI, type ProfileData } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export function ClientProfileView() {
  const { user, setView, setUser } = useAppStore();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await profileAPI.getProfile();
      setProfile(data);
      setName(data.name || "");
      setPhone(data.phone || "");
      setCity(data.city || "");
    } catch {
      // If the API fails, still show what we have from session
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Ошибка",
        description: "Имя обязательно для заполнения",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const updatedData = await profileAPI.updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        city: city.trim() || null,
      });

      setProfile(updatedData);
      setEditMode(false);

      // Update the user session in the store with new name and city
      if (user) {
        setUser(
          {
            ...user,
            name: updatedData.name,
            city: updatedData.city || undefined,
          },
          useAppStore.getState().token
        );
      }

      toast({
        title: "Профиль обновлён",
        description: "Ваши данные успешно сохранены",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Ошибка при сохранении";
      toast({
        title: "Ошибка",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Revert form fields to current profile
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone || "");
      setCity(profile.city || "");
    } else if (user) {
      setName(user.name);
      setCity(user.city || "");
      setPhone("");
    }
    setEditMode(false);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-muted-foreground text-sm">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setView("client-dashboard")}
          className="rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-700/60 shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Профиль</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Управление вашими данными
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 ring-2 ring-emerald-200 dark:ring-emerald-700 ring-offset-2 ring-offset-background shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 text-lg font-bold text-emerald-700 dark:text-emerald-300">
                  {getInitials(name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{name || "Пользователь"}</CardTitle>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            {!editMode ? (
              <Button
                onClick={() => setEditMode(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
              >
                Редактировать
              </Button>
            ) : (
              <div className="flex gap-2 shrink-0">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="border-border"
                >
                  Отмена
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {saving ? "Сохранение..." : "Сохранить"}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          <div className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4 text-muted-foreground" />
                Имя
              </Label>
              {editMode ? (
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Введите ваше имя"
                  maxLength={200}
                  className="max-w-md"
                />
              ) : (
                <p className="text-sm text-slate-700 dark:text-slate-300 ml-6">
                  {profile?.name || user?.name || "—"}
                </p>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Mail className="h-4 w-4" />
                Электронная почта
              </Label>
              <p className="text-sm text-slate-700 dark:text-slate-300 ml-6">
                {user?.email || "—"}
              </p>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-medium">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Телефон
              </Label>
              {editMode ? (
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  maxLength={20}
                  className="max-w-md"
                />
              ) : (
                <p className="text-sm text-slate-700 dark:text-slate-300 ml-6">
                  {profile?.phone || "Не указан"}
                </p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city" className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Город
              </Label>
              {editMode ? (
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Введите ваш город"
                  maxLength={100}
                  className="max-w-md"
                />
              ) : (
                <p className="text-sm text-slate-700 dark:text-slate-300 ml-6">
                  {profile?.city || user?.city || "Не указан"}
                </p>
              )}
            </div>

            {/* Registration Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Дата регистрации
              </Label>
              <p className="text-sm text-slate-700 dark:text-slate-300 ml-6">
                {profile?.createdAt
                  ? format(new Date(profile.createdAt), "d MMMM yyyy 'г.'", { locale: ru })
                  : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
