import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Header } from "@/components/renttrack/Header";
import { PropertyCard } from "@/components/renttrack/PropertyCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Plus, SlidersHorizontal } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { useSearch } from "@/contexts/SearchContext";

const amenitiesList = [
  "Parking",
  "Gym",
  "Pool",
  "Laundry",
  "Pet Friendly",
  "Garden",
  "Concierge",
  "Rooftop",
];

export default  function Properties() {
  const navigate = useNavigate();
  const token = localStorage.getItem("renttrack_token")!;
 


  // ✅ SINGLE SOURCE OF SEARCH
  const { search, setSearch } = useSearch();

  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 500000]);
  const [bhk, setBhk] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  

  // -----------------------
  // FETCH PROPERTIES
  // -----------------------
  useEffect(() => {
    apiClient.getProperties().then((data) => {
      setProperties(data);
      setFilteredProperties(data);
    });
  }, [token]);

  // -----------------------
  // FILTER LOGIC
  // -----------------------
  useEffect(() => {
    let filtered = [...properties];

    // 🔍 SEARCH (SAFE)
    if (search.trim() !== "") {
      const q = search.toLowerCase();
      filtered = filtered.filter((p) => {
        const title = p.title?.toLowerCase() || "";
        const address = p.address?.toLowerCase() || "";
        return title.includes(q) || address.includes(q);
      });
    }

    // 💰 BUDGET
    filtered = filtered.filter(
      (p) => p.price >= budgetRange[0] && p.price <= budgetRange[1]
    );

    // 🏠 BHK
    if (bhk !== null) {
      filtered = filtered.filter((p) => p.bhk === bhk);
    }

    // 🏷️ AMENITIES
    if (selectedTags.length > 0) {
      filtered = filtered.filter((p) =>
        selectedTags.every((tag) => p.tags?.includes(tag))
      );
    }

    setFilteredProperties(filtered);
  }, [search, budgetRange, bhk, selectedTags, properties]);

  const clearFilters = () => {
    setSearch("");
    setBudgetRange([0, 500000]);
    setBhk(null);
    setSelectedTags([]);
  };

  return (
    <DashboardLayout>
      <Header title="Properties" subtitle="Manage your rental properties" />

      <div className="p-4 lg:p-8 space-y-6">
        {/* Search & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>

            <Button
              className="gap-2"
              onClick={() => navigate("/properties/new")}
            >
              <Plus className="w-4 h-4" />
              Add Property
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters */}
          <div
            className={cn(
              "lg:w-72 flex-shrink-0 transition-all duration-300",
              showFilters ? "block" : "hidden lg:hidden"
            )}
          >
            <Card className="sticky top-24">
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-lg">Filters</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Budget */}
                <div className="space-y-4">
                  <Label>Budget</Label>
                  <Slider
                    value={budgetRange}
                    onValueChange={(value) =>
                      setBudgetRange([value[0], value[1]])
                    }
                    min={0}
                    max={500000}
                    step={5000}
                  />
                </div>

                {/* BHK */}
                <div className="space-y-3">
                  <Label>BHK</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map((num) => (
                      <Button
                        key={num}
                        size="sm"
                        variant={bhk === num ? "default" : "outline"}
                        onClick={() => setBhk(bhk === num ? null : num)}
                      >
                        {num}+
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-3">
                  <Label>Amenities</Label>
                  {amenitiesList.map((tag) => (
                    <div key={tag} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedTags.includes(tag)}
                        onCheckedChange={(checked) =>
                          setSelectedTags((prev) =>
                            checked
                              ? [...prev, tag]
                              : prev.filter((t) => t !== tag)
                          )
                        }
                      />
                      <span className="text-sm">{tag}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Properties Grid */}
          <div className="flex-1">
            {filteredProperties.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No properties found
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                    onClick={() =>
                      navigate(`/properties/${property.id}`)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
