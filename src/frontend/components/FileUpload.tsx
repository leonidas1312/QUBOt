// FileUpload.tsx
import { useState, useEffect, useRef } from "react";
import { Card } from "/components/ui/card";
import { Button } from "/components/ui/button";
import { Input } from "/components/ui/input";
import { Textarea } from "/components/ui/textarea";
import { toast } from "sonner";
import { Label } from "/components/ui/label";
import { OptimizationResults } from "./OptimizationResults";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OptimizationProgress {
  iteration: number;
  rl_cost: number;
  opt_cost: number;
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
    max_iters: 10, // Adjust as needed
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

  const handleParameterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParameters(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);
    Object.entries(parameters).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });

    try {
      const response = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || "An error occurred while processing.");
        setIsProcessing(false);
        return;
      }

      const data = await response.json();
      const { task_id } = data;
      taskIdRef.current = task_id;

      // Establish WebSocket connection
      const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${task_id}`);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connection established.");
        toast.success("Optimization started. Receiving updates...");
      };

      ws.onmessage = (event) => {
        const message: OptimizationFinalResult | OptimizationProgress = JSON.parse(event.data);
        if ("final" in message && message.final) {
          if (message.result) {
            setResults(message);
            toast.success("Processing completed successfully!");
          }
          ws.close();
        } else if ("error" in message) {
          toast.error(message.error || "An error occurred during optimization.");
          ws.close();
        } else {
          // It's a progress update
          setProgress(prev => [...prev, message as OptimizationProgress]);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        toast.error("WebSocket connection error.");
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed.");
        setIsProcessing(false);
      };

    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to communicate with the backend.");
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    // Cleanup WebSocket on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="num_layers">Number of Layers</Label>
                <Input
                  id="num_layers"
                  name="num_layers"
                  type="number"
                  value={parameters.num_layers}
                  onChange={handleParameterChange}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_iters">Maximum Iterations</Label>
                <Input
                  id="max_iters"
                  name="max_iters"
                  type="number"
                  value={parameters.max_iters}
                  onChange={handleParameterChange}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nbitstrings">Number of Bitstrings</Label>
                <Input
                  id="nbitstrings"
                  name="nbitstrings"
                  type="number"
                  value={parameters.nbitstrings}
                  onChange={handleParameterChange}
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="opt_time">Optimization Time (s)</Label>
                <Input
                  id="opt_time"
                  name="opt_time"
                  type="number"
                  value={parameters.opt_time}
                  onChange={handleParameterChange}
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rl_time">RL Time (s)</Label>
                <Input
                  id="rl_time"
                  name="rl_time"
                  type="number"
                  value={parameters.rl_time}
                  onChange={handleParameterChange}
                  min="0"
                  step="0.1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="initial_temperature">Initial Temperature</Label>
                <Input
                  id="initial_temperature"
                  name="initial_temperature"
                  type="number"
                  value={parameters.initial_temperature}
                  onChange={handleParameterChange}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Process Matrix"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Display live progress with a chart */}
      {progress.length > 0 && (
        <Card className="p-6 w-full max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">Optimization Progress</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="iteration" label={{ value: 'Iterations', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Cost', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="#8884d8" name="Cost" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </Card>
      )}


    </div>
  );
};
