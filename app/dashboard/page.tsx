"use client";

import { AuthGuard, useAuth } from "@/lib/auth";
import {
  Package,
  Tags,
  Award,
  Layers3,
} from "lucide-react";

function DashboardContent() {
  const { user } = useAuth();

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <p className="text-sm font-medium text-slate-500">
          Selamat datang kembali,
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {user?.name}
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Kelola katalog harga toko Anda dari satu tempat.
        </p>
      </div>

      {/* Statistic Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Total Produk"
          value="—"
          icon={Package}
        />

        <StatCard
          label="Kategori"
          value="—"
          icon={Tags}
        />

        <StatCard
          label="Brand"
          value="—"
          icon={Award}
        />

        <StatCard
          label="Jenis Produk"
          value="—"
          icon={Layers3}
        />

      </div>

      {/* Welcome Card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="max-w-2xl">

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Digital Price Catalog
          </p>

          <h2 className="mt-2 text-xl font-bold text-slate-900">
            Kelola katalog harga dengan lebih mudah.
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Tambahkan produk, brand, jenis produk, kategori,
            serta berbagai varian harga untuk membantu
            aktivitas toko sehari-hari.
          </p>

        </div>
      </section>

    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}

function StatCard({
  label,
  value,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>

      </div>

    </div>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}