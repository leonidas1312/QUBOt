import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileUploadZone } from "./FileUploadZone";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { SolverGuidelines } from "./SolverGuidelines";
import { Parameter, extractParameters, extractOutputs } from "./solverUtils";
import { validateGuidelines } from "./guidelineValidation";
import { ParameterDescriptionDialog } from "./ParameterDescriptionDialog";

export const SolverUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [paperLink, setPaperLink] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputs, setInputs] = useState<Parameter[]>([]);
  const [outputs, setOutputs] = useState<Parameter[]>([]);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
  const [guidelineValidation, setGuidelineValidation] = useState(null);
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [showOutputDialog, setShowOutputDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const session = useSession();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !selectedFile.name.endsWith(".py")) {
      toast.error("Please upload a valid `.py` file.");
      return;
    }

    setFile(selectedFile);

    try {
      const content = await selectedFile.text();
      
      // Validate guidelines
      const validation = validateGuidelines(content);
      setGuidelineValidation(validation);

      // Extract parameters
      const detectedParams = extractParameters(content);
      const detectedOutputs = extractOutputs(content);

      setInputs(detectedParams);
      setOutputs(detectedOutputs);

      if (detectedParams.length > 0) {
        setShowInputDialog(true);
      }
      if (detectedOutputs.length > 0) {
        // Will show after input dialog is closed
        setTimeout(() => setShowOutputDialog(true), 500);
      }

      if (detectedParams.length > 0 || detectedOutputs.length > 0) {
        toast.success("Parameters and outputs detected successfully!");
      } else {
        toast.warning("No parameters or outputs detected in the file.");
      }
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Failed to read the file.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.email) {
      toast.error("You must be logged in to upload solvers.");
      return;
    }

    if (!file || !description) {
      toast.error("Please provide both a file and description.");
      return;
    }

    setIsProcessing(true);

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("solvers")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("solvers")
        .insert({
          name: file.name,
          description,
          file_path: filePath,
          solver_parameters: inputs, // Stored as an array
          solver_outputs: outputs,    // Stored as an array
          paper_link: paperLink || null,
          user_id: session.user.id,
          email: session.user.email,
        });

      if (dbError) throw dbError;

      toast.success("Solver uploaded successfully!");
      setFile(null);
      setDescription("");
      setPaperLink("");
      setInputs([]);
      setOutputs([]);
    } catch (error) {
      console.error("Error uploading solver:", error);
      toast.error("Failed to upload solver.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SolverGuidelines 
          onGuidelinesAccepted={setGuidelinesAccepted} 
          validation={guidelineValidation}
        />

        <div className={`transition-opacity duration-300 ${guidelinesAccepted ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <Card className="p-6 h-full">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-semibold">Upload Solver</h3>
              <p className="text-sm text-muted-foreground">
                Upload your `.py` file containing the solver algorithm.
              </p>

              <FileUploadZone
                file={file}
                acceptedFileType=".py"
                onFileSelect={() => fileInputRef.current?.click()}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
              />

              <Input
                type="url"
                placeholder="Link to related paper (optional)"
                value={paperLink}
                onChange={(e) => setPaperLink(e.target.value)}
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
        </div>
      </div>

      <ParameterDescriptionDialog
        isOpen={showInputDialog}
        onClose={() => {
          setShowInputDialog(false);
          if (outputs.length > 0) {
            setShowOutputDialog(true);
          }
        }}
        parameters={inputs}
        onParametersChange={setInputs}
        title="Describe Input Parameters"
      />

      <ParameterDescriptionDialog
        isOpen={showOutputDialog}
        onClose={() => setShowOutputDialog(false)}
        parameters={outputs}
        onParametersChange={setOutputs}
        title="Describe Output Parameters"
      />
    </div>
  );
};
