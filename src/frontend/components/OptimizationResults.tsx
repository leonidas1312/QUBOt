import { Card } from "/components/ui/card";
import { Button } from "/components/ui/button";
import { Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface OptimizationResultsProps {
  results: {
    final: boolean;
    description?: string;
    result?: {
      best_bitstring: number[];
      best_cost: number;
      cost_values: number[];
      time_per_iteration: number[];
      progress_rl_costs: number[];
      progress_opt_costs: number[];
    };
    error?: string;
  };
}

export const OptimizationResults = ({ results }: OptimizationResultsProps) => {
  if (results.error) {
    return (
      <Card className="p-6 w-full max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-2">Error</h3>
        <p className="text-red-500">{results.error}</p>
      </Card>
    );
  }

  if (!results.result) {
    return null;
  }

  const { progress_rl_costs, progress_opt_costs, best_cost, best_bitstring, cost_values, time_per_iteration } = results.result;

  const handleDownload = () => {
    // Format the results as text
    const resultsText = `
Optimization Results
===================

Best Cost: ${best_cost.toFixed(2)}

Best Solution (Bitstring):
${best_bitstring.join('')}

Cost Values:
${cost_values.map((cost, index) => `Iteration ${index + 1}: ${cost}`).join('\n')}

Time per Iteration:
${time_per_iteration.map((time, index) => `Iteration ${index + 1}: ${time}ms`).join('\n')}
    `.trim();

    // Create blob and download
    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimization_results.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Optimization Results</h3>
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Results
          </Button>
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