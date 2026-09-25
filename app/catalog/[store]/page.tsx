"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Package,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { publicApiFetch } from "@/lib/api";
import { formatRupiah } from "@/lib/format";
import { Product } from "@/types/api";

interface PublicCatalogResponse {
  data: Product[];
  current_page: number;
  last_page: number;
  total: number;
}

export default function PublicCatalogPage() {
  const params = useParams();

  const store = params.store as string;

  const [products, setProducts] = useState<Product[]>([]);

  const [search, setSearch] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * =========================================================
   * STORE NAME
   * =========================================================
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

  /**
   * =========================================================
   * LOAD PRODUCTS
   * =========================================================
   */

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const query = new URLSearchParams();

        query.set("page", String(page));
        query.set("per_page", "12");

        if (activeSearch) {
          query.set("search", activeSearch);
        }

        const response =
          await publicApiFetch<PublicCatalogResponse>(
            `/public/stores/${store}/products?${query.toString()}`
          );

        if (cancelled) {
          return;
        }

        setProducts(response.data);
        setLastPage(response.last_page);
        setTotal(response.total);
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
  }, [store, page, activeSearch]);

  /**
   * =========================================================
   * SEARCH
   * =========================================================
   */

  function handleSearch(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setPage(1);
    setActiveSearch(search.trim());
  }

  /**
   * =========================================================
   * RESET SEARCH
   * =========================================================
   */

  function handleResetSearch() {
    setSearch("");
    setActiveSearch("");
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-background">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="bg-dark">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          {/* =================================================
              HEADER
          ================================================= */}

          <header className="flex items-center justify-between border-b border-white/10 py-5">
            <Link
              href="/catalog"
              className="group text-sm tracking-wide"
            >
              <span className="text-white/45 transition group-hover:text-white/65">
                DIGITAL PRICE
              </span>{" "}
              <span className="font-semibold text-white">
                CATALOG
              </span>
            </Link>

            <Link
  href="/login"
  className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition-all duration-200 hover:border-white/40 hover:bg-white/10"
>
  <span className="text-white">Login Admin</span>

  <ArrowRight className=" text-white h-3.5 w-3.5" />
