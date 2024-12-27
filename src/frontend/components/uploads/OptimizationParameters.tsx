import { Input } from "/components/ui/input";
import { Label } from "/components/ui/label";

interface OptimizationParametersProps {
  parameters: {
    num_layers: number;
    max_iters: number;
    nbitstrings: number;
    opt_time: number;
    rl_time: number;
    initial_temperature: number;
  };
  onParameterChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const OptimizationParameters = ({ 
  parameters, 
  onParameterChange 
}: OptimizationParametersProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="num_layers">Number of Layers</Label>
        <Input
          id="num_layers"
          name="num_layers"
          type="number"
          value={parameters.num_layers}
          onChange={onParameterChange}
          min="1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="max_iters">Maximum Iterations</Label>
        <Input
          id="max_iters"
          name="max_iters"
          type="number"
          value={parameters.max_iters}
          onChange={onParameterChange}
          min="1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="nbitstrings">Number of Bitstrings</Label>
        <Input
          id="nbitstrings"
          name="nbitstrings"
          type="number"
          value={parameters.nbitstrings}
          onChange={onParameterChange}
          min="1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="opt_time">Optimization Time (s)</Label>
        <Input
          id="opt_time"
          name="opt_time"
          type="number"
          value={parameters.opt_time}
          onChange={onParameterChange}
          min="0"
          step="0.1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rl_time">RL Time (s)</Label>
        <Input
          id="rl_time"
          name="rl_time"
          type="number"
          value={parameters.rl_time}
          onChange={onParameterChange}
          min="0"
          step="0.1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="initial_temperature">Initial Temperature</Label>
        <Input
          id="initial_temperature"
          name="initial_temperature"
          type="number"
          value={parameters.initial_temperature}
          onChange={onParameterChange}
          min="0"
          step="0.1"
        />
      </div>
    </div>
  );
};