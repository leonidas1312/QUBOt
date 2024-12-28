import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateJobForm } from "./CreateJobForm";

export const CreateJob = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Optimization Job</CardTitle>
      </CardHeader>
      <CardContent>
        <CreateJobForm />
      </CardContent>
    </Card>
  );
};