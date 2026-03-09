import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Loader2, Pencil, Trash2, BookOpen, Video, Image, Upload,
  Clock, Eye, Search, Filter, List, Layers, FileText,
} from "lucide-react";

const categories = [
  "Foundations", "Marketing & Growth", "Trading & Alpha", "Creator Economy",
  "Vibecoding & No-Code", "Development", "Community & DAO",
  "Sales & Partnerships", "Research & Data", "AI & Automation",
  "Onchain & DeFi", "Leadership & Strategy", "Freelancing", "Project Management",
];

const levels = ["Beginner", "Intermediate", "Advanced"];

interface PlatformCourse {
  id: string; title: string; description: string | null; category: string; level: string;
  duration: string | null; cover_image_url: string | null; skill_outcome: string | null;
  instructor: string | null; total_duration: string | null; resources: any;
  is_published: boolean; is_coming_soon: boolean; order_index: number;
  created_at: string; updated_at: string;
}

interface CourseModule {
  id: string; course_id: string; title: string; description: string | null;
  order_index: number; is_published: boolean; created_at: string;
}

interface CourseLesson {
  id: string; module_id: string; title: string; description: string | null;
  video_url: string | null; video_duration: string | null; cover_image_url: string | null;
  resources: any; order_index: number; is_published: boolean; is_free_preview: boolean;
  created_at: string;
}

