import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

interface SolverGuidelinesProps {
  onGuidelinesAccepted: (accepted: boolean) => void;
}

export const SolverGuidelines = ({ onGuidelinesAccepted }: SolverGuidelinesProps) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    entryPoint: false,
    returnStatement: false,
    nestedFunctions: false,
  });

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const newCheckedItems = { ...checkedItems, [id]: checked };
    setCheckedItems(newCheckedItems);
    
    // Check if all items are checked
    const allChecked = Object.values(newCheckedItems).every(value => value);
    onGuidelinesAccepted(allChecked);
  };

  const exampleCode = `# Simulated Annealing Algorithm Implementation
import numpy as np
import time

def compute_cost(qubo_matrix, solution, constant):
    """
    Computes the cost for a given solution based on the QUBO matrix and constant.
    """
    return solution @ qubo_matrix @ solution.T + constant

def solve(qubo_matrix, constant, initial_temperature=1000, 
         cooling_rate=0.99, max_iterations=1000):
    """
    Implements Simulated Annealing for QUBO optimization.
    """
    num_vars = qubo_matrix.shape[0]
    current_solution = np.random.randint(0, 2, num_vars)
    # ... rest of implementation
    return best_solution, best_cost, costs_per_iteration, elapsed_time`;

  return (
    <Card className="p-6 space-y-6">
      <h3 className="text-lg font-semibold">Solver Guidelines</h3>
      <p className="text-sm text-muted-foreground">
        Before uploading your solver, please ensure it meets the following requirements:
      </p>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="entryPoint"
            checked={checkedItems.entryPoint}
            onCheckedChange={(checked) => 
              handleCheckboxChange("entryPoint", checked as boolean)
            }
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="entryPoint">
              Must use a solve function as the main entry point with input QUBO_matrix for .npy file
            </Label>
            <p className="text-sm text-muted-foreground">
              The solve function can have other parameters, but QUBO_matrix is required
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="returnStatement"
            checked={checkedItems.returnStatement}
            onCheckedChange={(checked) => 
              handleCheckboxChange("returnStatement", checked as boolean)
            }
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="returnStatement">
              Must have a return statement with outputs separated by comma or a single output
            </Label>
            <p className="text-sm text-muted-foreground">
              Ensure your outputs are clearly defined and separated
            </p>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="nestedFunctions"
            checked={checkedItems.nestedFunctions}
            onCheckedChange={(checked) => 
              handleCheckboxChange("nestedFunctions", checked as boolean)
            }
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="nestedFunctions">
              Must not have nested functions inside the solve function
            </Label>
            <p className="text-sm text-muted-foreground">
              Other functions should always be defined outside the solve function
            </p>
          </div>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="example">
          <AccordionTrigger>View Example Solver</AccordionTrigger>
          <AccordionContent>
            <pre className="p-4 bg-gray-100 rounded-lg overflow-x-auto">
              <code>{exampleCode}</code>
            </pre>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};