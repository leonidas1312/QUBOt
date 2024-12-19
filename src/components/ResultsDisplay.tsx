import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResults } from "@/contexts/ResultsContext";

export const ResultsDisplay = () => {
  const { results } = useResults();

  const recentResults = [...results].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const popularResults = [...results].sort((a, b) => 
    b.comment.length - a.comment.length
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <h3 className="text-2xl font-semibold">Community Results</h3>
      
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">Recent Submissions</TabsTrigger>
          <TabsTrigger value="popular">Popular Submissions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent" className="space-y-4 mt-4">
          {recentResults.map((result) => (
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
        </TabsContent>
        
        <TabsContent value="popular" className="space-y-4 mt-4">
          {popularResults.map((result) => (
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
        </TabsContent>
      </Tabs>
    </div>
  );
};