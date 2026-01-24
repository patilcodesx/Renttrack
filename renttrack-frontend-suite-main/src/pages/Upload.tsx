// src/pages/Upload.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { Header } from "@/components/renttrack/Header";
import { UploadCard } from "@/components/renttrack/UploadCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image, Shield, Zap } from "lucide-react";
import apiClient from "@/lib/apiClient";
import { useToast } from "@/hooks/use-toast";

export default function Upload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (uploading) return;
    setUploading(true);

    try {
      // ✅ Upload file to backend
      const result = await apiClient.uploadDocument(file);

      // ✅ Backend returns UploadDTO (id, filename, status...)
      if (!result?.id) {
        throw new Error("Upload failed: no uploadId returned");
      }

      toast({
        title: "Upload Successful",
        description: "OCR processing started. Redirecting to preview…",
      });

      // ✅ Navigate ONLY with uploadId
      navigate("/ocr-preview", {
        state: {
          uploadId: result.id,
          fileName: result.filename ?? file.name,
        },
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: "Could not upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const features = [
    {
      icon: Zap,
      title: "Instant OCR",
      description: "Extract text from documents in seconds",
    },
    {
      icon: Shield,
      title: "Secure Processing",
      description: "Documents are encrypted and secure",
    },
    {
      icon: FileText,
      title: "Multiple Formats",
      description: "PDF, JPG, PNG supported",
    },
  ];

  return (
    <DashboardLayout>
      <Header
        title="Upload Document"
        subtitle="Submit tenant application forms for automatic data extraction"
      />

      <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">
        {/* Upload Area */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Upload Tenant Form
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* ⚠️ UploadCard does NOT support `disabled` */}
            <UploadCard onUpload={handleUpload} />
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="shadow-soft">
              <CardContent className="pt-6">
                <div className="p-3 rounded-lg bg-primary-lighter w-fit mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-primary" />
              Tips for Best Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>✔ Ensure the document is clearly scanned</li>
              <li>✔ All text is visible and not cut off</li>
              <li>✔ Use high resolution scans (300 DPI)</li>
              <li>✔ Avoid handwritten text</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
