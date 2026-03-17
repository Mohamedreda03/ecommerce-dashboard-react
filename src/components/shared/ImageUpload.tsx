import { useState, useRef, type ChangeEvent, type DragEvent } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadFile, useUploadFiles } from "@/hooks/use-files";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
}

export default function ImageUpload({
  value,
  onChange,
  multiple = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const singleUploadMutation = useUploadFile();
  const multipleUploadMutation = useUploadFiles();

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    await handleFiles(files);
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const filesToUpload = multiple ? files : [files[0]];
    if (!filesToUpload[0]) return;

    try {
      if (multiple) {
        const result = await multipleUploadMutation.mutateAsync(filesToUpload);
        onChange([...value, ...result.urls]);
        return;
      }

      const result = await singleUploadMutation.mutateAsync(filesToUpload[0]);
      onChange([result.url]);
    } catch (error) {
      console.error("Failed to upload image", error);
    }
  };

  const removeImage = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const isPending =
    singleUploadMutation.isPending || multipleUploadMutation.isPending;

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
          isDragging
            ? "border-primary bg-primary/10"
            : "border-muted-foreground/25 hover:border-primary/50",
          isPending && "opacity-50 cursor-not-allowed",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isPending && fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple={multiple}
          onChange={handleFileChange}
          disabled={isPending}
        />
        {isPending ? (
          <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
        ) : (
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
        )}
        <div className="mt-4 text-center text-sm">
          <span className="font-semibold text-primary">Click to upload</span> or
          drag and drop
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          SVG, PNG, JPG or GIF
        </p>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {value.map((url, index) => (
            <div
              key={index}
              className="group relative aspect-square rounded-lg border bg-muted"
            >
              <img
                src={url}
                alt={`Uploaded ${index + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
