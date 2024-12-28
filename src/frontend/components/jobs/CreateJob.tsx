import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SolverParameters } from "./SolverParameters";

interface Dataset {
  id: string;
  name: string;
  description?: string;
}

interface Solver {
  id: string;
  name: string;
  description?: string;
  solver_parameters?: Record<string, any>;
  solver_outputs?: Record<string, any>[];
}

export const CreateJob = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [solvers, setSolvers] = useState<Solver[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [selectedSolver, setSelectedSolver] = useState<string>("");
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [currentSolver, setCurrentSolver] = useState<Solver | null>(null);
  const [selectedDatasetName, setSelectedDatasetName] = useState<string>("");  // New state for dataset name
  const { toast } = useToast();
  const session = useSession();

  useEffect(() => {
    fetchDatasets();
    fetchSolvers();
  }, []);

  const fetchDatasets = async () => {
    try {
      const { data, error } = await supabase
        .from("datasets")
        .select("id, name, description");
      if (error) throw error;
      setDatasets(data || []);
    } catch (error) {
      console.error("Error fetching datasets:", error);
      toast({
        title: "Error fetching datasets",
        variant: "destructive",
      });
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
      toast({
        title: "Error fetching solvers",
        variant: "destructive",
      });
    }
  };

  const handleDatasetChange = (datasetId: string) => {
    setSelectedDataset(datasetId);
    const dataset = datasets.find((d) => d.id === datasetId);
    setSelectedDatasetName(dataset?.name || "");
  };

  const handleSolverChange = (solverId: string) => {
    setSelectedSolver(solverId);
    const solver = solvers.find((s) => s.id === solverId);
    setCurrentSolver(solver || null);
    
    // Initialize parameters with default values if available
    if (solver?.solver_parameters) {
      const initialParams: Record<string, string> = {};
      Object.values(solver.solver_parameters).forEach((param: any) => {
        initialParams[param.name] = param.default_value || "";
      });
      setParameters(initialParams);
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
      toast({
        title: "Please login to create a job",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("optimization_jobs").insert({
        solver_id: selectedSolver,
        dataset_id: selectedDataset,
        user_id: session.user.id,
        parameters: parameters,
      });

      if (error) throw error;

      toast({
        title: "Job created successfully",
      });

      // Reset form
      setSelectedDataset("");
      setSelectedSolver("");
      setParameters({});
      setSelectedDatasetName("");
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error creating job",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Optimization Job</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
          <>
            {/* Display Solver Parameters */}
            {currentSolver.solver_parameters && (
              <SolverParameters
                parameters={parameters}
                solverParameters={Object.values(currentSolver.solver_parameters)}
                onParameterChange={handleParameterChange}
                datasetName={selectedDatasetName}  // Pass the dataset name
              />
            )}

            {/* Display Solver Outputs */}
            {currentSolver.solver_outputs && currentSolver.solver_outputs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Expected Outputs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {currentSolver.solver_outputs.map((output, index) => (
                      <div key={index} className="p-2 border rounded">
                        <p className="font-medium">{output.name}</p>
                        <p className="text-sm text-gray-600">{output.type}</p>
                        {output.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {output.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!selectedDataset || !selectedSolver}
          className="w-full"
        >
          Create Job
        </Button>
      </CardContent>
    </Card>
  );
};