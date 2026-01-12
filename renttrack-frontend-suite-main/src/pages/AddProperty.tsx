import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Header } from "@/components/renttrack/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import apiClient from "@/lib/apiClient";

const AMENITIES = [
  "Parking",
  "Gym",
  "Pool",
  "Laundry",
  "Pet Friendly",
  "Garden",
  "Concierge",
  "Rooftop",
];

export default function AddProperty() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [bhk, setBhk] = useState(1);
  const [price, setPrice] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [available, setAvailable] = useState(true);

  // ✅ IMAGE STATE (FIXED)
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleAmenity = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleImageChange = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ✅ FINAL FIXED SUBMIT HANDLER
  const handleSubmit = async () => {
    if (!title || !address || price <= 0) {
      alert("Please fill all required fields");
      return;
    }

    if (!imageFile) {
      alert("Please select a property image");
      return;
    }

    try {
      setLoading(true);

      // 🔥 Upload image FIRST
      const imageUrl = await apiClient.uploadPropertyImage(imageFile);

      // 🔥 Create property with REAL image URL
      await apiClient.createProperty({
        title,
        address,
        bhk,
        price,
        images: [imageUrl],
        tags,
        available,
      });

      navigate("/properties");
    } catch (err: any) {
      alert(err.message || "Failed to create property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Header title="Add Property" subtitle="Create a new rental property" />

      <div className="p-4 lg:p-8 flex justify-center">
        <div className="w-full max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* TITLE */}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  placeholder="e.g. 2 BHK Apartment"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* ADDRESS */}
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  placeholder="Full property address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              {/* BHK + PRICE */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>BHK</Label>
                  <Input
                    type="number"
                    min={1}
                    value={bhk}
                    onChange={(e) => setBhk(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Monthly Rent (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* IMAGE UPLOAD */}
              <div className="space-y-2">
                <Label>Property Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageChange(e.target.files?.[0] || null)
                  }
                />

                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-3 rounded-lg h-40 object-cover border"
                  />
                )}
              </div>

              {/* AMENITIES */}
              <div className="space-y-2">
                <Label>Amenities</Label>
                <div className="grid grid-cols-2 gap-2">
                  {AMENITIES.map((tag) => (
                    <label
                      key={tag}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={tags.includes(tag)}
                        onCheckedChange={() => toggleAmenity(tag)}
                      />
                      {tag}
                    </label>
                  ))}
                </div>
              </div>

              {/* AVAILABLE */}
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={available}
                  onCheckedChange={(v) => setAvailable(Boolean(v))}
                />
                <Label>Available for rent</Label>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/properties")}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Creating..." : "Create Property"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
