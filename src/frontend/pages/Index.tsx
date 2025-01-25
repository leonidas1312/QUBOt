import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Video, LogIn } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { RecentJobs } from "@/components/dashboard/RecentJobs";
import { ItemGrid } from "@/components/uploads/ItemGrid";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const navigate = useNavigate();
  const session = useSession();

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

  if (session) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">
          Here's an overview of your optimization platform
        </p>
        
        <DashboardStats />
        
        <div className="grid gap-4">
          <div className="grid gap-4">
            <Tabs defaultValue="solvers" className="w-full">
              <TabsList>
                <TabsTrigger value="solvers">My Recent Solvers</TabsTrigger>
                <TabsTrigger value="datasets">My Recent Datasets</TabsTrigger>
              </TabsList>
              <TabsContent value="solvers">
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Recent Solvers</h2>
                    <Button onClick={() => navigate('/solvers')} variant="outline">
                      View All
                    </Button>
                  </div>
                  <ItemGrid items={userSolvers || []} type="solver" />
                </div>
              </TabsContent>
              <TabsContent value="datasets">
                <div className="grid gap-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Recent Datasets</h2>
                    <Button onClick={() => navigate('/datasets')} variant="outline">
                      View All
                    </Button>
                  </div>
                  <ItemGrid items={userDatasets || []} type="dataset" />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <RecentJobs />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-center px-4 py-12 bg-gradient-to-br from-purple-700 via-orange-500 to-green-500">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-6xl font-bold text-white tracking-tight">
          Simplifying Optimization
        </h1>
        
        <p className="text-xl text-white/90 max-w-2xl mx-auto">
          Built to make you extraordinarily productive,
          <br />
          QUBOt is the best way to optimize with AI.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Button
            onClick={() => window.open('https://www.youtube.com/watch?v=your-demo-video', '_blank')}
            variant="outline"
            size="lg"
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
          >
            <Video className="mr-2 h-4 w-4" />
            Watch Demo
          </Button>

          <Button
            onClick={() => navigate('/login')}
            size="lg"
            className="bg-black text-white hover:bg-black/80"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;