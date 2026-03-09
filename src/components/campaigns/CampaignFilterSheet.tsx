import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const campaignTypes = [
  { value: "social", label: "Social Media" },
  { value: "referral", label: "Refer to Earn" },
  { value: "airdrop", label: "Airdrop" },
  { value: "content", label: "Content Creation" },
  { value: "community", label: "Community" },
];

const campaignStatuses = [
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ended", label: "Ended" },
];

interface CampaignFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
}

const CampaignFilterSheet = ({
  open, onOpenChange, selectedType, onTypeChange, selectedStatus, onStatusChange,
}: CampaignFilterSheetProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] bg-background overflow-y-auto">
        <SheetHeader><SheetTitle>Filter Campaigns</SheetTitle></SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Campaign Type</Label>
            <RadioGroup value={selectedType} onValueChange={onTypeChange}>
              <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="type-all" /><Label htmlFor="type-all" className="font-normal cursor-pointer">All Types</Label></div>
              {campaignTypes.map(t => (
                <div key={t.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={t.value} id={`type-${t.value}`} />
                  <Label htmlFor={`type-${t.value}`} className="font-normal cursor-pointer">{t.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <RadioGroup value={selectedStatus} onValueChange={onStatusChange}>
              <div className="flex items-center space-x-2"><RadioGroupItem value="all" id="status-all" /><Label htmlFor="status-all" className="font-normal cursor-pointer">All Status</Label></div>
              {campaignStatuses.map(s => (
                <div key={s.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={s.value} id={`status-${s.value}`} />
                  <Label htmlFor={`status-${s.value}`} className="font-normal cursor-pointer">{s.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <Button variant="outline" className="w-full" onClick={() => { onTypeChange("all"); onStatusChange("all"); }}>Clear Filters</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CampaignFilterSheet;
