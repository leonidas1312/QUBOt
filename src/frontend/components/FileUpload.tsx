import { useState, useRef } from "react";
import { Card } from "/components/ui/card";
import { Button } from "/components/ui/button";
import { Textarea } from "/components/ui/textarea";
import { toast } from "sonner";
import { OptimizationParameters } from "./uploads/OptimizationParameters";
import { ProgressChart } from "./uploads/ProgressChart";
import { FileUploadZone } from "./uploads/FileUploadZone";
import { supabase } from "@/integrations/supabase/client";

interface OptimizationProgress {
  iteration: number;
  cost: number;
}

interface OptimizationFinalResult {
  final: boolean;
  description?: string;
  result?: {
    best_bitstring: number[];
    best_cost: number;
    cost_values: number[];
    time_per_iteration: number[];
    progress_rl_costs: number[];
    progress_opt_costs: number[];
  };
  error?: string;
}

export const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [parameters, setParameters] = useState({
    num_layers: 4,
    max_iters: 10,
    nbitstrings: 10,
    opt_time: 10,
    rl_time: 10,
    initial_temperature: 1.0
  });
  const [results, setResults] = useState<OptimizationFinalResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OptimizationProgress[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const taskIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (!file || !description) {
      toast.error("Please provide both a file and description");
      return;
    }

    setIsProcessing(true);
    setProgress([]);
    setResults(null);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(filePath, file);

      if (uploadError) {
        toast.error("Failed to upload file to storage");
        console.error(uploadError);
        setIsProcessing(false);
        return;
      }

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('datasets')
        .insert({
          name: file.name,
          description,
          file_path: filePath,
          format: 'npy'
        });

      if (dbError) {
        toast.error("Failed to save file metadata");
        console.error(dbError);
        setIsProcessing(false);
        return;
      }

      // Create form data for optimization
      const formData = new FormData();
      formData.append("file", file);
      formData.append("description", description);
      Object.entries(parameters).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });

      // Send to optimization endpoint
      const response = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process file");
      }

      const data = await response.json();
      taskIdRef.current = data.task_id;

      // Set up WebSocket connection
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${data.task_id}`);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connection established");
        toast.success("Optimization started. Receiving updates...");
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if ("final" in message && message.final) {
          if (message.result) {
            setResults(message);
            toast.success("Processing completed successfully!");
          }
          ws.close();
        } else if ("error" in message) {
          toast.error(message.error || "An error occurred during optimization");
          ws.close();
        } else {
          setProgress(prev => [...prev, message as OptimizationProgress]);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast.error("WebSocket connection error");
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
        setIsProcessing(false);
      };

    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to process file");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
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

          <Textarea
            placeholder="Describe what this QUBO matrix represents..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px]"
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

      {progress.length > 0 && (
        <Card className="p-6 w-full max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">Optimization Progress</h3>
          <ProgressChart progress={progress} />
        </Card>
      )}
    </div>
  );
};