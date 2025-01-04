import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUploadZone } from "./FileUploadZone";
import { toast } from "sonner";

interface RequirementsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRequirementsChange: (file: File) => void;
}

export const RequirementsDialog = ({
  isOpen,
  onClose,
  onRequirementsChange,
}: RequirementsDialogProps) => {
  const [requirementsFile, setRequirementsFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name !== "requirements.txt") {
      toast.error("File must be named 'requirements.txt'");
      return;
    }

    setRequirementsFile(file);
  };

  const handleApply = () => {
    if (!requirementsFile) {
      toast.error("Please upload a requirements.txt file");
      return;
    }

    onRequirementsChange(requirementsFile);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Requirements File</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <FileUploadZone
            file={requirementsFile}
            acceptedFileType=".txt"
            onFileSelect={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};