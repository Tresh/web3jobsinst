import { useState } from "react";
import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import BugReportModal from "./BugReportModal";

const BugReportButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 shadow-lg bg-background/95 backdrop-blur-sm border-border hover:bg-secondary gap-2"
      >
        <Bug className="h-4 w-4" />
        <span className="hidden sm:inline">Report an Issue</span>
      </Button>
      
      <BugReportModal open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};

export default BugReportButton;
