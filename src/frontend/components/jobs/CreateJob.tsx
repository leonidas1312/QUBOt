import { useState } from "react";
import { useSession } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Parameter {
  name: string;
  type: string;
  description: string;
}

export const CreateJob = () => {
  const session = useSession();
  const [selectedSolver, setSelectedSolver] = useState<string>("");
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [parameters, setParameters] = useState<Record<string, any>>({});

  // Fetch available solvers
  const { data: solvers, isLoading: solversLoading } = useQuery({
    queryKey: ['solvers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solvers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to fetch solvers");
        throw error;
      }
      return data;
    },
  });

  // Fetch available datasets
  const { data: datasets, isLoading: datasetsLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast.error("Failed to fetch datasets");
        throw error;
      }
      return data;
    },
  });

  const handleParameterChange = (name: string, value: string) => {
    setParameters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateJob = async () => {
    if (!session?.user) {
      toast.error("Please login to create a job");
      return;
    }

    if (!selectedSolver || !selectedDataset) {
      toast.error("Please select both a solver and a dataset");
      return;
    }

    try {
      // First, get the dataset content
      const selectedDatasetObj = datasets?.find(d => d.id === selectedDataset);
      if (!selectedDatasetObj) {
        toast.error("Selected dataset not found");
        return;
      }

      const { data: datasetFile, error: datasetError } = await supabase.storage
        .from('datasets')
        .download(selectedDatasetObj.file_path);

      if (datasetError) {
        toast.error("Failed to download dataset");
        throw datasetError;
      }

      // Convert the blob to array buffer and then to Float64Array
      const arrayBuffer = await datasetFile.arrayBuffer();
      const QUBO_matrix = new Float64Array(arrayBuffer);

      // Create the job with the parameters
      const { error } = await supabase
        .from('optimization_jobs')
        .insert({
          solver_id: selectedSolver,
          dataset_id: selectedDataset,
          user_id: session.user.id,
          status: 'PENDING',
          parameters: parameters,
        });

      if (error) throw error;

      toast.success("Job created successfully");
      setSelectedSolver("");
      setSelectedDataset("");
      setParameters({});
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error("Failed to create job");
    }
  };

  const selectedSolverData = solvers?.find(s => s.id === selectedSolver);
  const solverInputs = selectedSolverData?.solver_parameters?.inputs || [];
  const solverOutputs = selectedSolverData?.solver_outputs || [];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Create New Job</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Select Dataset</Label>
            <Select
              value={selectedDataset}
              onValueChange={setSelectedDataset}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasetsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading datasets...
                  </SelectItem>
                ) : datasets?.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No datasets available
                  </SelectItem>
                ) : (
                  datasets?.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Select Solver</Label>
            <Select
              value={selectedSolver}
              onValueChange={setSelectedSolver}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a solver" />
              </SelectTrigger>
              <SelectContent>
                {solversLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading solvers...
                  </SelectItem>
                ) : solvers?.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No solvers available
                  </SelectItem>
                ) : (
                  solvers?.map((solver) => (
                    <SelectItem key={solver.id} value={solver.id}>
                      {solver.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedSolver && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Algorithm Parameters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {solverInputs.map((param: Parameter) => (
                    <div key={param.name} className="space-y-2">
                      <Label htmlFor={param.name}>
                        {param.name}
                        <span className="text-sm text-muted-foreground ml-2">
                          ({param.type})
                        </span>
                      </Label>
                      <Input
                        id={param.name}
                        type={param.type === 'number' ? 'number' : 'text'}
                        value={parameters[param.name] || ''}
                        onChange={(e) => handleParameterChange(param.name, e.target.value)}
                        placeholder={param.description}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {solverOutputs.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Expected Outputs</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {solverOutputs.map((output: Parameter) => (
                      <div key={output.name} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium">{output.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Type: {output.type}
                        </p>
                        <p className="text-sm mt-2">{output.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <Button 
          onClick={handleCreateJob}
          disabled={!selectedSolver || !selectedDataset || !session?.user}
          className="w-full mt-6"
        >
          Create Job
        </Button>
      </Card>
    </div>
  );
};