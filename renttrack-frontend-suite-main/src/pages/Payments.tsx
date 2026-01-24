import { useEffect, useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Header } from "@/components/renttrack/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Download,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { StatCard } from "@/components/renttrack/StatCard";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

/* =====================================================
   TYPES (MATCH BACKEND PaymentDTO)
===================================================== */
type Payment = {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId?: string;
  month: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "paid" | "due" | "overdue";
};

/* =====================================================
   COMPONENT
===================================================== */
export default function Payments() {
  const { isTenant, isLandlord } = useAuth();
  const { toast } = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH PAYMENTS (ROLE BASED)
  ========================= */
 useEffect(() => {
  const fetchPayments = async () => {
    try {
      const data = isTenant
        ? await apiClient.getMyPayments()
        : await apiClient.getPayments();

      setPayments(data);
    } catch (err: any) {
      toast({
        title: "Failed to load payments",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  fetchPayments();
}, [isTenant, isLandlord]); // ✅ ADD isLandlord


  /* =========================
     FILTER PAYMENTS
  ========================= */
 const filteredPayments = payments.filter((p) => {
  const searchText = search.toLowerCase();

  const matchesSearch = isTenant
    ? p.month.toLowerCase().includes(searchText)
    : p.tenantName.toLowerCase().includes(searchText) ||
      p.month.toLowerCase().includes(searchText);

  const matchesFilter =
    filter === "all" || p.status === filter;

  return matchesSearch && matchesFilter;
});


  /* =========================
     STATUS BADGE
  ========================= */
  const getStatusBadge = (status: Payment["status"]) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-success/10 text-success border-success/30">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Paid
          </Badge>
        );
      case "due":
        return (
          <Badge className="bg-warning/10 text-warning border-warning/30">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Due
          </Badge>
        );
      case "overdue":
        return (
          <Badge className="bg-destructive/10 text-destructive border-destructive/30">
            <AlertCircle className="w-3.5 h-3.5 mr-1" />
            Overdue
          </Badge>
        );
    }
  };

  /* =========================
     STATS
  ========================= */
  const paidPayments = payments.filter((p) => p.status === "paid");
  const duePayments = payments.filter((p) => p.status === "due");
  const overduePayments = payments.filter((p) => p.status === "overdue");

  const totalCollected = paidPayments.reduce((s, p) => s + p.amount, 0);
  const totalDue = duePayments.reduce((s, p) => s + p.amount, 0);
  const totalOverdue = overduePayments.reduce((s, p) => s + p.amount, 0);

  /* =========================
     LANDLORD: MANUAL PAYMENT
  ========================= */
  const handleRecordPayment = async (id: string) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const updated = await apiClient.markPaymentPaid(id, {
        paidDate: today,
        method: "cash",
      });

      setPayments((prev) =>
        prev.map((p) => (p.id === id ? updated : p))
      );

      toast({
        title: "Payment Recorded",
        description: "Payment marked as paid",
      });
    } catch (err: any) {
      toast({
        title: "Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  /* =========================
     TENANT: PAY NOW (RAZORPAY)
  ========================= */
  const handlePayNow = async (paymentId: string) => {
    try {
      const order = await apiClient.createRazorpayOrder(paymentId);

      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "RentTrack",
        description: "Monthly Rent",
        order_id: order.orderId,
      handler: async function (response: any) {
  await apiClient.verifyRazorpayPayment({
    paymentId,
    razorpayOrderId: response.razorpay_order_id,
    razorpayPaymentId: response.razorpay_payment_id,
    razorpaySignature: response.razorpay_signature,
  });

  toast({
    title: "Payment Successful",
    description: "Rent paid successfully",
  });

  // ✅ ALWAYS REFRESH DATA FROM BACKEND
  const updatedPayments = await apiClient.getMyPayments();
  setPayments(updatedPayments);
},

      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast({
        title: "Payment Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  /* =========================
     EXPORT CSV
  ========================= */
  const handleExport = () => {
  if (!filteredPayments.length) return;

  const header = isTenant
    ? ["Month", "Amount", "Due Date", "Paid Date", "Status"]
    : ["Tenant", "Month", "Amount", "Due Date", "Paid Date", "Status"];

  const rows = filteredPayments.map((p) =>
    isTenant
      ? [
          p.month,
          p.amount.toFixed(2),
          p.dueDate,
          p.paidDate || "",
          p.status,
        ]
      : [
          p.tenantName,
          p.month,
          p.amount.toFixed(2),
          p.dueDate,
          p.paidDate || "",
          p.status,
        ]
  );

  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "payments.csv";
  a.click();
  URL.revokeObjectURL(url);
};

  /* =========================
     UI
  ========================= */
  return (
    <DashboardLayout>
      <Header title="Payments" subtitle="Rent payment history & status" />

      <div className="p-6 space-y-6">
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
  title={isTenant ? "Paid" : "Collected"}
  value={`₹${totalCollected.toFixed(2)}`}
  icon={CheckCircle}
/>
          <StatCard title="Due" value={`₹${totalDue.toFixed(2)}`} icon={Clock} />
<StatCard title="Overdue" value={`₹${totalOverdue.toFixed(2)}`} icon={AlertCircle} />
 </div>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payments
            </CardTitle>

            <div className="flex gap-2">
              <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-60"
              />
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs value={filter} onValueChange={setFilter}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="due">Due</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
              </TabsList>

              <TabsContent value={filter}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {!isTenant && <TableHead>Tenant</TableHead>}
                      <TableHead>Month</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredPayments.map((p) => (
                      <TableRow key={p.id}>
                        {!isTenant && <TableCell>{p.tenantName}</TableCell>}
                        <TableCell>{p.month}</TableCell>
                        <TableCell>₹{p.amount.toFixed(2)}</TableCell>
                        <TableCell>{p.dueDate}</TableCell>
                        <TableCell>{getStatusBadge(p.status)}</TableCell>
                        <TableCell className="text-right">
                          {isLandlord && p.status !== "paid" && (
                            <Button size="sm" onClick={() => handleRecordPayment(p.id)}>
                              Mark Paid
                            </Button>
                          )}

                          {isTenant && p.status !== "paid" && (
                            <Button size="sm" onClick={() => handlePayNow(p.id)}>
                              <CreditCard className="w-4 h-4 mr-1" />
                              Pay Now
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {!loading && !filteredPayments.length && (
                  <div className="text-center py-10 text-muted-foreground">
                    No payments found
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
