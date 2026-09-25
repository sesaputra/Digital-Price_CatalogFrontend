"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Plus, Tags } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { AuthGuard, useAuth } from "@/lib/auth";

export default function CreateBrandPage() {
  return (
    <AuthGuard>
      <CreateBrandContent />
    </AuthGuard>
  );
}

function CreateBrandContent() {
  const router = useRouter();
  const { user } = useAuth();

  // =========================================================
  // STATE
  // =========================================================

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // =========================================================
  // SUBMIT
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
      await apiFetch("/brands", {
        method: "POST",
        body: JSON.stringify({ name: trimmedName }),
      });

      router.push("/dashboard/brands");
      router.refresh();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan brand."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // GUARD: hanya owner yang boleh membuat brand
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
            Anda tidak memiliki izin untuk menambahkan brand.
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

          <span className="text-slate-700">Tambah</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Tags size={21} strokeWidth={1.8} />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Tambah Brand
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Buat brand baru untuk digunakan pada produk Anda.
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
              onChange={(event) => {
                setName(event.target.value);

                if (formError) {
                  setFormError("");
                }
              }}
              placeholder="Contoh: Semen Gresik"
              autoFocus
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />

            <p className="mt-1.5 text-xs text-slate-400">
              Nama brand akan tampil pada daftar produk yang menggunakannya.
            </p>
          </div>

          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
            <Link
              href="/dashboard/brands"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <Plus size={16} />
              )}
              Simpan Brand
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}