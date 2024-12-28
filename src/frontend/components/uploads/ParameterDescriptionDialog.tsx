import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Parameter } from "./solverUtils";

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 max-h-[60vh] overflow-y-auto py-4">
          {parameters.map((param, index) => (
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
                  value={param.description}
                  onChange={(e) => {
                    const updatedParams = [...parameters];
                    updatedParams[index].description = e.target.value;
                    onParametersChange(updatedParams);
                  }}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};