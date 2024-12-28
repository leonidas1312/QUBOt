import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "/components/ui/card";
import { ScrollArea } from "/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Heart, Link as LinkIcon } from "lucide-react";
import { Button } from "/components/ui/button";
import { useSession } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLikedSolvers } from "@/hooks/useLikedSolvers";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "/components/ui/hover-card";

interface ItemGridProps {
  items: any[];
  type: 'solver' | 'dataset';
}

export const ItemGrid = ({ items, type }: ItemGridProps) => {
  const session = useSession();
  const { likedSolvers, setLikedSolvers } = useLikedSolvers();

  const handleLike = async (solverId: string) => {
    if (!session?.user) {
      toast.error("Please login to like solvers");
      return;
    }

    try {
      if (likedSolvers.includes(solverId)) {
        // Unlike
        const { error } = await supabase
          .from('solver_likes')
          .delete()
          .eq('solver_id', solverId)
          .eq('user_id', session.user.id);

        if (error) throw error;
        setLikedSolvers(prev => prev.filter(id => id !== solverId));
        toast.success("Solver unliked");
      } else {
        // Like
        const { error } = await supabase
          .from('solver_likes')
          .insert({
            solver_id: solverId,
            user_id: session.user.id
          });

        if (error) throw error;
        setLikedSolvers(prev => [...prev, solverId]);
        toast.success("Solver liked");
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error("Failed to update like status");
    }
  };

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
            <CardHeader className="relative">
              <CardTitle className="text-xl font-bold truncate">{item.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                {item.email ? (
                  <HoverCard>
                    <HoverCardTrigger className="cursor-pointer">
                      Created by {item.email.split('@')[0]}
                    </HoverCardTrigger>
                    <HoverCardContent className="w-auto">
                      <p>{item.email}</p>
                    </HoverCardContent>
                  </HoverCard>
                ) : (
                  "Created by Unknown"
                )}
                {" "}{formatDistanceToNow(new Date(item.created_at))} ago
              </CardDescription>
              {type === 'solver' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4"
                  onClick={() => handleLike(item.id)}
                >
                  <Heart 
                    className={likedSolvers.includes(item.id) ? "fill-red-500 text-red-500" : ""}
                  />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 line-clamp-3 mb-4">
                {item.description || "No description provided"}
              </p>
              
              {item.paper_link && (
                <div className="flex items-center gap-2 mb-4">
                  <LinkIcon className="h-4 w-4" />
                  <a 
                    href={item.paper_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 underline truncate"
                  >
                    Related Paper
                  </a>
                </div>
              )}

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