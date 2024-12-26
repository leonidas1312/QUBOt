import { useState } from "react";
import { FileUploadForm } from "./FileUploadForm";
import { AlgorithmParametersForm } from "./AlgorithmParametersForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Parameter {
  name: string;
  type: string;
}

export const SolverUpload = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputs, setInputs] = useState<Parameter[]>([{ name: '', type: '' }]);
  const [outputs, setOutputs] = useState<Parameter[]>([{ name: '', type: '' }]);

  const handleSubmit = async (formData: FormData) => {
    setIsProcessing(true);
    try {
      const file = formData.get("file") as File;
      const description = formData.get("description") as string;

      // Upload file to Supabase Storage
      const { data: fileData, error: fileError } = await supabase.storage
        .from('solvers')
        .upload(`${Date.now()}-${file.name}`, file);

      if (fileError) throw fileError;

      // Store metadata in Supabase database
      const { error: dbError } = await supabase
        .from('solvers')
        .insert({
          name: file.name,
          description,
          file_path: fileData?.path,
          solver_parameters: {
            inputs,
            outputs
          }
        });

      if (dbError) throw dbError;

      toast.success("Solver uploaded successfully!");
    } catch (error) {
      console.error('Error:', error);
      toast.error("Failed to upload solver");
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <FileUploadForm
      title="Upload Solver"
      description="Please upload your .py file containing the solver algorithm"
      acceptedFileType=".py"
      fileExtension=".py"
      onSubmit={handleSubmit}
      isProcessing={isProcessing}
      additionalFields={
        <AlgorithmParametersForm
          inputs={inputs}
          outputs={outputs}
          onInputsChange={setInputs}
          onOutputsChange={setOutputs}
        />
      }
    />
  );
};