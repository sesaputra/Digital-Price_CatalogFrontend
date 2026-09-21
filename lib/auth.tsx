
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch, logout as apiLogout } from "@/lib/api";
import { User } from "@/types/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUser: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshUser(): Promise<User | null> {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      return null;
    }

    try {
      const response = await apiFetch<{ user: User }>(
        "/auth/me"
      );

      setUser(response.user);

      localStorage.setItem(
        "user",
        JSON.stringify(response.user)
      );

      return response.user;
    } catch (error) {
      console.error(
        "Gagal mengambil data user:",
        error
      );

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setUser(null);

      return null;
    }
  }

  async function handleLogout() {
    try {
      await apiLogout();
    } catch (error) {
      console.error("Logout API gagal:", error);
    } finally {
      // Hapus data autentikasi dari browser
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Reset user di context
      setUser(null);

      // Arahkan user ke halaman login
      router.replace("/login");
    }
  }

  useEffect(() => {
    async function initializeAuth() {
      const token = localStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      await refreshUser();

      setLoading(false);
    }

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        refreshUser,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth harus digunakan di dalam AuthProvider."
    );
  }

  return context;
}

/**
 * Komponen untuk melindungi halaman yang membutuhkan login.
 */
interface AuthGuardProps {
  children: ReactNode;
}

export function AuthGuard({
  children,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const {
    user,
    loading,
    refreshUser,
  } = useAuth();

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  useEffect(() => {
    async function checkAuthentication() {
      const token = localStorage.getItem("token");

      // Tidak ada token
      if (!token) {
        router.replace(
          `/login?redirect=${encodeURIComponent(pathname)}`
        );

        return;
      }

      // User sudah tersedia
      if (user) {
        setCheckingAuth(false);
        return;
      }

      // Token tersedia tetapi user belum ada.
      // Validasi token melalui /auth/me.
      const authenticatedUser =
        await refreshUser();

      if (!authenticatedUser) {
        router.replace(
          `/login?redirect=${encodeURIComponent(pathname)}`
        );

        return;
      }

      setCheckingAuth(false);
    }

    if (!loading) {
      checkAuthentication();
    }
  }, [
    loading,
    user,
    pathname,
    router,
    refreshUser,
  ]);

  if (
    loading ||
    checkingAuth ||
    !user
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />

          <p className="mt-4 text-sm text-slate-500">
            Memeriksa autentikasi...
          </p>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
