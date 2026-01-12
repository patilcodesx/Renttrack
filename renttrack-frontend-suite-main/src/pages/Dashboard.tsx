import { useEffect, useState } from "react";
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
import { api, mockActivity } from "@/lib/mockData";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProperties: 0,
    occupiedUnits: 0,
    totalTenants: 0,
    monthlyRevenue: 0,
    pendingPayments: 0,
    upcomingRenewals: 0,
  });

  useEffect(() => {
    api.getDashboardStats().then(setStats);
  }, []);

  const quickActions = [
    { icon: Plus, label: "Add Property", path: "/properties", color: "bg-primary" },
    { icon: Upload, label: "Upload Document", path: "/upload", color: "bg-chart-2" },
    { icon: CreditCard, label: "Record Payment", path: "/payments", color: "bg-success" },
    { icon: Users, label: "New Tenant", path: "/onboarding", color: "bg-warning" },
  ];

  return (
    <DashboardLayout>
      <Header title="Dashboard" subtitle="Welcome back! Here's what's happening today." />

      <div className="p-4 lg:p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            title="Total Properties"
            value={stats.totalProperties}
            icon={Building2}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Active Tenants"
            value={stats.totalTenants}
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${stats.monthlyRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 15, isPositive: true }}
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={AlertCircle}
            trend={{ value: 2, isPositive: false }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
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

          {/* Recent Activity */}
          <Card className="lg:col-span-2 shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="p-2 rounded-full bg-primary-lighter">
                      {activity.type === "payment" && <DollarSign className="w-4 h-4 text-primary" />}
                      {activity.type === "onboarding" && <Users className="w-4 h-4 text-primary" />}
                      {activity.type === "lease" && <Clock className="w-4 h-4 text-warning" />}
                      {activity.type === "property" && <Building2 className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                    {activity.type === "lease" && (
                      <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                        Action Required
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Occupancy Overview */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Occupancy Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full gradient-primary transition-all duration-500"
                  style={{ width: `${(stats.occupiedUnits / stats.totalProperties) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-foreground whitespace-nowrap">
                {stats.occupiedUnits} / {stats.totalProperties} units occupied
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round((stats.occupiedUnits / stats.totalProperties) * 100)}% occupancy rate
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
