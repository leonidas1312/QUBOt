import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Job {
  id: string;
  solver_id: string;
  dataset_id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  parameters: Record<string, any>;
  results: any;
  logs: string[];
  error_message?: string;
}

interface JobManagerProps {
  currentJobId?: string;
}

export const JobManager = ({ currentJobId }: JobManagerProps) => {
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    if (session?.user && currentJobId) {
      fetchJob();
      const channel = subscribeToJobUpdates();
      return () => {
        channel.unsubscribe();
      };
    }
  }, [session, currentJobId]);

  const fetchJob = async () => {
    if (!currentJobId) return;
    
    try {
      const { data, error } = await supabase
        .from('optimization_jobs')
        .select('*')
        .eq('id', currentJobId)
        .single();

      if (error) throw error;
      setCurrentJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to fetch job');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToJobUpdates = () => {
    const channel = supabase
      .channel('job-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'optimization_jobs',
          filter: `id=eq.${currentJobId}`,
        },
        (payload) => {
          console.log('Job update received:', payload);
          if (payload.eventType === 'UPDATE') {
            setCurrentJob(payload.new as Job);
          }
        }
      )
      .subscribe();

    return channel;
  };

  const handleDownloadResults = (job: Job) => {
    if (!job.results) {
      toast.error('No results available for this job');
      return;
    }

    const resultsText = `
Optimization Results for Job ${job.id}
=====================================

Parameters:
${JSON.stringify(job.parameters, null, 2)}

Results:
${JSON.stringify(job.results, null, 2)}

Logs:
${job.logs?.join('\n') || 'No logs available'}
    `.trim();

    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimization_results_${job.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'FAILED':
        return 'bg-red-500';
      case 'RUNNING':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProgressValue = (status: Job['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 100;
      case 'FAILED':
        return 100;
      case 'RUNNING':
        return 50;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return <div>Loading job status...</div>;
  }

  if (!currentJob) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Job {currentJob.id.slice(0, 8)}</span>
            <div className="flex items-center gap-2">
              {currentJob.status === 'COMPLETED' && currentJob.results && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadResults(currentJob)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Results
                </Button>
              )}
              <span className={`px-2 py-1 rounded text-white text-sm ${getStatusColor(currentJob.status)}`}>
                {currentJob.status}
              </span>
            </div>
          </CardTitle>
          <CardDescription>
            Started at: {new Date(currentJob.created_at).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentJob.error_message && (
            <div className="text-red-500 mb-4">
              Error: {currentJob.error_message}
            </div>
          )}
          {currentJob.status === 'RUNNING' && (
            <Progress value={getProgressValue(currentJob.status)} className="mb-4" />
          )}
          {currentJob.logs && currentJob.logs.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="font-semibold">Solver Output:</h3>
              <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                <div className="space-y-2">
                  {currentJob.logs.map((log, index) => (
                    <div key={index} className="font-mono text-sm">
                      {log}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
          {currentJob.results && (
            <div className="space-y-2 mt-4">
              <h3 className="font-semibold">Results:</h3>
              <div className="bg-gray-100 p-4 rounded">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {JSON.stringify(currentJob.results, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};