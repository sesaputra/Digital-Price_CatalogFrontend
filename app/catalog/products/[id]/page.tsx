"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { Product } from "@/types/api";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id as string;

  const [product, setProduct] =
    useState<Product | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProduct() {
  try {
    setLoading(true);
    setError("");

    const response = await apiFetch<
      Product | { data: Product }
    >(`/products/${productId}`);

    if (!mounted) {
      return;
    }

    const productData =
      "data" in response
        ? response.data
        : response;

    setProduct(productData);
  } catch (error) {
    if (!mounted) {
      return;
    }

    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError(
        "Gagal mengambil detail produk."
      );
    }
  } finally {
    if (mounted) {
      setLoading(false);
    }
  }
}

    if (productId) {
      loadProduct();
    }

    return () => {
      mounted = false;
    };
  }, [productId]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="mb-8 h-5 w-32 animate-pulse rounded bg-slate-200" />

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="h-80 animate-pulse rounded-2xl bg-slate-200 lg:col-span-2" />

            <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
            !
          </div>

          <h1 className="mt-4 text-lg font-semibold text-slate-900">
            Produk tidak ditemukan
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error ||
              "Produk yang Anda cari tidak tersedia."}
          </p>

          <button
            onClick={() => router.back()}
            className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Kembali
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/catalog"
            className="text-lg font-bold tracking-tight text-slate-900"
          >
            Digital Price Catalog
          </Link>

          <Link
            href="/catalog"
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Kembali ke Katalog
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/catalog"
            className="text-slate-400 transition hover:text-slate-700"
          >
            Katalog
          </Link>

          <span className="text-slate-300">
            /
          </span>

          <span className="truncate font-medium text-slate-700">
            {product.name}
          </span>
        </nav>

        {/* Main Product */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Product Information */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            {/* Product Header */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  {product.category && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {product.category.name}
                    </span>
                  )}

                  {product.product_type && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {product.product_type.name}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                  {product.name}
                </h1>

                {product.sku && (
                  <p className="mt-2 text-sm text-slate-400">
                    SKU: {product.sku}
                  </p>
                )}
              </div>

              {product.brand && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left sm:text-right">
                  <p className="text-xs text-slate-400">
                    Brand
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {product.brand.name}
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="my-6 h-px bg-slate-100" />

            {/* Description */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-900">
                Deskripsi Produk
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                {product.description ||
                  "Tidak ada deskripsi untuk produk ini."}
              </p>
            </div>

            {/* Product Information */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Kategori
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {product.category?.name ||
                    "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Jenis Produk
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {product.product_type?.name ||
                    "-"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Brand
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {product.brand?.name ||
                    "-"}
                </p>
              </div>
            </div>
          </section>

          {/* Quick Summary */}
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Informasi Harga
            </p>

            <h2 className="mt-2 text-xl font-bold text-slate-900">
              {product.variants.length} Pilihan
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Tersedia beberapa ukuran atau
              varian harga untuk produk ini.
            </p>

            {product.variants.length > 0 && (
              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Mulai dari
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {formatRupiah(
                    Math.min(
                      ...product.variants.map(
                        (variant) =>
                          Number(variant.price)
                      )
                    )
                  )}
                </p>
              </div>
            )}
          </aside>
        </div>

        {/* Variants */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-blue-600">
                Pilihan Produk
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-900">
                Ukuran & Harga
              </h2>
            </div>

            <p className="text-sm text-slate-400">
              {product.variants.length} varian
            </p>
          </div>

          {product.variants.length === 0 ? (
            <div className="mt-6 rounded-xl bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">
                Belum ada varian harga.
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
              {/* Desktop Header */}
              <div className="hidden grid-cols-3 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:grid">
                <div>Ukuran / Varian</div>
                <div>Satuan</div>
                <div className="text-right">
                  Harga
                </div>
              </div>

              {product.variants.map(
                (variant, index) => (
                  <div
                    key={variant.id}
                    className={`grid gap-3 px-5 py-4 sm:grid-cols-3 sm:items-center ${
                      index !==
                      product.variants.length - 1
                        ? "border-b border-slate-100"
                        : ""
                    }`}
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {variant.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400 sm:hidden">
                        Varian produk
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-400 sm:hidden">
                        Satuan
                      </p>

                      <p className="text-sm text-slate-600">
                        {variant.unit}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs text-slate-400 sm:hidden">
                        Harga
                      </p>

                      <p className="text-base font-bold text-slate-900">
                        {formatRupiah(
                          variant.price
                        )}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        / {variant.unit}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

        {/* Back */}
        <div className="mt-8">
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <span>←</span>
            Kembali ke katalog
          </Link>
        </div>
      </div>
    </main>
  );
}