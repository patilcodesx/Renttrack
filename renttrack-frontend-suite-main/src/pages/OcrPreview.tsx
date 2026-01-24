import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Header } from "@/components/renttrack/Header";
import { InputField } from "@/components/renttrack/InputField";
import { PrimaryButton } from "@/components/renttrack/PrimaryButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Edit2,
  FileText,
  AlertTriangle,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";

/* =====================================================
   CONFIG
===================================================== */
const BACKEND_URL = "http://localhost:8080/api";

/* =====================================================
   TYPES
===================================================== */
type ExtractedData = {
  name?: string;
  email?: string;
  phone?: string;
  govtId?: string;
  dob?: string;
  address?: string;
  rentAmount?: number;
  leaseStart?: string;
  leaseEnd?: string;
  profileImageUrl?: string;
};

/* =====================================================
   COMPONENT
===================================================== */
export default function OcrPreview() {
  
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  /* ------------------------------
     ROUTE STATE
  ------------------------------ */
  const state = (location.state || {}) as {
    uploadId?: string;
    fileName?: string;
  };

  const uploadId = state.uploadId;
  const fileName = state.fileName ?? "document";

  /* ------------------------------
     LOCAL STATE
  ------------------------------ */
  const [formData, setFormData] = useState<ExtractedData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     FETCH OCR DATA (POLLING)
  ===================================================== */
  useEffect(() => {
    
    if (!uploadId) {
      toast({
        title: "Invalid Access",
        description: "Upload ID missing. Please upload again.",
        variant: "destructive",
      });
      navigate("/upload");
      return;
    }

    let intervalId: number;

    const fetchOcrData = async () => {
      try {
        const parsed = await apiClient.getUploadParsed(uploadId);

        // OCR still processing
        if (!parsed || Object.keys(parsed).length === 0) return;

        window.clearInterval(intervalId);
        setLoading(false);

        const rawText: string = parsed.rawText ?? "";

        const name =
          parsed.name ||
          rawText.match(/\b([A-Z][a-z]{2,}\s[A-Z][a-z]{2,})\b/)?.[1] ||
          "";

        const email =
          parsed.email ||
          rawText.match(
            /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
          )?.[1] ||
          "";

        const phone =
          parsed.phone ||
          rawText.match(/(\+91[-\s]?\d{10}|\d{10})/)?.[1] ||
          "";

        const govtId =
          parsed.govtId ||
          rawText.match(/(\d{4}\s\d{4}\s\d{4})/)?.[1] ||
          "";

        const dob =
          parsed.dob ||
          rawText.match(/DOB[:\s]*(\d{2}[\/-]\d{2}[\/-]\d{4})/i)?.[1] ||
          "";

        const address =
          parsed.address ||
          rawText.match(
            /(\d+\s+[A-Za-z0-9.,\s]+(Street|Road|Rd|Sector|Block)[^\n]*)/i
          )?.[1] ||
          "";

        setFormData({
          name,
          email,
          phone,
          govtId,
          dob,
          address,
          rentAmount: parsed.rentAmount,
          leaseStart: "",
          leaseEnd: "",
          profileImageUrl: parsed.profileImageUrl || undefined,
        });
      } catch (error) {
        console.error("OCR fetch failed:", error);
        window.clearInterval(intervalId);
        setLoading(false);

        toast({
          title: "OCR Failed",
          description: "Could not fetch OCR data from server.",
          variant: "destructive",
        });
      }
    };

    intervalId = window.setInterval(fetchOcrData, 1500);
    fetchOcrData();

    return () => window.clearInterval(intervalId);
  }, [uploadId, navigate, toast]);

  /* =====================================================
     HELPERS
  ===================================================== */
  const updateField = (field: keyof ExtractedData, value: any) => {
    setFormData((prev) => ({
      ...(prev || {}),
      [field]: value,
    }));
  };

  const handleConfirm = () => {
    toast({
      title: "OCR Confirmed",
      description: "Proceeding to tenant onboarding",
    });

    navigate("/onboarding", {
      state: {
        ocrData: formData,
        fromOcr: true,
      },
    });
  };

  /* =====================================================
     UI STATES
  ===================================================== */
  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-muted-foreground">
          Processing OCR…
        </div>
      </DashboardLayout>
    );
  }

  if (!formData) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center text-destructive">
          Failed to load OCR data.
        </div>
      </DashboardLayout>
    );
  }

  /* =====================================================
     FORM FIELDS
  ===================================================== */
  const fields = [
    { key: "name", label: "Full Name", type: "text" },
    { key: "email", label: "Email Address", type: "email" },
    { key: "phone", label: "Phone Number", type: "tel" },
    { key: "govtId", label: "Government ID", type: "text" },
    { key: "address", label: "Address", type: "text" },
    { key: "leaseStart", label: "Lease Start Date", type: "date" },
    { key: "leaseEnd", label: "Lease End Date", type: "date" },
  ] as const;

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <DashboardLayout>
      <Header
        title="OCR Preview"
        subtitle="Review extracted details & profile photo"
      />

      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>

        {/* DOCUMENT CARD */}
        <Card className="shadow-soft">
          <CardContent className="py-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">{fileName}</p>
                <p className="text-sm text-muted-foreground">OCR Complete</p>
              </div>
            </div>

            <Badge className="bg-success/10 text-success border-success/30">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Verified
            </Badge>
          </CardContent>
        </Card>

        {/* PROFILE PHOTO */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Extracted Profile Photo</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Avatar className="w-32 h-32">
              <AvatarImage
                src={
                  formData.profileImageUrl
                    ? `${BACKEND_URL}${formData.profileImageUrl}`
                    : undefined
                }
              />
              <AvatarFallback>
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
          </CardContent>
        </Card>

        {/* EXTRACTED DATA */}
        <Card className="shadow-soft">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Extracted Information</CardTitle>
            <PrimaryButton
              size="sm"
              variant={editMode ? "default" : "outline"}
              icon={<Edit2 className="w-4 h-4" />}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Done Editing" : "Edit"}
            </PrimaryButton>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((f) => (
                <InputField
                  key={f.key}
                  id={f.key}
                  label={f.label}
                  type={f.type}
                  disabled={!editMode}
                  value={String((formData as any)[f.key] ?? "")}
                  onChange={(e) =>
                    updateField(f.key, e.target.value)
                  }
                />
              ))}
            </div>

            <div className="mt-6 p-4 bg-warning/10 border border-warning/30 rounded-lg flex gap-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <p className="text-sm">
                Please verify the data before continuing.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <PrimaryButton
                variant="outline"
                onClick={() => navigate("/upload")}
              >
                Re-upload
              </PrimaryButton>

              <PrimaryButton onClick={handleConfirm}>
                Confirm & Continue
              </PrimaryButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
