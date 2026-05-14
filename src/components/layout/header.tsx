"use client";

import { useState } from "react";
import {
  Package,
  Menu,
  LogIn,
  UserPlus,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  PlusCircle,
  ClipboardList,
  User,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAppStore } from "@/stores/app-store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Header() {
  const { user, setView, logout } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAuthenticated = !!user;

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
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

  const navLinks = user?.role === "ADMIN"
    ? [
        { label: "Панель управления", onClick: () => { setView("admin-dashboard"); setMobileOpen(false); } },
      ]
    : [
        { label: "Мои заявки", onClick: () => { setView("client-dashboard"); setMobileOpen(false); } },
        { label: "Создать заявку", onClick: () => { setView("order-create"); setMobileOpen(false); } },
      ];

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-light">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* ── Logo ── */}
          <button
            onClick={() => setView("landing")}
            className="group flex items-center gap-2.5 transition-all hover:scale-[1.02]"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-105">
              <Package className="h-5 w-5" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Cargo
              </span>
              <span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                HS54
              </span>
            </div>
          </button>

          {/* ── Desktop Navigation ── */}
          <nav className="hidden items-center gap-1 md:flex">
            {isAuthenticated &&
              navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.onClick}
                  className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 transition-all hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400"
                >
                  {link.label}
                </button>
              ))}
          </nav>

          {/* ── Desktop Auth + Theme ── */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {!isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setView("login")}
                  className="rounded-lg px-4 text-sm font-medium text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-200/60 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <LogIn className="mr-1.5 h-4 w-4" />
                  Войти
                </Button>
                <Button
                  size="sm"
                  onClick={() => setView("register")}
                  className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:brightness-110"
                >
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Регистрация
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-all hover:bg-slate-200/60 dark:hover:bg-slate-700/60"
                  >
                    <Avatar className="h-8 w-8 ring-2 ring-emerald-200 dark:ring-emerald-700 ring-offset-2 ring-offset-background">
                      <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium sm:inline">
                      {user?.name}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                      {user?.role === "ADMIN" && (
                        <span className="mt-1 inline-flex w-fit rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50">
                          Администратор
                        </span>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user?.role === "CLIENT" && (
                    <>
                      <DropdownMenuItem onClick={() => setView("client-dashboard")}>
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Мои заявки
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setView("order-create")}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Создать заявку
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setView("profile")}>
                        <User className="mr-2 h-4 w-4" />
                        Профиль
                      </DropdownMenuItem>
                    </>
                  )}
                  {user?.role === "ADMIN" && (
                    <DropdownMenuItem onClick={() => setView("admin-dashboard")}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Панель управления
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} variant="destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Выйти
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* ── Mobile Menu ── */}
          <div className="flex md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-lg">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Открыть меню</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[300px] gap-0 p-0 sm:w-[360px]"
              >
                {/* Sheet header */}
                <SheetHeader className="border-b border-border px-6 py-5">
                  <SheetTitle className="flex items-center gap-2.5">
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                      <Package className="h-4 w-4" />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        Cargo
                      </span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        HS54
                      </span>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                {/* Sheet body */}
                <div className="flex flex-1 flex-col px-4 py-4">
                  {isAuthenticated ? (
                    <>
                      {/* User info card */}
                      <div className="mb-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-4 border border-emerald-100 dark:border-emerald-800/40">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-11 w-11 ring-2 ring-emerald-200 dark:ring-emerald-700">
                            <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/40 dark:to-emerald-800/40 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                              {getInitials(user?.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                              {user?.name}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Nav links */}
                      <div className="flex flex-col gap-1">
                        {navLinks.map((link) => (
                          <button
                            key={link.label}
                            onClick={link.onClick}
                            className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 transition-all hover:bg-emerald-500/10 hover:text-emerald-700 dark:hover:text-emerald-400"
                          >
                            {link.label}
                          </button>
                        ))}
                      </div>

                      {/* Separator */}
                      <div className="my-3 h-px w-full bg-border" />

                      {/* Logout */}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-red-500/80 transition-all hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Выйти
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-xl px-4 py-6 text-sm font-medium text-slate-600 dark:text-slate-300 transition-all hover:bg-slate-200/60 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-slate-100"
                        onClick={() => {
                          setView("login");
                          setMobileOpen(false);
                        }}
                      >
                        <LogIn className="mr-2.5 h-4 w-4" />
                        Войти
                      </Button>
                      <Button
                        className="w-full justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 py-6 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
                        onClick={() => {
                          setView("register");
                          setMobileOpen(false);
                        }}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Регистрация
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
