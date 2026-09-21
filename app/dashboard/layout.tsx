"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tags,
  Award,
  Layers3,
  LogOut,
  Store,
  ChevronRight,
} from "lucide-react";
import { ReactNode } from "react";
import { useAuth } from "@/lib/auth";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Produk",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    name: "Kategori",
    href: "/dashboard/categories",
    icon: Tags,
  },
  {
    name: "Brand",
    href: "/dashboard/brands",
    icon: Award,
  },
  {
    name: "Jenis Produk",
    href: "/dashboard/product-types",
    icon: Layers3,
  },
];

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">

          {/* Logo */}
          <div className="flex h-20 items-center border-b border-slate-100 px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Store className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold tracking-tight text-slate-900">
                  Digital Price
                </p>

                <p className="text-xs text-slate-400">
                  Catalog
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">

            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Menu Utama
            </p>

            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;

                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-slate-700"
                      }`}
                    />

                    <span>{item.name}</span>

                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4" />
                    )}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Section */}
          <div className="border-t border-slate-100 p-4">

            <div className="mb-3 rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {user?.name}
                  </p>

                  <p className="truncate text-xs text-slate-400">
                    {user?.tenant?.name}
                  </p>
                </div>

              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" />

              <span>Keluar</span>
            </button>

          </div>
        </aside>

        {/* Main Content */}
        <main className="min-w-0 flex-1 lg:pl-64">

          {/* Topbar */}
          <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur lg:px-8">

            <div>
              <p className="text-xs font-medium text-slate-400">
                {user?.tenant?.name}
              </p>

              <p className="text-sm font-semibold text-slate-800">
                Panel Pemilik Toko
              </p>
            </div>

            <div className="flex items-center gap-3">

              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  {user?.name}
                </p>

                <p className="text-xs text-slate-400">
                  Owner
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>

            </div>
          </header>

          {/* Page */}
          <div className="p-6 lg:p-8">
            {children}
          </div>

        </main>
      </div>
    </div>
  );
}
