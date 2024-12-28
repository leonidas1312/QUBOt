import { CreateJob } from "@/components/jobs/CreateJob";
import { JobManager } from "@/components/jobs/JobManager";

const Playground = () => {
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <CreateJob />
      <JobManager />
    </div>
  );
};

export default Playground;