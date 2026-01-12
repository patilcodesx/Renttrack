import { useState, useCallback } from "react";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface UploadCardProps {
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
}

export function UploadCard({ onUpload, accept = ".pdf,.jpg,.jpeg,.png", maxSize = 10 }: UploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = accept.split(",").map((t) => t.trim());
    const fileExt = `.${file.name.split(".").pop()?.toLowerCase()}`;
    
    if (!validTypes.some((type) => fileExt === type || file.type.includes(type.replace(".", "")))) {
      setError(`Invalid file type. Accepted: ${accept}`);
      return false;
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File too large. Maximum size: ${maxSize}MB`);
      return false;
    }
    
    return true;
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setError(null);
      
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    },
    [accept, maxSize]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    try {
      await onUpload(file);
      clearInterval(interval);
      setProgress(100);
      setUploaded(true);
    } catch (err) {
      clearInterval(interval);
      setError("Upload failed. Please try again.");
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setProgress(0);
    setUploaded(false);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 text-center",
          isDragging
            ? "border-primary bg-primary-lighter scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-accent/50",
          uploaded && "border-success bg-success/10"
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-4">
          {uploaded ? (
            <CheckCircle className="w-12 h-12 mx-auto text-success" />
          ) : (
            <Upload className={cn("w-12 h-12 mx-auto", isDragging ? "text-primary" : "text-muted-foreground")} />
          )}
          
          <div>
            <p className="font-medium text-foreground">
              {uploaded ? "Upload Complete!" : isDragging ? "Drop your file here" : "Drag & drop your file here"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {uploaded ? file?.name : `or click to browse. Max ${maxSize}MB`}
            </p>
          </div>
        </div>
      </div>

      {file && !uploaded && (
        <div className="bg-card rounded-lg p-4 border border-border animate-slide-up">
          <div className="flex items-center gap-3">
            <File className="w-8 h-8 text-primary" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemove} disabled={uploading}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {uploading && (
            <div className="mt-3 space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">{progress}% uploaded</p>
            </div>
          )}
          
          {!uploading && (
            <Button onClick={handleUpload} className="w-full mt-3">
              Upload Document
            </Button>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive animate-fade-in">{error}</p>
      )}
    </div>
  );
}
