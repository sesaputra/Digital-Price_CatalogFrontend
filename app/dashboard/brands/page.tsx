"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Tags,
  Trash2,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { AuthGuard, useAuth } from "@/lib/auth";
import { Brand } from "@/types/api";

export default function BrandsPage() {
  return (
    <AuthGuard>
      <BrandsContent />
    </AuthGuard>
  );
}

function BrandsContent() {
  const { user } = useAuth();

  const [brands, setBrands] = useState<Brand[]>([]);
  const [search, setSearch] = useState("");

  // `loading` hanya untuk pemuatan pertama kali (full-page spinner).
  // `refreshing` untuk pemuatan ulang lewat tombol Refresh, supaya
  // toolbar & tabel yang sudah ada tidak ikut hilang/berkedip.
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [page, setPage] = useState(1);
  const perPage = 10;

  // =========================================================
  // FETCH BRANDS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadBrands() {
      try {
        const response = await apiFetch<{ data: Brand[] }>("/brands");

        if (cancelled) {
          return;
        }

        setBrands(response.data);
        setError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Gagal memuat data brand."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void loadBrands();

    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // =========================================================
  // SEARCH (client-side)
  // =========================================================

  const filteredBrands = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return brands;
    }

    return brands.filter((brand) =>
      brand.name.toLowerCase().includes(keyword)
    );
  }, [brands, search]);

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  // =========================================================
  // PAGINATION (client-side)
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredBrands.length / perPage)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedBrands = filteredBrands.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  const startItem =
    filteredBrands.length === 0
      ? 0
      : (currentPage - 1) * perPage + 1;

  const endItem = Math.min(
    currentPage * perPage,
    filteredBrands.length
  );

  // =========================================================
  // REFRESH
  // =========================================================

  function handleRefresh() {
    setError("");
    setRefreshing(true);
    setRefreshKey((current) => current + 1);
  }

  // =========================================================
  // DELETE BRAND
  // =========================================================

  async function handleDelete(brand: Brand) {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus brand "${brand.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(brand.id);
      setError("");

      await apiFetch(`/brands/${brand.id}`, {
        method: "DELETE",
      });

      setBrands((current) =>
        current.filter((item) => item.id !== brand.id)
      );

      if (paginatedBrands.length === 1 && currentPage > 1) {
        setPage((current) => current - 1);
      }
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus brand."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // =========================================================
  // INITIAL LOADING (full page, hanya sekali di awal)
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">
            Memuat data brand...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="space-y-6">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <section className="rounded-2xl border border-slate-200/80 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <span>Manajemen</span>

              <span>/</span>

              <span className="text-slate-700">Brand</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Tags size={21} strokeWidth={1.8} />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                  Brand
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Kelola brand produk yang tersedia di toko Anda.
                </p>
              </div>
            </div>
          </div>

          {user?.role === "owner" && (
            <Link
              href="/dashboard/brands/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus size={18} />
              Tambah Brand
            </Link>
          )}
        </div>
      </section>

      {/* =========================================================
          ERROR
      ========================================================= */}

      {error && (
        <div className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-red-700">{error}</p>

          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50 sm:self-auto"
          >
            <RefreshCw size={14} />
            Coba Lagi
          </button>
        </div>
      )}

      {/* =========================================================
          CONTENT
      ========================================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {/* Toolbar */}

        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              placeholder="Cari brand..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              {filteredBrands.length} brand
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {filteredBrands.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Tags size={25} strokeWidth={1.7} />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              {search ? "Brand tidak ditemukan" : "Belum ada brand"}
            </h3>

            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              {search
                ? "Coba gunakan kata kunci pencarian yang berbeda."
                : "Tambahkan brand pertama untuk mulai mengelola data brand produk."}
            </p>

            {!search && user?.role === "owner" && (
              <Link
                href="/dashboard/brands/create"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Plus size={17} />
                Tambah Brand
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* =================================================
                DESKTOP TABLE
            ================================================= */}

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="w-20 px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      #
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Brand
                    </th>

                    {user?.role === "owner" && (
                      <th className="w-32 px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody>
                  {paginatedBrands.map((brand, index) => (
                    <tr
                      key={brand.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {(currentPage - 1) * perPage + index + 1}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Tags size={17} />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {brand.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              ID #{brand.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      {user?.role === "owner" && (
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/brands/${brand.id}/edit`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                              title="Edit brand"
                            >
                              <Pencil size={16} />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleDelete(brand)}
                              disabled={deletingId === brand.id}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 text-red-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Hapus brand"
                            >
                              {deletingId === brand.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* =================================================
                MOBILE LIST
            ================================================= */}

            <div className="divide-y divide-slate-100 md:hidden">
              {paginatedBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <Tags size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {brand.name}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-400">
                        ID #{brand.id}
                      </p>
                    </div>
                  </div>

                  {user?.role === "owner" && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      <Link
                        href={`/dashboard/brands/${brand.id}/edit`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                      >
                        <Pencil size={16} />
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(brand)}
                        disabled={deletingId === brand.id}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === brand.id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* =================================================
                PAGINATION
            ================================================= */}

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Menampilkan{" "}
                <span className="font-medium text-slate-700">
                  {startItem}
                </span>{" "}
                sampai{" "}
                <span className="font-medium text-slate-700">
                  {endItem}
                </span>{" "}
                dari{" "}
                <span className="font-medium text-slate-700">
                  {filteredBrands.length}
                </span>{" "}
                brand
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                  disabled={currentPage <= 1}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} />
                </button>

                <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-slate-900 px-3 text-sm font-medium text-white">
                  {currentPage}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(totalPages, current + 1)
                    )
                  }
                  disabled={currentPage >= totalPages}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}