import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Header } from "@/components/renttrack/Header";
import { InputField } from "@/components/renttrack/InputField";
import { PrimaryButton } from "@/components/renttrack/PrimaryButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Check,
  User,
  Home,
  FileText,
  CreditCard,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/apiClient";
import { useAppStore } from "@/store/appStore.ts";
import { UploadCard } from "@/components/renttrack/UploadCard";

/* =====================================================
   STEPS
===================================================== */
const steps = [
  { id: 1, title: "Personal Info", icon: User },
  { id: 2, title: "Property", icon: Home },
  { id: 3, title: "Documents", icon: FileText },
  { id: 4, title: "Payment", icon: CreditCard },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [hasUploadedDoc, setHasUploadedDoc] = useState(false);

  const location = useLocation();
  const ocrData = location.state?.ocrData;

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);

  /* =====================================================
     FORM STATE (✅ PROFILE IMAGE ADDED)
  ===================================================== */
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    govtId: "",
    profileImageUrl: "", // ✅ NEW (from OCR)
    dateOfBirth: "",
    propertyId: location.state?.propertyId ?? "",
    leaseStart: "",
    leaseEnd: "",
    monthlyRent: "",
    securityDeposit: "",
    emergencyName: "",
    emergencyPhone: "",
    bankName: "",
    accountNumber: "",
    routingNumber: "",
  });

  /* =====================================================
     FETCH PROPERTIES
  ===================================================== */
  useEffect(() => {
    const token = localStorage.getItem("renttrack_token");
    if (!token) return;

    apiClient.getProperties().then(setProperties);
  }, []);

  /* =====================================================
     OCR PREFILL (✅ IMAGE INCLUDED)
  ===================================================== */
  useEffect(() => {
    if (!ocrData) return;

    const [firstName, ...rest] = (ocrData.name || "").split(" ");

    const formatDob = (dob?: string) => {
      if (!dob) return "";
      const [dd, mm, yyyy] = dob.split(/[\/-]/);
      return `${yyyy}-${mm}-${dd}`;
    };

    setFormData((prev) => ({
      ...prev,
      firstName,
      lastName: rest.join(" "),
      email: ocrData.email ?? "",
      phone: ocrData.phone ?? "",
      govtId: ocrData.govtId ?? "",
      dateOfBirth: formatDob(ocrData.dob),
      leaseStart: ocrData.leaseStart ?? "",
      leaseEnd: ocrData.leaseEnd ?? "",
      monthlyRent: ocrData.rentAmount?.toString() ?? "",
      profileImageUrl: ocrData.profileImageUrl ?? "", // ✅ SAVE IMAGE URL
    }));
  }, [ocrData]);

  /* =====================================================
     UPDATE FIELD
  ===================================================== */
  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /* =====================================================
     AUTOFILL RENT
  ===================================================== */
  useEffect(() => {
    if (!formData.propertyId) return;

    const property = properties.find((p) => p.id === formData.propertyId);
    if (!property) return;

    setFormData((prev) => ({
      ...prev,
      monthlyRent: prev.monthlyRent || `${property.price}`,
      securityDeposit:
        prev.securityDeposit || `${Math.round(property.price * 1.5)}`,
    }));
  }, [formData.propertyId, properties]);

  /* =====================================================
     SUBMIT (✅ IMAGE SENT TO BACKEND)
  ===================================================== */
  const handleSubmit = async () => {
    try {
      setLoading(true);
await apiClient.createTenant({
  firstName: formData.firstName,
  lastName: formData.lastName,
  email: formData.email,
  phone: formData.phone,
  govtId: formData.govtId,
  propertyId: formData.propertyId,
  leaseStart: formData.leaseStart,
  leaseEnd: formData.leaseEnd,
  rentAmount: Number(formData.monthlyRent),
  deposit: Number(formData.securityDeposit),

  // ✅ ADD THIS
  profileImageUrl: formData?.profileImageUrl
});



      toast({
        title: "Tenant Onboarded",
        description: "Tenant saved successfully",
      });

      navigate("/tenants");
    } catch (err: any) {
      toast({
        title: "Unable to create tenant",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <DashboardLayout>
      <Header title="Tenant Onboarding" subtitle="Add a new tenant" />

      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => {
            if (window.history.length > 1) navigate(-1);
            else navigate("/upload");
          }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back
        </button>

        {/* PROGRESS */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center",
                      currentStep > step.id
                        ? "gradient-primary text-primary-foreground"
                        : currentStep === step.id
                        ? "bg-primary text-primary-foreground shadow-glow"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? <Check /> : <step.icon />}
                  </div>
                  <span className="text-xs mt-2 hidden sm:block">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 bg-muted rounded-full" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CARD */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField id="firstName" label="First Name" value={formData.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
                <InputField id="lastName" label="Last Name" value={formData.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
                <InputField id="email" label="Email" value={formData.email} onChange={(e) => updateField("email", e.target.value)} />
                <InputField id="phone" label="Phone" value={formData.phone} onChange={(e) => updateField("phone", e.target.value)} />
                <InputField id="govtId" label="Government ID" value={formData.govtId} onChange={(e) => updateField("govtId", e.target.value)} />
                <InputField id="dob" label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e) => updateField("dateOfBirth", e.target.value)} />
              </div>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label>Select Property</Label>
                  <Select value={formData.propertyId} onValueChange={(v) => updateField("propertyId", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose" />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.filter((p) => p.available).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title} - ${p.price}/mo
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <InputField id="leaseStart" label="Lease Start" type="date" value={formData.leaseStart} onChange={(e) => updateField("leaseStart", e.target.value)} />
                <InputField id="leaseEnd" label="Lease End" type="date" value={formData.leaseEnd} onChange={(e) => updateField("leaseEnd", e.target.value)} />
                <InputField id="monthlyRent" label="Monthly Rent ($)" type="number" value={formData.monthlyRent} onChange={(e) => updateField("monthlyRent", e.target.value)} />
                <InputField id="securityDeposit" label="Security Deposit ($)" type="number" value={formData.securityDeposit} onChange={(e) => updateField("securityDeposit", e.target.value)} />
              </div>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <UploadCard
                  onUpload={async (file) => {
                    const res = await apiClient.uploadDocument(file);
                    setUploadedDocs((prev) => [...prev, res]);
                    setHasUploadedDoc(true);
                    toast({ title: "Document Uploaded", description: res.filename });
                  }}
                />

                {uploadedDocs.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    {uploadedDocs.length} document(s) uploaded
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField id="emergencyName" label="Emergency Name" value={formData.emergencyName} onChange={(e) => updateField("emergencyName", e.target.value)} />
                  <InputField id="emergencyPhone" label="Emergency Phone" value={formData.emergencyPhone} onChange={(e) => updateField("emergencyPhone", e.target.value)} />
                </div>
              </div>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField id="bankName" label="Bank Name" value={formData.bankName} onChange={(e) => updateField("bankName", e.target.value)} />
                <InputField id="accountNumber" label="Account Number" type="password" value={formData.accountNumber} onChange={(e) => updateField("accountNumber", e.target.value)} />
                <InputField id="routingNumber" label="Routing Number" value={formData.routingNumber} onChange={(e) => updateField("routingNumber", e.target.value)} />
              </div>
            )}

            {/* ACTIONS */}
            <div className="flex justify-between pt-6 border-t">
              <PrimaryButton variant="outline" disabled={currentStep === 1} onClick={() => setCurrentStep(currentStep - 1)}>
                <ArrowLeft /> Back
              </PrimaryButton>

              {currentStep < steps.length ? (
                <PrimaryButton
                  onClick={() => {
                    if (currentStep === 3 && !hasUploadedDoc) {
                      toast({
                        title: "Upload required",
                        description: "Please upload at least one document",
                        variant: "destructive",
                      });
                      return;
                    }
                    setCurrentStep(currentStep + 1);
                  }}
                >
                  Continue <ArrowRight />
                </PrimaryButton>
              ) : (
                <PrimaryButton loading={loading} onClick={handleSubmit}>
                  Complete Onboarding
                </PrimaryButton>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
