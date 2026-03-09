import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AffiliateOverviewTab from "@/components/affiliate/AffiliateOverviewTab";
import AffiliateMarketplaceTab from "@/components/affiliate/AffiliateMarketplaceTab";
import AffiliateLinksTab from "@/components/affiliate/AffiliateLinksTab";
import AffiliateSalesTab from "@/components/affiliate/AffiliateSalesTab";
import AffiliateEarningsTab from "@/components/affiliate/AffiliateEarningsTab";
import AffiliatePayoutsTab from "@/components/affiliate/AffiliatePayoutsTab";
import AffiliateRulesTab from "@/components/affiliate/AffiliateRulesTab";

const DashboardAffiliate = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Affiliate Program</h1>
        <p className="text-muted-foreground mt-1">Promote courses & products. Earn commissions.</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex w-max md:w-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="links">My Links</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview"><AffiliateOverviewTab /></TabsContent>
        <TabsContent value="marketplace"><AffiliateMarketplaceTab /></TabsContent>
        <TabsContent value="links"><AffiliateLinksTab /></TabsContent>
        <TabsContent value="sales"><AffiliateSalesTab /></TabsContent>
        <TabsContent value="earnings"><AffiliateEarningsTab /></TabsContent>
        <TabsContent value="payouts"><AffiliatePayoutsTab /></TabsContent>
        <TabsContent value="rules"><AffiliateRulesTab /></TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardAffiliate;
