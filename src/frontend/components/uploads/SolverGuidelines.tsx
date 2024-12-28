import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SolverExample } from "./SolverExample";

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
          </div>
        </div>
      </div>

      <SolverExample />
    </Card>
  );
};