import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OptimizationResultsProps {
  results: {
    result: {
      progress_rl_costs: number[];
      progress_opt_costs: number[];
      best_cost: number;
      best_bitstring: number[];
      cost_values: number[];
      time_per_iteration: number;
    };
  };
}

export const OptimizationResults = ({ results }: OptimizationResultsProps) => {
  const { progress_rl_costs, progress_opt_costs, best_cost, best_bitstring, cost_values } = results.result;

  // Format bitstring for display (chunks of 32 bits)
  const formattedBitstring = best_bitstring
    .join('')
    .match(/.{1,32}/g)
    ?.join('\n') || '';

  // Prepare data for the optimization progress chart
  const optChartData = progress_opt_costs.map((cost, index) => ({
    iteration: index + 1,
    cost: cost,
    type: 'Optimization'
  }));

  // Prepare data for the RL progress chart
  const rlChartData = progress_rl_costs.map((cost, index) => ({
    iteration: index + 1,
    cost: cost,
    type: 'Reinforcement Learning'
  }));

  // Combine both datasets
  const chartData = [...optChartData, ...rlChartData].sort((a, b) => a.iteration - b.iteration);

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Optimization Results</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Best Cost</p>
              <p className="font-medium">{best_cost.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Solution (Bitstring)</p>
              <pre className="font-mono text-xs bg-muted p-2 rounded-md overflow-x-auto whitespace-pre-wrap break-all">
                {formattedBitstring}
              </pre>
            </div>
          </div>
        </div>

        <div className="h-[400px]">
          <h4 className="text-md font-semibold mb-4">Cost Function Evolution</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="iteration" 
                label={{ value: 'Iteration', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Cost', angle: -90, position: 'insideLeft' }}
                domain={['auto', 'auto']}
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cost" 
                stroke="#8884d8" 
                name="Cost Function"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};