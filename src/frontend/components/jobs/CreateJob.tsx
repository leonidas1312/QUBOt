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

export const CreateJob = () => {
  const session = useSession();
  const [selectedSolver, setSelectedSolver] = useState<string>("");
  const [selectedDataset, setSelectedDataset] = useState<string>("");

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
      const { error } = await supabase
        .from('optimization_jobs')
        .insert({
          solver_id: selectedSolver,
          dataset_id: selectedDataset,
          user_id: session.user.id,
          status: 'PENDING',
          parameters: {},
        });

      if (error) throw error;

      toast.success("Job created successfully");
      setSelectedSolver("");
      setSelectedDataset("");
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error("Failed to create job");
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Create New Job</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Solver</label>
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Select Dataset</label>
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
      </div>

      <Button 
        onClick={handleCreateJob}
        disabled={!selectedSolver || !selectedDataset || !session?.user}
        className="w-full mt-4"
      >
        Create Job
      </Button>
    </div>
  );
};