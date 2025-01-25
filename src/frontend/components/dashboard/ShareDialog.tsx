import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Share2, Info } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Parameter {
  name: string;
  type: string;
  description: string;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: { type: 'solver' | 'dataset'; id: string; name: string; solver_parameters?: any; solver_outputs?: any } | null;
  description: string;
  onDescriptionChange: (description: string) => void;
  onShare: () => void;
}

export const ShareDialog = ({
  open,
  onOpenChange,
  selectedItem,
  description,
  onDescriptionChange,
  onShare,
}: ShareDialogProps) => {
  // Check if all parameters have descriptions (for solvers only)
  const hasValidParameters = () => {
    if (selectedItem?.type !== 'solver') return true;
    
    const inputs = selectedItem.solver_parameters?.inputs || [];
    const outputs = selectedItem.solver_outputs || [];
    
    const allInputsHaveDescription = inputs.every((param: Parameter) => 
      param.description && param.description.trim().length > 0
    );
    
    const allOutputsHaveDescription = outputs.every((param: Parameter) => 
      param.description && param.description.trim().length > 0
    );
    
    return allInputsHaveDescription && allOutputsHaveDescription;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share with Community</DialogTitle>
          <DialogDescription>
            {selectedItem?.type === 'solver' ? (
              "Share your solver with the community. Please provide descriptions for all input and output parameters."
            ) : (
              "Share your dataset with the community. This will make it available for other users to download and use."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {selectedItem?.type === 'solver' && (
            <>
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Input Parameters
                </h4>
                {selectedItem.solver_parameters?.inputs?.map((param: Parameter, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{param.name}</Label>
                      <span className="text-sm text-muted-foreground">({param.type})</span>
                    </div>
                    <Textarea
                      placeholder={`Describe what ${param.name} is used for...`}
                      value={param.description || ''}
                      onChange={(e) => {
                        const newInputs = [...selectedItem.solver_parameters.inputs];
                        newInputs[index].description = e.target.value;
                        selectedItem.solver_parameters.inputs = newInputs;
                      }}
                      className="min-h-[80px]"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Output Parameters
                </h4>
                {selectedItem.solver_outputs?.map((param: Parameter, index: number) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">{param.name}</Label>
                      <span className="text-sm text-muted-foreground">({param.type})</span>
                    </div>
                    <Textarea
                      placeholder={`Describe what ${param.name} represents...`}
                      value={param.description || ''}
                      onChange={(e) => {
                        const newOutputs = [...selectedItem.solver_outputs];
                        newOutputs[index].description = e.target.value;
                        selectedItem.solver_outputs = newOutputs;
                      }}
                      className="min-h-[80px]"
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>General Description</Label>
            <Textarea
              placeholder={`Describe your ${selectedItem?.type}...`}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onShare} 
            disabled={!description || !hasValidParameters()}
            className="gap-2"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};