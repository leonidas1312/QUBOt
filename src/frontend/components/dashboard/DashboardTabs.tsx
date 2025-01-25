import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import { JobsTable } from "./JobsTable";
import { SolversTable } from "./SolversTable";
import { DatasetsTable } from "./DatasetsTable";

interface DashboardTabsProps {
  recentJobs: any[];
  userSolvers: any[];
  userDatasets: any[];
  onNavigate: (path: string) => void;
  onDelete: (type: 'solver' | 'dataset', id: string) => void;
  onShare: (item: any, type: 'solver' | 'dataset') => void;
}

export const DashboardTabs = ({
  recentJobs,
  userSolvers,
  userDatasets,
  onNavigate,
  onDelete,
  onShare,
}: DashboardTabsProps) => {
  return (
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
        <JobsTable recentJobs={recentJobs} />
      </TabsContent>

      <TabsContent value="solvers" className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">My Solvers</h2>
          <Button onClick={() => onNavigate('/solvers')} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Create Solver
          </Button>
        </div>
        <SolversTable 
          userSolvers={userSolvers} 
          onDelete={(id) => onDelete('solver', id)}
          onShare={(solver) => onShare(solver, 'solver')}
        />
      </TabsContent>

      <TabsContent value="datasets" className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">My Datasets</h2>
          <Button onClick={() => onNavigate('/datasets')} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Upload Dataset
          </Button>
        </div>
        <DatasetsTable 
          userDatasets={userDatasets} 
          onDelete={(id) => onDelete('dataset', id)}
          onShare={(dataset) => onShare(dataset, 'dataset')}
        />
      </TabsContent>
    </Tabs>
  );
};