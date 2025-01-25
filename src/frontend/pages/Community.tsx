import React, { useState } from 'react';
import { Search, Star, Award } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

const Community = () => {
  const [searchQuery, setSearchQuery] = useState('');

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