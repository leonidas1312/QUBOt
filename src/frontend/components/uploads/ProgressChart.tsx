import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgressChartProps {
  progress: Array<{
    iteration: number;
    cost: number;
  }>;
}

export const ProgressChart = ({ progress }: ProgressChartProps) => {
  if (progress.length === 0) return null;

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={progress}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="iteration" 
            label={{ value: 'Iterations', position: 'insideBottom', offset: -5 }} 
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
            name="Cost" 
            dot={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};