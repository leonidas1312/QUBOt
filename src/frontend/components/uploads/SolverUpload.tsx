import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { FileUploadZone } from "./FileUploadZone";
import { supabase } from "@/integrations/supabase/client";
import { ItemGrid } from "./ItemGrid";
import { useSession } from "@supabase/auth-helpers-react";

interface Parameter {
  name: string;
  type: string;
  description: string;
  default_value?: string;
}

export const SolverUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [paperLink, setPaperLink] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputs, setInputs] = useState<Parameter[]>([]);
  const [outputs, setOutputs] = useState<Parameter[]>([]);
  const [solvers, setSolvers] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const session = useSession();

  const extractParameters = (content: string) => {
    // Extract function definition
    const funcMatch = content.match(/def\s+solve\s*\(([^)]*)\)/);
    if (!funcMatch) {
      toast.error("No solve function found in the file");
      return [];
    }

    const paramsString = funcMatch[1];
    const params = paramsString.split(',').map(param => {
      const paramParts = param.trim().split('=');
      const nameAndType = paramParts[0].split(':').map(p => p.trim());
      
      return {
        name: nameAndType[0],
        type: nameAndType[1] || 'any',
        description: `Parameter ${nameAndType[0]}`,
        default_value: paramParts[1]?.trim() || undefined
      };
    });

    return params.filter(param => param.name && !param.default_value);
  };

  const extractOutputs = (content: string) => {
    const returnMatches = content.match(/return\s+([^#\n]+)/g);
    if (!returnMatches) return [];

    return returnMatches.map((match, index) => {
      const returnValue = match.replace('return', '').trim();
      return {
        name: `output_${index + 1}`,
        type: 'any',
        description: `Returns ${returnValue}`
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.py')) {
        toast.error("Please upload a .py file");
        return;
      }
      setFile(selectedFile);
      
      const content = await selectedFile.text();
      const detectedParams = extractParameters(content);
      const detectedOutputs = extractOutputs(content);
      
      setInputs(detectedParams);
      setOutputs(detectedOutputs);
      
      if (detectedParams.length > 0 || detectedOutputs.length > 0) {
        toast.success("Parameters and outputs detected successfully!");
      } else {
        toast.warning("No parameters or outputs detected");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!session?.user?.email) {
      toast.error("You must be logged in to upload solvers");
      return;
    }
  
    if (!file || !description) {
      toast.error("Please provide both a file and description");
      return;
    }
  
    setIsProcessing(true);
  
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('solvers')
        .upload(filePath, file);
  
      if (uploadError) throw uploadError;
  
      const { error: dbError } = await supabase
        .from('solvers')
        .insert({
          name: file.name,
          description,
          file_path: filePath,
          solver_parameters: { inputs },
          solver_outputs: outputs,
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
      console.error("Error:", error);
      toast.error("Failed to upload solver");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="p-6 w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Upload Solver</h3>
            <p className="text-sm text-muted-foreground">
              Upload your .py file containing the solver algorithm. Parameters and outputs will be detected automatically.
            </p>
          </div>

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

          {inputs.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Detected Parameters:</h4>
              <ul className="list-disc pl-5 space-y-2">
                {inputs.map((param, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{param.name}</span>
                    {param.type !== 'any' && (
                      <span className="text-muted-foreground"> ({param.type})</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {outputs.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold">Detected Outputs:</h4>
              <ul className="list-disc pl-5 space-y-2">
                {outputs.map((output, index) => (
                  <li key={index} className="text-sm">
                    {output.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isProcessing}>
            {isProcessing ? "Uploading..." : "Upload Solver"}
          </Button>
        </form>
      </Card>

      <div className="w-full">
        <h2 className="text-2xl font-bold mb-6">Available Solvers</h2>
        <ItemGrid items={solvers} type="solver" />
      </div>
    </div>
  );
};