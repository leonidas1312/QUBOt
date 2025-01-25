import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Video, LogIn, ExternalLink } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Database, CheckCircle2, Clock, XCircle } from "lucide-react";

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (session) {
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

            <TabsContent value="jobs">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Recent Jobs</h2>
              </div>
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Solver</TableHead>
                      <TableHead>Dataset</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentJobs?.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className={
                            job.status === 'COMPLETED' ? 'text-green-500' :
                            job.status === 'FAILED' ? 'text-red-500' :
                            'text-yellow-500'
                          }>
                            {job.status}
                          </span>
                        </TableCell>
                        <TableCell>{job.solver?.name || 'Unknown Solver'}</TableCell>
                        <TableCell>{job.dataset?.name || 'Unknown Dataset'}</TableCell>
                        <TableCell>{formatDistanceToNow(new Date(job.created_at))} ago</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="solvers">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">My Solvers</h2>
                <Button onClick={() => navigate('/solvers')} variant="outline">
                  View All
                </Button>
              </div>
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Paper</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userSolvers?.map((solver) => (
                      <TableRow key={solver.id}>
                        <TableCell className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-muted-foreground" />
                          {solver.name}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {solver.description || 'No description'}
                        </TableCell>
                        <TableCell>{formatDistanceToNow(new Date(solver.created_at))} ago</TableCell>
                        <TableCell>
                          {solver.paper_link ? (
                            <a
                              href={solver.paper_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                            >
                              <ExternalLink className="h-4 w-4" />
                              View
                            </a>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="datasets">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">My Datasets</h2>
                <Button onClick={() => navigate('/datasets')} variant="outline">
                  View All
                </Button>
              </div>
              <ScrollArea className="h-[400px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userDatasets?.map((dataset) => (
                      <TableRow key={dataset.id}>
                        <TableCell className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-muted-foreground" />
                          {dataset.name}
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {dataset.description || 'No description'}
                        </TableCell>
                        <TableCell>{dataset.format || 'Unknown'}</TableCell>
                        <TableCell>{formatDistanceToNow(new Date(dataset.created_at))} ago</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
          </Tabs>
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