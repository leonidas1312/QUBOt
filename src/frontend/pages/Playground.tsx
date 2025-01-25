import { CreateJob } from "@/components/jobs/CreateJob";
import { JobManager } from "@/components/jobs/JobManager";

const Playground = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-700/10 via-teal-500/10 to-blue-500/10">
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-700 to-teal-500">
            Optimization Playground
          </h1>
          <p className="text-xl text-muted-foreground">
            Create and manage your optimization jobs
          </p>
        </div>
        <CreateJob />
        <JobManager />
      </div>
    </div>
  );
};

export default Playground;