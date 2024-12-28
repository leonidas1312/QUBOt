import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SolverExample } from "./SolverExample";
import type { GuidelineValidation } from "./guidelineValidation";

interface SolverGuidelinesProps {
  onGuidelinesAccepted: (accepted: boolean) => void;
  validation?: GuidelineValidation;
}

export const SolverGuidelines = ({ 
  onGuidelinesAccepted, 
  validation 
}: SolverGuidelinesProps) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    entryPoint: false,
    returnStatement: false,
    nestedFunctions: false,
  });

  useEffect(() => {
    if (validation) {
      // Animate the checkboxes one by one
      const animateChecks = async () => {
        if (validation.entryPoint) {
          setCheckedItems(prev => ({ ...prev, entryPoint: true }));
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        if (validation.returnStatement) {
          setCheckedItems(prev => ({ ...prev, returnStatement: true }));
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        if (validation.nestedFunctions) {
          setCheckedItems(prev => ({ ...prev, nestedFunctions: true }));
        }
      };
      animateChecks();
    }
  }, [validation]);

  useEffect(() => {
    const allChecked = Object.values(checkedItems).every(value => value);
    onGuidelinesAccepted(allChecked);
  }, [checkedItems, onGuidelinesAccepted]);

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
            disabled={!!validation}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="entryPoint">
              Must use a solve function as the main entry point
            </Label>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="returnStatement"
            checked={checkedItems.returnStatement}
            disabled={!!validation}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="returnStatement">
              Must have a return statement with outputs
            </Label>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="nestedFunctions"
            checked={checkedItems.nestedFunctions}
            disabled={!!validation}
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