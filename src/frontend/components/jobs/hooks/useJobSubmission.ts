import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UseJobSubmissionProps {
  selectedDataset: string;
  selectedSolver: string;
  onJobCreated?: () => void;
}

export const useJobSubmission = ({ selectedDataset, selectedSolver, onJobCreated }: UseJobSubmissionProps) => {
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedDataset || !selectedSolver) {
      toast.error("Please select both a dataset and a solver");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the job
      const { data: job, error: jobError } = await supabase
        .from("optimization_jobs")
        .insert({
          solver_id: selectedSolver,
          dataset_id: selectedDataset,
          parameters,
          status: 'PENDING'
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Call the Edge Function to start the optimization
      const { data, error } = await supabase.functions.invoke('run-optimization', {
        body: { jobId: job.id }
      });

      if (error) throw error;

      toast.success("Job created successfully");
      onJobCreated?.();

      // Reset form
      setParameters({});
    } catch (error) {
      console.error("Error creating job:", error);
      toast.error("Error creating job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return { parameters, setParameters, handleSubmit, isSubmitting };
};