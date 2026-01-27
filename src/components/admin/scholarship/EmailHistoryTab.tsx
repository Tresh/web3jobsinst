import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  Eye,
  RefreshCw,
  AlertCircle,
  Users,
} from "lucide-react";

interface EmailCampaign {
  id: string;
  subject: string;
  body_preview: string;
  audience: string;
  total_recipients: number;
  queued_count: number;
  sending_count: number;
  delivered_count: number;
  failed_count: number;
  status: string;
  sent_by: string;
  created_at: string;
  completed_at: string | null;
}

interface EmailDelivery {
  id: string;
  campaign_id: string;
  recipient_email: string;
  recipient_name: string | null;
  status: string;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
}

const EmailHistoryTab = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<EmailCampaign | null>(null);
  const [deliveries, setDeliveries] = useState<EmailDelivery[]>([]);
  const [isLoadingDeliveries, setIsLoadingDeliveries] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("email_campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCampaigns((data as unknown as EmailCampaign[]) || []);
    } catch (err) {
      console.error("Failed to fetch email campaigns:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchDeliveries = async (campaignId: string) => {
    setIsLoadingDeliveries(true);
    try {
      const { data, error } = await supabase
        .from("email_deliveries")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("status", { ascending: true });

      if (error) throw error;
      setDeliveries((data as unknown as EmailDelivery[]) || []);
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
    } finally {
      setIsLoadingDeliveries(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
    
    // Set up real-time subscription for campaign updates
    const channel = supabase
      .channel("email-campaigns-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "email_campaigns" },
        () => {
          fetchCampaigns();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleViewDetails = (campaign: EmailCampaign) => {
    setSelectedCampaign(campaign);
    fetchDeliveries(campaign.id);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCampaigns();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sending":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Sending
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "partially_failed":
        return (
          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Partially Failed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case "queued":
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Queued
          </Badge>
        );
      case "sending":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Sending
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Delivered
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAudienceLabel = (audience: string) => {
    switch (audience) {
      case "scholars":
        return "All Scholars";
      case "all_users":
        return "All Platform Users";
      default:
        return audience;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email History
            </CardTitle>
            <CardDescription>
              View previously sent broadcast emails and their delivery status
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No emails have been sent yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead className="text-center">Total</TableHead>
                  <TableHead className="text-center">Delivered</TableHead>
                  <TableHead className="text-center">Pending</TableHead>
                  <TableHead className="text-center">Failed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {campaign.subject}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(campaign.created_at), "MMM d, yyyy h:mm a")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        {getAudienceLabel(campaign.audience)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {campaign.total_recipients}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-green-500 font-medium">{campaign.delivered_count}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-amber-500 font-medium">
                        {campaign.queued_count + campaign.sending_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-red-500 font-medium">{campaign.failed_count}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(campaign)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Campaign Detail Dialog */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Email Campaign Details
            </DialogTitle>
            <DialogDescription>
              {selectedCampaign?.subject}
            </DialogDescription>
          </DialogHeader>

          {selectedCampaign && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold">{selectedCampaign.total_recipients}</div>
                    <div className="text-xs text-muted-foreground">Total Recipients</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {selectedCampaign.delivered_count}
                    </div>
                    <div className="text-xs text-muted-foreground">Delivered</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-amber-500">
                      {selectedCampaign.queued_count + selectedCampaign.sending_count}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {selectedCampaign.failed_count}
                    </div>
                    <div className="text-xs text-muted-foreground">Failed</div>
                  </CardContent>
                </Card>
              </div>

              {/* Campaign Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Audience:</span>
                  <span>{getAudienceLabel(selectedCampaign.audience)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sent at:</span>
                  <span>
                    {format(new Date(selectedCampaign.created_at), "PPpp")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge(selectedCampaign.status)}
                </div>
              </div>

              {/* Body Preview */}
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Message Preview:</span>
                <Card>
                  <CardContent className="pt-4 text-sm whitespace-pre-wrap">
                    {selectedCampaign.body_preview}
                  </CardContent>
                </Card>
              </div>

              {/* Recipient List */}
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Recipient Delivery Status:</span>
                {isLoadingDeliveries ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Recipient</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Failure Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deliveries.map((delivery) => (
                          <TableRow key={delivery.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{delivery.recipient_name || "—"}</div>
                                <div className="text-xs text-muted-foreground">
                                  {delivery.recipient_email}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getDeliveryStatusBadge(delivery.status)}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {delivery.failure_reason || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                        {deliveries.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                              No delivery records found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailHistoryTab;
