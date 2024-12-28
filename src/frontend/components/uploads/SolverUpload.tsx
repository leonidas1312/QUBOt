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
import { SolverParameterForm } from "./SolverParameterForm";

interface Parameter {
  name: string;
  type: string;
  description: string;
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.py')) {
        toast.error("Please upload a .py file");
        return;
      }
      setFile(selectedFile);
      
      const content = await selectedFile.text();
      const paramMatches = content.match(/def\s+solve\s*\(([^)]*)\)/);
      if (paramMatches && paramMatches[1]) {
        const params = paramMatches[1].split(',').map(param => {
          const trimmed = param.trim();
          const [name, type] = trimmed.split(':').map(p => p.trim());
          return { 
            name: name || '',
            type: type || 'any',
            description: ''
          };
        }).filter(param => param.name);
        setInputs(params);
        toast.success("Parameters extracted successfully!");
      } else {
        toast.error("No solve function found in the file");
      }
      
      toast.success("File selected successfully!");
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
  
    const missingDescriptions = [...inputs, ...outputs].some(param => !param.description);
    if (missingDescriptions) {
      toast.error("Please provide descriptions for all parameters");
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
      fetchSolvers();
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
              Please upload your .py file containing the solver algorithm
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

          <SolverParameterForm
            parameters={inputs}
            onParametersChange={setInputs}
            title="Input Parameters"
            description="Define the input parameters for your solver"
          />

          <SolverParameterForm
            parameters={outputs}
            onParametersChange={setOutputs}
            title="Output Parameters"
            description="Define what outputs your solver will produce"
          />

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