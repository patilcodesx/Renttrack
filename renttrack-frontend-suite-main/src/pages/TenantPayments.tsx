import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { useAuth } from "@/contexts/AuthContext";

export default function TenantPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    apiClient.getMyPayments().then(setPayments);
  }, [user]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">My Payments</h1>

      {payments.map(p => (
        <div key={p.id} className="border p-3 rounded mb-2">
          <div>{p.month}</div>
          <div>Amount: ₹{p.amount}</div>
          <div>Status: {p.status}</div>
        </div>
      ))}
    </div>
  );
}
