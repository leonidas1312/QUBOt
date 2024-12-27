import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "/components/ui/card";
import { ScrollArea } from "/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

interface ItemGridProps {
  items: any[];
  type: 'solver' | 'dataset';
}

export const ItemGrid = ({ items, type }: ItemGridProps) => {
  return (
    <ScrollArea className="h-[calc(100vh-16rem)] w-full rounded-md border p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {items.map((item) => (
          <Card 
            key={item.id}
            className="overflow-hidden transition-all hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)"
            }}
          >
            <CardHeader>
              <CardTitle className="text-xl font-bold truncate">{item.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Created {formatDistanceToNow(new Date(item.created_at))} ago
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 line-clamp-3">
                {item.description || "No description provided"}
              </p>
              {type === 'solver' && item.solver_parameters?.inputs && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Input Parameters:</h4>
                  <ul className="text-sm space-y-1">
                    {item.solver_parameters.inputs.map((input: any, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="font-medium">{input.name}:</span>
                        <span className="text-gray-600">{input.description || input.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};