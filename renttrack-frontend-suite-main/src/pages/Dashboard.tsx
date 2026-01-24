import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Header } from "@/components/renttrack/Header";
import { StatCard } from "@/components/renttrack/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Building2,
  Users,
  DollarSign,
  AlertCircle,
  Clock,
  Plus,
  Upload,
  CreditCard,
  ArrowRight,
} from "lucide-react";

import apiClient from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

/* ===================================================== */

type DashboardStats = {
  totalProperties: number;
  occupiedUnits: number;
  totalTenants: number;
  monthlyRevenue: number;
  pendingPayments: number;
  upcomingRenewals: number;
};

/* ===================================================== */

export default function Dashboard() {
  const { user, isLandlord, isTenant } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    occupiedUnits: 0,
    totalTenants: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    upcomingRenewals: 0,
  });

  const [loading, setLoading] = useState(true);

  /* =====================================================
     LOAD DASHBOARD DATA
  ===================================================== */
  useEffect(() => {
    async function load() {
      try {
        const data = await apiClient.getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* =====================================================
     QUICK ACTIONS (ROLE BASED)
  ===================================================== */

  const landlordActions = [
    { icon: Plus, label: "Add Property", path: "/properties", color: "bg-primary" },
    { icon: Users, label: "Add Tenant", path: "/onboarding", color: "bg-warning" },
    { icon: Upload, label: "Upload Document", path: "/upload", color: "bg-chart-2" },
    { icon: CreditCard, label: "Record Payment", path: "/payments", color: "bg-success" },
  ];

  const tenantActions = [
    { icon: CreditCard, label: "Pay Rent", path: "/payments/me", color: "bg-success" },
    { icon: Clock, label: "My Lease", path: "/lease", color: "bg-primary" },
    { icon: Upload, label: "Upload Document", path: "/upload", color: "bg-chart-2" },
  ];

  const quickActions = isLandlord ? landlordActions : tenantActions;

  /* ===================================================== */

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-10 text-center text-muted-foreground">
          Loading dashboard...
        </div>
      </DashboardLayout>
    );
  }

  /* ===================================================== */

  return (
    <DashboardLayout>
      <Header
        title="Dashboard"
        subtitle={`Welcome back, ${user?.name || "User"} 👋`}
      />

      <div className="p-4 lg:p-8 space-y-8">

        {/* =====================================================
            STATS GRID
        ===================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">

          {isLandlord && (
            <>
              <StatCard
                title="Total Properties"
                value={stats.totalProperties}
                icon={Building2}
              />

              <StatCard
                title="Active Tenants"
                value={stats.totalTenants}
                icon={Users}
              />
            </>
          )}

          <StatCard
            title="Monthly Revenue"
            value={`₹${stats.monthlyRevenue.toLocaleString()}`}
            icon={DollarSign}
          />

          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={AlertCircle}
          />
        </div>

        {/* =====================================================
            QUICK ACTIONS + ACTIVITY
        ===================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ---------- QUICK ACTIONS ---------- */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>

            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.label} to={action.path}>
                  <Button
                    variant="outline"
                    className="w-full h-auto py-4 flex flex-col items-center gap-2 hover:shadow-soft transition-all"
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-sm">{action.label}</span>
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* ---------- RECENT ACTIVITY ---------- */}
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>

              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>

            <CardContent>
              {stats.upcomingRenewals === 0 &&
              stats.pendingPayments === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No recent activity
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.pendingPayments > 0 && (
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-warning/10">
                      <AlertCircle className="w-5 h-5 text-warning" />
                      <span className="text-sm">
                        {stats.pendingPayments} payment(s) pending
                      </span>
                    </div>
                  )}

                  {stats.upcomingRenewals > 0 && (
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/10">
                      <Clock className="w-5 h-5 text-primary" />
                      <span className="text-sm">
                        {stats.upcomingRenewals} lease renewal(s) coming soon
                      </span>

                      <Badge variant="outline" className="ml-auto">
                        Action Required
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* =====================================================
            OCCUPANCY (LANDLORD ONLY)
        ===================================================== */}

        {isLandlord && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Occupancy Overview</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full gradient-primary transition-all duration-500"
                    style={{
                      width: stats.totalProperties
                        ? `${(stats.occupiedUnits / stats.totalProperties) * 100}%`
                        : "0%",
                    }}
                  />
                </div>

                <span className="text-sm font-medium whitespace-nowrap">
                  {stats.occupiedUnits} / {stats.totalProperties} occupied
                </span>
              </div>

              <p className="text-sm text-muted-foreground mt-2">
                {stats.totalProperties
                  ? Math.round(
                      (stats.occupiedUnits / stats.totalProperties) * 100
                    )
                  : 0}
                % occupancy rate
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
