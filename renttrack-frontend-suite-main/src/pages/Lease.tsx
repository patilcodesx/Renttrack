import { useEffect, useState } from "react";
import apiClient from "@/lib/apiClient";
import { Card } from "@/components/ui/card";

export default function Lease() {
  const [lease, setLease] = useState<any>(null);

  useEffect(() => {
    apiClient.getMyLease().then(setLease);
  }, []);

  if (!lease) return <p>Loading lease...</p>;

  return (
    <Card className="p-6 max-w-xl">
      <h2 className="text-xl font-bold mb-4">Lease Agreement</h2>

      <p><b>Property ID:</b> {lease.propertyId}</p>
      <p><b>Rent:</b> ₹{lease.rentAmount}</p>
      <p><b>Deposit:</b> ₹{lease.deposit}</p>
      <p><b>Status:</b> {lease.status}</p>
      <p>
        <b>Duration:</b>{" "}
        {new Date(lease.leaseStart).toDateString()} —{" "}
        {new Date(lease.leaseEnd).toDateString()}
      </p>
    </Card>
  );
}
