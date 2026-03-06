import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Eye, 
  Loader2, 
  ExternalLink,
  Monitor,
  Globe,
  Calendar,
  User,
  Mail,
  FileText,
  Image as ImageIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type BugReportStatus = "new" | "in_review" | "resolved" | "ignored";

interface BugReport {
  id: string;
  reporter_user_id: string | null;
  reporter_email: string | null;
  reporter_name: string | null;
  title: string;
  description: string;
  page_url: string | null;
  device_info: string | null;
  browser_info: string | null;
  screenshot_urls: string[];
  status: BugReportStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<BugReportStatus, string> = {
  new: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  in_review: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  resolved: "bg-green-500/10 text-green-500 border-green-500/20",
  ignored: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<BugReportStatus, string> = {
  new: "New",
  in_review: "In Review",
  resolved: "Resolved",
  ignored: "Ignored",
};

const AdminBugReports = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [filterStatus, setFilterStatus] = useState<BugReportStatus | "all">("all");
  const [adminNotes, setAdminNotes] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [allReports, setAllReports] = useState<BugReport[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const PAGE_SIZE = 30;

  const { data: reports, isLoading } = useQuery({
    queryKey: ["bug-reports", filterStatus, page],
    queryFn: async () => {
      let query = supabase
        .from("bug_reports")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(0, (page + 1) * PAGE_SIZE - 1);

      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }

      const { data, error, count } = await query;
      if (error) throw error;
      setHasMore((data?.length || 0) < (count || 0));
      return data as BugReport[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: BugReportStatus; notes?: string }) => {
      const updateData: Record<string, unknown> = {
        status,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      };
      
      if (notes !== undefined) {
        updateData.admin_notes = notes;
      }

      const { error } = await supabase
        .from("bug_reports")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bug-reports"] });
      toast({
        title: "Status updated",
        description: "Bug report status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update bug report status.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (id: string, status: BugReportStatus) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleSaveNotes = () => {
    if (!selectedReport) return;
    updateStatusMutation.mutate({
      id: selectedReport.id,
      status: selectedReport.status,
      notes: adminNotes,
    });
    setSelectedReport({ ...selectedReport, admin_notes: adminNotes });
  };

  const openReportDetails = (report: BugReport) => {
    setSelectedReport(report);
    setAdminNotes(report.admin_notes || "");
  };

  const statusCounts = reports?.reduce(
    (acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      acc.total++;
      return acc;
    },
    { total: 0 } as Record<string, number>
  ) || { total: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bug Reports</h1>
        <p className="text-muted-foreground">
          Review and manage user-submitted bug reports
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statusCounts.total}</div>
          </CardContent>
        </Card>
        {(["new", "in_review", "resolved", "ignored"] as BugReportStatus[]).map((status) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {statusLabels[status]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts[status] || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Filter by status:</span>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as BugReportStatus | "all")}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reports</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="ignored">Ignored</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reports Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : reports?.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No bug reports found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Screenshots</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(reports || []).map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">
                          {report.reporter_name || "Guest"}
                        </span>
                        {report.reporter_email && (
                          <span className="text-xs text-muted-foreground">
                            {report.reporter_email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium line-clamp-1 max-w-[200px]">
                        {report.title}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={report.status}
                        onValueChange={(v) => handleStatusChange(report.id, v as BugReportStatus)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <Badge variant="outline" className={statusColors[report.status]}>
                            {statusLabels[report.status]}
                          </Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {(["new", "in_review", "resolved", "ignored"] as BugReportStatus[]).map((s) => (
                            <SelectItem key={s} value={s}>
                              {statusLabels[s]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      {report.screenshot_urls?.length > 0 ? (
                        <Badge variant="secondary">
                          <ImageIcon className="h-3 w-3 mr-1" />
                          {report.screenshot_urls.length}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(report.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openReportDetails(report)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bug Report Details</DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={statusColors[selectedReport.status]}>
                  {statusLabels[selectedReport.status]}
                </Badge>
                <Select
                  value={selectedReport.status}
                  onValueChange={(v) => {
                    handleStatusChange(selectedReport.id, v as BugReportStatus);
                    setSelectedReport({ ...selectedReport, status: v as BugReportStatus });
                  }}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["new", "in_review", "resolved", "ignored"] as BugReportStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusLabels[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Reporter Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedReport.reporter_name || "Guest"}</span>
                </div>
                {selectedReport.reporter_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedReport.reporter_email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(selectedReport.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Issue</span>
                </div>
                <h3 className="text-lg font-semibold">{selectedReport.title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedReport.description}
                </p>
              </div>

              {/* Page URL */}
              {selectedReport.page_url && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Page URL</span>
                  </div>
                  <a
                    href={selectedReport.page_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1 break-all"
                  >
                    {selectedReport.page_url}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </div>
              )}

              {/* Device/Browser Info */}
              {(selectedReport.device_info || selectedReport.browser_info) && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Technical Info</span>
                  </div>
                  <div className="text-xs text-muted-foreground bg-muted p-2 rounded font-mono break-all overflow-hidden">
                    {selectedReport.device_info && <div className="break-all">Device: {selectedReport.device_info}</div>}
                    {selectedReport.browser_info && (
                      <div className="break-all">Browser: {selectedReport.browser_info}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Screenshots */}
              {selectedReport.screenshot_urls?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Screenshots</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.screenshot_urls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setPreviewImage(url)}
                        className="w-24 h-24 rounded-md overflow-hidden border border-border hover:border-primary transition-colors"
                      >
                        <img
                          src={url}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div className="space-y-2">
                <label className="font-medium text-sm">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this report..."
                  className="min-h-[80px]"
                />
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          {previewImage && (
            <img
              src={previewImage}
              alt="Screenshot preview"
              className="w-full h-auto rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBugReports;
