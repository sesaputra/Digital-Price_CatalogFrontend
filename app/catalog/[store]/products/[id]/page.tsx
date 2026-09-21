"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";

import { publicApiFetch } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { Product } from "@/types/api";

export default function PublicProductDetailPage() {
  const params = useParams();

  const store = params.store as string;
  const productId = params.id as string;

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
          await publicApiFetch<
            Product | { data: Product }
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
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-10">
          <div className="animate-pulse">
            <div className="h-5 w-24 rounded bg-slate-200" />

            <div className="mt-10 h-8 w-72 rounded bg-slate-200" />

            <div className="mt-4 h-4 w-48 rounded bg-slate-200" />

            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6">
              <div className="h-5 w-32 rounded bg-slate-200" />

              <div className="mt-6 space-y-4">
                <div className="h-14 rounded bg-slate-200" />
                <div className="h-14 rounded bg-slate-200" />
                <div className="h-14 rounded bg-slate-200" />
              </div>
            </div>
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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Package className="h-6 w-6 text-slate-500" />
          </div>

          <h1 className="mt-5 text-lg font-semibold text-slate-900">
            Produk tidak ditemukan
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Produk mungkin sudah tidak tersedia
            atau tidak ditampilkan pada katalog
            publik.
          </p>

          <Link
            href={`/catalog/${store}`}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />

            Kembali ke katalog
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <div className="flex items-center justify-between">
            <Link
              href={`/catalog/${store}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />

              Kembali ke katalog
            </Link>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Store className="h-4 w-4" />

              Public Catalog
            </div>
          </div>
        </div>
      </header>

      {/* Content */}

      <section className="mx-auto max-w-5xl px-6 py-10">
        {/* Product Header */}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {product.brand && (
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {product.brand.name}
              </span>
            )}

            {product.category && (
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
                {product.category.name}
              </span>
            )}

            {product.product_type && (
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
                {product.product_type.name}
              </span>
            )}
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {product.name}
          </h1>

          {product.sku && (
            <p className="mt-2 text-sm text-slate-400">
              SKU: {product.sku}
            </p>
          )}

          {product.description && (
            <div className="mt-6 max-w-3xl">
              <p className="text-sm leading-7 text-slate-600">
                {product.description}
              </p>
            </div>
          )}
        </div>

        {/* Variants */}

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Varian & Harga
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Pilihan ukuran dan harga produk.
              </p>
            </div>

            <div className="hidden rounded-xl bg-slate-100 p-3 sm:block">
              <Package className="h-5 w-5 text-slate-500" />
            </div>
          </div>

          {product.variants.length > 0 ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid grid-cols-[1fr_auto] border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 sm:grid-cols-[1fr_160px_180px]">
                <span>Varian</span>

                <span className="hidden sm:block">
                  Satuan
                </span>

                <span className="text-right">
                  Harga
                </span>
              </div>

              {product.variants.map(
                (variant) => (
                  <div
                    key={variant.id}
                    className="grid grid-cols-[1fr_auto] items-center border-b border-slate-100 px-5 py-4 last:border-b-0 sm:grid-cols-[1fr_160px_180px]"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {variant.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400 sm:hidden">
                        per {variant.unit}
                      </p>
                    </div>

                    <div className="hidden text-sm text-slate-500 sm:block">
                      {variant.unit}
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-slate-900">
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
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center">
              <p className="text-sm text-slate-500">
                Belum ada varian harga untuk
                produk ini.
              </p>
            </div>
          )}
        </div>

        {/* Back Button */}

        <div className="mt-8">
          <Link
            href={`/catalog/${store}`}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />

            Kembali ke katalog
          </Link>
        </div>
      </section>
    </main>
  );
}