import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
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
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        if (validation.returnStatement) {
          setCheckedItems(prev => ({ ...prev, returnStatement: true }));
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        if (validation.nestedFunctions) {
          setCheckedItems(prev => ({ ...prev, nestedFunctions: true }));
        }
      };
      animateChecks();
    } else {
      setCheckedItems({
        entryPoint: false,
        returnStatement: false,
        nestedFunctions: false,
      });
    }
  }, [validation]);

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Guidelines</h4>
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
            checkedItems.entryPoint ? 'bg-primary border-primary' : 'border-input'
          }`}>
            {checkedItems.entryPoint && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <Label className="text-sm">Main entry point</Label>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
            checkedItems.returnStatement ? 'bg-primary border-primary' : 'border-input'
          }`}>
            {checkedItems.returnStatement && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <Label className="text-sm">Return statement</Label>
        </div>

        <div className="flex items-center space-x-2">
          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
            checkedItems.nestedFunctions ? 'bg-primary border-primary' : 'border-input'
          }`}>
            {checkedItems.nestedFunctions && <Check className="h-3 w-3 text-primary-foreground" />}
          </div>
          <Label className="text-sm">No nested functions</Label>
        </div>
      </div>
    </div>
  );
};