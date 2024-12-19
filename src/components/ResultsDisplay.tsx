import { Card } from "@/components/ui/card";

// This would come from your backend
type Result = {
  id: string;
  email: string;
  comment: string;
  description: string;
  timestamp: string;
};

const mockResults: Result[] = [
  {
    id: "1",
    email: "researcher@university.edu",
    comment: "Achieved optimal solution with 98% accuracy",
    description: "TSP problem with 100 cities",
    timestamp: "2024-03-10",
  },
  {
    id: "2",
    email: "student@college.edu",
    comment: "Interesting convergence patterns observed",
    description: "Max-Cut on random graph",
    timestamp: "2024-03-09",
  },
];

export const ResultsDisplay = () => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <h3 className="text-2xl font-semibold">Community Results</h3>
      <div className="space-y-4">
        {mockResults.map((result) => (
          <Card key={result.id} className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <p className="font-mono text-sm text-muted-foreground">
                  {result.email}
                </p>
                <span className="text-xs text-muted-foreground">
                  {result.timestamp}
                </span>
              </div>
              <p className="font-medium">{result.description}</p>
              <p className="text-sm">{result.comment}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};