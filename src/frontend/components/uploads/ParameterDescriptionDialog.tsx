import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Parameter } from "./solverUtils";
import { useState } from "react";

interface ParameterDescriptionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  parameters: Parameter[];
  onParametersChange: (params: Parameter[]) => void;
  title: string;
}

export const ParameterDescriptionDialog = ({
  isOpen,
  onClose,
  parameters,
  onParametersChange,
  title,
}: ParameterDescriptionDialogProps) => {
  // Create a local copy of parameters for editing
  const [localParameters, setLocalParameters] = useState<Parameter[]>(parameters);

  // Update local parameters when dialog opens with new parameters
  React.useEffect(() => {
    setLocalParameters(parameters);
  }, [parameters]);

  const handleApply = () => {
    onParametersChange(localParameters);
    onClose();
  };

  const handleCancel = () => {
    setLocalParameters(parameters); // Reset to original parameters
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto py-4">
          {localParameters.map((param, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{param.name}</span>
                {param.type !== "any" && (
                  <span className="text-muted-foreground">({param.type})</span>
                )}
                {param.default_value && (
                  <span className="text-muted-foreground">
                    Default: {param.default_value}
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`param-${index}`}>Description</Label>
                <Textarea
                  id={`param-${index}`}
                  placeholder={`Describe what ${param.name} is used for...`}
                  value={localParameters[index].description}
                  onChange={(e) => {
                    const updatedParams = [...localParameters];
                    updatedParams[index].description = e.target.value;
                    setLocalParameters(updatedParams);
                  }}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};