const AdminCourses = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<PlatformCourse[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [lessons, setLessons] = useState<CourseLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("courses");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Course form
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<PlatformCourse | null>(null);
  const emptyCourseForm = {
    title: "", description: "", category: "Foundations", level: "Beginner",
    cover_image_url: "", skill_outcome: "", instructor: "", total_duration: "",
    is_coming_soon: true, order_index: "0",
  };
  const [courseForm, setCourseForm] = useState(emptyCourseForm);

  // Module form
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const emptyModuleForm = { course_id: "", title: "", description: "", order_index: "0" };
  const [moduleForm, setModuleForm] = useState(emptyModuleForm);
  const [moduleViewCourseId, setModuleViewCourseId] = useState("_all");

  // Lesson form
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [isEditingLesson, setIsEditingLesson] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<CourseLesson | null>(null);
  const emptyLessonForm = {
    module_id: "", title: "", description: "", video_url: "", video_duration: "",
    cover_image_url: "", order_index: "0", is_free_preview: false,
  };
  const [lessonForm, setLessonForm] = useState(emptyLessonForm);
  const [lessonViewModuleId, setLessonViewModuleId] = useState("_all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [cr, mr, lr] = await Promise.all([
      supabase.from("platform_courses").select("*").order("order_index"),
      supabase.from("platform_course_modules").select("*").order("order_index"),
      supabase.from("platform_course_lessons").select("*").order("order_index"),
    ]);
    setCourses((cr.data || []) as PlatformCourse[]);
    setModules((mr.data || []) as CourseModule[]);
    setLessons((lr.data || []) as CourseLesson[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, cb: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error } = await supabase.storage.from('module-covers').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('module-covers').getPublicUrl(path);
      cb(publicUrl);
      toast({ title: "Image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally { setIsUploading(false); }
  };

  // ========== COURSE CRUD ==========
  const resetCourseForm = () => { setCourseForm(emptyCourseForm); setSelectedCourse(null); setIsEditingCourse(false); };
  const openEditCourse = (c: PlatformCourse) => {
    setSelectedCourse(c); setIsEditingCourse(true);
    setCourseForm({
      title: c.title, description: c.description || "", category: c.category, level: c.level,
      cover_image_url: c.cover_image_url || "", skill_outcome: c.skill_outcome || "",
      instructor: c.instructor || "", total_duration: c.total_duration || "",
      is_coming_soon: c.is_coming_soon, order_index: String(c.order_index),
    });
    setIsCourseDialogOpen(true);
  };
  const handleSaveCourse = async () => {
    if (!courseForm.title) { toast({ title: "Title required", variant: "destructive" }); return; }
    setIsSaving(true);
    const payload = {
      title: courseForm.title, description: courseForm.description || null,
      category: courseForm.category, level: courseForm.level,
      cover_image_url: courseForm.cover_image_url || null, skill_outcome: courseForm.skill_outcome || null,
      instructor: courseForm.instructor || null, total_duration: courseForm.total_duration || null,
      is_coming_soon: courseForm.is_coming_soon, order_index: parseInt(courseForm.order_index) || 0,
    };
    try {
      if (isEditingCourse && selectedCourse) {
        const { error } = await supabase.from("platform_courses").update(payload).eq("id", selectedCourse.id);
        if (error) throw error;
        toast({ title: "Course updated" });
      } else {
        const { error } = await supabase.from("platform_courses").insert(payload);
        if (error) throw error;
        toast({ title: "Course created" });
      }
      setIsCourseDialogOpen(false); resetCourseForm(); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setIsSaving(false); }
  };
  const handleDeleteCourse = async (id: string) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase.from("platform_courses").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Course deleted" }); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setIsDeleting(null); }
  };
  const toggleCoursePublished = async (id: string, cur: boolean) => {
    const { error } = await supabase.from("platform_courses").update({ is_published: !cur }).eq("id", id);
    if (!error) fetchData(); else toast({ title: "Error", description: error.message, variant: "destructive" });
  };

  // ========== MODULE CRUD ==========
  const resetModuleForm = () => { setModuleForm(emptyModuleForm); setSelectedModule(null); setIsEditingModule(false); };
  const openEditModule = (m: CourseModule) => {
    setSelectedModule(m); setIsEditingModule(true);
    setModuleForm({ course_id: m.course_id, title: m.title, description: m.description || "", order_index: String(m.order_index) });
    setIsModuleDialogOpen(true);
  };
  const handleSaveModule = async () => {
    if (!moduleForm.title || !moduleForm.course_id) { toast({ title: "Title & course required", variant: "destructive" }); return; }
    setIsSaving(true);
    const payload = {
      course_id: moduleForm.course_id, title: moduleForm.title,
      description: moduleForm.description || null, order_index: parseInt(moduleForm.order_index) || 0,
    };
    try {
      if (isEditingModule && selectedModule) {
        const { error } = await supabase.from("platform_course_modules").update(payload).eq("id", selectedModule.id);
        if (error) throw error; toast({ title: "Module updated" });
      } else {
        const { error } = await supabase.from("platform_course_modules").insert(payload);
        if (error) throw error; toast({ title: "Module created" });
      }
      setIsModuleDialogOpen(false); resetModuleForm(); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setIsSaving(false); }
  };
  const handleDeleteModule = async (id: string) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase.from("platform_course_modules").delete().eq("id", id);
      if (error) throw error; toast({ title: "Module deleted" }); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setIsDeleting(null); }
  };
  const toggleModulePublished = async (id: string, cur: boolean) => {
    const { error } = await supabase.from("platform_course_modules").update({ is_published: !cur }).eq("id", id);
    if (!error) fetchData();
  };

  // ========== LESSON CRUD ==========
  const resetLessonForm = () => { setLessonForm(emptyLessonForm); setSelectedLesson(null); setIsEditingLesson(false); };
  const openEditLesson = (l: CourseLesson) => {
    setSelectedLesson(l); setIsEditingLesson(true);
    setLessonForm({
      module_id: l.module_id, title: l.title, description: l.description || "",
      video_url: l.video_url || "", video_duration: l.video_duration || "",
      cover_image_url: l.cover_image_url || "", order_index: String(l.order_index),
      is_free_preview: l.is_free_preview,
    });
    setIsLessonDialogOpen(true);
  };
  const handleSaveLesson = async () => {
    if (!lessonForm.title || !lessonForm.module_id) { toast({ title: "Title & module required", variant: "destructive" }); return; }
    setIsSaving(true);
    const payload = {
      module_id: lessonForm.module_id, title: lessonForm.title,
      description: lessonForm.description || null, video_url: lessonForm.video_url || null,
      video_duration: lessonForm.video_duration || null, cover_image_url: lessonForm.cover_image_url || null,
      order_index: parseInt(lessonForm.order_index) || 0, is_free_preview: lessonForm.is_free_preview,
    };
    try {
      if (isEditingLesson && selectedLesson) {
        const { error } = await supabase.from("platform_course_lessons").update(payload).eq("id", selectedLesson.id);
        if (error) throw error; toast({ title: "Lesson updated" });
      } else {
        const { error } = await supabase.from("platform_course_lessons").insert(payload);
        if (error) throw error; toast({ title: "Lesson created" });
      }
      setIsLessonDialogOpen(false); resetLessonForm(); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setIsSaving(false); }
  };
  const handleDeleteLesson = async (id: string) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase.from("platform_course_lessons").delete().eq("id", id);
      if (error) throw error; toast({ title: "Lesson deleted" }); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setIsDeleting(null); }
  };
  const toggleLessonPublished = async (id: string, cur: boolean) => {
    const { error } = await supabase.from("platform_course_lessons").update({ is_published: !cur }).eq("id", id);
    if (!error) fetchData();
  };

  // Filters
  const filteredCourses = courses.filter(c => {
    const ms = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const mc = categoryFilter === "all" || c.category === categoryFilter;
    return ms && mc;
  });
  const filteredModules = moduleViewCourseId === "_all" ? modules : modules.filter(m => m.course_id === moduleViewCourseId);
  const filteredLessons = lessonViewModuleId === "_all" ? lessons : lessons.filter(l => l.module_id === lessonViewModuleId);

  const getCourse = (id: string) => courses.find(c => c.id === id);
  const getModule = (id: string) => modules.find(m => m.id === id);
  const getModuleCourse = (moduleId: string) => {
    const mod = getModule(moduleId);
    return mod ? getCourse(mod.course_id) : undefined;
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Management</h1>
        <p className="text-muted-foreground mt-1">Manage courses, modules, and lessons (Vimeo)</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses" className="gap-2"><BookOpen className="w-4 h-4" /> Courses ({courses.length})</TabsTrigger>
          <TabsTrigger value="modules" className="gap-2"><Layers className="w-4 h-4" /> Modules ({modules.length})</TabsTrigger>
          <TabsTrigger value="lessons" className="gap-2"><Video className="w-4 h-4" /> Lessons ({lessons.length})</TabsTrigger>
        </TabsList>

        {/* ===== COURSES TAB ===== */}
        <TabsContent value="courses" className="space-y-4 mt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={resetCourseForm}><Plus className="w-4 h-4" /> Add Course</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditingCourse ? "Edit Course" : "Create Course"}</DialogTitle>
                  <DialogDescription>Course info only — add modules & lessons separately</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><Label>Title *</Label><Input value={courseForm.title} onChange={e => setCourseForm(p => ({ ...p, title: e.target.value }))} /></div>
                    <div className="col-span-2"><Label>Description</Label><Textarea value={courseForm.description} onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
                    <div><Label>Category</Label>
                      <Select value={courseForm.category} onValueChange={v => setCourseForm(p => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Level</Label>
                      <Select value={courseForm.level} onValueChange={v => setCourseForm(p => ({ ...p, level: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Instructor</Label><Input value={courseForm.instructor} onChange={e => setCourseForm(p => ({ ...p, instructor: e.target.value }))} placeholder="Instructor name" /></div>
                    <div><Label>Total Duration</Label><Input value={courseForm.total_duration} onChange={e => setCourseForm(p => ({ ...p, total_duration: e.target.value }))} placeholder="e.g. 4h 30m" /></div>
                    <div className="col-span-2"><Label>Skill Outcome</Label><Input value={courseForm.skill_outcome} onChange={e => setCourseForm(p => ({ ...p, skill_outcome: e.target.value }))} placeholder="What students will learn" /></div>
                    <div className="col-span-2">
                      <Label>Cover Image</Label>
                      <div className="flex items-center gap-4 mt-2">
                        {courseForm.cover_image_url && <img src={courseForm.cover_image_url} alt="" className="w-32 h-20 object-cover rounded-md" />}
                        <div className="flex-1">
                          <Input type="file" accept="image/*" onChange={e => handleImageUpload(e, url => setCourseForm(p => ({ ...p, cover_image_url: url })))} disabled={isUploading} className="hidden" id="course-cover-up" />
                          <Button type="button" variant="outline" onClick={() => document.getElementById('course-cover-up')?.click()} disabled={isUploading} className="gap-2">
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
                          </Button>
                          <Input value={courseForm.cover_image_url} onChange={e => setCourseForm(p => ({ ...p, cover_image_url: e.target.value }))} placeholder="Or paste URL" className="mt-2" />
                        </div>
                      </div>
                    </div>
                    <div><Label>Order</Label><Input type="number" value={courseForm.order_index} onChange={e => setCourseForm(p => ({ ...p, order_index: e.target.value }))} /></div>
                    <div className="flex items-center gap-3 pt-6"><Switch checked={courseForm.is_coming_soon} onCheckedChange={v => setCourseForm(p => ({ ...p, is_coming_soon: v }))} /><Label>Coming Soon</Label></div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCourseDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveCourse} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{isEditingCourse ? "Save" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {filteredCourses.length === 0 ? (
            <Card className="border-dashed"><CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
              <Button onClick={() => { resetCourseForm(); setIsCourseDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Create Course</Button>
            </CardContent></Card>
          ) : (
            <div className="rounded-md border"><Table>
              <TableHeader><TableRow>
                <TableHead className="w-12">#</TableHead><TableHead>Course</TableHead><TableHead>Category</TableHead>
                <TableHead>Level</TableHead><TableHead className="text-center">Modules</TableHead>
                <TableHead className="text-center">Lessons</TableHead><TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Live</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filteredCourses.map(c => {
                  const mods = modules.filter(m => m.course_id === c.id);
                  const modIds = mods.map(m => m.id);
                  const lessonCount = lessons.filter(l => modIds.includes(l.module_id)).length;
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-sm">{c.order_index}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {c.cover_image_url ? <img src={c.cover_image_url} alt="" className="w-16 h-10 object-cover rounded" /> : <div className="w-16 h-10 bg-muted rounded flex items-center justify-center"><Image className="w-4 h-4 text-muted-foreground" /></div>}
                          <div><p className="font-medium">{c.title}</p>{c.instructor && <p className="text-xs text-muted-foreground">{c.instructor}</p>}</div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline">{c.category}</Badge></TableCell>
                      <TableCell><Badge variant={c.level === "Beginner" ? "secondary" : c.level === "Intermediate" ? "default" : "destructive"}>{c.level}</Badge></TableCell>
                      <TableCell className="text-center">{mods.length}</TableCell>
                      <TableCell className="text-center">{lessonCount}</TableCell>
                      <TableCell className="text-center">{c.is_coming_soon ? <Badge variant="secondary">Coming Soon</Badge> : <Badge variant="default">Active</Badge>}</TableCell>
                      <TableCell className="text-center"><Switch checked={c.is_published} onCheckedChange={() => toggleCoursePublished(c.id, c.is_published)} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditCourse(c)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteCourse(c.id)} disabled={isDeleting === c.id}>
                            {isDeleting === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table></div>
          )}
        </TabsContent>

        {/* ===== MODULES TAB ===== */}
        <TabsContent value="modules" className="space-y-4 mt-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Label>Filter by Course:</Label>
            <Select value={moduleViewCourseId} onValueChange={setModuleViewCourseId}>
              <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Courses</SelectItem>
                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={resetModuleForm}><Plus className="w-4 h-4" /> Add Module</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{isEditingModule ? "Edit Module" : "Create Module"}</DialogTitle>
                    <DialogDescription>Modules group lessons within a course</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Course *</Label>
                      <Select value={moduleForm.course_id || "_none"} onValueChange={v => setModuleForm(p => ({ ...p, course_id: v === "_none" ? "" : v }))}>
                        <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                        <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Title *</Label><Input value={moduleForm.title} onChange={e => setModuleForm(p => ({ ...p, title: e.target.value }))} /></div>
                    <div><Label>Description</Label><Textarea value={moduleForm.description} onChange={e => setModuleForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
                    <div><Label>Order</Label><Input type="number" value={moduleForm.order_index} onChange={e => setModuleForm(p => ({ ...p, order_index: e.target.value }))} /></div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveModule} disabled={isSaving}>
                      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{isEditingModule ? "Save" : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {filteredModules.length === 0 ? (
            <Card className="border-dashed"><CardContent className="p-12 text-center">
              <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Modules Yet</h3>
              <p className="text-muted-foreground mb-4">Create a course first, then add modules</p>
            </CardContent></Card>
          ) : (
            <div className="rounded-md border"><Table>
              <TableHeader><TableRow>
                <TableHead className="w-12">#</TableHead><TableHead>Module</TableHead><TableHead>Course</TableHead>
                <TableHead className="text-center">Lessons</TableHead><TableHead className="text-center">Live</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filteredModules.map(m => {
                  const course = getCourse(m.course_id);
                  const lessonCount = lessons.filter(l => l.module_id === m.id).length;
                  return (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-sm">{m.order_index}</TableCell>
                      <TableCell><p className="font-medium">{m.title}</p>{m.description && <p className="text-xs text-muted-foreground line-clamp-1">{m.description}</p>}</TableCell>
                      <TableCell><Badge variant="outline">{course?.title || "Unknown"}</Badge></TableCell>
                      <TableCell className="text-center">{lessonCount}</TableCell>
                      <TableCell className="text-center"><Switch checked={m.is_published} onCheckedChange={() => toggleModulePublished(m.id, m.is_published)} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditModule(m)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteModule(m.id)} disabled={isDeleting === m.id}>
                            {isDeleting === m.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table></div>
          )}
        </TabsContent>

        {/* ===== LESSONS TAB ===== */}
        <TabsContent value="lessons" className="space-y-4 mt-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Label>Filter by Module:</Label>
            <Select value={lessonViewModuleId} onValueChange={setLessonViewModuleId}>
              <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Modules</SelectItem>
                {modules.map(m => {
                  const c = getCourse(m.course_id);
                  return <SelectItem key={m.id} value={m.id}>{c?.title ? `${c.title} → ` : ""}{m.title}</SelectItem>;
                })}
              </SelectContent>
            </Select>
            <div className="ml-auto">
              <Dialog open={isLessonDialogOpen} onOpenChange={setIsLessonDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2" onClick={resetLessonForm}><Plus className="w-4 h-4" /> Add Lesson</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{isEditingLesson ? "Edit Lesson" : "Create Lesson"}</DialogTitle>
                    <DialogDescription>Lessons contain video content (Vimeo)</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2"><Label>Module *</Label>
                        <Select value={lessonForm.module_id || "_none"} onValueChange={v => setLessonForm(p => ({ ...p, module_id: v === "_none" ? "" : v }))}>
                          <SelectTrigger><SelectValue placeholder="Select module" /></SelectTrigger>
                          <SelectContent>
                            {modules.map(m => {
                              const c = getCourse(m.course_id);
                              return <SelectItem key={m.id} value={m.id}>{c?.title ? `${c.title} → ` : ""}{m.title}</SelectItem>;
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2"><Label>Title *</Label><Input value={lessonForm.title} onChange={e => setLessonForm(p => ({ ...p, title: e.target.value }))} /></div>
                      <div className="col-span-2"><Label>Description</Label><Textarea value={lessonForm.description} onChange={e => setLessonForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
                      <div className="col-span-2"><Label>Video URL (Vimeo)</Label><Input value={lessonForm.video_url} onChange={e => setLessonForm(p => ({ ...p, video_url: e.target.value }))} placeholder="https://vimeo.com/123456789" /><p className="text-xs text-muted-foreground mt-1">Paste Vimeo URL</p></div>
                      <div><Label>Video Duration</Label><Input value={lessonForm.video_duration} onChange={e => setLessonForm(p => ({ ...p, video_duration: e.target.value }))} placeholder="10:30" /></div>
                      <div><Label>Order</Label><Input type="number" value={lessonForm.order_index} onChange={e => setLessonForm(p => ({ ...p, order_index: e.target.value }))} /></div>
                      <div className="col-span-2">
                        <Label>Cover Image</Label>
                        <div className="flex items-center gap-4 mt-2">
                          {lessonForm.cover_image_url && <img src={lessonForm.cover_image_url} alt="" className="w-32 h-20 object-cover rounded-md" />}
                          <div className="flex-1">
                            <Input type="file" accept="image/*" onChange={e => handleImageUpload(e, url => setLessonForm(p => ({ ...p, cover_image_url: url })))} disabled={isUploading} className="hidden" id="lesson-cover-up" />
                            <Button type="button" variant="outline" onClick={() => document.getElementById('lesson-cover-up')?.click()} disabled={isUploading} className="gap-2">
                              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
                            </Button>
                            <Input value={lessonForm.cover_image_url} onChange={e => setLessonForm(p => ({ ...p, cover_image_url: e.target.value }))} placeholder="Or paste URL" className="mt-2" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 col-span-2 pt-2"><Switch checked={lessonForm.is_free_preview} onCheckedChange={v => setLessonForm(p => ({ ...p, is_free_preview: v }))} /><Label>Free Preview</Label></div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsLessonDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveLesson} disabled={isSaving}>
                      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{isEditingLesson ? "Save" : "Create"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {filteredLessons.length === 0 ? (
            <Card className="border-dashed"><CardContent className="p-12 text-center">
              <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Lessons Yet</h3>
              <p className="text-muted-foreground mb-4">Create a module first, then add lessons with Vimeo videos</p>
            </CardContent></Card>
          ) : (
            <div className="rounded-md border"><Table>
              <TableHeader><TableRow>
                <TableHead className="w-12">#</TableHead><TableHead>Lesson</TableHead><TableHead>Module / Course</TableHead>
                <TableHead className="text-center">Duration</TableHead><TableHead className="text-center">Preview</TableHead>
                <TableHead className="text-center">Live</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filteredLessons.map(l => {
                  const mod = getModule(l.module_id);
                  const course = mod ? getCourse(mod.course_id) : undefined;
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono text-sm">{l.order_index}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {l.cover_image_url ? <img src={l.cover_image_url} alt="" className="w-16 h-10 object-cover rounded" /> : <div className="w-16 h-10 bg-muted rounded flex items-center justify-center"><Video className="w-4 h-4 text-muted-foreground" /></div>}
                          <div><p className="font-medium">{l.title}</p>{l.video_url && <p className="text-xs text-muted-foreground flex items-center gap-1"><Video className="w-3 h-3" /> Vimeo</p>}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <Badge variant="outline" className="text-xs">{mod?.title || "Unknown"}</Badge>
                          {course && <p className="text-xs text-muted-foreground">{course.title}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{l.video_duration ? <span className="text-sm text-muted-foreground flex items-center justify-center gap-1"><Clock className="w-3 h-3" /> {l.video_duration}</span> : "-"}</TableCell>
                      <TableCell className="text-center">{l.is_free_preview ? <Badge variant="secondary" className="gap-1"><Eye className="w-3 h-3" /> Free</Badge> : <span className="text-xs text-muted-foreground">No</span>}</TableCell>
                      <TableCell className="text-center"><Switch checked={l.is_published} onCheckedChange={() => toggleLessonPublished(l.id, l.is_published)} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEditLesson(l)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteLesson(l.id)} disabled={isDeleting === l.id}>
                            {isDeleting === l.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table></div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCourses;
