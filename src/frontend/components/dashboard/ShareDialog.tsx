import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Share2 } from "lucide-react";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItem: { type: 'solver' | 'dataset'; id: string; name: string } | null;
  description: string;
  onDescriptionChange: (description: string) => void;
  onShare: () => void;
}

export const ShareDialog = ({
  open,
  onOpenChange,
  selectedItem,
  description,
  onDescriptionChange,
  onShare,
}: ShareDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share with Community</DialogTitle>
          <DialogDescription>
            Share your {selectedItem?.type} "{selectedItem?.name}" with the community. 
            Please provide a detailed description of the {selectedItem?.type === 'solver' ? 'input/output parameters' : 'dataset structure'}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            placeholder={`Describe your ${selectedItem?.type}...`}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="min-h-[200px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => {
            onOpenChange(false);
          }}>
            Cancel
          </Button>
          <Button onClick={onShare} disabled={!description}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};