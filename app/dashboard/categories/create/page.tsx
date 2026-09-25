"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Loader2,
  Tags,
  X,
} from "lucide-react";

import { apiFetch } from "@/lib/api";
import { AuthGuard } from "@/lib/auth";

export default function CreateCategoryPage() {
  const router = useRouter();

  // =========================================================
  // STATE
  // =========================================================

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");

  // =========================================================
  // VALIDATION
  // =========================================================

  function validateForm(): boolean {
    let valid = true;

    setNameError("");
    setError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError("Nama kategori wajib diisi.");
      valid = false;
    } else if (trimmedName.length < 2) {
      setNameError(
        "Nama kategori minimal terdiri dari 2 karakter."
      );
      valid = false;
    } else if (trimmedName.length > 100) {
      setNameError(
        "Nama kategori maksimal terdiri dari 100 karakter."
      );
      valid = false;
    }

    return valid;
  }

  // =========================================================
  // SUBMIT
  // =========================================================

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiFetch("/categories", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
        }),
      });

      router.push("/dashboard/categories");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Gagal membuat kategori. Silakan coba lagi."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // CANCEL
  // =========================================================

  function handleCancel() {
    if (loading) {
      return;
    }

    router.push("/dashboard/categories");
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <AuthGuard>
      <div className="space-y-6">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div>
          {/* Breadcrumb */}

          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>Manajemen</span>

            <span className="text-slate-300">
              /
            </span>

            <span>Kategori</span>

            <span className="text-slate-300">
              /
            </span>

            <span className="text-slate-600">
              Tambah
            </span>
          </div>

          {/* Title */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Tambah Kategori
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Tambahkan kategori produk baru ke
                dalam katalog.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              <ArrowLeft size={16} />

              Kembali
            </button>
          </div>
        </div>

        {/* =====================================================
            CENTERED FORM
        ====================================================== */}

        <div className="flex justify-center">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

            {/* =================================================
                CARD HEADER
            ================================================== */}

            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Tags
                    size={19}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Informasi Kategori
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Isi informasi kategori yang akan
                    digunakan pada katalog.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                FORM
            ================================================== */}

            <form
              onSubmit={handleSubmit}
              noValidate
            >
              <div className="space-y-6 px-5 py-6 sm:px-6">

                {/* =============================================
                    ERROR
                ============================================== */}

                {error && (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <X size={13} />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-red-700">
                        Gagal menyimpan kategori
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-red-600">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* =============================================
                    NAME
                ============================================== */}

                <div>
                  <label
                    htmlFor="category-name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Nama Kategori
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="category-name"
                    type="text"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);

                      if (nameError) {
                        setNameError("");
                      }

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="Contoh: Cat Tembok"
                    maxLength={100}
                    autoComplete="off"
                    autoFocus
                    disabled={loading}
                    className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                      nameError
                        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                        : "border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                    }`}
                  />

                  <div className="mt-2 flex items-start justify-between gap-4">
                    <div>
                      {nameError ? (
                        <p className="text-xs text-red-500">
                          {nameError}
                        </p>
                      ) : (
                        <p className="text-xs leading-5 text-slate-400">
                          Gunakan nama yang singkat dan
                          mudah dikenali.
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 text-xs text-slate-400">
                      {name.length}/100
                    </span>
                  </div>
                </div>

                {/* =============================================
                    INFORMATION
                ============================================== */}

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5">
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
                      <Tags size={12} />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-700">
                        Tentang kategori
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Kategori digunakan untuk
                        mengelompokkan produk sehingga
                        produk lebih mudah ditemukan dan
                        dikelola dalam katalog.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===============================================
                  FOOTER
              ================================================ */}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">

                {/* Batal */}

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X size={16} />

                  Batal
                </button>

                {/* Simpan */}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />

                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check size={16} />

                      Simpan Kategori
                    </>
                  )}
                </button>

              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
