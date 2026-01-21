import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";

interface ComingSoonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  onScholarshipClick?: () => void;
}

const ComingSoonDialog = ({
  open,
  onOpenChange,
  title,
  onScholarshipClick,
}: ComingSoonDialogProps) => {
  const handleScholarshipClick = () => {
    onOpenChange(false);
    onScholarshipClick?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-base">
            This feature is coming soon. {onScholarshipClick && "In the meantime, you can register for our free Web3 Scholarship Program to get started."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 mt-4">
          {onScholarshipClick && (
            <Button variant="default" onClick={handleScholarshipClick}>
              View Scholarships
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComingSoonDialog;
