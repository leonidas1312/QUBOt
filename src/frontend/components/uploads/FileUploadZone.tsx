import { Upload } from "lucide-react";
import { Button } from "/components/ui/button";

interface FileUploadZoneProps {
  file: File | null;
  acceptedFileType: string;
  onFileSelect: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadZone = ({
  file,
  acceptedFileType,
  onFileSelect,
  fileInputRef,
  handleFileChange,
}: FileUploadZoneProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
      <Upload className="w-12 h-12 mb-4 text-gray-400" />
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFileType}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={onFileSelect}
        className="mb-2"
      >
        Choose File
      </Button>
      {file && (
        <p className="text-sm text-muted-foreground">
          Selected: {file.name}
        </p>
      )}
      <p className="mt-2 text-sm text-gray-500">
        Upload {acceptedFileType} files only
      </p>
    </div>
  );
};