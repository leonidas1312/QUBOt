import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Job } from "./types";

interface JobHeaderProps {
  job: Job;
  onDownload: (job: Job) => void;
}

export const JobHeader = ({ job, onDownload }: JobHeaderProps) => {
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

  return (
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>Job {job.id.slice(0, 8)}</span>
        <div className="flex items-center gap-2">
          {job.status === 'COMPLETED' && job.results && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(job)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Results
            </Button>
          )}
          <span className={`px-2 py-1 rounded text-white text-sm ${getStatusColor(job.status)}`}>
            {job.status}
          </span>
        </div>
      </CardTitle>
      <CardDescription>
        Started at: {new Date(job.created_at).toLocaleString()}
      </CardDescription>
    </CardHeader>
  );
};