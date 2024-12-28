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
}

export const SolverParameterInput = ({
  parameter,
  value,
  onChange,
  disabled = false,
}: SolverParameterInputProps) => {
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
        placeholder={parameter.default_value ? `Default: ${parameter.default_value}` : `Enter ${parameter.name}`}
        disabled={disabled}
      />
    </div>
  );
};