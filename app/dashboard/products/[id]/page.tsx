"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Package,
  Tag,
  Award,
  Layers3,
  Hash,
  Globe,
  Lock,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AuthGuard } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

import { Product } from "@/types/api";

function ProductDetailContent() {
  const params = useParams();

  const id = params.id as string;

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
  try {
    setLoading(true);
    setError("");

    const response =
      await apiFetch<{
        data: Product;
      }>(`/products/${id}`);

    if (cancelled) {
      return;
    }

    setProduct(response.data);
  } catch (error) {
    if (cancelled) {
      return;
    }

    console.error(
      "Gagal mengambil detail produk:",
      error
    );

    setError(
      error instanceof Error
        ? error.message
        : "Gagal mengambil detail produk."
    );
  } finally {
    if (!cancelled) {
      setLoading(false);
    }
  }
}

    if (id) {
      loadProduct();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="space-y-6">

        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-100" />

            <div className="h-8 w-72 animate-pulse rounded bg-slate-100" />

            <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
          </div>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />

          <div className="mt-6 space-y-3">
            <div className="h-12 animate-pulse rounded bg-slate-100" />
            <div className="h-12 animate-pulse rounded bg-slate-100" />
          </div>

        </div>

      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error || !product) {
    return (
      <div className="space-y-6">

        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />

          Kembali ke Produk
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

          <p className="text-sm font-semibold text-red-700">
            Produk tidak dapat ditemukan
          </p>

          <p className="mt-1 text-sm text-red-600">
            {error ||
              "Data produk tidak tersedia."}
          </p>

        </div>

      </div>
    );
  }

  const lowestPrice =
    product.variants?.length
      ? Math.min(
          ...product.variants.map(
            (variant) =>
              Number(variant.price)
          )
        )
      : null;

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />

            Kembali ke Produk
          </Link>

          <div className="mt-4">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Detail Produk
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              {product.name}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Kelola informasi dan varian harga
              produk.
            </p>

          </div>

        </div>

        <Link
          href={`/dashboard/products/${product.id}/edit`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Pencil className="h-4 w-4" />

          Edit Produk
        </Link>

      </div>

      {/* =====================================================
          PRODUCT SUMMARY
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-100 p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                <Package className="h-7 w-7 text-slate-500" />
              </div>

              <div>

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Produk
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {product.name}
                </h2>

                {product.sku && (
                  <p className="mt-1 text-sm text-slate-500">
                    SKU: {product.sku}
                  </p>
                )}

              </div>

            </div>

            {/* Status */}

            <div>
              {product.is_public ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">

                  <Globe className="h-3.5 w-3.5" />

                  Publik
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">

                  <Lock className="h-3.5 w-3.5" />

                  Privat
                </span>
              )}
            </div>

          </div>

        </div>

        {/* Product Information */}

        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4">

          <InfoItem
            icon={Tag}
            label="Kategori"
            value={
              product.category?.name ||
              "—"
            }
          />

          <InfoItem
            icon={Layers3}
            label="Jenis Produk"
            value={
              product.product_type?.name ||
              "—"
            }
          />

          <InfoItem
            icon={Award}
            label="Brand"
            value={
              product.brand?.name ||
              "—"
            }
          />

          <InfoItem
            icon={Hash}
            label="SKU"
            value={
              product.sku || "Tidak tersedia"
            }
          />

        </div>

      </section>

      {/* =====================================================
          PRICE SUMMARY
      ===================================================== */}

      <section className="grid gap-4 sm:grid-cols-3">

        <SummaryCard
          label="Jumlah Varian"
          value={`${product.variants?.length || 0}`}
          description="Varian harga"
        />

        <SummaryCard
          label="Harga Terendah"
          value={
            lowestPrice !== null
              ? formatRupiah(lowestPrice)
              : "—"
          }
          description="Dari semua varian"
        />

        <SummaryCard
          label="Status"
          value={
            product.is_public
              ? "Publik"
              : "Privat"
          }
          description={
            product.is_public
              ? "Tampil di katalog"
              : "Tidak tampil di katalog"
          }
        />

      </section>

      {/* =====================================================
          VARIANTS
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-2 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Harga Produk
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Varian Harga
            </h2>

          </div>

          <p className="text-sm text-slate-400">
            {product.variants?.length || 0} varian
          </p>

        </div>

        {product.variants?.length ? (
          <div className="overflow-x-auto">

            <table className="w-full min-w-[600px] text-left">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Varian
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Unit
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Harga
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {product.variants.map(
                  (variant) => (
                    <tr
                      key={variant.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <p className="text-sm font-semibold text-slate-900">
                          {variant.name}
                        </p>

                      </td>

                      <td className="px-6 py-4">

                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {variant.unit}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-right">

                        <span className="text-sm font-bold text-slate-900">
                          {formatRupiah(
                            variant.price
                          )}
                        </span>

                      </td>

                    </tr>
                  )
                )}

              </tbody>

            </table>

          </div>
        ) : (
          <div className="px-6 py-12 text-center">

            <Package className="mx-auto h-8 w-8 text-slate-300" />

            <p className="mt-3 text-sm font-semibold text-slate-700">
              Belum ada varian
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Produk ini belum memiliki
              varian harga.
            </p>

          </div>
        )}

      </section>

      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <FileText className="h-5 w-5 text-slate-500" />
          </div>

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Informasi
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Deskripsi Produk
            </h2>

          </div>

        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4">

          {product.description ? (
            <p className="text-sm leading-7 text-slate-600">
              {product.description}
            </p>
          ) : (
            <p className="text-sm italic text-slate-400">
              Produk ini belum memiliki
              deskripsi.
            </p>
          )}

        </div>

      </section>

    </div>
  );
}

/* =========================================================
   INFO ITEM
========================================================= */

interface InfoItemProps {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: InfoItemProps) {
  return (
    <div className="border-b border-slate-100 p-5 last:border-b-0 sm:nth-[2n]:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0">

      <div className="flex items-center gap-2">

        <Icon className="h-4 w-4 text-slate-400" />

        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>

      </div>

      <p className="mt-2 text-sm font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

interface SummaryCardProps {
  label: string;
  value: string;
  description: string;
}

function SummaryCard({
  label,
  value,
  description,
}: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold tracking-tight text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ProductDetailPage() {
  return (
    <AuthGuard>
      <ProductDetailContent />
    </AuthGuard>
  );
}