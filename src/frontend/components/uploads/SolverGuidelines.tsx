import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { SolverExample } from "./SolverExample";
import type { GuidelineValidation } from "./guidelineValidation";

interface SolverGuidelinesProps {
  validation?: GuidelineValidation;
}

export const SolverGuidelines = ({ validation }: SolverGuidelinesProps) => {
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
    } else {
      // Reset when validation is null (new file upload)
      setCheckedItems({
        entryPoint: false,
        returnStatement: false,
        nestedFunctions: false,
      });
    }
  }, [validation]);

  return (
    <div className="space-y-6">
      <h4 className="text-sm font-semibold">Solver Guidelines</h4>
      <p className="text-sm text-muted-foreground">
        Your solver must meet these requirements:
      </p>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${
            checkedItems.entryPoint ? 'bg-primary border-primary' : 'border-input'
          }`}>
            {checkedItems.entryPoint && <Check className="h-4 w-4 text-primary-foreground" />}
          </div>
          <div className="grid gap-1.5 leading-none">
            <Label>Must use a solve function as the main entry point</Label>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${
            checkedItems.returnStatement ? 'bg-primary border-primary' : 'border-input'
          }`}>
            {checkedItems.returnStatement && <Check className="h-4 w-4 text-primary-foreground" />}
          </div>
          <div className="grid gap-1.5 leading-none">
            <Label>Must have a return statement with outputs</Label>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-colors ${
            checkedItems.nestedFunctions ? 'bg-primary border-primary' : 'border-input'
          }`}>
            {checkedItems.nestedFunctions && <Check className="h-4 w-4 text-primary-foreground" />}
          </div>
          <div className="grid gap-1.5 leading-none">
            <Label>Must not have nested functions inside the solve function</Label>
          </div>
        </div>
      </div>

      <SolverExample />
    </div>
  );
};