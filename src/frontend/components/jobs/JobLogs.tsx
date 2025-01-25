import { ScrollArea } from "@/components/ui/scroll-area";

interface JobLogsProps {
  logs: string[];
}

export const JobLogs = ({ logs }: JobLogsProps) => {
  if (!logs || logs.length === 0) return null;

  return (
    <div className="space-y-2 mt-4">
      <h3 className="font-semibold">Solver Output:</h3>
      <ScrollArea className="h-[200px] w-full rounded-md border p-4">
        <div className="space-y-2">
          {logs.map((log, index) => (
            <div key={index} className="font-mono text-sm">
              {log}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};