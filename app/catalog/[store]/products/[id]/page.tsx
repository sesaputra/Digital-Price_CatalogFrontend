"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Package,
  Store,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { publicApiFetch } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { Product } from "@/types/api";

type ProductWithImage = Product & {
  image?: string | null;
};

export default function PublicProductDetailPage() {
  const params = useParams();

  const store = params.store as string;
  const productId = params.id as string;

  const [product, setProduct] =
    useState<ProductWithImage | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /*
  |--------------------------------------------------------------------------
  | Store name
  |--------------------------------------------------------------------------
  */

  const storeName = useMemo(() => {
    if (!store) {
      return "Digital Price Catalog";
    }

    return store
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  }, [store]);

  /*
  |--------------------------------------------------------------------------
  | Fetch product
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const response =
          await publicApiFetch<
            ProductWithImage | {
              data: ProductWithImage;
            }
          >(
            `/public/stores/${store}/products/${productId}`
          );

        if (cancelled) {
          return;
        }

        const productData =
          "data" in response
            ? response.data
            : response;

        setProduct(productData);
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
            : "Produk tidak ditemukan."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [store, productId]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950">
        {/* HEADER SKELETON */}
        <section className="bg-slate-900">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between border-b border-white/10 py-5">
              <div className="h-4 w-40 animate-pulse rounded bg-white/10" />

              <div className="h-8 w-28 animate-pulse rounded-lg bg-white/10" />
            </div>

            <div className="grid gap-10 py-12 md:grid-cols-[1fr_360px] md:items-center">
              <div>
                <div className="flex gap-2">
                  <div className="h-6 w-14 animate-pulse rounded-full bg-white/10" />
                  <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
                  <div className="h-6 w-20 animate-pulse rounded-full bg-white/10" />
                </div>

                <div className="mt-6 h-10 w-72 animate-pulse rounded bg-white/10" />

                <div className="mt-3 h-3 w-36 animate-pulse rounded bg-white/10" />

                <div className="mt-5 space-y-2">
                  <div className="h-3 w-full max-w-lg animate-pulse rounded bg-white/10" />
                  <div className="h-3 w-4/5 max-w-lg animate-pulse rounded bg-white/10" />
                </div>
              </div>

              <div className="aspect-[4/3] animate-pulse rounded-2xl bg-white/10" />
            </div>
          </div>
        </section>

        {/* CONTENT SKELETON */}
        <section className="rounded-t-[2rem] bg-white">
          <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
            <div className="rounded-3xl border border-slate-200 p-6 sm:p-8">
              <div className="h-6 w-40 animate-pulse rounded bg-slate-100" />

              <div className="mt-2 h-4 w-72 animate-pulse rounded bg-slate-100" />

              <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200">
                <div className="h-12 animate-pulse bg-slate-50" />

                <div className="space-y-1 p-2">
                  <div className="h-14 animate-pulse rounded bg-slate-50" />
                  <div className="h-14 animate-pulse rounded bg-slate-50" />
                  <div className="h-14 animate-pulse rounded bg-slate-50" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error / Product Not Found
  |--------------------------------------------------------------------------
  */

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Package className="h-6 w-6 text-slate-400" />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-slate-900">
            Produk tidak ditemukan
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Produk mungkin sudah tidak tersedia
            atau tidak ditampilkan pada katalog
            publik.
          </p>

          <Link
            href={`/catalog/${store}`}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke katalog
          </Link>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Lowest Price
  |--------------------------------------------------------------------------
  */

  const lowestPrice =
    product.variants?.length > 0
      ? Math.min(
          ...product.variants.map((variant) =>
            Number(variant.price)
          )
        )
      : null;

  /*
  |--------------------------------------------------------------------------
  | Main Page
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen bg-slate-950">
      {/* =========================================================
          HERO / PRODUCT HEADER
      ========================================================= */}

      <section className="relative overflow-hidden bg-slate-900">
        {/* Decorative background */}
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-white/[0.035] blur-3xl" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-slate-700/20 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.07),transparent_35%)]" />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          {/* TOP NAV */}
          <div className="flex items-center justify-between border-b border-white/10 py-5">
            <Link
              href={`/catalog/${store}`}
              className="group flex items-center gap-2"
            >
              <span className="text-sm font-medium tracking-wide text-white/50 transition group-hover:text-white/80">
                DIGITAL PRICE
              </span>

              <span className="text-sm font-semibold tracking-wide text-white">
                CATALOG
              </span>
            </Link>

            <Link
              href={`/catalog/${store}`}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/[0.03] px-3.5 py-2 text-xs font-medium text-white/70 transition hover:border-white/40 hover:bg-white/[0.08] hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Katalog
            </Link>
          </div>

          {/* PRODUCT HERO */}
          <div className="grid gap-10 py-10 sm:py-12 md:grid-cols-[1fr_360px] md:items-center lg:grid-cols-[1fr_390px]">
            {/* PRODUCT INFORMATION */}
            <div>
              {/* BADGES */}
              <div className="flex flex-wrap items-center gap-2">
                {product.brand && (
                  <span className="rounded-full border border-white/15 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold text-white/75">
                    {product.brand.name}
                  </span>
                )}

                {product.category && (
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/50">
                    {product.category.name}
                  </span>
                )}

                {product.product_type && (
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-white/50">
                    {product.product_type.name}
                  </span>
                )}
              </div>

              {/* PRODUCT NAME */}
              <h1 className="mt-6 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>

              {/* SKU */}
              {product.sku && (
                <p className="mt-3 text-xs font-medium tracking-wide text-white/35">
                  SKU: {product.sku}
                </p>
              )}

              {/* DESCRIPTION */}
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">
                {product.description ||
                  "Informasi produk dan harga tersedia melalui katalog digital ini."}
              </p>

              {/* PRICE SUMMARY */}
              {lowestPrice !== null && (
                <div className="mt-7">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                    Harga mulai dari
                  </p>

                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight text-white">
                      {formatRupiah(lowestPrice)}
                    </span>

                    <span className="text-xs text-white/35">
                      tergantung varian
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* PRODUCT IMAGE */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/20">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-800 to-slate-700">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.05]">
                      <Package className="h-9 w-9 text-white/30" />
                    </div>
                  </div>
                )}
              </div>

              {/* IMAGE CAPTION */}
              <div className="mt-3 flex items-center gap-2 text-[10px] text-white/30">
                <Store className="h-3.5 w-3.5" />
                {storeName}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VARIANT & PRICE
      ========================================================= */}

      <section className="rounded-t-[2rem] bg-white sm:rounded-t-[2.5rem]">
        <div className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12 lg:px-10 lg:py-14">
          {/* SECTION HEADER */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Product Pricing
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Varian & Harga
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Pilihan ukuran, satuan, dan harga
                produk yang tersedia.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Package className="h-4 w-4" />

              {product.variants.length}{" "}
              {product.variants.length === 1
                ? "varian"
                : "varian"}
            </div>
          </div>

          {/* VARIANTS */}
          {product.variants.length > 0 ? (
            <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200">
              {/* TABLE HEADER */}
              <div className="hidden grid-cols-[1fr_180px_220px] border-b border-slate-200 bg-slate-50 px-6 py-3.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:grid">
                <span>Varian</span>
                <span>Satuan</span>
                <span className="text-right">
                  Harga
                </span>
              </div>

              {/* ROWS */}
              {product.variants.map(
                (variant, index) => (
                  <div
                    key={variant.id}
                    className={`grid gap-3 px-5 py-5 sm:grid-cols-[1fr_180px_220px] sm:items-center sm:px-6 ${
                      index !==
                      product.variants.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >
                    {/* VARIANT */}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {variant.name}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400 sm:hidden">
                        Satuan: {variant.unit}
                      </p>
                    </div>

                    {/* UNIT */}
                    <div className="hidden text-sm text-slate-500 sm:block">
                      {variant.unit}
                    </div>

                    {/* PRICE */}
                    <div className="text-left sm:text-right">
                      <p className="text-lg font-bold tracking-tight text-slate-900">
                        {formatRupiah(
                          variant.price
                        )}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        per {variant.unit}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            /* EMPTY VARIANT */
            <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200">
                <Package className="h-5 w-5 text-slate-400" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-800">
                Belum ada varian harga
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-slate-500">
                Informasi harga untuk produk ini
                belum tersedia.
              </p>
            </div>
          )}

          {/* =====================================================
              INFORMATION CARD
          ===================================================== */}

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            {/* PRODUCT INFO */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Informasi Produk
              </p>

              <div className="mt-4 space-y-3">
                {product.brand && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-400">
                      Brand
                    </span>

                    <span className="text-xs font-semibold text-slate-700">
                      {product.brand.name}
                    </span>
                  </div>
                )}

                {product.category && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-400">
                      Kategori
                    </span>

                    <span className="text-xs font-semibold text-slate-700">
                      {product.category.name}
                    </span>
                  </div>
                )}

                {product.product_type && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-400">
                      Jenis Produk
                    </span>

                    <span className="text-xs font-semibold text-slate-700">
                      {
                        product.product_type
                          .name
                      }
                    </span>
                  </div>
                )}

                {product.sku && (
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-400">
                      SKU
                    </span>

                    <span className="text-xs font-semibold text-slate-700">
                      {product.sku}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                Deskripsi
              </p>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {product.description ||
                  "Tidak ada deskripsi tambahan untuk produk ini."}
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-12 border-t border-slate-200 pt-6">
            <div className="flex flex-col gap-2 text-center text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <p>
                © {new Date().getFullYear()}{" "}
                {storeName}
              </p>

              <p>
                Digital Price Catalog
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}