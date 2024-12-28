import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Parameter {
  name: string;
  type: string;
  description: string;
}

interface SolverParameterFormProps {
  parameters: Parameter[];
  onParametersChange: (params: Parameter[]) => void;
  title: string;
  description: string;
}

export const SolverParameterForm = ({
  parameters,
  onParametersChange,
  title,
  description,
}: SolverParameterFormProps) => {
  const addParameter = () => {
    onParametersChange([...parameters, { name: '', type: '', description: '' }]);
  };

  const updateParameter = (index: number, field: keyof Parameter, value: string) => {
    const newParams = [...parameters];
    newParams[index][field] = value;
    onParametersChange(newParams);
  };

  const removeParameter = (index: number) => {
    const newParams = parameters.filter((_, i) => i !== index);
    onParametersChange(newParams);
  };

  return (
    <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
      
      {parameters.map((param, index) => (
        <div key={index} className="space-y-2 p-4 bg-white rounded-md shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Parameter Name</Label>
              <Input
                placeholder="e.g., num_layers"
                value={param.name}
                onChange={(e) => updateParameter(index, 'name', e.target.value)}
              />
            </div>
            <div>
              <Label>Parameter Type</Label>
              <Input
                placeholder="e.g., number"
                value={param.type}
                onChange={(e) => updateParameter(index, 'type', e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              placeholder="Describe what this parameter does..."
              value={param.description}
              onChange={(e) => updateParameter(index, 'description', e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={() => removeParameter(index)}
          >
            Remove
          </Button>
        </div>
      ))}
      
      <Button type="button" variant="outline" onClick={addParameter}>
        Add Parameter
      </Button>
    </div>
  );
};