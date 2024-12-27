import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Solver {
  id: string;
  name: string;
  solver_parameters?: {
    inputs?: { name: string; type: string }[];
    outputs?: { name: string; type: string }[];
  };
}

interface Dataset {
  id: string;
  name: string;
}

const Playground = () => {
  const { toast } = useToast();
  const [solvers, setSolvers] = useState<Solver[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedSolver, setSelectedSolver] = useState<string>('');
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSolversAndDatasets();
  }, []);

  const fetchSolversAndDatasets = async () => {
    try {
      setIsLoading(true);
      // Fetch solvers
      const { data: solversData, error: solversError } = await supabase
        .from('solvers')
        .select('id, name, solver_parameters');

      if (solversError) throw solversError;
      setSolvers(solversData || []);

      // Fetch datasets
      const { data: datasetsData, error: datasetsError } = await supabase
        .from('datasets')
        .select('id, name');

      if (datasetsError) throw datasetsError;
      setDatasets(datasetsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load solvers and datasets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSolverChange = (value: string) => {
    setSelectedSolver(value);
    const solver = solvers.find(s => s.id === value);
    if (solver && solver.solver_parameters?.inputs) {
      const initialParams: Record<string, string> = {};
      solver.solver_parameters.inputs.forEach(input => {
        initialParams[input.name] = '';
      });
      setParameters(initialParams);
    } else {
      setParameters({});
    }
  };

  const handleParameterChange = (name: string, value: string) => {
    setParameters(prev => ({ ...prev, [name]: value }));
  };

  const handleRun = async () => {
    if (!selectedSolver || !selectedDataset) {
      toast({
        title: "Missing selection",
        description: "Please select both a solver and a dataset",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    try {
      // Here you would typically make an API call to your backend
      toast({
        title: "Started",
        description: "The optimization process has started",
      });
    } catch (error) {
      console.error('Error running optimization:', error);
      toast({
        title: "Error",
        description: "Failed to start optimization",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-8 flex justify-center items-center">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedSolverData = solvers.find(s => s.id === selectedSolver);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Playground</CardTitle>
          <CardDescription>
            Run optimization algorithms on your datasets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Algorithm</label>
            <Select value={selectedSolver} onValueChange={handleSolverChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a solver" />
              </SelectTrigger>
              <SelectContent>
                {solvers.map(solver => (
                  <SelectItem key={solver.id} value={solver.id}>
                    {solver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Select Dataset</label>
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a dataset" />
              </SelectTrigger>
              <SelectContent>
                {datasets.map(dataset => (
                  <SelectItem key={dataset.id} value={dataset.id}>
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSolverData?.solver_parameters?.inputs && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Algorithm Parameters</h3>
              {selectedSolverData.solver_parameters.inputs.map(input => (
                <div key={input.name}>
                  <label className="text-sm font-medium mb-2 block">
                    {input.name} ({input.type})
                  </label>
                  <Input
                    value={parameters[input.name] || ''}
                    onChange={(e) => handleParameterChange(input.name, e.target.value)}
                    placeholder={`Enter ${input.name}`}
                  />
                </div>
              ))}
            </div>
          )}

          <Button 
            className="w-full"
            onClick={handleRun}
            disabled={isRunning || !selectedSolver || !selectedDataset}
          >
            {isRunning ? "Running..." : "Run Optimization"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Playground;