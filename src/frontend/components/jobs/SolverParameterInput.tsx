import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { InfoIcon } from "lucide-react";

interface SolverParameter {
  name: string;
  type: string;
  description?: string;
  default_value?: string;
}

interface SolverParameterInputProps {
  parameter: SolverParameter;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  datasetName?: string;  // New prop for dataset name
}

export const SolverParameterInput = ({
  parameter,
  value,
  onChange,
  disabled = false,
  datasetName,  // Add the new prop
}: SolverParameterInputProps) => {
  // Create placeholder text based on whether it's a qubo_matrix parameter and if there's a dataset
  const getPlaceholder = () => {
    if (parameter.name === "qubo_matrix" && datasetName) {
      return `Linked to dataset: ${datasetName}`;
    }
    return parameter.default_value ? `Default: ${parameter.default_value}` : `Enter ${parameter.name}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="font-medium">{parameter.name}</Label>
        {parameter.description && (
          <HoverCard>
            <HoverCardTrigger asChild>
              <InfoIcon className="h-4 w-4 text-muted-foreground cursor-help" />
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm">{parameter.description}</p>
              {parameter.default_value && (
                <p className="text-sm text-muted-foreground mt-2">
                  Default: {parameter.default_value}
                </p>
              )}
            </HoverCardContent>
          </HoverCard>
        )}
      </div>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={getPlaceholder()}
        disabled={disabled}
      />
    </div>
  );
};