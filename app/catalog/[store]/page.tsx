"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";

import { publicApiFetch } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { Product } from "@/types/api";

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

interface TenantInfo {
  id: number;
  name: string;
  slug: string;
}

interface PublicCatalogResponse
  extends PaginatedResponse<Product> {
  tenant?: TenantInfo;
}

export default function PublicCatalogPage() {
  const params = useParams();

  const store = params.store as string;

  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [tenant, setTenant] =
    useState<TenantInfo | null>(null);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [pagination, setPagination] =
    useState<PaginatedResponse<Product> | null>(
      null
    );

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const query = new URLSearchParams();

        query.set(
          "page",
          String(page)
        );

        query.set(
          "per_page",
          "12"
        );

        if (search.trim()) {
          query.set(
            "search",
            search.trim()
          );
        }

        const response =
          await publicApiFetch<
            PublicCatalogResponse
          >(
            `/public/stores/${store}/products?${query.toString()}`
          );

        if (cancelled) {
          return;
        }

        setProducts(response.data);

        setPagination({
          data: response.data,
          current_page:
            response.current_page,
          last_page:
            response.last_page,
          per_page:
            response.per_page,
          total: response.total,
          from: response.from,
          to: response.to,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Gagal mengambil katalog:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil katalog."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [store, page, search]);

  function handleSearch(
    value: string
  ) {
    setSearch(value);
    setPage(1);
  }

  function getLowestPrice(
    product: Product
  ) {
    if (
      !product.variants ||
      product.variants.length === 0
    ) {
      return null;
    }

    return product.variants.reduce(
      (lowest, variant) => {
        const price = Number(
          variant.price
        );

        return price <
          lowest
          ? price
          : lowest;
      },
      Number(
        product.variants[0].price
      )
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}

      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft
                className="h-4 w-4"
              />

              Kembali
            </Link>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Store
                className="h-4 w-4"
              />

              Public Catalog
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              <Store
                className="h-3.5 w-3.5"
              />

              Katalog Harga
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {tenant?.name ||
                store
                  .split("-")
                  .map(
                    (word) =>
                      word
                        .charAt(0)
                        .toUpperCase() +
                      word.slice(1)
                  )
                  .join(" ")}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Temukan produk dan cek harga
              dengan mudah tanpa perlu login.
            </p>
          </div>
        </div>
      </section>

      {/* Catalog */}

      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Search */}

        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                handleSearch(
                  event.target.value
                )
              }
              placeholder="Cari nama produk, brand, SKU..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            />
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading */}

        {loading && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({
              length: 8,
            }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="h-4 w-24 rounded bg-slate-200" />

                <div className="mt-4 h-5 w-3/4 rounded bg-slate-200" />

                <div className="mt-3 h-4 w-full rounded bg-slate-200" />

                <div className="mt-6 h-10 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {/* Empty */}

        {!loading &&
          !error &&
          products.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <Search className="mx-auto h-8 w-8 text-slate-300" />

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Produk tidak ditemukan
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Coba gunakan kata kunci
                pencarian yang berbeda.
              </p>
            </div>
          )}

        {/* Products */}

        {!loading &&
          !error &&
          products.length > 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map(
                  (product) => {
                    const lowestPrice =
                      getLowestPrice(
                        product
                      );

                    return (
                      <Link
                        key={product.id}
                        href={`/catalog/${store}/products/${product.id}`}
                        className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              {product.brand
                                ?.name ||
                                "Tanpa brand"}
                            </p>

                            <h2 className="mt-2 line-clamp-2 text-base font-semibold text-slate-900 group-hover:text-slate-700">
                              {
                                product.name
                              }
                            </h2>
                          </div>

                          {product.product_type && (
                            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-500">
                              {
                                product
                                  .product_type
                                  .name
                              }
                            </span>
                          )}
                        </div>

                        {product.description && (
                          <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-500">
                            {
                              product.description
                            }
                          </p>
                        )}

                        <div className="mt-6 border-t border-slate-100 pt-4">
                          <p className="text-xs text-slate-400">
                            Mulai dari
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {lowestPrice !==
                            null
                              ? formatRupiah(
                                  lowestPrice
                                )
                              : "Harga tidak tersedia"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {
                              product
                                .variants
                                .length
                            }{" "}
                            varian tersedia
                          </p>
                        </div>

                        <div className="mt-5 text-sm font-semibold text-slate-700">
                          Lihat detail →
                        </div>
                      </Link>
                    );
                  }
                )}
              </div>

              {/* Pagination */}

              {pagination &&
                pagination.last_page >
                  1 && (
                  <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-5">
                    <p className="text-sm text-slate-500">
                      Menampilkan{" "}
                      <span className="font-medium text-slate-700">
                        {pagination.from}
                      </span>{" "}
                      -{" "}
                      <span className="font-medium text-slate-700">
                        {pagination.to}
                      </span>{" "}
                      dari{" "}
                      <span className="font-medium text-slate-700">
                        {pagination.total}
                      </span>{" "}
                      produk
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={
                          page <= 1
                        }
                        onClick={() =>
                          setPage(
                            (current) =>
                              current -
                              1
                          )
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>

                      <span className="px-3 text-sm font-medium text-slate-600">
                        {page} /{" "}
                        {
                          pagination.last_page
                        }
                      </span>

                      <button
                        type="button"
                        disabled={
                          page >=
                          pagination.last_page
                        }
                        onClick={() =>
                          setPage(
                            (current) =>
                              current +
                              1
                          )
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
            </>
          )}
      </section>
    </main>
  );
}