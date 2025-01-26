import { Card } from "@/components/ui/card";
import { SolverExample } from "@/components/uploads/SolverExample";

const Docs = () => {
  return (
    <div className="min-h-screen w-full bg-white">
      <div className="container mx-auto py-12 px-4">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Solver Documentation</h2>
          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold mb-4">Example Implementation</h3>
            <p className="text-muted-foreground mb-6">
              Below is an example of a solver implementation that follows all the required guidelines.
              This example uses Simulated Annealing to solve QUBO optimization problems.
            </p>
            <SolverExample />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Docs;