import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Users,
  Upload,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { FileSignature } from "lucide-react";


/* ===================== NAV CONFIG ===================== */

const landlordNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Building2, label: "Properties", path: "/properties" },
  { icon: UserPlus, label: "Onboarding", path: "/onboarding" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: FileText, label: "OCR Preview", path: "/ocr-preview" },
  { icon: Users, label: "Tenants", path: "/tenants" },
  { icon: CreditCard, label: "Payments", path: "/payments" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const tenantNav = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: FileSignature, label: "Lease", path: "/lease" },
  { icon: CreditCard, label: "Payments", path: "/payments" },
  { icon: Settings, label: "Settings", path: "/settings" },
];


/* ===================== SIDEBAR ===================== */

export function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems =
    user?.role === "LANDLORD" || user?.role === "ADMIN"
      ? landlordNav
      : tenantNav;

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Building2 className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground">
            RentTrack
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => {
            logout();
            setMobileOpen(false);
          }}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card shadow-soft"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar transform transition-transform duration-300 lg:hidden flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <NavContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar">
        <NavContent />
      </aside>
    </>
  );
}