</Link>
          </header>

          {/* =================================================
              HERO CONTENT
          ================================================= */}

          <div className="grid gap-8 py-10 md:grid-cols-[1fr_380px] md:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/35">
                Public Store Catalog
              </p>

              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                {storeName}
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-white/45">
                Temukan produk, ukuran, dan informasi
                harga terbaru dari {storeName}.
              </p>
            </div>

            {/* =================================================
                SEARCH
            ================================================= */}

            <form
              onSubmit={handleSearch}
              className="relative"
            >
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari produk, brand, SKU..."
                className="h-11 w-full rounded-xl border border-white/10 bg-white px-11 text-sm text-slate-900 shadow-lg outline-none placeholder:text-slate-400 focus:border-white/20 focus:ring-2 focus:ring-white/20"
              />
            </form>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <section className="rounded-t-[2rem] bg-surface sm:rounded-t-[2.5rem]">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12 lg:px-10">
          {/* =================================================
              SECTION HEADER
          ================================================= */}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                Product Catalog
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
                Produk
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                {total} produk tersedia
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-text-muted">
              <ShieldCheck className="h-4 w-4" />

              Harga katalog
            </div>
          </div>

          {/* =================================================
              ACTIVE SEARCH
          ================================================= */}

          {activeSearch && (
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-text-muted">
                Hasil pencarian untuk
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-text-secondary">
                &quot;{activeSearch}&quot;
              </span>

              <button
                type="button"
                onClick={handleResetSearch}
                className="text-xs font-medium text-text-muted underline underline-offset-4 transition hover:text-text-primary"
              >
                Reset
              </button>
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm font-semibold text-red-700">
                Gagal memuat katalog
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          )}

          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-2xl border border-border bg-surface"
                  >
                    {/* IMAGE SKELETON */}
                    <div className="aspect-[4/3] animate-pulse bg-slate-100" />

                    {/* INFO SKELETON */}
                    <div className="space-y-3 p-5">
                      <div className="h-3 w-20 animate-pulse rounded bg-slate-100" />

                      <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />

                      <div className="mt-5 h-3 w-24 animate-pulse rounded bg-slate-100" />

                      <div className="h-7 w-32 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!loading &&
            !error &&
            products.length === 0 && (
              <div className="mt-10 rounded-3xl border border-dashed border-border bg-surface-muted px-6 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white ring-1 ring-border">
                  <Package className="h-6 w-6 text-text-muted" />
                </div>

                <h3 className="mt-5 text-base font-semibold text-text-primary">
                  Produk tidak ditemukan
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">
                  Tidak ada produk yang sesuai
                  dengan pencarian Anda.
                </p>

                {activeSearch && (
                  <button
                    type="button"
                    onClick={handleResetSearch}
                    className="mt-5 rounded-xl bg-dark px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-dark-soft"
                  >
                    Tampilkan semua produk
                  </button>
                )}
              </div>
            )}

          {/* =================================================
              PRODUCT GRID
          ================================================= */}

          {!loading &&
            !error &&
            products.length > 0 && (
              <>
                <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => {
                    const lowestPrice =
                      product.variants?.length
                        ? Math.min(
                            ...product.variants.map(
                              (variant) =>
                                Number(
                                  variant.price
                                )
                            )
                          )
                        : null;

                    return (
                      <Link
                        key={product.id}
                        href={`/catalog/${store}/products/${product.id}`}
                        className="group overflow-hidden rounded-2xl border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-card"
                      >
                        {/* =====================================
                            PRODUCT IMAGE
                        ===================================== */}

                        <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted">
                          <div className="flex h-full items-center justify-center bg-slate-50 transition duration-500 group-hover:bg-slate-100">
                            <Package className="h-8 w-8 text-slate-300 transition duration-500 group-hover:scale-105 group-hover:text-slate-400" />
                          </div>
                        </div>

                        {/* =====================================
                            PRODUCT INFORMATION
                        ===================================== */}

                        <div className="p-5">
                          {/* PRODUCT TYPE / CATEGORY */}

                          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted">
                            {product.product_type?.name ||
                              product.category?.name ||
                              "Produk"}
                          </p>

                          {/* PRODUCT NAME */}

                          <h3 className="mt-2 line-clamp-2 text-[17px] font-semibold leading-6 tracking-[-0.02em] text-text-primary">
                            {product.name}
                          </h3>

                          {/* PRICE */}

                          <div className="mt-6 flex items-end justify-between gap-4">
                            <div>
                              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-muted">
                                Harga mulai
                              </p>

                              <p className="mt-1 text-xl font-bold tracking-tight text-text-primary">
                                {lowestPrice !==
                                null
                                  ? formatRupiah(
                                      lowestPrice
                                    )
                                  : "—"}
                              </p>
                            </div>

                            {/* DETAIL ARROW */}

                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-text-secondary transition duration-300 group-hover:border-border-strong group-hover:bg-slate-50 group-hover:text-text-primary">
                              <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* =================================================
                    PAGINATION
                ================================================= */}

                {lastPage > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    {/* PREVIOUS */}

                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() =>
                        setPage((current) =>
                          Math.max(
                            current - 1,
                            1
                          )
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Halaman sebelumnya"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>

                    {/* PAGE */}

                    <div className="px-4 text-xs font-medium text-text-secondary">
                      {page} / {lastPage}
                    </div>

                    {/* NEXT */}

                    <button
                      type="button"
                      disabled={page >= lastPage}
                      onClick={() =>
                        setPage((current) =>
                          Math.min(
                            current + 1,
                            lastPage
                          )
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Halaman berikutnya"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
        </div>
      </section>
    </main>
  );
}