"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  Save,
  Loader2,
  Globe,
  Lock,
} from "lucide-react";
import { useEffect, useState } from "react";

import { AuthGuard } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import {
  Brand,
  Category,
  ProductType,
} from "@/types/api";

interface VariantForm {
  name: string;
  unit: string;
  price: string;
}

function CreateProductContent() {
  const router = useRouter();

  // =========================================================
  // MASTER DATA
  // =========================================================

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [brands, setBrands] =
    useState<Brand[]>([]);

  const [productTypes, setProductTypes] =
    useState<ProductType[]>([]);

  // =========================================================
  // FORM
  // =========================================================

  const [name, setName] =
    useState("");

  const [sku, setSku] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [categoryId, setCategoryId] =
    useState("");

  const [productTypeId, setProductTypeId] =
    useState("");

  const [brandId, setBrandId] =
    useState("");

  const [isPublic, setIsPublic] =
    useState(true);

  const [variants, setVariants] =
    useState<VariantForm[]>([
      {
        name: "",
        unit: "",
        price: "",
      },
    ]);

  // =========================================================
  // UI STATE
  // =========================================================

  const [loadingMasterData, setLoadingMasterData] =
    useState(true);

  const [loadingProductTypes, setLoadingProductTypes] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================================================
  // LOAD CATEGORY + BRAND
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadMasterData() {
      try {
        setLoadingMasterData(true);
        setError("");

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
          "Gagal mengambil master data:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data kategori dan brand."
        );
      } finally {
        if (!cancelled) {
          setLoadingMasterData(false);
        }
      }
    }

    loadMasterData();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // LOAD PRODUCT TYPES
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadProductTypes() {
      if (!categoryId) {
        setProductTypes([]);
        setProductTypeId("");
        return;
      }

      try {
        setLoadingProductTypes(true);

        const response =
          await apiFetch<{
            data: ProductType[];
          }>(
            `/product-types?category_id=${categoryId}`
          );

        if (cancelled) {
          return;
        }

        setProductTypes(response.data);

        // Reset jenis produk jika tidak tersedia
        setProductTypeId("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Gagal mengambil jenis produk:",
          error
        );

        setProductTypes([]);
        setProductTypeId("");

        setError(
          error instanceof Error
            ? error.message
            : "Gagal mengambil jenis produk."
        );
      } finally {
        if (!cancelled) {
          setLoadingProductTypes(false);
        }
      }
    }

    loadProductTypes();

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  // =========================================================
  // CATEGORY CHANGE
  // =========================================================

  function handleCategoryChange(
    value: string
  ) {
    setCategoryId(value);

    // Jenis produk akan di-reset
    // karena category berubah.
    setProductTypeId("");
  }

  // =========================================================
  // VARIANT
  // =========================================================

  function addVariant() {
    setVariants((current) => [
      ...current,
      {
        name: "",
        unit: "",
        price: "",
      },
    ]);
  }

  function removeVariant(index: number) {
    setVariants((current) => {
      if (current.length === 1) {
        return current;
      }

      return current.filter(
        (_, variantIndex) =>
          variantIndex !== index
      );
    });
  }

  function updateVariant(
    index: number,
    field: keyof VariantForm,
    value: string
  ) {
    setVariants((current) =>
      current.map((variant, variantIndex) =>
        variantIndex === index
          ? {
              ...variant,
              [field]: value,
            }
          : variant
      )
    );
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    // -------------------------------------------------------
    // FRONTEND VALIDATION
    // -------------------------------------------------------

    if (!name.trim()) {
      setError("Nama produk wajib diisi.");
      return;
    }

    if (!categoryId) {
      setError("Kategori wajib dipilih.");
      return;
    }

    if (!productTypeId) {
      setError("Jenis produk wajib dipilih.");
      return;
    }

    if (!brandId) {
      setError("Brand wajib dipilih.");
      return;
    }

    if (variants.length === 0) {
      setError(
        "Produk harus memiliki minimal satu varian."
      );
      return;
    }

    const invalidVariant = variants.some(
      (variant) =>
        !variant.name.trim() ||
        !variant.unit.trim() ||
        !variant.price ||
        Number(variant.price) <= 0
    );

    if (invalidVariant) {
      setError(
        "Semua varian harus memiliki nama, unit, dan harga yang valid."
      );
      return;
    }

    // -------------------------------------------------------
    // SUBMIT
    // -------------------------------------------------------

    try {
      setSaving(true);

      const payload = {
        name: name.trim(),

        sku: sku.trim() || null,

        description:
          description.trim() || null,

        category_id: Number(categoryId),

        product_type_id:
          Number(productTypeId),

        brand_id: Number(brandId),

        is_public: isPublic,

        variants: variants.map((variant) => ({
          name: variant.name.trim(),

          unit: variant.unit.trim(),

          price: Number(variant.price),
        })),
      };

      const response =
        await apiFetch<{
          data: {
            id: number;
          };
        }>("/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });

      router.push(
        `/dashboard/products/${response.data.id}`
      );
    } catch (error) {
      console.error(
        "Gagal membuat produk:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Gagal membuat produk."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loadingMasterData) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-5">
            <div className="h-6 w-48 animate-pulse rounded bg-slate-100" />

            <div className="grid gap-5 md:grid-cols-2">
              <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
              <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Produk
          </Link>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Produk
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Tambah Produk
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Tambahkan produk baru ke katalog toko.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Batal
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Simpan Produk
              </>
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* =====================================================
          INFORMASI PRODUK
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Package className="h-5 w-5 text-slate-500" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Informasi Produk
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-900">
                Data Utama
              </h2>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* NAMA + SKU */}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Nama Produk
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Contoh: Avian Cat Tembok"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <div>
              <label
                htmlFor="sku"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                SKU
              </label>

              <input
                id="sku"
                type="text"
                value={sku}
                onChange={(event) =>
                  setSku(event.target.value)
                }
                placeholder="Contoh: CAT-AVN-001"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>
          </div>

          {/* CATEGORY + PRODUCT TYPE */}

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Kategori
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <select
                id="category"
                value={categoryId}
                onChange={(event) =>
                  handleCategoryChange(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                <option value="">
                  Pilih kategori
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
            </div>

            <div>
              <label
                htmlFor="productType"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Jenis Produk
                <span className="text-red-500">
                  {" "}
                  *
                </span>
              </label>

              <select
                id="productType"
                value={productTypeId}
                onChange={(event) =>
                  setProductTypeId(
                    event.target.value
                  )
                }
                disabled={
                  !categoryId ||
                  loadingProductTypes
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              >
                <option value="">
                  {loadingProductTypes
                    ? "Memuat jenis produk..."
                    : !categoryId
                      ? "Pilih kategori terlebih dahulu"
                      : productTypes.length === 0
                        ? "Belum ada jenis produk"
                        : "Pilih jenis produk"}
                </option>

                {productTypes.map(
                  (productType) => (
                    <option
                      key={productType.id}
                      value={productType.id}
                    >
                      {productType.name}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* BRAND */}

          <div>
            <label
              htmlFor="brand"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Brand
              <span className="text-red-500">
                {" "}
                *
              </span>
            </label>

            <select
              id="brand"
              value={brandId}
              onChange={(event) =>
                setBrandId(event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">
                Pilih brand
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

          {/* DESCRIPTION */}

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Deskripsi
            </label>

            <textarea
              id="description"
              rows={5}
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="Tambahkan informasi singkat mengenai produk..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          STATUS KATALOG
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Visibilitas
          </p>

          <h2 className="mt-1 text-lg font-bold text-slate-900">
            Status Katalog
          </h2>
        </div>

        <div className="grid gap-4 p-6 md:grid-cols-2">
          {/* PUBLIC */}

          <button
            type="button"
            onClick={() => setIsPublic(true)}
            className={`rounded-2xl border p-5 text-left transition ${
              isPublic
                ? "border-slate-900 bg-slate-50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  isPublic
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Globe className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Publik
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Produk dapat dilihat oleh
                  pengunjung katalog.
                </p>
              </div>
            </div>
          </button>

          {/* PRIVATE */}

          <button
            type="button"
            onClick={() => setIsPublic(false)}
            className={`rounded-2xl border p-5 text-left transition ${
              !isPublic
                ? "border-slate-900 bg-slate-50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  !isPublic
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <Lock className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Privat
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Produk hanya dapat dilihat
                  melalui dashboard.
                </p>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* =====================================================
          VARIANTS
      ===================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Harga Produk
            </p>

            <h2 className="mt-1 text-lg font-bold text-slate-900">
              Varian Harga
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Tambahkan ukuran atau kemasan beserta
              harga masing-masing.
            </p>
          </div>

          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Tambah Varian
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {variants.map(
              (variant, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_auto] lg:items-end">
                    {/* VARIANT NAME */}

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Ukuran / Varian
                      </label>

                      <input
                        type="text"
                        value={variant.name}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="Contoh: 5 kg"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />
                    </div>

                    {/* UNIT */}

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Unit
                      </label>

                      <input
                        type="text"
                        value={variant.unit}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "unit",
                            event.target.value
                          )
                        }
                        placeholder="Contoh: kaleng"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />
                    </div>

                    {/* PRICE */}

                    <div>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Harga
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={variant.price}
                        onChange={(event) =>
                          updateVariant(
                            index,
                            "price",
                            event.target.value
                          )
                        }
                        placeholder="Contoh: 125000"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                      />
                    </div>

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={() =>
                        removeVariant(index)
                      }
                      disabled={
                        variants.length === 1
                      }
                      title="Hapus varian"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          BOTTOM ACTION
      ===================================================== */}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/dashboard/products"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          Batal
        </Link>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Simpan Produk
            </>
          )}
        </button>
      </div>
    </form>
  );
}

export default function CreateProductPage() {
  return (
    <AuthGuard>
      <CreateProductContent />
    </AuthGuard>
  );
}