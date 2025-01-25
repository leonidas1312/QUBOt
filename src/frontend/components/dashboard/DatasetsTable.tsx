import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { Database, Trash2, Share2 } from "lucide-react";
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

interface DatasetsTableProps {
  userDatasets: any[];
  onDelete: (id: string) => void;
  onShare: (dataset: any) => void;
}

export const DatasetsTable = ({ userDatasets, onDelete, onShare }: DatasetsTableProps) => {
  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
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
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onShare(dataset)}
                    disabled={dataset.is_public}
                    title={dataset.is_public ? "Already shared" : "Share with community"}
                  >
                    <Share2 className={`h-4 w-4 ${dataset.is_public ? 'text-gray-400' : 'text-blue-500 hover:text-blue-700'}`} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Dataset</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this dataset? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(dataset.id)}
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