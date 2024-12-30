import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobParameters } from "./JobParameters";
import { useDatasetSelection } from "./hooks/useDatasetSelection";
import { useSolverSelection } from "./hooks/useSolverSelection";
import { useJobSubmission } from "./hooks/useJobSubmission";

export const CreateJobForm = ({ onJobCreated }: { onJobCreated?: () => void }) => {
  const session = useSession();
  const { datasets, selectedDataset, handleDatasetChange } = useDatasetSelection();
  const { solvers, selectedSolver, handleSolverChange } = useSolverSelection();
  const { parameters, setParameters, handleSubmit, isSubmitting } = useJobSubmission({
    selectedDataset,
    selectedSolver,
    onJobCreated
  });

  // Get the selected dataset name
  const selectedDatasetName = datasets.find(d => d.id === selectedDataset)?.name || '';

  if (!session?.user?.id) {
    return (
      <div className="text-center p-4">
        <p>Please login to create optimization jobs.</p>
      </div>
    );
  }

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

      {selectedSolver && (
        <JobParameters
          parameters={parameters}
          solverParameters={solvers.find(s => s.id === selectedSolver)?.solver_parameters || {}}
          onParameterChange={setParameters}
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