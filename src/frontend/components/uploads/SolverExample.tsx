import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const exampleCode = `# Simulated Annealing Algorithm Implementation
import numpy as np
import time

def compute_cost(qubo_matrix, solution, constant):
    """
    Computes the cost for a given solution based on the QUBO matrix and constant.
    """
    return solution @ qubo_matrix @ solution.T + constant

def solve(qubo_matrix, constant, initial_temperature=1000, cooling_rate=0.99, max_iterations=1000):
    """
    Implements Simulated Annealing for QUBO optimization.
    """
    num_vars = qubo_matrix.shape[0]
    current_solution = np.random.randint(0, 2, num_vars)
    # ... rest of implementation
    return best_solution, best_cost, costs_per_iteration, elapsed_time`;

export const SolverExample = () => {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="example">
        <AccordionTrigger>View Example Solver</AccordionTrigger>
        <AccordionContent>
          <pre className="p-4 bg-gray-100 rounded-lg overflow-x-auto">
            <code>
              {exampleCode.split('\n').map((line, index) => {
                // Highlight input parameters
                if (line.includes('def solve(')) {
                  return (
                    <div key={index} className="bg-yellow-100">
                      {line}
                    </div>
                  );
                }
                // Highlight return statement
                if (line.includes('return ')) {
                  return (
                    <div key={index} className="bg-yellow-100">
                      {line}
                    </div>
                  );
                }
                return <div key={index}>{line}</div>;
              })}
            </code>
          </pre>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};