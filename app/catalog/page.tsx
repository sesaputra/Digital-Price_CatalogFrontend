"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import {
  Brand,
  Category,
  Product,
  ProductResponse,
  ProductType,
} from "@/types/api";

import ProductCard from "@/components/ProductCard";

interface MasterDataResponse<T> {
  data: T[];
}

export default function CatalogPage() {
  const { user, logout } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [productTypeId, setProductTypeId] =
    useState("");
  const [brandId, setBrandId] = useState("");

  const [page, setPage] = useState(1);

  const [lastPage, setLastPage] = useState(1);
  const [totalProducts, setTotalProducts] =
    useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
  |--------------------------------------------------------------------------
  | Load Categories
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        const response =
          await apiFetch<MasterDataResponse<Category>>(
            "/categories"
          );

        if (mounted) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error(
          "Gagal mengambil kategori:",
          error
        );
      }
    }

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load Brands
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    async function loadBrands() {
      try {
        const response =
          await apiFetch<MasterDataResponse<Brand>>(
            "/brands"
          );

        if (mounted) {
          setBrands(response.data);
        }
      } catch (error) {
        console.error(
          "Gagal mengambil brand:",
          error
        );
      }
    }

    loadBrands();

    return () => {
      mounted = false;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load Product Types
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    async function loadProductTypes() {
      try {
        const endpoint = categoryId
          ? `/product-types?category_id=${categoryId}`
          : "/product-types";

        const response =
          await apiFetch<
            MasterDataResponse<ProductType>
          >(endpoint);

        if (mounted) {
          setProductTypes(response.data);
        }
      } catch (error) {
        console.error(
          "Gagal mengambil jenis produk:",
          error
        );
      }
    }

    loadProductTypes();

    return () => {
      mounted = false;
    };
  }, [categoryId]);

  /*
  |--------------------------------------------------------------------------
  | Load Products
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();

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

        if (productTypeId) {
          params.set(
            "product_type_id",
            productTypeId
          );
        }

        if (brandId) {
          params.set(
            "brand_id",
            brandId
          );
        }

        params.set("page", String(page));
        params.set("per_page", "9");

        const response =
          await apiFetch<ProductResponse>(
            `/products?${params.toString()}`
          );

        if (!mounted) {
          return;
        }

        setProducts(response.data);
        setLastPage(response.last_page);
        setTotalProducts(response.total);
      } catch (error) {
        if (!mounted) {
          return;
        }

        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError(
            "Gagal mengambil data produk."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      mounted = false;
    };
  }, [
    search,
    categoryId,
    productTypeId,
    brandId,
    page,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Category Change
  |--------------------------------------------------------------------------
  */

  function handleCategoryChange(
    value: string
  ) {
    setCategoryId(value);

    setProductTypeId("");

    setPage(1);
  }

  /*
  |--------------------------------------------------------------------------
  | Reset Filter
  |--------------------------------------------------------------------------
  */

  function resetFilters() {
    setSearch("");
    setCategoryId("");
    setProductTypeId("");
    setBrandId("");
    setPage(1);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-lg font-bold text-slate-900">
              Digital Price Catalog
            </p>

            <p className="text-xs text-slate-500">
              {user?.tenant?.name}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-800">
                {user?.name}
              </p>

              <p className="text-xs text-slate-400">
                {user?.role}
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Heading */}
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Katalog Produk
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Cari harga produk dengan cepat
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Temukan produk berdasarkan kategori,
            jenis produk, brand, atau nama produk.
          </p>
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari nama produk, SKU, brand, jenis, atau ukuran..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
            />
          </div>

          {/* Filters */}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {/* Category */}
            <select
              value={categoryId}
              onChange={(event) =>
                handleCategoryChange(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="">
                Semua kategori
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

            {/* Product Type */}
            <select
              value={productTypeId}
              onChange={(event) => {
                setProductTypeId(
                  event.target.value
                );
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="">
                Semua jenis produk
              </option>

              {productTypes.map((type) => (
                <option
                  key={type.id}
                  value={type.id}
                >
                  {type.name}
                </option>
              ))}
            </select>

            {/* Brand */}
            <select
              value={brandId}
              onChange={(event) => {
                setBrandId(
                  event.target.value
                );
                setPage(1);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="">
                Semua brand
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
          </div>

          {/* Filter footer */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              {totalProducts} produk ditemukan
            </p>

            <button
              onClick={resetFilters}
              className="text-xs font-medium text-slate-500 transition hover:text-slate-900"
            >
              Reset filter
            </button>
          </div>
        </div>

        {/* Products */}
        <div className="mt-8">
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(
                (item) => (
                  <div
                    key={item}
                    className="h-80 animate-pulse rounded-2xl bg-slate-200"
                  />
                )
              )}
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <h2 className="text-lg font-semibold text-slate-800">
                Produk tidak ditemukan
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Coba ubah kata pencarian atau
                filter yang digunakan.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>

              {/* Pagination */}
              {lastPage > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() =>
                      setPage(
                        (current) =>
                          current - 1
                      )
                    }
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>

                  <div className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                    {page} / {lastPage}
                  </div>

                  <button
                    disabled={
                      page >= lastPage
                    }
                    onClick={() =>
                      setPage(
                        (current) =>
                          current + 1
                      )
                    }
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}