import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Header } from "@/components/renttrack/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  Mail,
  Phone,
  Eye,
  Building2,
  Calendar,
} from "lucide-react";
import apiClient from "@/lib/apiClient";

/* =====================================================
   CONFIG
===================================================== */
const BACKEND_URL = "http://localhost:8080/api";

export default function Tenants() {
  const navigate = useNavigate();

  const [tenants, setTenants] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);

  /* =========================
     FETCH TENANTS
  ========================= */
  useEffect(() => {
    apiClient.getTenants().then(setTenants);
  }, []);

  /* =========================
     FETCH TENANT PAYMENT HISTORY
  ========================= */
  useEffect(() => {
    if (!selectedTenant) return;

    setLoadingPayments(true);

    apiClient
      .getTenantPayments(selectedTenant.id)
      .then(setPayments)
      .catch(console.error)
      .finally(() => setLoadingPayments(false));
  }, [selectedTenant]);

  /* =========================
     SEARCH FILTER
  ========================= */
  const filteredTenants = tenants.filter((t) =>
    `${t.firstName} ${t.lastName}`
      .toLowerCase()
      .includes(search.toLowerCase()) ||
    t.email?.toLowerCase().includes(search.toLowerCase())
  );

  /* =========================
     STATUS BADGE COLOR
  ========================= */
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-success/10 text-success border-success/30";
      case "INACTIVE":
        return "bg-warning/10 text-warning border-warning/30";
      case "PAID":
      case "paid":
        return "bg-success/10 text-success border-success/30";
      case "DUE":
      case "due":
        return "bg-warning/10 text-warning border-warning/30";
      case "OVERDUE":
      case "overdue":
        return "bg-destructive/10 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout>
      <Header
        title="Tenants"
        subtitle="Manage your tenant profiles and leases"
      />

      <div className="p-4 lg:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* =========================
              TENANTS LIST
          ========================= */}
          <div className="lg:w-1/2 xl:w-2/5 space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tenants..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={() => navigate("/onboarding")} className="gap-2">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Tenant</span>
              </Button>
            </div>

            <Card className="shadow-soft">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {filteredTenants.map((tenant) => {
                    const imageUrl = tenant.profileImageUrl
                      ? `${BACKEND_URL}${tenant.profileImageUrl}`
                      : undefined;

                    return (
                      <div
                        key={tenant.id}
                        onClick={() => setSelectedTenant(tenant)}
                        className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
                          selectedTenant?.id === tenant.id ? "bg-accent" : ""
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={imageUrl} />
                            <AvatarFallback>
                              {tenant.firstName?.[0]}
                              {tenant.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium truncate">
                                {tenant.firstName} {tenant.lastName}
                              </p>
                              <Badge className={getStatusColor(tenant.status)}>
                                {tenant.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {tenant.propertyTitle}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* =========================
              TENANT DETAILS
          ========================= */}
          <div className="lg:flex-1 space-y-6">
            {selectedTenant ? (
              <>
                {/* PROFILE */}
                <Card className="shadow-soft animate-slide-up">
                  <CardHeader>
                    <CardTitle>Tenant Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-6 flex-wrap">
                      <Avatar className="w-20 h-20">
                        <AvatarImage
                          src={
                            selectedTenant.profileImageUrl
                              ? `${BACKEND_URL}${selectedTenant.profileImageUrl}`
                              : undefined
                          }
                        />
                        <AvatarFallback className="text-2xl">
                          {selectedTenant.firstName?.[0]}
                          {selectedTenant.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-4">
                        <div>
                          <h2 className="text-xl font-semibold">
                            {selectedTenant.firstName}{" "}
                            {selectedTenant.lastName}
                          </h2>
                          <Badge
                            className={getStatusColor(selectedTenant.status)}
                          >
                            {selectedTenant.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {selectedTenant.email}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {selectedTenant.phone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4" />
                            {selectedTenant.propertyTitle}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {selectedTenant.leaseStart} –{" "}
                            {selectedTenant.leaseEnd}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* LEASE INFO */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Lease Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-4 rounded-lg bg-accent">
                        <p className="text-sm text-muted-foreground">
                          Monthly Rent
                        </p>
                        <p className="text-xl font-bold">
                          ${selectedTenant.rentAmount}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-accent">
                        <p className="text-sm text-muted-foreground">
                          Security Deposit
                        </p>
                        <p className="text-xl font-bold">
                          ${selectedTenant.deposit}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-accent">
                        <p className="text-sm text-muted-foreground">
                          Lease Duration
                        </p>
                        <p className="text-xl font-bold">12 months</p>
                      </div>

                      <div className="p-4 rounded-lg bg-accent">
                        <p className="text-sm text-muted-foreground">
                          Days Remaining
                        </p>
                        <p className="text-xl font-bold">—</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* PAYMENT HISTORY (REAL) */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingPayments ? (
                      <p className="text-muted-foreground">
                        Loading payments...
                      </p>
                    ) : payments.length === 0 ? (
                      <p className="text-muted-foreground">
                        No payment records found
                      </p>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Month</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Paid Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.map((p: any) => (
                            <TableRow key={p.id}>
                              <TableCell>{p.month}</TableCell>
                              <TableCell>${p.amount}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(p.status)}>
                                  {p.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{p.paidDate || "—"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a tenant to view their profile</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
