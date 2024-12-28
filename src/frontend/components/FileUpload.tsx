import { useState } from "react";
import { Card } from "/components/ui/card";
import { toast } from "sonner";
import { FileUploadForm } from "./uploads/FileUploadForm";
import { ProgressChart } from "./uploads/ProgressChart";
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<OptimizationProgress[]>([]);
  const [results, setResults] = useState<OptimizationFinalResult | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setIsProcessing(true);
    setProgress([]);
    setResults(null);

    try {
      const file = formData.get("file") as File;
      const description = formData.get("description") as string;
      const email = formData.get("email") as string;
      const paperLink = formData.get("paper_link") as string;

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('datasets')
        .upload(filePath, file);

      if (uploadError) {
        toast.error("Failed to upload file to storage");
        console.error(uploadError);
        return;
      }

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('datasets')
        .insert({
          name: file.name,
          description,
          file_path: filePath,
          format: 'npy',
          email,
          paper_link: paperLink || null
        });

      if (dbError) {
        toast.error("Failed to save file metadata");
        console.error(dbError);
        return;
      }

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
      
      // Set up WebSocket connection for real-time updates
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${data.task_id}`);

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
      <FileUploadForm
        onSubmit={handleSubmit}
        isProcessing={isProcessing}
      />

      {progress.length > 0 && (
        <Card className="p-6 w-full max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">Optimization Progress</h3>
          <ProgressChart progress={progress} />
        </Card>
      )}
    </div>
  );
};