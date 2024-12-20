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

  const formData = new FormData();
  formData.append("file", file);
  formData.append("description", description);
  formData.append("num_layers", "4"); // Replace with user input or default value
  formData.append("max_iters", "1"); // Replace with user input or default value
  formData.append("nbitstrings", "10"); // Replace with user input or default value
  formData.append("opt_time", "10"); // Replace with user input or default value
  formData.append("rl_time", "10"); // Replace with user input or default value
  formData.append("initial_temperature", "1.0"); // Replace with user input or default value

  try {
    const response = await fetch("http://127.0.0.1:8000/upload/", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      toast.error(errorData.error || "An error occurred while processing.");
      return;
    }

    const result = await response.json();
    console.log("Result:", result);
    toast.success("Processing completed successfully!");
  } catch (error) {
    console.error("Error:", error);
    toast.error("Failed to communicate with the backend.");
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