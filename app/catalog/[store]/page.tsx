"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Package,
  Search,
  SlidersHorizontal,
  Store,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { publicApiFetch } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { Product } from "@/types/api";

interface PublicCatalogResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export default function PublicCatalogPage() {
  const params = useParams();

  const store = params.store as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  /*
  |--------------------------------------------------------------------------
  | Ambil nama toko dari slug
  |--------------------------------------------------------------------------
  */

  const storeName = useMemo(() => {
    if (!store) {
      return "Katalog Produk";
    }

    return store
      .split("-")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  }, [store]);

  /*
  |--------------------------------------------------------------------------
  | Fetch products
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const query = new URLSearchParams();

        query.set("page", currentPage.toString());
        query.set("per_page", "12");

        if (activeSearch.trim()) {
          query.set("search", activeSearch.trim());
        }

        if (categoryId) {
          query.set("category_id", categoryId);
        }

        if (brandId) {
          query.set("brand_id", brandId);
        }

        const response =
          await publicApiFetch<PublicCatalogResponse>(
            `/public/stores/${store}/products?${query.toString()}`
          );

        if (cancelled) {
          return;
        }

        setProducts(response.data ?? []);
        setLastPage(response.last_page ?? 1);
        setTotalProducts(response.total ?? 0);
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
            : "Gagal mengambil data katalog."
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
  }, [
    store,
    currentPage,
    activeSearch,
    categoryId,
    brandId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();

    setCurrentPage(1);
    setActiveSearch(search.trim());
  }

  /*
  |--------------------------------------------------------------------------
  | Reset filter
  |--------------------------------------------------------------------------
  */

  function resetFilters() {
    setSearch("");
    setActiveSearch("");
    setCategoryId("");
    setBrandId("");
    setCurrentPage(1);
  }

  const hasFilter =
    Boolean(activeSearch) ||
    Boolean(categoryId) ||
    Boolean(brandId);

  /*
  |--------------------------------------------------------------------------
  | Unique category & brand dari data yang tersedia
  |--------------------------------------------------------------------------
  */

  const categories = useMemo(() => {
    const map = new Map<number, string>();

    products.forEach((product) => {
      if (product.category) {
        map.set(
          product.category.id,
          product.category.name
        );
      }
    });

    return Array.from(map.entries()).map(
      ([id, name]) => ({
        id,
        name,
      })
    );
  }, [products]);

