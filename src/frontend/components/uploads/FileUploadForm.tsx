import { useState, useRef } from "react";
import { Card } from "/components/ui/card";
import { Button } from "/components/ui/button";
import { Input } from "/components/ui/input";
import { Textarea } from "/components/ui/textarea";
import { FileUploadZone } from "./FileUploadZone";

interface FileUploadFormProps {
  title: string;
  description: string;
  acceptedFileType: string;
  fileExtension: string;
  onSubmit: (formData: FormData) => Promise<void>;
  isProcessing: boolean;
  showPaperLink?: boolean;
}

export const FileUploadForm = ({
  title,
  description,
  acceptedFileType,
  fileExtension,
  onSubmit,
  isProcessing,
  showPaperLink = false,
}: FileUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState("");
  const [paperLink, setPaperLink] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(fileExtension)) {
        toast.error(`Please upload a ${fileExtension} file`);
        return;
      }
      setFile(selectedFile);
      toast.success("File selected successfully!");
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !fileDescription) {
      toast.error("Please provide both a file and description");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", fileDescription);
    if (showPaperLink && paperLink) {
      formData.append("paper_link", paperLink);
    }

    try {
      await onSubmit(formData);
      setFile(null);
      setFileDescription("");
      setPaperLink("");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <FileUploadZone
          file={file}
          acceptedFileType={acceptedFileType}
          onFileSelect={handleChooseFile}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
        />

        {showPaperLink && (
          <Input
            type="url"
            placeholder="Link to related paper (optional)"
            value={paperLink}
            onChange={(e) => setPaperLink(e.target.value)}
          />
        )}

        <Textarea
          placeholder="Description..."
          value={fileDescription}
          onChange={(e) => setFileDescription(e.target.value)}
          className="min-h-[100px]"
          required
        />

        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Upload"}
        </Button>
      </form>
    </Card>
  );
};