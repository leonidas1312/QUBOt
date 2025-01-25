import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { JobsTable } from "./JobsTable";
import { SolversTable } from "./SolversTable";
import { DatasetsTable } from "./DatasetsTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";

export const DashboardView = () => {
  const navigate = useNavigate();
  const session = useSession();
  const queryClient = useQueryClient();

  const { data: userSolvers } = useQuery({
    queryKey: ['userSolvers', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solvers')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id,
  });

  const { data: userDatasets } = useQuery({
    queryKey: ['userDatasets', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id,
  });

  const { data: recentJobs } = useQuery({
    queryKey: ['recentJobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('optimization_jobs')
        .select('*, solver:solvers(name), dataset:datasets(name)')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id
  });

  const handleDelete = async (type: 'solver' | 'dataset', id: string) => {
    try {
      const { error } = await supabase
        .from(type === 'solver' ? 'solvers' : 'datasets')
        .delete()
        .eq('id', id)
        .eq('user_id', session?.user?.id);

      if (error) throw error;

      const { error: storageError } = await supabase
        .storage
        .from(type === 'solver' ? 'solvers' : 'datasets')
        .remove([`${id}`]);

      if (storageError) {
        console.error('Error deleting file:', storageError);
      }

      queryClient.invalidateQueries({ queryKey: [type === 'solver' ? 'userSolvers' : 'userDatasets'] });
      toast.success(`${type === 'solver' ? 'Solver' : 'Dataset'} deleted successfully`);
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to delete ${type}`);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Welcome back!</h1>
      <p className="text-muted-foreground">
        Here's an overview of your optimization platform
      </p>
      
      <DashboardStats />
      
      <div className="grid gap-6">
        <Tabs defaultValue="jobs" className="w-full">
          <TabsList>
            <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
            <TabsTrigger value="solvers">My Solvers</TabsTrigger>
            <TabsTrigger value="datasets">My Datasets</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Recent Jobs</h2>
            </div>
            <JobsTable recentJobs={recentJobs || []} />
          </TabsContent>

          <TabsContent value="solvers" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">My Solvers</h2>
              <Button onClick={() => navigate('/solvers')} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Create Solver
              </Button>
            </div>
            <SolversTable 
              userSolvers={userSolvers || []} 
              onDelete={(id) => handleDelete('solver', id)} 
            />
          </TabsContent>

          <TabsContent value="datasets" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">My Datasets</h2>
              <Button onClick={() => navigate('/datasets')} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload Dataset
              </Button>
            </div>
            <DatasetsTable 
              userDatasets={userDatasets || []} 
              onDelete={(id) => handleDelete('dataset', id)} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};