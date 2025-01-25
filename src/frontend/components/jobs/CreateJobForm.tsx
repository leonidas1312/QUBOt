import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession } from "@supabase/auth-helpers-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobParameters } from "./JobParameters";
import { useJobSubmission } from "./hooks/useJobSubmission";

interface CreateJobFormProps {
  availableSolvers: any[];
  availableDatasets: any[];
}

export const CreateJobForm = ({ availableSolvers, availableDatasets, onJobCreated }: CreateJobFormProps & { onJobCreated?: () => void }) => {
  const session = useSession();
  const [selectedDataset, setSelectedDataset] = useState("");
  const [selectedSolver, setSelectedSolver] = useState("");
  
  const { parameters, setParameters, handleSubmit, isSubmitting } = useJobSubmission({
    selectedDataset,
    selectedSolver,
    onJobCreated
  });

  // Get the selected dataset name
  const selectedDatasetName = availableDatasets.find(d => d.id === selectedDataset)?.name || '';

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
        <Select value={selectedDataset} onValueChange={setSelectedDataset}>
          <SelectTrigger>
            <SelectValue placeholder="Select a dataset" />
          </SelectTrigger>
          <SelectContent>
            {availableDatasets.map((dataset) => (
              <SelectItem key={dataset.id} value={dataset.id}>
                {dataset.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Solver</Label>
        <Select value={selectedSolver} onValueChange={setSelectedSolver}>
          <SelectTrigger>
            <SelectValue placeholder="Select a solver" />
          </SelectTrigger>
          <SelectContent>
            {availableSolvers.map((solver) => (
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
          solverParameters={availableSolvers.find(s => s.id === selectedSolver)?.solver_parameters || {}}
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