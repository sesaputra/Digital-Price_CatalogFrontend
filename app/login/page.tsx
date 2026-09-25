"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import { apiFetch } from "@/lib/api";
import { User } from "@/types/api";

interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response =
        await apiFetch<LoginResponse>(
          "/auth/login",
          {
            method: "POST",
            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

      localStorage.setItem(
        "token",
        response.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      router.push("/dashboard/products");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Login gagal.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Digital Price Catalog
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Masuk untuk mengakses katalog harga toko.
          </p>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            FORM
        ====================================================== */}

        <form
          onSubmit={handleLogin}
          className="space-y-5"
        >

          {/* EMAIL */}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="tedy@example.com"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          {/* PASSWORD */}

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>

            <div className="relative">

              <input
                id="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
                title={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
                className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-slate-400 transition hover:text-slate-700"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>

            </div>
          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Memproses..."
              : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}