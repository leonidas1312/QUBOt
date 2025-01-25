import { CreateJob } from "@/components/jobs/CreateJob";
import { JobManager } from "@/components/jobs/JobManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

const Playground = () => {
  const session = useSession();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: userSolvers = [] } = useQuery({
    queryKey: ['userSolvers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solvers')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: userDatasets = [] } = useQuery({
    queryKey: ['userDatasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: communitySolvers = [] } = useQuery({
    queryKey: ['communitySolvers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solvers')
        .select('*')
        .neq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const { data: communityDatasets = [] } = useQuery({
    queryKey: ['communityDatasets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .neq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id
  });

  const filteredUserSolvers = userSolvers.filter(solver =>
    solver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    solver.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUserDatasets = userDatasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dataset.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommunitySolvers = communitySolvers.filter(solver =>
    solver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    solver.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommunityDatasets = communityDatasets.filter(dataset =>
    dataset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dataset.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search solvers and datasets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="my-items" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-items">My Items</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>

          <TabsContent value="my-items" className="space-y-6">
            <CreateJob 
              availableSolvers={filteredUserSolvers}
              availableDatasets={filteredUserDatasets}
            />
            <JobManager />
          </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <CreateJob 
              availableSolvers={filteredCommunitySolvers}
              availableDatasets={filteredCommunityDatasets}
            />
            <JobManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Playground;