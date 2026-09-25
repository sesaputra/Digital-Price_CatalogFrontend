"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save, Tags, Trash2 } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { AuthGuard, useAuth } from "@/lib/auth";
import { Brand } from "@/types/api";

export default function EditBrandPage() {
  return (
    <AuthGuard>
      <EditBrandContent />
    </AuthGuard>
  );
}

function EditBrandContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();

  const brandId = params.id;

  // =========================================================
  // STATE
  // =========================================================

  const [brand, setBrand] = useState<Brand | null>(null);
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");

  // =========================================================
  // FETCH BRAND
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadBrand() {
      setLoading(true);
      setLoadError("");

      try {
        const response = await apiFetch<{ data: Brand }>(
          `/brands/${brandId}`
        );

        if (cancelled) {
          return;
        }

        setBrand(response.data);
        setName(response.data.name);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "Gagal memuat data brand."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (brandId) {
      void loadBrand();
    }

    return () => {
      cancelled = true;
    };
  }, [brandId]);

  // =========================================================
  // SUBMIT (UPDATE)
  // =========================================================

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setFormError("Nama brand wajib diisi.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      await apiFetch(`/brands/${brandId}`, {
        method: "PUT",
        body: JSON.stringify({ name: trimmedName }),
      });

      router.push("/dashboard/brands");
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan perubahan brand."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // DELETE
  // =========================================================

  async function handleDelete() {
    if (!brand) {
      return;
    }

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus brand "${brand.name}"?`
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setFormError("");

    try {
      await apiFetch(`/brands/${brandId}`, {
        method: "DELETE",
      });

      router.push("/dashboard/brands");
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus brand."
      );
      setDeleting(false);
    }
  }

  // =========================================================
  // GUARD: hanya owner yang boleh mengedit
  // =========================================================

  if (user && user.role !== "owner") {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Tags size={25} strokeWidth={1.7} />
          </div>

          <h1 className="mt-4 text-sm font-semibold text-slate-900">
            Akses ditolak
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Anda tidak memiliki izin untuk mengubah data brand.
          </p>

          <Link
            href="/dashboard/brands"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            Kembali ke Brand
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================
  // LOADING
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
  // LOAD ERROR / NOT FOUND
  // =========================================================

  if (loadError || !brand) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <Tags size={25} strokeWidth={1.7} />
          </div>

          <h1 className="mt-4 text-sm font-semibold text-slate-900">
            Brand tidak ditemukan
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {loadError || "Brand yang Anda cari tidak tersedia."}
          </p>

          <Link
            href="/dashboard/brands"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <ArrowLeft size={16} />
            Kembali ke Brand
          </Link>
        </div>
      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="mx-auto max-w-2xl space-y-6">
      {/* =========================================================
          HEADER
      ========================================================= */}

      <section>
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          <Link
            href="/dashboard/brands"
            className="transition hover:text-slate-700"
          >
            Brand
          </Link>

          <span>/</span>

          <span className="text-slate-700">Edit</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Tags size={21} strokeWidth={1.8} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Edit Brand
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Perbarui informasi brand{" "}
              <span className="font-medium text-slate-700">
                {brand.name}
              </span>
              .
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          FORM
      ========================================================= */}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Nama Brand
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Contoh: Semen Gresik"
              autoFocus
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              ID #{brand.id}
            </p>
          </div>

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-500" />
              ) : (
                <Trash2 size={16} />
              )}
              Hapus Brand
            </button>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/brands"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </Link>

              <button
                type="submit"
                disabled={saving || deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <Save size={16} />
                )}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  );
}