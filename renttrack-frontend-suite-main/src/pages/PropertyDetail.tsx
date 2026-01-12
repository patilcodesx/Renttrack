import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const property = useAppStore((s) =>
    s.properties.find((p) => String(p.id) === id)
  );

  if (!property) {
    return (
      <div className="p-6">
        <p>Property not found</p>
        <Button onClick={() => navigate(-1)}>← Back</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← Back
      </button>

      <h2 className="text-3xl font-bold">{property.title}</h2>
      <p>{property.address}</p>
      <p className="font-semibold">${property.price}/mo</p>

      <div>
        <h3 className="font-semibold mt-4">Amenities</h3>
        <ul className="list-disc ml-6">
          {property.amenities?.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
