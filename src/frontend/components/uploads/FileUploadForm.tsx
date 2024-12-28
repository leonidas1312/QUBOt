import { useState, useRef } from "react";
import { Card } from "/components/ui/card";
import { Button } from "/components/ui/button";
import { Input } from "/components/ui/input";
import { Textarea } from "/components/ui/textarea";
import { toast } from "sonner";
import { FileUploadZone } from "./FileUploadZone";
import { OptimizationParameters } from "./OptimizationParameters";

interface FileUploadFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  isProcessing: boolean;
}

export const FileUploadForm = ({ onSubmit, isProcessing }: FileUploadFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [paperLink, setPaperLink] = useState("");
  const [parameters, setParameters] = useState({
    num_layers: 4,
    max_iters: 10,
    nbitstrings: 10,
    opt_time: 10,
    rl_time: 10,
    initial_temperature: 1.0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.npy')) {
        toast.error("Please upload a .npy file");
        return;
      }
      setFile(selectedFile);
      toast.success("File selected successfully!");
    }
  };

  const handleParameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParameters(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !description || !email) {
      toast.error("Please provide a file, description, and email");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    formData.append("email", email);
    if (paperLink) formData.append("paper_link", paperLink);
    Object.entries(parameters).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    try {
      await onSubmit(formData);
      setFile(null);
      setDescription("");
      setEmail("");
      setPaperLink("");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to upload file");
    }
  };

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Upload QUBO Matrix</h3>
          <p className="text-sm text-muted-foreground">
            Please upload your .npy file containing the QUBO matrix
          </p>
        </div>

        <FileUploadZone
          file={file}
          acceptedFileType=".npy"
          onFileSelect={handleChooseFile}
          fileInputRef={fileInputRef}
          handleFileChange={handleFileChange}
        />

        <Input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          type="url"
          placeholder="Link to related paper (optional)"
          value={paperLink}
          onChange={(e) => setPaperLink(e.target.value)}
        />

        <Textarea
          placeholder="Describe what this QUBO matrix represents..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px]"
          required
        />

        <OptimizationParameters
          parameters={parameters}
          onParameterChange={handleParameterChange}
        />

        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Process Matrix"}
        </Button>
      </form>
    </Card>
  );
};