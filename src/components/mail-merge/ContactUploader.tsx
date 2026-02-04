import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContactUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile?: File | null;
  onClear?: () => void;
}

export const ContactUploader = ({ onFileSelect, selectedFile, onClear }: ContactUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition-colors
          ${isDragging ? "border-primary bg-primary/5" : "border-border"}
          ${selectedFile ? "border-success bg-success/5" : ""}
        `}
      >
        {selectedFile ? (
          <>
            <FileSpreadsheet className="w-4 h-4 text-success" />
            <span className="text-sm font-medium text-success">{selectedFile.name}</span>
            <button
              onClick={onClear}
              className="ml-2 p-1 rounded hover:bg-muted transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </>
        ) : (
          <>
            <span className="text-sm text-muted-foreground">Choose file</span>
            <span className="text-sm text-muted-foreground/60">No file chosen</span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        variant="outline"
        onClick={() => inputRef.current?.click()}
        className="gap-2 bg-card"
      >
        <Upload className="w-4 h-4" />
        Upload CSV
      </Button>
    </div>
  );
};
