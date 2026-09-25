"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Tags,
  Pencil,
  Trash2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Layers3,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { AuthGuard } from "@/lib/auth";
import {
  Category,
  PaginatedResponse,
} from "@/types/api";

export default function CategoriesPage() {
  // =========================================================
  // STATE
  // =========================================================

  const [categories, setCategories] = useState<Category[]>(
    []
  );

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<
    number | null
  >(null);

  const [error, setError] = useState("");

  const [refreshKey, setRefreshKey] = useState(0);

  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });

  // =========================================================
  // SEARCH DEBOUNCE
  // =========================================================

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, [search]);

  // =========================================================
  // RESET PAGE SAAT SEARCH BERUBAH
  // =========================================================

 function handleSearch(value: string) {
  setSearch(value);

  if (page !== 1) {
    setPage(1);
  }
}

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadCategories() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("per_page", "10");

        if (debouncedSearch.trim()) {
          params.set(
            "search",
            debouncedSearch.trim()
          );
        }

        const response = await apiFetch<
          PaginatedResponse<Category>
        >(
          `/categories?${params.toString()}`
        );

        console.log("RAW /categories response:", response);

        // Jangan update state jika request
        // sudah tidak relevan.
        if (cancelled) {
          return;
        }

        setCategories(response.data);

        setMeta({
          current_page:
            response.meta.current_page,
          last_page:
            response.meta.last_page,
          total:
            response.meta.total,
          per_page:
            response.meta.per_page,
        });
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Gagal memuat data kategori."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCategories();

    return () => {
      cancelled = true;
    };
  }, [
    page,
    debouncedSearch,
    refreshKey,
  ]);


  // =========================================================
  // REFRESH
  // =========================================================

  function handleRefresh() {
    setRefreshKey(
      (current) => current + 1
    );
  }

  // =========================================================
  // DELETE CATEGORY
  // =========================================================

  async function handleDelete(
    category: Category
  ) {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus kategori "${category.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(category.id);
    setError("");

    try {
      await apiFetch(
        `/categories/${category.id}`,
        {
          method: "DELETE",
        }
      );

      /*
       * Jika kategori terakhir pada halaman
       * dihapus, kembali ke halaman sebelumnya.
       */
      if (
        categories.length === 1 &&
        page > 1
      ) {
        setPage(
          (current) => current - 1
        );
      } else {
        // Reload data pada halaman yang sama.
        setRefreshKey(
          (current) => current + 1
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Gagal menghapus kategori."
        );
      }
    } finally {
      setDeletingId(null);
    }
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  function handlePreviousPage() {
    if (page > 1) {
      setPage(
        (current) => current - 1
      );
    }
  }

  function handleNextPage() {
    if (page < meta.last_page) {
      setPage(
        (current) => current + 1
      );
    }
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <AuthGuard>
      <div className="space-y-6">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <section>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">

                <Tags className="h-4 w-4" />

                <span>
                  Manajemen
                </span>

                <span>
                  /
                </span>

                <span className="text-slate-600">
                  Kategori
                </span>

              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Kategori Produk
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Kelola kategori produk untuk
                katalog toko Anda.
              </p>
            </div>

            <Link
              href="/dashboard/categories/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" />

              Tambah Kategori
            </Link>

          </div>
        </section>

        {/* =====================================================
            SUMMARY
        ====================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">

          {/* TOTAL CATEGORY */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Total Kategori
                </p>

                {loading ? (
                  <div className="mt-2 h-8 w-16 animate-pulse rounded-lg bg-slate-100" />
                ) : (
                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                    {meta.total}
                  </p>
                )}

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <Tags className="h-5 w-5 text-slate-600" />
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Jumlah kategori pada toko Anda
            </p>

          </div>

          {/* CURRENT PAGE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Halaman
                </p>

                {loading ? (
                  <div className="mt-2 h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
                ) : (
                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">

                    {meta.current_page}

                    <span className="ml-1 text-base font-medium text-slate-400">
                      / {meta.last_page}
                    </span>

                  </p>
                )}

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                <Layers3 className="h-5 w-5 text-slate-600" />
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Menampilkan maksimal{" "}
              {meta.per_page} kategori per
              halaman
            </p>

          </div>

        </section>

        {/* =====================================================
            SEARCH & TOOLBAR
        ====================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

            {/* SEARCH */}

            <div className="relative w-full sm:max-w-md">

              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  handleSearch(
                    event.target.value
                  )
                }
                placeholder="Cari kategori..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
              />

            </div>

            {/* REFRESH */}

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <RotateCcw
                className={`h-4 w-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh

            </button>

          </div>

        </section>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-semibold text-red-800">
                  Terjadi kesalahan
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>

              </div>

              <button
                type="button"
                onClick={handleRefresh}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
              >

                <RotateCcw className="h-4 w-4" />

                Coba Lagi

              </button>

            </div>

          </div>
        )}

        {/* =====================================================
            CATEGORY TABLE
        ====================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* TABLE HEADER */}

          <div className="border-b border-slate-100 px-5 py-4">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-sm font-semibold text-slate-900">
                  Daftar Kategori
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Kelola kategori yang digunakan
                  pada produk.
                </p>

              </div>

              {!loading && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  {meta.total} kategori
                </span>
              )}

            </div>

          </div>

          {/* =================================================
              LOADING
          ================================================== */}

          {loading ? (

            <div className="divide-y divide-slate-100">

              {Array.from({
                length: 6,
              }).map((_, index) => (

                <div
                  key={index}
                  className="flex items-center justify-between px-5 py-5"
                >

                  <div className="flex items-center gap-4">

                    <div className="h-10 w-10 animate-pulse rounded-xl bg-slate-100" />

                    <div className="space-y-2">

                      <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />

                      <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />

                    </div>

                  </div>

                  <div className="flex gap-2">

                    <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />

                    <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-100" />

                  </div>

                </div>

              ))}

            </div>

          ) : categories.length === 0 ? (

            /* =================================================
               EMPTY STATE
            ================================================== */

            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">

                <Tags className="h-6 w-6 text-slate-400" />

              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">

                {debouncedSearch
                  ? "Kategori tidak ditemukan"
                  : "Belum ada kategori"}

              </h3>

              <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">

                {debouncedSearch
                  ? "Coba gunakan kata kunci pencarian yang berbeda."
                  : "Tambahkan kategori pertama untuk mulai mengelola produk Anda."}

              </p>

              {!debouncedSearch && (
                <Link
                  href="/dashboard/categories/create"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >

                  <Plus className="h-4 w-4" />

                  Tambah Kategori

                </Link>
              )}

            </div>

          ) : (

            /* =================================================
               DATA
            ================================================== */

            <>

              {/* =================================================
                  DESKTOP TABLE
              ================================================== */}

              <div className="hidden overflow-x-auto md:block">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-slate-100 bg-slate-50/70">

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        #
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Kategori
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        ID
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Aksi
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {categories.map(
                      (category, index) => {

                        const rowNumber =
                          (meta.current_page -
                            1) *
                            meta.per_page +
                          index +
                          1;

                        return (
                          <tr
                            key={category.id}
                            className="group transition hover:bg-slate-50/70"
                          >

                            {/* NUMBER */}

                            <td className="px-5 py-4 text-sm text-slate-400">
                              {rowNumber}
                            </td>

                            {/* CATEGORY */}

                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">

                                  <Tags className="h-4 w-4 text-slate-500" />

                                </div>

                                <div>

                                  <p className="text-sm font-semibold text-slate-900">
                                    {category.name}
                                  </p>

                                  <p className="mt-0.5 text-xs text-slate-400">
                                    Kategori produk
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* ID */}

                            <td className="px-5 py-4">

                              <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-500">
                                #{category.id}
                              </span>

                            </td>

                            {/* ACTION */}

                            <td className="px-5 py-4">

                              <div className="flex items-center justify-end gap-2">

                                <Link
                                  href={`/dashboard/categories/${category.id}/edit`}
                                  title="Edit kategori"
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                                >

                                  <Pencil className="h-4 w-4" />

                                </Link>

                                <button
                                  type="button"
                                  title="Hapus kategori"
                                  onClick={() =>
                                    handleDelete(
                                      category
                                    )
                                  }
                                  disabled={
                                    deletingId ===
                                    category.id
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                  {deletingId ===
                                  category.id ? (
                                    <RotateCcw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}

                                </button>

                              </div>

                            </td>

                          </tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

              {/* =================================================
                  MOBILE LIST
              ================================================== */}

              <div className="divide-y divide-slate-100 md:hidden">

                {categories.map(
                  (category, index) => {

                    const rowNumber =
                      (meta.current_page -
                        1) *
                        meta.per_page +
                      index +
                      1;

                    return (
                      <div
                        key={category.id}
                        className="p-5"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">

                              <Tags className="h-4 w-4 text-slate-500" />

                            </div>

                            <div className="min-w-0">

                              <p className="truncate text-sm font-semibold text-slate-900">
                                {category.name}
                              </p>

                              <div className="mt-1 flex items-center gap-2">

                                <span className="text-xs text-slate-400">
                                  #{rowNumber}
                                </span>

                                <span className="text-slate-300">
                                  •
                                </span>

                                <span className="text-xs text-slate-400">
                                  ID {category.id}
                                </span>

                              </div>

                            </div>

                          </div>

                          <div className="flex shrink-0 items-center gap-2">

                            <Link
                              href={`/dashboard/categories/${category.id}/edit`}
                              title="Edit kategori"
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                            >

                              <Pencil className="h-4 w-4" />

                            </Link>

                            <button
                              type="button"
                              title="Hapus kategori"
                              onClick={() =>
                                handleDelete(
                                  category
                                )
                              }
                              disabled={
                                deletingId ===
                                category.id
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                              {deletingId ===
                              category.id ? (
                                <RotateCcw className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}

                            </button>

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </>

          )}

          {/* =====================================================
              PAGINATION
          ====================================================== */}

          {!loading &&
            categories.length > 0 &&
            meta.last_page > 1 && (

              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-xs text-slate-400">

                  Halaman{" "}

                  <span className="font-medium text-slate-600">
                    {meta.current_page}
                  </span>

                  {" "}dari{" "}

                  <span className="font-medium text-slate-600">
                    {meta.last_page}
                  </span>

                </p>

                <div className="flex items-center gap-2">

                  <button
                    type="button"
                    onClick={
                      handlePreviousPage
                    }
                    disabled={page <= 1}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    <ChevronLeft className="h-4 w-4" />

                    Sebelumnya

                  </button>

                  <button
                    type="button"
                    onClick={
                      handleNextPage
                    }
                    disabled={
                      page >=
                      meta.last_page
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >

                    Berikutnya

                    <ChevronRight className="h-4 w-4" />

                  </button>

                </div>

              </div>

            )}

        </section>

      </div>
    </AuthGuard>
  );
}
