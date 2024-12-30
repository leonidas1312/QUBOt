import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface JobParametersProps {
  parameters: Record<string, string>;
  solverParameters: Record<string, any>;
  onParameterChange: (params: Record<string, string>) => void;
  datasetName?: string;  // Add dataset name prop
}

export const JobParameters = ({
  parameters,
  solverParameters,
  onParameterChange,
  datasetName,  // Add dataset name to props
}: JobParametersProps) => {
  const handleParameterChange = (paramName: string, value: string) => {
    onParameterChange({
      ...parameters,
      [paramName]: value,
    });
  };

  return (
    <div className="space-y-4">
      {Object.values(solverParameters).map((param: any) => (
        <div key={param.name} className="space-y-2">
          <Label className="font-medium">{param.name}</Label>
          {param.name === "qubo_matrix" ? (
            <Input
              type="text"
              value={`Using QUBO matrix from dataset: ${datasetName || 'No dataset selected'}`}
              disabled
              className="bg-muted"
            />
          ) : (
            <Input
              type="text"
              value={parameters[param.name] || ""}
              onChange={(e) => handleParameterChange(param.name, e.target.value)}
              placeholder={param.default_value ? `Default: ${param.default_value}` : `Enter ${param.name}`}
            />
          )}
        </div>
      ))}
    </div>
  );
};