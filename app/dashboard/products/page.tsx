"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Package,
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
} from "lucide-react";

import { AuthGuard } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { formatRupiah } from "@/lib/format";

import {
  Product,
  Category,
  Brand,
  PaginatedResponse,
} from "@/types/api";

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Fetch Categories & Brands
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function loadFilters() {
      try {
        const [
          categoryResponse,
          brandResponse,
        ] = await Promise.all([
          apiFetch<{
            data: Category[];
          }>("/categories"),

          apiFetch<{
            data: Brand[];
          }>("/brands"),
        ]);

        if (cancelled) {
          return;
        }

        setCategories(categoryResponse.data);
        setBrands(brandResponse.data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Gagal mengambil filter:",
          error
        );
      }
    }

    loadFilters();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Fetch Products
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

        params.set("page", String(page));
        params.set("per_page", "10");

        if (search.trim()) {
          params.set(
            "search",
            search.trim()
          );
        }

        if (categoryId) {
          params.set(
            "category_id",
            categoryId
          );
        }

        if (brandId) {
          params.set(
            "brand_id",
            brandId
          );
        }

        const response =
          await apiFetch<
            PaginatedResponse<Product>
          >(
            `/products?${params.toString()}`
          );

        if (cancelled) {
          return;
        }

        setProducts(response.data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Gagal mengambil produk:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data produk."
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
    page,
    search,
    categoryId,
    brandId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Reset Filter
  |--------------------------------------------------------------------------
  */

  function handleReset() {
    setSearch("");
    setCategoryId("");
    setBrandId("");
    setPage(1);
  }

  /*
  |--------------------------------------------------------------------------
  | Delete Product
  |--------------------------------------------------------------------------
  */

  async function handleDelete(
    product: Product
  ) {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus "${product.name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(product.id);

      await apiFetch(
        `/products/${product.id}`,
        {
          method: "DELETE",
        }
      );

      /*
       * Setelah delete, ambil ulang data.
       * Kita tidak memanggil fetchProducts()
       * karena fetchProducts sudah kita pindahkan
       * ke dalam effect.
       *
       * Ubah page agar effect mengambil data terbaru.
       */
      setProducts((currentProducts) =>
        currentProducts.filter(
          (item) =>
            item.id !== product.id
        )
      );
    } catch (error) {
      console.error(error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Gagal menghapus produk."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-slate-700" />

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Manajemen Produk
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Kelola produk dan varian harga toko Anda.
          </p>
        </div>

        <Link
          href="/dashboard/products/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />

          Tambah Produk
        </Link>
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="grid gap-3 lg:grid-cols-[1fr_200px_200px_auto]">

          {/* Search */}
          <div className="relative">

            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari nama produk, SKU, brand..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />

          </div>

          {/* Category */}
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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

          {/* Brand */}
          <select
            value={brandId}
            onChange={(event) => {
              setBrandId(event.target.value);
              setPage(1);
            }}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
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

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />

            Reset
          </button>

        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px] text-left">

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Produk
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Kategori
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Brand
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Varian
                </th>

                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Harga
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Aksi
                </th>

              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {/* Loading */}
              {loading &&
                Array.from({ length: 5 }).map(
                  (_, index) => (
                    <tr key={index}>

                      <td className="px-6 py-5">
                        <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />

                        <div className="mt-2 h-3 w-28 animate-pulse rounded bg-slate-100" />
                      </td>

                      <td className="px-6 py-5">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                      </td>

                      <td className="px-6 py-5">
                        <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                      </td>

                      <td className="px-6 py-5">
                        <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
                      </td>

                      <td className="px-6 py-5">
                        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                      </td>

                      <td className="px-6 py-5">
                        <div className="ml-auto h-8 w-24 animate-pulse rounded bg-slate-200" />
                      </td>

                    </tr>
                  )
                )}

              {/* Empty */}
              {!loading &&
                products.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center"
                    >
                      <Package className="mx-auto h-10 w-10 text-slate-300" />

                      <h3 className="mt-4 text-sm font-semibold text-slate-800">
                        Produk tidak ditemukan
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Coba ubah pencarian atau filter
                        Anda.
                      </p>
                    </td>
                  </tr>
                )}

              {/* Products */}
              {!loading &&
                products.map((product) => {
                  const firstVariant =
                    product.variants[0];

                  return (
                    <tr
                      key={product.id}
                      className="transition hover:bg-slate-50"
                    >

                      {/* Product */}
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {product.name}
                          </p>

                          {product.sku && (
                            <p className="mt-1 text-xs text-slate-400">
                              SKU: {product.sku}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-5">
                        {product.category ? (
                          <span className="inline-flex rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                            {product.category.name}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* Brand */}
                      <td className="px-6 py-5">
                        {product.brand ? (
                          <span className="text-sm font-medium text-slate-700">
                            {product.brand.name}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      {/* Variants */}
                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {product.variants.length} varian
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-5">
                        {firstVariant ? (
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {formatRupiah(
                                firstVariant.price
                              )}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {firstVariant.name}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">
                            Belum ada harga
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1">

                          <Link
                            href={`/catalog/products/${product.id}`}
                            title="Lihat detail"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          <Link
                            href={`/dashboard/products/${product.id}/edit`}
                            title="Edit produk"
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>

                          <button
                            type="button"
                            title="Hapus produk"
                            disabled={
                              deletingId ===
                              product.id
                            }
                            onClick={() =>
                              handleDelete(product)
                            }
                            className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}

            </tbody>

          </table>
        </div>

        {/* Pagination */}
        {!loading &&
          products.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm text-slate-500">
                Halaman{" "}
                <span className="font-semibold text-slate-700">
                  {page}
                </span>
              </p>

              <div className="flex items-center gap-2">

                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() =>
                    setPage((current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Sebelumnya
                </button>

                <button
                  type="button"
                  disabled={
                    products.length < 10
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1
                    )
                  }
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Berikutnya
                </button>

              </div>
            </div>
          )}

      </section>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <AuthGuard>
      <ProductsContent />
    </AuthGuard>
  );
}

