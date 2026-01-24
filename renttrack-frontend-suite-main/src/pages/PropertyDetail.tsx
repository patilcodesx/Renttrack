// src/pages/PropertyDetail.tsx

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchJson } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";

type Property = {
  id: string;
  title: string;
  address: string;
  price: number;
  bhk: number;
  available: boolean;
  images: string[];
  tags: string[];
};

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    async function load() {
      try {
        const data = await fetchJson<Property>(
          `/api/properties/${id}`
        );
        setProperty(data);
      } catch (err) {
        console.error("Property load failed", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!property) {
    return (
      <div className="p-6 space-y-4">
        <p>Property not found</p>
        <Button onClick={() => navigate(-1)}>← Back</Button>
      </div>
    );
  }

  return (
    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* LEFT — IMAGE */}
      <div className="lg:col-span-2">
        <img
          src={property.images?.[0]}
          className="w-full h-[420px] object-cover rounded-xl"
        />

        <div className="grid grid-cols-4 gap-3 mt-4">
          {property.images?.map((img) => (
            <img
              key={img}
              src={img}
              className="h-24 w-full object-cover rounded-lg cursor-pointer"
            />
          ))}
        </div>
      </div>

      {/* RIGHT — INFO */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{property.title}</h1>
        <p className="text-muted-foreground">{property.address}</p>

        <div className="text-2xl font-semibold">
          ₹{property.price} / month
        </div>

        <div className="flex gap-2">
          <span className="px-3 py-1 bg-muted rounded">
            {property.bhk} BHK
          </span>

          <span
            className={`px-3 py-1 rounded ${
              property.available
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {property.available ? "Available" : "Not Available"}
          </span>
        </div>

        <div>
          <h3 className="font-semibold mt-4">Amenities</h3>
          <ul className="list-disc ml-6 mt-2">
            {property.tags?.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>

        <Button className="w-full mt-4">Contact Owner</Button>
      </div>
    </div>
  );
}
