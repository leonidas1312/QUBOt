// SolverUpload.tsx

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
import { Shuffle, Plus, Info } from "lucide-react";

export const SolverUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [solverName, setSolverName] = useState("");
  const [description, setDescription] = useState("");
  const [paperLink, setPaperLink] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputs, setInputs] = useState<Parameter[]>([]);
  const [outputs, setOutputs] = useState<Parameter[]>([]);
  const [guidelineValidation, setGuidelineValidation] = useState<any>(null);
  const [showInputDialog, setShowInputDialog] = useState(false);
  const [showOutputDialog, setShowOutputDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const session = useSession();

  const generateRandomName = () => {
    const adjectives = ['Quantum', 'Neural', 'Adaptive', 'Dynamic', 'Hybrid', 'Advanced', 'Optimized'];
    const nouns = ['Solver', 'Optimizer', 'Engine', 'System', 'Framework', 'Algorithm'];
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 1000);
    setSolverName(`${randomAdjective}${randomNoun}${randomNumber}`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !selectedFile.name.endsWith(".py")) {
      toast.error("Please upload a valid `.py` file.");
      return;
    }

    setFile(selectedFile);
    if (!solverName) {
      setSolverName(selectedFile.name.replace('.py', ''));
    }

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

      toast.success("File uploaded successfully!");
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

    if (!file || !description || !solverName) {
      toast.error("Please provide a file, name, and description.");
      return;
    }

    // Check if guidelines are met
    if (!guidelineValidation || !Object.values(guidelineValidation).every(Boolean)) {
      toast.error("Your solver must meet all guidelines before uploading.");
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
          name: solverName,
          description,
          file_path: filePath,
          solver_parameters: inputs,
          solver_outputs: outputs,
          paper_link: paperLink || null,
          user_id: session.user.id,
          email: session.user.email,
        });

      if (dbError) throw dbError;

      toast.success("Solver uploaded successfully!");
      setFile(null);
      setSolverName("");
      setDescription("");
      setPaperLink("");
      setInputs([]);
      setOutputs([]);
      setGuidelineValidation(null);
    } catch (error) {
      console.error("Error uploading solver:", error);
      toast.error("Failed to upload solver.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6">
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

          <div className="flex gap-4 items-center">
            <Input
              placeholder="Solver name"
              value={solverName}
              onChange={(e) => setSolverName(e.target.value)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={generateRandomName}
              className="whitespace-nowrap"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Random Name
            </Button>
          </div>

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

          {file && (
            <div className="flex flex-wrap gap-4">
              {inputs.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInputDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Configure Input Parameters ({inputs.length})
                </Button>
              )}
              {outputs.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowOutputDialog(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Configure Output Parameters ({outputs.length})
                </Button>
              )}
            </div>
          )}

          <SolverGuidelines validation={guidelineValidation} />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isProcessing || !guidelineValidation || !Object.values(guidelineValidation).every(Boolean)}
          >
            {isProcessing ? "Uploading..." : "Upload Solver"}
          </Button>
        </form>
      </Card>

      <ParameterDescriptionDialog
        isOpen={showInputDialog}
        onClose={() => setShowInputDialog(false)}
        parameters={inputs}
        onParametersChange={setInputs}
        title="Configure Input Parameters"
      />

      <ParameterDescriptionDialog
        isOpen={showOutputDialog}
        onClose={() => setShowOutputDialog(false)}
        parameters={outputs}
        onParametersChange={setOutputs}
        title="Configure Output Parameters"
      />
    </div>
  );
};
