import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface JobsTableProps {
  recentJobs: any[];
}

export const JobsTable = ({ recentJobs }: JobsTableProps) => {
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

  return (
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
  );
};