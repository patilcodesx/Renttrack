import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
  id: string;
  title: string;
  address: string;
  price: number;
  bedrooms?: number;
  amenities?: string[];
  images?: string[];
  available: boolean;
  onClick?: () => void;
}

export function PropertyCard({
  title,
  address,
  price,
  bedrooms,
  amenities,
  images,
  available,
  onClick,
}: PropertyCardProps) {

  /* =====================================================
     ✅ IMAGE URL (CONTEXT-PATH SAFE)
     Backend stores: /uploads/property/xyz.jpg
     Actual served URL: http://localhost:8080/api/uploads/property/xyz.jpg
  ===================================================== */
  const imageUrl =
    images && images.length > 0
      ? images[0].startsWith("http")
        ? images[0]
        : `http://localhost:8080/api${images[0]}`
      : "https://via.placeholder.com/600x400?text=No+Image";

  

  return (
    <div
      className={cn(
        "bg-card rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition"
      )}
    >
      {/* IMAGE */}
      <div className="relative w-full h-56 bg-muted">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        <div className="absolute top-3 right-3">
          <Badge
            className={available ? "bg-success text-white" : ""}
          >
            {available ? "Available" : "Occupied"}
          </Badge>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-3">
        {/* TITLE */}
        <h3 className="text-lg font-semibold truncate">{title}</h3>

        {/* LOCATION */}
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {address}
        </p>

        {/* BEDROOMS */}
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          <Bed className="w-4 h-4" />
          {bedrooms ?? 0} BHK
        </p>

        {/* AMENITIES */}
        {amenities && amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {amenities.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}

            {amenities.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{amenities.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* PRICE + ACTION */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <p className="font-semibold text-primary">
            ₹{price.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground">
              /mo
            </span>
          </p>

          <Button size="sm" onClick={onClick}>
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}
