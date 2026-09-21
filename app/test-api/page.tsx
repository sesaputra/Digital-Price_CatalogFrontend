"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, logout } from "@/lib/api";

type Product = {
  id: number;
  name: string;
  sku: string | null;
  description: string | null;
};

type ProductResponse = {
  data: Product[];
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  tenant: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

export default function TestApiPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        // Ambil data user yang sedang login
        const userResponse = await apiFetch<{ user: User }>(
          "/auth/me"
        );

        setUser(userResponse.user);

        // Ambil produk berdasarkan tenant user
        const productResponse =
          await apiFetch<ProductResponse>("/products");

        setProducts(productResponse.data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Gagal mengambil data.");
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  async function handleLogout() {
    try {
      setLogoutLoading(true);

      await logout();

      router.push("/login");
    } catch (error) {
      console.error("Logout gagal:", error);

      // Tetap hapus session lokal dan arahkan ke login
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      router.push("/login");
    } finally {
      setLogoutLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Test Laravel API
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Pengujian koneksi Next.js dengan Laravel API
            </p>
          </div>

          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {logoutLoading ? "Keluar..." : "Logout"}
          </button>
        </div>

        {/* User Information */}
        {user && (
          <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Informasi Login
              </h2>

              <p className="text-sm text-slate-500">
                Data user yang diperoleh dari Laravel Sanctum
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Nama
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {user.name}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Email
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Role
                </p>

                <p className="mt-1 text-sm font-medium capitalize text-slate-800">
                  {user.role}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Toko
                </p>

                <p className="mt-1 text-sm font-medium text-slate-800">
                  {user.tenant?.name ?? "-"}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Mengambil data dari Laravel...
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
            <p className="font-semibold">
              Gagal mengambil data
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Products */}
        {!loading && !error && (
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Produk
              </h2>

              <p className="text-sm text-slate-500">
                Data produk dari tenant yang sedang login
              </p>
            </div>

            {products.length === 0 ? (
              <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-slate-500">
                  Belum ada produk.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {product.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          SKU: {product.sku ?? "-"}
                        </p>
                      </div>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        ID #{product.id}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-slate-600">
                      {product.description ??
                        "Tidak ada deskripsi."}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
