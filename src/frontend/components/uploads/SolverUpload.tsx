import { useState, useRef } from "react";
import { Card } from "/components/ui/card";
import { Button } from "/components/ui/button";
import { Textarea } from "/components/ui/textarea";
import { toast } from "sonner";
import { FileUploadZone } from "./FileUploadZone";
import { supabase } from "@/integrations/supabase/client";

export const SolverUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.py')) {
        toast.error("Please upload a .py file");
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

    if (!file || !description) {
      toast.error("Please provide both a file and description");
      return;
    }

    setIsProcessing(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('solvers')
        .upload(filePath, file);

      if (uploadError) {
        toast.error("Failed to upload file to storage");
        console.error(uploadError);
        return;
      }

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('solvers')
        .insert({
          name: file.name,
          description,
          file_path: filePath
        });

      if (dbError) {
        toast.error("Failed to save file metadata");
        console.error(dbError);
        return;
      }

      toast.success("Solver uploaded successfully!");
      setFile(null);
      setDescription("");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to upload solver");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Upload Solver</h3>
          <p className="text-sm text-muted-foreground">
            Please upload your .py file containing the solver algorithm
          </p>
        </div>

        <FileUploadZone
          file={file}
          acceptedFileType=".py"
          onFileSelect={handleChooseFile}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
        />

        <Textarea
          placeholder="Describe what this solver does..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
        />

        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? "Uploading..." : "Upload Solver"}
        </Button>
      </form>
    </Card>
  );
};