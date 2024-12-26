import { Input } from "/components/ui/input";
import { Button } from "/components/ui/button";
import { Label } from "/components/ui/label";

interface Parameter {
  name: string;
  type: string;
}

interface AlgorithmParametersFormProps {
  inputs: Parameter[];
  outputs: Parameter[];
  onInputsChange: (inputs: Parameter[]) => void;
  onOutputsChange: (outputs: Parameter[]) => void;
}

export const AlgorithmParametersForm = ({
  inputs,
  outputs,
  onInputsChange,
  onOutputsChange,
}: AlgorithmParametersFormProps) => {
  const addInput = () => {
    onInputsChange([...inputs, { name: '', type: '' }]);
  };

  const addOutput = () => {
    onOutputsChange([...outputs, { name: '', type: '' }]);
  };

  const updateInput = (index: number, field: 'name' | 'type', value: string) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    onInputsChange(newInputs);
  };

  const updateOutput = (index: number, field: 'name' | 'type', value: string) => {
    const newOutputs = [...outputs];
    newOutputs[index][field] = value;
    onOutputsChange(newOutputs);
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-2">Input Parameters</h4>
        {inputs.map((input, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              placeholder="Parameter Name"
              value={input.name}
              onChange={(e) => updateInput(index, 'name', e.target.value)}
            />
            <Input
              placeholder="Parameter Type"
              value={input.type}
              onChange={(e) => updateInput(index, 'type', e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const newInputs = inputs.filter((_, i) => i !== index);
                onInputsChange(newInputs);
              }}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addInput}>
          Add Input Parameter
        </Button>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Output Parameters</h4>
        {outputs.map((output, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              placeholder="Output Name"
              value={output.name}
              onChange={(e) => updateOutput(index, 'name', e.target.value)}
            />
            <Input
              placeholder="Output Type"
              value={output.type}
              onChange={(e) => updateOutput(index, 'type', e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const newOutputs = outputs.filter((_, i) => i !== index);
                onOutputsChange(newOutputs);
              }}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addOutput}>
          Add Output Parameter
        </Button>
      </div>
    </div>
  );
};