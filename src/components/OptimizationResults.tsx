import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OptimizationResultsProps {
  results: {
    result: {
      progress_rl_costs: number[];
      progress_opt_costs: number[];
      best_cost: number;
      best_bitstring: number[];
    };
  };
}

export const OptimizationResults = ({ results }: OptimizationResultsProps) => {
  const { progress_rl_costs, progress_opt_costs, best_cost, best_bitstring } = results.result;

  // Prepare data for the chart
  const chartData = progress_rl_costs.map((cost, index) => ({
    iteration: index + 1,
    cost: cost
  }));

  return (
    <Card className="p-6 w-full max-w-2xl mx-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Optimization Results</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Best Cost</p>
              <p className="font-medium">{best_cost}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Solution</p>
              <p className="font-mono text-sm break-all">{best_bitstring.join('')}</p>
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