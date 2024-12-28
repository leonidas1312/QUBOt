import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

interface Solver {
  id: string;
  name: string;
  solver_parameters?: {
    inputs?: { name: string; type: string }[];
  };
}

interface Dataset {
  id: string;
  name: string;
}

export const CreateJob = () => {
  const [selectedSolver, setSelectedSolver] = useState<string>('');
  const [selectedDataset, setSelectedDataset] = useState<string>('');
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [solvers, setSolvers] = useState<Solver[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  const fetchSolversAndDatasets = async () => {
    try {
      const [{ data: solversData }, { data: datasetsData }] = await Promise.all([
        supabase.from('solvers').select('*'),
        supabase.from('datasets').select('*')
      ]);

      setSolvers(solversData || []);
      setDatasets(datasetsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load solvers and datasets');
    }
  };

  const handleCreateJob = async () => {
    if (!session?.user) {
      toast.error('Please sign in to create a job');
      return;
    }

    if (!selectedSolver || !selectedDataset) {
      toast.error('Please select both a solver and a dataset');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('optimization_jobs')
        .insert({
          solver_id: selectedSolver,
          dataset_id: selectedDataset,
          user_id: session.user.id,
          parameters,
          status: 'PENDING'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Job created successfully');
      setSelectedSolver('');
      setSelectedDataset('');
      setParameters({});
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Optimization Job</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Select Solver</Label>
          <Select value={selectedSolver} onValueChange={setSelectedSolver}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a solver" />
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

        <div className="space-y-2">
          <Label>Select Dataset</Label>
          <Select value={selectedDataset} onValueChange={setSelectedDataset}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a dataset" />
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

        {selectedSolver && solvers.find(s => s.id === selectedSolver)?.solver_parameters?.inputs && (
          <div className="space-y-4">
            <h3 className="font-medium">Parameters</h3>
            {solvers.find(s => s.id === selectedSolver)?.solver_parameters?.inputs?.map((input) => (
              <div key={input.name} className="space-y-2">
                <Label>{input.name}</Label>
                <Input
                  type={input.type === 'number' ? 'number' : 'text'}
                  placeholder={`Enter ${input.name}`}
                  value={parameters[input.name] || ''}
                  onChange={(e) => setParameters(prev => ({
                    ...prev,
                    [input.name]: e.target.value
                  }))}
                />
              </div>
            ))}
          </div>
        )}

        <Button 
          className="w-full" 
          onClick={handleCreateJob}
          disabled={isLoading || !selectedSolver || !selectedDataset}
        >
          {isLoading ? 'Creating...' : 'Create Job'}
        </Button>
      </CardContent>
    </Card>
  );
};