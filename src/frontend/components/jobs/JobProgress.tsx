import { Progress } from "@/components/ui/progress";
import { Job } from "./types";

interface JobProgressProps {
  status: Job['status'];
}

export const JobProgress = ({ status }: JobProgressProps) => {
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

  return status === 'RUNNING' ? (
    <Progress value={getProgressValue(status)} className="mb-4" />
  ) : null;
};