  const brands = useMemo(() => {
    const map = new Map<number, string>();

    products.forEach((product) => {
      if (product.brand) {
        map.set(
          product.brand.id,
          product.brand.name
        );
      }
    });

    return Array.from(map.entries()).map(
      ([id, name]) => ({
        id,
        name,
      })
    );
  }, [products]);

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading && products.length === 0) {
    return (
      <main className="min-h-screen bg-slate-950">
        {/* HERO */}
        <section className="relative overflow-hidden bg-slate-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%)]" />

          <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between">
              <div className="h-4 w-40 animate-pulse rounded bg-white/10" />

              <div className="h-9 w-28 animate-pulse rounded-lg bg-white/10" />
            </div>

            <div className="mx-auto max-w-3xl py-20 text-center">
              <div className="mx-auto h-5 w-40 animate-pulse rounded bg-white/10" />

              <div className="mx-auto mt-5 h-12 w-80 animate-pulse rounded bg-white/10" />

              <div className="mx-auto mt-4 h-4 w-96 max-w-full animate-pulse rounded bg-white/10" />

              <div className="mx-auto mt-8 h-14 max-w-xl animate-pulse rounded-2xl bg-white/10" />
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="rounded-t-[2rem] bg-white">
          <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="aspect-[4/3] animate-pulse bg-slate-100" />

                    <div className="space-y-3 p-5">
                      <div className="h-4 w-20 animate-pulse rounded bg-slate-100" />

                      <div className="h-5 w-40 animate-pulse rounded bg-slate-100" />

                      <div className="h-4 w-full animate-pulse rounded bg-slate-100" />

                      <div className="mt-5 h-6 w-28 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error
  |--------------------------------------------------------------------------
  */

  if (error && products.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Store className="h-6 w-6 text-slate-500" />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-slate-900">
            Katalog tidak dapat dimuat
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Coba lagi
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950">
      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden bg-slate-900">
        {/* Decorative background */}
        <div className="absolute -right-32 -top-40 h-96 w-96 rounded-full bg-white/[0.035] blur-3xl" />

        <div className="absolute -left-40 bottom-0 h-80 w-80 rounded-full bg-slate-700/20 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          {/* TOP NAV */}
          <div className="flex items-center justify-between border-b border-white/10 py-5">
            <Link
              href="/catalog"
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
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/25 bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/80 transition hover:border-white/40 hover:bg-white/[0.08] hover:text-white"
            >
              Login Admin
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* HERO CONTENT */}
          <div className="mx-auto max-w-4xl px-2 py-14 text-center sm:py-16 lg:py-20">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white/60 backdrop-blur">
              <Store className="h-3.5 w-3.5" />
              Katalog Produk Resmi
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              {storeName}
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/45 sm:text-base">
              Temukan produk dan periksa harga terbaru
              dengan cepat melalui katalog digital
              {storeName}.
            </p>

            {/* SEARCH */}
            <form
              onSubmit={handleSearch}
              className="mx-auto mt-8 max-w-2xl"
            >
              <div className="group flex items-center rounded-2xl border border-white/10 bg-white p-1.5 shadow-2xl shadow-black/20 transition focus-within:border-white/30">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Cari nama produk, brand, atau SKU..."
                  className="min-w-0 flex-1 bg-transparent px-1 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setActiveSearch("");
                      setCurrentPage(1);
                    }}
                    className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Hapus pencarian"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                <button
                  type="submit"
                  className="hidden rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:block"
                >
                  Cari
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATALOG CONTENT
      ========================================================= */}

      <section className="rounded-t-[2rem] bg-white sm:rounded-t-[2.5rem]">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-11 lg:px-10 lg:py-14">
          {/* HEADER */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Product Catalog
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Produk
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {totalProducts} produk tersedia
              </p>
            </div>

            {loading && (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
                Memperbarui...
              </div>
            )}
          </div>

          {/* =====================================================
              FILTER
          ===================================================== */}

          <div className="mt-7 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 px-2 text-sm font-medium text-slate-500">
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </div>

            {/* CATEGORY */}
            <div className="relative">
              <select
                value={categoryId}
                onChange={(event) => {
                  setCategoryId(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-600 outline-none transition focus:border-slate-400 sm:w-48"
              >
                <option value="">
                  Semua Kategori
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {/* BRAND */}
            <div className="relative">
              <select
                value={brandId}
                onChange={(event) => {
                  setBrandId(event.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-sm text-slate-600 outline-none transition focus:border-slate-400 sm:w-48"
              >
                <option value="">
                  Semua Brand
                </option>

                {brands.map((brand) => (
                  <option
                    key={brand.id}
                    value={brand.id}
                  >
                    {brand.name}
                  </option>
                ))}
              </select>

              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            {/* RESET */}
            {hasFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900"
              >
                <X className="h-4 w-4" />
                Reset
              </button>
            )}
          </div>

          {/* ACTIVE SEARCH INFO */}
          {activeSearch && (
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-slate-400">
                Hasil pencarian untuk
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                "{activeSearch}"
              </span>
            </div>
          )}

          {/* =====================================================
              EMPTY STATE
          ===================================================== */}

          {!loading && products.length === 0 && (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <Package className="h-6 w-6 text-slate-400" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                Produk tidak ditemukan
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Coba gunakan kata pencarian lain
                atau ubah filter yang sedang
                digunakan.
              </p>

              {hasFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                  Reset filter
                </button>
              )}
            </div>
          )}

          {/* =====================================================
              PRODUCT GRID
          ===================================================== */}

          {products.length > 0 && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const lowestPrice =
                  product.variants?.length
                    ? Math.min(
                        ...product.variants.map(
                          (variant) =>
                            Number(variant.price)
                        )
                      )
                    : null;

                const firstVariant =
                  product.variants?.[0];

                return (
                  <Link
                    key={product.id}
                    href={`/catalog/${store}/products/${product.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60"
                  >
                    {/* IMAGE / PLACEHOLDER */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      {/*
                        Jika nanti ProductResource mengembalikan
                        field image, bagian ini bisa menggunakan
                        URL gambar produk.
                      */}

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                          <Package className="h-7 w-7 text-slate-300" />
                        </div>
                      </div>

                      {/* IMAGE OVERLAY */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                    </div>

                    {/* CARD BODY */}
                    <div className="flex flex-1 flex-col p-5">
                      {/* BADGES */}
                      <div className="flex min-h-6 flex-wrap items-center gap-1.5">
                        {product.brand && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            {product.brand.name}
                          </span>
                        )}

                        {product.category && (
                          <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-400 ring-1 ring-slate-100">
                            {product.category.name}
                          </span>
                        )}
                      </div>

                      {/* PRODUCT NAME */}
                      <h3 className="mt-4 line-clamp-2 text-lg font-semibold tracking-tight text-slate-900 transition group-hover:text-slate-600">
                        {product.name}
                      </h3>

                      {/* DESCRIPTION */}
                      <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">
                        {product.description ||
                          "Informasi produk dan harga tersedia pada katalog."}
                      </p>

                      {/* PRICE */}
                      <div className="mt-5 border-t border-slate-100 pt-4">
                        {lowestPrice !== null ? (
                          <>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                              Mulai dari
                            </p>

                            <div className="mt-1 flex items-baseline gap-1.5">
                              <span className="text-xl font-bold tracking-tight text-slate-900">
                                {formatRupiah(
                                  lowestPrice
                                )}
                              </span>

                              {firstVariant && (
                                <span className="text-[11px] text-slate-400">
                                  / {firstVariant.unit}
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <p className="text-sm font-medium text-slate-400">
                            Harga belum tersedia
                          </p>
                        )}
                      </div>

                      {/* DETAIL */}
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 transition group-hover:text-slate-900">
                          Lihat detail
                        </span>

                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition group-hover:border-slate-900 group-hover:bg-slate-900 group-hover:text-white">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* =====================================================
              PAGINATION
          ===================================================== */}

          {lastPage > 1 && (
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-7 sm:flex-row">
              <p className="text-xs text-slate-400">
                Halaman {currentPage} dari{" "}
                {lastPage}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setCurrentPage(
                      (page) => page - 1
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sebelumnya
                </button>

                <div className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white">
                  {currentPage}
                </div>

                <button
                  type="button"
                  disabled={
                    currentPage >= lastPage
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) => page + 1
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          )}

          {/* =====================================================
              FOOTER INFO
          ===================================================== */}

          <div className="mt-14 border-t border-slate-200 pt-7">
            <div className="flex flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
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