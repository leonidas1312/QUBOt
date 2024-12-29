import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SolverParameters } from "./SolverParameters";

interface Dataset {
  id: string;
  name: string;
  description?: string;
  file_path: string;
}

interface Solver {
  id: string;
  name: string;
  description?: string;
  solver_parameters?: Record<string, any>;
  solver_outputs?: Record<string, any>[];
}

interface CreateJobFormProps {
  onJobCreated?: () => void;
}

export const CreateJobForm = ({ onJobCreated }: CreateJobFormProps) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [solvers, setSolvers] = useState<Solver[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [selectedSolver, setSelectedSolver] = useState<string>("");
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [currentSolver, setCurrentSolver] = useState<Solver | null>(null);
  const [selectedDatasetName, setSelectedDatasetName] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const session = useSession();

  useEffect(() => {
    fetchDatasets();
    fetchSolvers();
  }, []);

  const fetchDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from("datasets")
        .select("id, name, description, file_path");
      if (error) throw error;
      setDatasets(data || []);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      toast.error("Error fetching datasets");
    }
  };

  const fetchSolvers = async () => {
    try {
      const { data, error } = await supabase
        .from("solvers")
        .select("id, name, description, solver_parameters, solver_outputs");
      if (error) throw error;
      setSolvers(data || []);
    } catch (error) {
      console.error("Error fetching solvers:", error);
      toast.error("Error fetching solvers");
    }
  };

  const handleDatasetChange = async (datasetId: string) => {
    setSelectedDataset(datasetId);
    const dataset = datasets.find((d) => d.id === datasetId);
    setSelectedDatasetName(dataset?.name || "");

    if (dataset) {
      try {
        // Download the dataset file from storage
        const { data, error } = await supabase.storage
          .from('datasets')
          .download(dataset.file_path);
        
        if (error) throw error;

        // Convert the blob to array buffer and then to a numeric array
        const arrayBuffer = await data.arrayBuffer();
        const quboMatrix = new Float64Array(arrayBuffer);
        
        // Update parameters with the QUBO matrix
        setParameters(prev => ({
          ...prev,
          qubo_matrix: JSON.stringify(Array.from(quboMatrix))
        }));
      } catch (error) {
        console.error("Error loading dataset:", error);
        toast.error("Failed to load dataset");
      }
    }
  };

  const handleSolverChange = (solverId: string) => {
    setSelectedSolver(solverId);
    const solver = solvers.find((s) => s.id === solverId);
    setCurrentSolver(solver || null);
    
    if (solver?.solver_parameters) {
      const initialParams: Record<string, string> = {};
      Object.values(solver.solver_parameters).forEach((param: any) => {
        initialParams[param.name] = param.default_value || "";
      });
      setParameters(prev => ({
        ...prev,
        ...initialParams
      }));
    }
  };

  const handleParameterChange = (paramName: string, value: string) => {
    setParameters((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      toast.error("Please login to create a job");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the job
      const { data: job, error: jobError } = await supabase
        .from("optimization_jobs")
        .insert({
          solver_id: selectedSolver,
          dataset_id: selectedDataset,
          user_id: session.user.id,
          parameters,
          status: 'PENDING'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Call the Edge Function to start the optimization
      const { data, error } = await supabase.functions.invoke('run-optimization', {
        body: { jobId: job.id }
      });

      if (error) throw error;

      toast.success("Job created successfully");
      onJobCreated?.();

      // Reset form
      setSelectedDataset("");
      setSelectedSolver("");
      setParameters({});
      setSelectedDatasetName("");
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Error creating job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Dataset</Label>
        <Select value={selectedDataset} onValueChange={handleDatasetChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a dataset" />
          </SelectTrigger>
          <SelectContent>
            {datasets.map((dataset) => (
              <SelectItem key={dataset.id} value={dataset.id}>
                {dataset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Solver</Label>
        <Select value={selectedSolver} onValueChange={handleSolverChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select a solver" />
          </SelectTrigger>
          <SelectContent>
            {solvers.map((solver) => (
              <SelectItem key={solver.id} value={solver.id}>
                {solver.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {currentSolver && (
        <SolverParameters
          parameters={parameters}
          solverParameters={Object.values(currentSolver.solver_parameters || {})}
          onParameterChange={handleParameterChange}
          datasetName={selectedDatasetName}
        />
      )}

      <Button
        onClick={handleSubmit}
        disabled={!selectedDataset || !selectedSolver || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Creating Job..." : "Create Job"}
      </Button>
    </div>
  );
};