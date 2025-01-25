import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { JobHeader } from './JobHeader';
import { JobProgress } from './JobProgress';
import { JobLogs } from './JobLogs';
import { JobResults } from './JobResults';
import type { Job } from './types';

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

  if (isLoading) {
    return <div>Loading job status...</div>;
  }

  if (!currentJob) {
    return null;
  }

  return (
    <div className="space-y-4">
      <Card>
        <JobHeader job={currentJob} onDownload={handleDownloadResults} />
        <CardContent>
          {currentJob.error_message && (
            <div className="text-red-500 mb-4">
              Error: {currentJob.error_message}
            </div>
          )}
          <JobProgress status={currentJob.status} />
          <JobLogs logs={currentJob.logs} />
          <JobResults results={currentJob.results} />
        </CardContent>
      </Card>
    </div>
  );
};