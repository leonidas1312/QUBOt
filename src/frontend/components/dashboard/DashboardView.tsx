import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { toast } from "sonner";
import { useState } from "react";
import { ProfileCard } from "./ProfileCard";
import { ShareDialog } from "./ShareDialog";
import { DashboardTabs } from "./DashboardTabs";

export const DashboardView = () => {
  const navigate = useNavigate();
  const session = useSession();
  const queryClient = useQueryClient();
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{ type: 'solver' | 'dataset'; id: string; name: string; solver_parameters?: any; solver_outputs?: any } | null>(null);
  const [description, setDescription] = useState("");

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

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

  const handleShare = async () => {
    if (!selectedItem || !description) return;

    try {
      let updateData: any = { 
        is_public: true,
        description: description 
      };

      // For solvers, include the updated parameter descriptions
      if (selectedItem.type === 'solver') {
        updateData.solver_parameters = selectedItem.solver_parameters;
        updateData.solver_outputs = selectedItem.solver_outputs;
      }

      const { error } = await supabase
        .from(selectedItem.type === 'solver' ? 'solvers' : 'datasets')
        .update(updateData)
        .eq('id', selectedItem.id)
        .eq('user_id', session?.user?.id);

      if (error) throw error;

      queryClient.invalidateQueries({ 
        queryKey: [selectedItem.type === 'solver' ? 'userSolvers' : 'userDatasets'] 
      });
      
      toast.success(`${selectedItem.type === 'solver' ? 'Solver' : 'Dataset'} shared with the community`);
      setShareDialogOpen(false);
      setSelectedItem(null);
      setDescription("");
    } catch (error) {
      console.error('Error:', error);
      toast.error(`Failed to share ${selectedItem.type}`);
    }
  };

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
    <div className="container mx-auto p-6 space-y-6 bg-white">
      <h1 className="text-3xl font-bold">Welcome back!</h1>
      <p className="text-muted-foreground">
        Here's an overview of your optimization platform
      </p>

      <ProfileCard profile={profile} />
      <DashboardStats />
      
      <div className="grid gap-6">
        <DashboardTabs
          recentJobs={recentJobs || []}
          userSolvers={userSolvers || []}
          userDatasets={userDatasets || []}
          onNavigate={navigate}
          onDelete={handleDelete}
          onShare={(item, type) => {
            const fullItem = type === 'solver' 
              ? userSolvers?.find(s => s.id === item.id)
              : userDatasets?.find(d => d.id === item.id);
              
            setSelectedItem({ 
              type, 
              id: item.id, 
              name: item.name,
              ...(type === 'solver' ? {
                solver_parameters: fullItem?.solver_parameters || { inputs: [] },
                solver_outputs: fullItem?.solver_outputs || []
              } : {})
            });
            setShareDialogOpen(true);
          }}
        />
      </div>

      <ShareDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        selectedItem={selectedItem}
        description={description}
        onDescriptionChange={setDescription}
        onShare={handleShare}
      />
    </div>
  );
};