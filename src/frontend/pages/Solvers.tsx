import { SolverUpload } from "@/components/uploads/SolverUpload";

const Solvers = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-purple-700/10 via-orange-500/10 to-green-500/10">
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-orange-500">
            Solver Repository
          </h1>
          <p className="text-xl text-muted-foreground">
            Upload and manage your optimization solvers
          </p>
        </div>
        <SolverUpload />
      </div>
    </div>
  );
};

export default Solvers;