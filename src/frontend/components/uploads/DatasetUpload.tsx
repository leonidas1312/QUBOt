import { useState } from "react";
import { FileUploadForm } from "./FileUploadForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const DatasetUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsProcessing(true);
    try {
      const file = formData.get("file") as File;
      const description = formData.get("description") as string;

      // Upload file to Supabase Storage
      const { data: fileData, error: fileError } = await supabase.storage
        .from('datasets')
        .upload(`${Date.now()}-${file.name}`, file);

      if (fileError) throw fileError;

      // Store metadata in Supabase database
      const { error: dbError } = await supabase
        .from('datasets')
        .insert({
          name: file.name,
          description,
          file_path: fileData?.path,
          format: 'npy'
        });

      if (dbError) throw dbError;

      toast.success("Dataset uploaded successfully!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to upload dataset");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <FileUploadForm
      title="Upload Dataset"
      description="Please upload your .npy file containing the QUBO matrix"
      acceptedFileType=".npy"
      fileExtension=".npy"
      onSubmit={handleSubmit}
      isProcessing={isProcessing}
    />
  );
};