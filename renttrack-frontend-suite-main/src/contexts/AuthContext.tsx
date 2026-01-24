import { createContext, useContext, useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";

/* ===================== TYPES ===================== */

export type Role = "LANDLORD" | "TENANT";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

/* ===== Backend response types ===== */

type LoginResponse = {
  token: string;
  user: User;
};

type MeResponse = User;

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

  /* =====================================================
     RESTORE LOGIN ON PAGE REFRESH
  ===================================================== */

  useEffect(() => {
    const savedToken = localStorage.getItem("renttrack_token");
    const savedUser = localStorage.getItem("renttrack_user");

    if (!savedToken || !savedUser) {
      setLoading(false);
      return;
    }

    apiClient.setToken(savedToken);
    setToken(savedToken);

    apiClient
      .getMe()
      .then((me: MeResponse) => {
        setUser(me);
        localStorage.setItem("renttrack_user", JSON.stringify(me));
      })
      .catch(() => {
        localStorage.clear();
        apiClient.clearToken();
        setUser(null);
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  /* =====================================================
     LOGIN
  ===================================================== */

  const login = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    const res = (await apiClient.login(
      email,
      password
    )) as LoginResponse;

    apiClient.setToken(res.token);

    localStorage.setItem("renttrack_token", res.token);
    localStorage.setItem("renttrack_user", JSON.stringify(res.user));

    setToken(res.token);
    setUser(res.user);
  };

  /* =====================================================
     REGISTER
  ===================================================== */

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) => {
    await apiClient.register(data);
  };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const logout = () => {
    localStorage.clear();
    apiClient.clearToken();
    setUser(null);
    setToken(null);
  };

  /* =====================================================
     ROLE HELPERS
  ===================================================== */

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
