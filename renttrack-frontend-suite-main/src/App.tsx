// src/App.tsx

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider } from "@/contexts/SearchContext";
import ProtectedRoute from "@/routes/ProtectedRoute";

/* ================= PAGES ================= */
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Onboarding from "./pages/Onboarding";
import Upload from "./pages/Upload";
import OcrPreview from "./pages/OcrPreview";
import Tenants from "./pages/Tenants";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ContactAdmin from "./pages/ContactAdmin";
import NotFound from "./pages/NotFound";
import AddProperty from "./pages/AddProperty";
import Lease from "./pages/Lease";

/* ================= QUERY CLIENT ================= */
const queryClient = new QueryClient();

/* ================= ROUTES ================= */
const router = createBrowserRouter(
  [
    /* =============== PUBLIC =============== */
    { path: "/", element: <Index /> },
    { path: "/login", element: <Login /> },
    { path: "/register", element: <Register /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/contact-admin", element: <ContactAdmin /> },

    /* ===== SHARED (LANDLORD + TENANT) ===== */
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/payments",
      element: (
        <ProtectedRoute>
          <Payments />
        </ProtectedRoute>
      ),
    },
    {
      path: "/settings",
      element: (
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      ),
    },

    /* ===== LANDLORD / ADMIN ===== */
    {
      path: "/properties",
      element: (
        <ProtectedRoute allowedRoles={["LANDLORD", "ADMIN"]}>
          <Properties />
        </ProtectedRoute>
      ),
    },
    {
      path: "/properties/new",
      element: (
        <ProtectedRoute allowedRoles={["LANDLORD", "ADMIN"]}>
          <AddProperty />
        </ProtectedRoute>
      ),
    },
    {
      path: "/onboarding",
      element: (
        <ProtectedRoute allowedRoles={["LANDLORD", "ADMIN"]}>
          <Onboarding />
        </ProtectedRoute>
      ),
    },
    {
      path: "/upload",
      element: (
        <ProtectedRoute allowedRoles={["LANDLORD", "ADMIN"]}>
          <Upload />
        </ProtectedRoute>
      ),
    },
    {
      path: "/ocr-preview",
      element: (
        <ProtectedRoute allowedRoles={["LANDLORD", "ADMIN"]}>
          <OcrPreview />
        </ProtectedRoute>
      ),
    },
    {
      path: "/tenants",
      element: (
        <ProtectedRoute allowedRoles={["LANDLORD", "ADMIN"]}>
          <Tenants />
        </ProtectedRoute>
      ),
    },

    /* ===== TENANT ===== */
    {
      path: "/lease",
      element: (
        <ProtectedRoute allowedRoles={["TENANT"]}>
          <Lease />
        </ProtectedRoute>
      ),
    },

    /* =============== 404 =============== */
    { path: "*", element: <NotFound /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

/* ================= APP ================= */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SearchProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <RouterProvider router={router} />
        </TooltipProvider>
      </SearchProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
