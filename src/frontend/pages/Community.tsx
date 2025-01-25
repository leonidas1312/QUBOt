import React, { useState } from 'react';
import { Search, Star, Award, Download, Heart } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { useSession } from '@supabase/auth-helpers-react';
import { toast } from "sonner";
import { useLikedSolvers } from "@/hooks/useLikedSolvers";

const Community = () => {
  const session = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const { likedSolvers, setLikedSolvers } = useLikedSolvers();

  const { data: solvers = [], isLoading: solversLoading } = useQuery({
    queryKey: ['solvers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solvers')
        .select(`
          *,
          solver_likes: solver_likes(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(solver => ({
        ...solver,
        likes: solver.solver_likes[0]?.count || 0
      }));
    }
  });

  const { data: datasets = [], isLoading: datasetsLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select(`
          *,
          optimization_jobs(count)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(dataset => ({
        ...dataset,
        usage_count: dataset.optimization_jobs[0]?.count || 0
      }));
    }
  });

  const handleDownload = async (type: 'solver' | 'dataset', item: any) => {
    try {
      const bucket = type === 'solver' ? 'solvers' : 'datasets';
      const { data, error } = await supabase
        .storage
        .from(bucket)
        .download(item.file_path);

      if (error) throw error;

      // Create a download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name + (type === 'solver' ? '.py' : '.npy');
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`${type === 'solver' ? 'Solver' : 'Dataset'} downloaded successfully`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download ${type}. Please try again.`);
    }
  };

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

  const filteredSolvers = solvers.filter(solver =>
    solver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    solver.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDatasets = datasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dataset.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topSolvers = [...filteredSolvers].sort((a, b) => b.likes - a.likes);
  const topDatasets = [...filteredDatasets].sort((a, b) => b.usage_count - a.usage_count);

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="container mx-auto py-8 px-4 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search solvers and datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="solvers" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="solvers">Solvers</TabsTrigger>
            <TabsTrigger value="datasets">Datasets</TabsTrigger>
          </TabsList>

          <TabsContent value="solvers" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topSolvers.map((solver) => (
                <Card key={solver.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {solver.name}
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-4 w-4 mr-1" />
                        <span>{solver.likes}</span>
                      </div>
                    </CardTitle>
                    <CardDescription>{solver.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {solver.description || 'No description available'}
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLike(solver.id)}
                    >
                      <Heart 
                        className={likedSolvers.includes(solver.id) ? "fill-red-500 text-red-500" : ""}
                      />
                      {likedSolvers.includes(solver.id) ? 'Unlike' : 'Like'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload('solver', solver)}
                    >
                      <Download className="mr-2" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="datasets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topDatasets.map((dataset) => (
                <Card key={dataset.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {dataset.name}
                      <div className="flex items-center text-purple-500">
                        <Award className="h-4 w-4 mr-1" />
                        <span>{dataset.usage_count}</span>
                      </div>
                    </CardTitle>
                    <CardDescription>{dataset.email}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {dataset.description || 'No description available'}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      onClick={() => handleDownload('dataset', dataset)}
                    >
                      <Download className="mr-2" />
                      Download
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;