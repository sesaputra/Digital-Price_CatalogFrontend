"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Tags,
  Award,
  Layers3,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import { AuthGuard, useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

import {
  Product,
  Category,
  Brand,
  ProductType,
  PaginatedResponse,
} from "@/types/api";

interface DashboardStats {
  products: number;
  categories: number;
  brands: number;
  productTypes: number;
}

function DashboardContent() {
  const { user } = useAuth();

  const [stats, setStats] =
    useState<DashboardStats>({
      products: 0,
      categories: 0,
      brands: 0,
      productTypes: 0,
    });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboardStats() {
    try {
      setLoading(true);
      setError("");

      const [
        productResponse,
        categoryResponse,
        brandResponse,
        productTypeResponse,
      ] = await Promise.all([
        apiFetch<PaginatedResponse<Product>>(
          "/products?per_page=1"
        ),

        apiFetch<{
          data: Category[];
        }>("/categories"),

        apiFetch<{
          data: Brand[];
        }>("/brands"),

        apiFetch<{
          data: ProductType[];
        }>("/product-types"),
      ]);

     setStats({
  products: productResponse.meta.total,
  categories: categoryResponse.data.length,
  brands: brandResponse.data.length,
  productTypes:
    productTypeResponse.data.length,
});
    } catch (error) {
      console.error(
        "Gagal mengambil statistik dashboard:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [
          productResponse,
          categoryResponse,
          brandResponse,
          productTypeResponse,
        ] = await Promise.all([
          apiFetch<PaginatedResponse<Product>>(
            "/products?per_page=1"
          ),

          apiFetch<{
            data: Category[];
          }>("/categories"),

          apiFetch<{
            data: Brand[];
          }>("/brands"),

          apiFetch<{
            data: ProductType[];
          }>("/product-types"),
        ]);

        if (cancelled) {
          return;
        }

        setStats({
  products: productResponse.meta.total,
  categories: categoryResponse.data.length,
  brands: brandResponse.data.length,
  productTypes:
    productTypeResponse.data.length,
});
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Gagal mengambil statistik dashboard:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data dashboard."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>
          <p className="text-sm font-medium text-slate-500">
            Selamat datang kembali,
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {user?.name}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Kelola katalog harga toko Anda dari satu
            tempat.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboardStats}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? "animate-spin" : ""
            }`}
          />

          Refresh
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-sm font-semibold text-red-700">
              Gagal memuat dashboard
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboardStats}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />

            Coba lagi
          </button>

        </div>
      )}

      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          label="Total Produk"
          value={stats.products}
          icon={Package}
          loading={loading}
          href="/dashboard/products"
        />

        <StatCard
          label="Kategori"
          value={stats.categories}
          icon={Tags}
          loading={loading}
          href="/dashboard/categories"
        />

        <StatCard
          label="Brand"
          value={stats.brands}
          icon={Award}
          loading={loading}
          href="/dashboard/brands"
        />

        <StatCard
          label="Jenis Produk"
          value={stats.productTypes}
          icon={Layers3}
          loading={loading}
          href="/dashboard/product-types"
        />

      </div>

      {/* =====================================================
          STORE SUMMARY
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

          <div className="max-w-2xl">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Digital Price Catalog
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-900">
              Kelola katalog harga dengan lebih mudah.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Tambahkan produk, brand, jenis produk,
              kategori, serta berbagai varian harga
              untuk membantu aktivitas toko sehari-hari.
            </p>

          </div>

          <Link
            href="/dashboard/products/create"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Tambah Produk

            <ArrowRight className="h-4 w-4" />
          </Link>

        </div>

      </section>

      {/* =====================================================
          STORE INFORMATION
      ===================================================== */}

      <section className="grid gap-4 lg:grid-cols-2">

        <InfoCard
          title="Toko"
          value={
            user?.tenant?.name ||
            "Tidak tersedia"
          }
          description="Tenant yang sedang aktif pada akun Anda."
        />

        <InfoCard
          title="Akun"
          value={user?.name || "—"}
          description={`Role: ${
            user?.role || "—"
          }`}
        />

      </section>

    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{
    className?: string;
  }>;
  loading: boolean;
  href: string;
}

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
  href,
}: StatCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
          ) : (
            <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
              {value}
            </p>
          )}

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 transition group-hover:bg-slate-900">

          <Icon className="h-5 w-5 text-slate-600 transition group-hover:text-white" />

        </div>

      </div>

      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-400 transition group-hover:text-slate-700">

        Kelola

        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />

      </div>

    </Link>
  );
}

/* =========================================================
   INFO CARD
========================================================= */

interface InfoCardProps {
  title: string;
  value: string;
  description: string;
}

function InfoCard({
  title,
  value,
  description,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-base font-semibold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}