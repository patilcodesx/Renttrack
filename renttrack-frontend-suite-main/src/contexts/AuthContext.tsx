import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

/* ===================== TYPES ===================== */

export type Role = "LANDLORD" | "TENANT";

export type User = {
  id?: string;
  email: string;
  name: string;
  role: Role;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;

  isAuthenticated: boolean;
  isLandlord: boolean;
  isTenant: boolean;

  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) => Promise<void>;
  logout: () => void;
};

/* ===================== CONTEXT ===================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ===================== PROVIDER ===================== */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------- RESTORE SESSION ON REFRESH ---------- */
  useEffect(() => {
    const savedToken = localStorage.getItem("renttrack_token");
    const savedUser = localStorage.getItem("renttrack_user");

    if (savedToken && savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);

        setToken(savedToken);
        setUser(parsedUser);

        apiClient.setToken(savedToken);
      } catch (err) {
        console.error("Invalid auth storage, clearing");
        localStorage.clear();
      }
    }

    setLoading(false);
  }, []);

  /* ===================== LOGIN ===================== */
  const login = async ({ email, password }: { email: string; password: string }) => {
    const res = await apiClient.login(email, password);

    const user: User = {
      email: res.email,
      name: res.name,
      role: res.role as Role, // LANDLORD | TENANT
    };

    localStorage.setItem("renttrack_token", res.token);
    localStorage.setItem("renttrack_user", JSON.stringify(user));

    apiClient.setToken(res.token);

    setToken(res.token);
    setUser(user);
  };

  /* ===================== REGISTER ===================== */
  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) => {
    const res = await apiClient.register(data);

    const user: User = {
      email: res.email,
      name: res.name,
      role: res.role as Role,
    };

    localStorage.setItem("renttrack_token", res.token);
    localStorage.setItem("renttrack_user", JSON.stringify(user));

    apiClient.setToken(res.token);

    setToken(res.token);
    setUser(user);
  };

  /* ===================== LOGOUT ===================== */
  const logout = () => {
    localStorage.clear();
    apiClient.clearToken();
    setUser(null);
    setToken(null);
  };

  /* ===================== ROLE HELPERS ===================== */
  const isAuthenticated = !!user;
  const isLandlord = user?.role === "LANDLORD";
  const isTenant = user?.role === "TENANT";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isLandlord,
        isTenant,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ===================== HOOK ===================== */

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
