import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { campaignTypes, campaignStatuses, CampaignType, CampaignStatus } from "@/data/campaignsData";

interface CampaignFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedType: CampaignType | "all";
  onTypeChange: (type: CampaignType | "all") => void;
  selectedStatus: CampaignStatus | "all";
  onStatusChange: (status: CampaignStatus | "all") => void;
}

const CampaignFilterSheet = ({
  open,
  onOpenChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
}: CampaignFilterSheetProps) => {
  const handleClearFilters = () => {
    onTypeChange("all");
    onStatusChange("all");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] bg-background">
        <SheetHeader>
          <SheetTitle>Filter Campaigns</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Campaign Type */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Campaign Type</Label>
            <RadioGroup
              value={selectedType}
              onValueChange={(value) => onTypeChange(value as CampaignType | "all")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="type-all" />
                <Label htmlFor="type-all" className="font-normal cursor-pointer">
                  All Types
                </Label>
              </div>
              {campaignTypes.map((type) => (
                <div key={type.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={type.value} id={`type-${type.value}`} />
                  <Label htmlFor={`type-${type.value}`} className="font-normal cursor-pointer">
                    {type.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <RadioGroup
              value={selectedStatus}
              onValueChange={(value) => onStatusChange(value as CampaignStatus | "all")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="status-all" />
                <Label htmlFor="status-all" className="font-normal cursor-pointer">
                  All Status
                </Label>
              </div>
              {campaignStatuses.map((status) => (
                <div key={status.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={status.value} id={`status-${status.value}`} />
                  <Label htmlFor={`status-${status.value}`} className="font-normal cursor-pointer">
                    {status.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Clear Filters */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleClearFilters}
          >
            Clear Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CampaignFilterSheet;
