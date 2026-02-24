import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Loader2,
  Pencil,
  Trash2,
  BookOpen,
  Video,
  Image,
  Upload,
  Eye,
  Clock,
  Zap,
  Lock,
} from "lucide-react";
import type { ScholarshipProgram, ScholarshipModule } from "@/types/scholarship";

interface AdminModulesTabProps {
  programs: ScholarshipProgram[];
  modules: ScholarshipModule[];
  isLoading: boolean;
  onRefetch: () => void;
}

export function AdminModulesTab({ programs, modules, isLoading, onRefetch }: AdminModulesTabProps) {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ScholarshipModule | null>(null);
  const [programFilter, setProgramFilter] = useState<string>("_all");

  const [formData, setFormData] = useState({
    program_id: "",
    title: "",
    description: "",
    video_url: "",
    cover_image_url: "",
    video_duration: "",
    xp_value: "0",
    xp_threshold: "0",
    unlock_type: "day" as "day" | "task" | "manual" | "immediate",
    unlock_day: "",
    order_index: "0",
  });

  const resetForm = () => {
    setFormData({
      program_id: "",
      title: "",
      description: "",
      video_url: "",
      cover_image_url: "",
      video_duration: "",
      xp_value: "0",
      xp_threshold: "0",
      unlock_type: "immediate",
      unlock_day: "",
      order_index: "0",
    });
  };

  const openEditDialog = (module: ScholarshipModule) => {
    setSelectedModule(module);
    setFormData({
      program_id: module.program_id || "",
      title: module.title,
      description: module.description || "",
      video_url: module.video_url || "",
      cover_image_url: module.cover_image_url || "",
      video_duration: module.video_duration || "",
      xp_value: String(module.xp_value || 0),
      xp_threshold: String(module.xp_threshold || 0),
      unlock_type: module.unlock_type as "day" | "task" | "manual" | "immediate",
      unlock_day: module.unlock_day ? String(module.unlock_day) : "",
      order_index: String(module.order_index || 0),
    });
    setIsEditOpen(true);
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('module-covers')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('module-covers')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, cover_image_url: publicUrl }));
      toast({ title: "Image uploaded successfully" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.title || !formData.program_id) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("scholarship_modules").insert({
        program_id: formData.program_id,
        title: formData.title,
        description: formData.description || null,
        video_url: formData.video_url || null,
        cover_image_url: formData.cover_image_url || null,
        video_duration: formData.video_duration || null,
        xp_value: parseInt(formData.xp_value) || 0,
        xp_threshold: parseInt(formData.xp_threshold) || 0,
        unlock_type: formData.unlock_type,
        unlock_day: formData.unlock_day ? parseInt(formData.unlock_day) : null,
        order_index: parseInt(formData.order_index) || 0,
        is_published: false,
      });

      if (error) throw error;

      toast({ title: "Module created successfully" });
      setIsCreateOpen(false);
      resetForm();
      onRefetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedModule || !formData.title) {
      toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("scholarship_modules")
        .update({
          program_id: formData.program_id || null,
          title: formData.title,
          description: formData.description || null,
          video_url: formData.video_url || null,
          cover_image_url: formData.cover_image_url || null,
          video_duration: formData.video_duration || null,
          xp_value: parseInt(formData.xp_value) || 0,
          xp_threshold: parseInt(formData.xp_threshold) || 0,
          unlock_type: formData.unlock_type,
          unlock_day: formData.unlock_day ? parseInt(formData.unlock_day) : null,
          order_index: parseInt(formData.order_index) || 0,
        })
        .eq("id", selectedModule.id);

      if (error) throw error;

      toast({ title: "Module updated successfully" });
      setIsEditOpen(false);
      setSelectedModule(null);
      resetForm();
      onRefetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (moduleId: string) => {
    setIsDeleting(moduleId);
    try {
      const { error } = await supabase
        .from("scholarship_modules")
        .delete()
        .eq("id", moduleId);

      if (error) throw error;

      toast({ title: "Module deleted" });
      onRefetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(null);
    }
  };

  const togglePublished = async (moduleId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("scholarship_modules")
        .update({ is_published: !currentStatus })
        .eq("id", moduleId);

      if (error) throw error;
      onRefetch();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filteredModules = programFilter === "_all" 
    ? modules 
    : modules.filter(m => m.program_id === programFilter);

  const getProgram = (programId: string | null) => 
    programs.find(p => p.id === programId);

  const ModuleForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="program_id">Program *</Label>
          <Select
            value={formData.program_id || "_none"}
            onValueChange={(value) => setFormData(prev => ({ ...prev, program_id: value === "_none" ? "" : value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Module title"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Module description"
            rows={3}
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="video_url">Video URL (Vimeo)</Label>
          <Input
            id="video_url"
            value={formData.video_url}
            onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
            placeholder="https://vimeo.com/123456789 or embed URL"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Paste a Vimeo URL or embed URL
          </p>
        </div>

        <div className="col-span-2">
          <Label>Cover Image</Label>
          <div className="flex items-center gap-4 mt-2">
            {formData.cover_image_url && (
              <img 
                src={formData.cover_image_url} 
                alt="Cover preview" 
                className="w-32 h-20 object-cover rounded-md"
              />
            )}
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                disabled={isUploading}
                className="hidden"
                id="cover-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('cover-upload')?.click()}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload Image
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                Or paste URL directly below
              </p>
              <Input
                value={formData.cover_image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, cover_image_url: e.target.value }))}
                placeholder="https://..."
                className="mt-2"
              />
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="video_duration">Duration</Label>
          <Input
            id="video_duration"
            value={formData.video_duration}
            onChange={(e) => setFormData(prev => ({ ...prev, video_duration: e.target.value }))}
            placeholder="10:30"
          />
        </div>

        <div>
          <Label htmlFor="xp_value">XP Value</Label>
          <Input
            id="xp_value"
            type="number"
            value={formData.xp_value}
            onChange={(e) => setFormData(prev => ({ ...prev, xp_value: e.target.value }))}
            placeholder="100"
          />
        </div>

        <div>
          <Label htmlFor="xp_threshold">XP Threshold (Gate)</Label>
          <Select
            value={formData.xp_threshold}
            onValueChange={(value) => setFormData(prev => ({ ...prev, xp_threshold: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No XP Required (0)</SelectItem>
              <SelectItem value="50">50 XP</SelectItem>
              <SelectItem value="100">100 XP</SelectItem>
              <SelectItem value="200">200 XP</SelectItem>
              <SelectItem value="300">300 XP</SelectItem>
              <SelectItem value="500">500 XP</SelectItem>
              <SelectItem value="750">750 XP</SelectItem>
              <SelectItem value="1000">1000 XP</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Students need this much XP to see this module
          </p>
        </div>

        <div>
          <Label htmlFor="unlock_type">Unlock Rule</Label>
          <Select
            value={formData.unlock_type}
            onValueChange={(value: "day" | "task" | "manual" | "immediate") => 
              setFormData(prev => ({ ...prev, unlock_type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">🟢 Go Live (Immediate)</SelectItem>
              <SelectItem value="day">Unlock after X days</SelectItem>
              <SelectItem value="task">Unlock after task completion</SelectItem>
              <SelectItem value="manual">Manual unlock only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.unlock_type === "day" && (
          <div>
            <Label htmlFor="unlock_day">Unlock Day</Label>
            <Input
              id="unlock_day"
              type="number"
              value={formData.unlock_day}
              onChange={(e) => setFormData(prev => ({ ...prev, unlock_day: e.target.value }))}
              placeholder="1"
            />
          </div>
        )}

        <div>
          <Label htmlFor="order_index">Order Index</Label>
          <Input
            id="order_index"
            type="number"
            value={formData.order_index}
            onChange={(e) => setFormData(prev => ({ ...prev, order_index: e.target.value }))}
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Course Modules
          </h2>
          <p className="text-sm text-muted-foreground">
            Create and manage video course modules
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={resetForm}>
              <Plus className="w-4 h-4" />
              Create Module
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Module</DialogTitle>
              <DialogDescription>
                Add a new video module to a scholarship program
              </DialogDescription>
            </DialogHeader>
            <ModuleForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter by Program:</Label>
        <Select value={programFilter} onValueChange={setProgramFilter}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">All Programs</SelectItem>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Modules Table */}
      {filteredModules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Modules Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first course module to get started
            </p>
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Program</TableHead>
                <TableHead className="text-center">XP</TableHead>
                <TableHead className="text-center">XP Gate</TableHead>
                <TableHead className="text-center">Duration</TableHead>
                <TableHead className="text-center">Live</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredModules.map((module) => {
                const program = getProgram(module.program_id);
                return (
                  <TableRow key={module.id}>
                    <TableCell className="font-mono text-sm">
                      {module.order_index}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {module.cover_image_url ? (
                          <img 
                            src={module.cover_image_url} 
                            alt="" 
                            className="w-16 h-10 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                            <Image className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{module.title}</p>
                          {module.video_url && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Video className="w-3 h-3" />
                              Video attached
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {program?.title || "No program"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        <Zap className="w-3 h-3 mr-1" />
                        {module.xp_value || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {(module.xp_threshold || 0) > 0 ? (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="w-3 h-3" />
                          {module.xp_threshold} XP
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {module.video_duration ? (
                        <span className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          {module.video_duration}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={module.is_published}
                        onCheckedChange={() => togglePublished(module.id, module.is_published)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(module)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(module.id)}
                          disabled={isDeleting === module.id}
                        >
                          {isDeleting === module.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>
              Update module details and content
            </DialogDescription>
          </DialogHeader>
          <ModuleForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
