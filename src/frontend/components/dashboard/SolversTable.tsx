import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Brain, ExternalLink, Trash2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SolversTableProps {
  userSolvers: any[];
  onDelete: (id: string) => void;
  onShare: (solver: any) => void;
}

export const SolversTable = ({ userSolvers, onDelete, onShare }: SolversTableProps) => {
  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Paper</TableHead>
            <TableHead>Actions</TableHead>
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
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onShare(solver)}
                    disabled={solver.is_public}
                    title={solver.is_public ? "Already shared" : "Share with community"}
                  >
                    <Share2 className={`h-4 w-4 ${solver.is_public ? 'text-gray-400' : 'text-blue-500 hover:text-blue-700'}`} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Solver</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this solver? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(solver.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};