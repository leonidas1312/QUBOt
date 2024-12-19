import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.npy')) {
        toast.error("Please upload a .npy file");
        return;
      }
      setFile(selectedFile);
      toast.success("File uploaded successfully!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !description) {
      toast.error("Please provide both a file and description");
      return;
    }
    // Here you would handle the file submission to your Python backend
    toast.success("Processing started! You'll be notified when it's complete.");
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
        
        <div className="space-y-4">
          <Input
            type="file"
            accept=".npy"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          
          <Textarea
            placeholder="Describe what this QUBO matrix represents..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
          />
          
          <Button type="submit" className="w-full">
            Process Matrix
          </Button>
        </div>
      </form>
    </Card>
  );
};