import { useState, useRef, useEffect } from "react";
import { Card } from "/components/ui/card";
import { Button } from "/components/ui/button";
import { Textarea } from "/components/ui/textarea";
import { Input } from "/components/ui/input";
import { Label } from "/components/ui/label";
import { toast } from "sonner";
import { FileUploadZone } from "./FileUploadZone";
import { supabase } from "@/integrations/supabase/client";
import { ItemGrid } from "./ItemGrid";
import { useSession } from "@supabase/auth-helpers-react";

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
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [solvers, setSolvers] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const session = useSession();

  useEffect(() => {
    fetchSolvers();
  }, []);

  const fetchSolvers = async () => {
    const { data, error } = await supabase
      .from('solvers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to fetch solvers");
      return;
    }

    setSolvers(data || []);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.py')) {
        toast.error("Please upload a .py file");
        return;
      }
      setFile(selectedFile);
      
      // Read file content to extract parameters
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
        setParameters(params);
        toast.success("Parameters extracted successfully!");
      } else {
        toast.error("No solve function found in the file");
      }
      
      toast.success("File selected successfully!");
    }
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
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

    const missingDescriptions = parameters.some(param => !param.description);
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

      if (uploadError) {
        toast.error("Failed to upload file to storage");
        console.error(uploadError);
        return;
      }

      const { error: dbError } = await supabase
        .from('solvers')
        .insert({
          name: file.name,
          description,
          file_path: filePath,
          solver_parameters: {
            inputs: parameters,
            outputs: []
          },
          paper_link: paperLink || null,
          user_id: session.user.id
        });

      if (dbError) {
        toast.error("Failed to save solver metadata");
        console.error(dbError);
        return;
      }

      toast.success("Solver uploaded successfully!");
      setFile(null);
      setDescription("");
      setPaperLink("");
      setParameters([]);
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
            onFileSelect={handleChooseFile}
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

          {parameters.length > 0 && (
            <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-semibold">Parameter Descriptions</h4>
              <p className="text-sm text-muted-foreground">
                Please provide a description for each parameter of your solver
              </p>
              {parameters.map((param, index) => (
                <div key={index} className="space-y-2 p-4 bg-white rounded-md shadow-sm">
                  <Label className="font-medium">
                    {param.name} ({param.type})
                  </Label>
                  <Textarea
                    placeholder={`Describe what ${param.name} is used for...`}
                    value={param.description}
                    onChange={(e) => {
                      const newParams = [...parameters];
                      newParams[index].description = e.target.value;
                      setParameters(newParams);
                    }}
                    className="min-h-[80px]"
                  />
                </div>
              ))}
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