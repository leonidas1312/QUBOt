import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CreateJobForm } from "./CreateJobForm";

interface CreateJobProps {
  availableSolvers: any[];
  availableDatasets: any[];
}

export const CreateJob = ({ availableSolvers, availableDatasets }: CreateJobProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <h2 className="text-lg font-semibold">Create New Job</h2>
      </CardHeader>
      <CardContent>
        <CreateJobForm 
          availableSolvers={availableSolvers}
          availableDatasets={availableDatasets}
        />
      </CardContent>
    </Card>
  );
};