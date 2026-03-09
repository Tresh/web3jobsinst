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
  Clock, Eye, Search, Filter, List,
} from "lucide-react";

const categories = [
  "Foundations", "Marketing & Growth", "Trading & Alpha", "Creator Economy",
  "Vibecoding & No-Code", "Development", "Community & DAO",
  "Sales & Partnerships", "Research & Data", "AI & Automation",
  "Onchain & DeFi", "Leadership & Strategy", "Freelancing", "Project Management",
];

const levels = ["Beginner", "Intermediate", "Advanced"];

interface PlatformCourse {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  duration: string | null;
  video_url: string | null;
  cover_image_url: string | null;
  video_duration: string | null;
  skill_outcome: string | null;
  is_published: boolean;
  is_coming_soon: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_duration: string | null;
  cover_image_url: string | null;
  order_index: number;
  is_published: boolean;
  is_free_preview: boolean;
  created_at: string;
}

const AdminCourses = () => {
  const { toast } = useToast();
  const [courses, setCourses] = useState<PlatformCourse[]>([]);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("courses");

  // Course form state
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false);
  const [isEditingCourse, setIsEditingCourse] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<PlatformCourse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [courseForm, setCourseForm] = useState({
    title: "", description: "", category: "Foundations", level: "Beginner",
    duration: "", video_url: "", cover_image_url: "", video_duration: "",
    skill_outcome: "", is_coming_soon: true, order_index: "0",
  });

  // Module form state
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [moduleForm, setModuleForm] = useState({
    course_id: "", title: "", description: "", video_url: "",
    video_duration: "", cover_image_url: "", order_index: "0",
    is_free_preview: false,
  });

  // Selected course for module view
  const [moduleViewCourseId, setModuleViewCourseId] = useState<string>("_all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [coursesRes, modulesRes] = await Promise.all([
      supabase.from("platform_courses").select("*").order("order_index"),
      supabase.from("platform_course_modules").select("*").order("order_index"),
    ]);
    setCourses((coursesRes.data || []) as PlatformCourse[]);
    setModules((modulesRes.data || []) as CourseModule[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Course CRUD ---
  const resetCourseForm = () => {
    setCourseForm({
      title: "", description: "", category: "Foundations", level: "Beginner",
      duration: "", video_url: "", cover_image_url: "", video_duration: "",
      skill_outcome: "", is_coming_soon: true, order_index: "0",
    });
    setSelectedCourse(null);
    setIsEditingCourse(false);
  };

  const openEditCourse = (course: PlatformCourse) => {
    setSelectedCourse(course);
    setIsEditingCourse(true);
    setCourseForm({
      title: course.title,
      description: course.description || "",
      category: course.category,
      level: course.level,
      duration: course.duration || "",
      video_url: course.video_url || "",
      cover_image_url: course.cover_image_url || "",
      video_duration: course.video_duration || "",
      skill_outcome: course.skill_outcome || "",
      is_coming_soon: course.is_coming_soon,
      order_index: String(course.order_index),
    });
    setIsCourseDialogOpen(true);
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const payload = {
      title: courseForm.title,
      description: courseForm.description || null,
      category: courseForm.category,
      level: courseForm.level,
      duration: courseForm.duration || null,
      video_url: courseForm.video_url || null,
      cover_image_url: courseForm.cover_image_url || null,
      video_duration: courseForm.video_duration || null,
      skill_outcome: courseForm.skill_outcome || null,
      is_coming_soon: courseForm.is_coming_soon,
      order_index: parseInt(courseForm.order_index) || 0,
    };

    try {
      if (isEditingCourse && selectedCourse) {
        const { error } = await supabase.from("platform_courses")
          .update(payload).eq("id", selectedCourse.id);
        if (error) throw error;
        toast({ title: "Course updated" });
      } else {
        const { error } = await supabase.from("platform_courses").insert(payload);
        if (error) throw error;
        toast({ title: "Course created" });
      }
      setIsCourseDialogOpen(false);
      resetCourseForm();
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase.from("platform_courses").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Course deleted" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleCoursePublished = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from("platform_courses")
        .update({ is_published: !current }).eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  // --- Module CRUD ---
  const resetModuleForm = () => {
    setModuleForm({
      course_id: "", title: "", description: "", video_url: "",
      video_duration: "", cover_image_url: "", order_index: "0",
      is_free_preview: false,
    });
    setSelectedModule(null);
    setIsEditingModule(false);
  };

  const openEditModule = (mod: CourseModule) => {
    setSelectedModule(mod);
    setIsEditingModule(true);
    setModuleForm({
      course_id: mod.course_id,
      title: mod.title,
      description: mod.description || "",
      video_url: mod.video_url || "",
      video_duration: mod.video_duration || "",
      cover_image_url: mod.cover_image_url || "",
      order_index: String(mod.order_index),
      is_free_preview: mod.is_free_preview,
    });
    setIsModuleDialogOpen(true);
  };

  const handleSaveModule = async () => {
    if (!moduleForm.title || !moduleForm.course_id) {
      toast({ title: "Title and course are required", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const payload = {
      course_id: moduleForm.course_id,
      title: moduleForm.title,
      description: moduleForm.description || null,
      video_url: moduleForm.video_url || null,
      video_duration: moduleForm.video_duration || null,
      cover_image_url: moduleForm.cover_image_url || null,
      order_index: parseInt(moduleForm.order_index) || 0,
      is_free_preview: moduleForm.is_free_preview,
    };

    try {
      if (isEditingModule && selectedModule) {
        const { error } = await supabase.from("platform_course_modules")
          .update(payload).eq("id", selectedModule.id);
        if (error) throw error;
        toast({ title: "Lesson updated" });
      } else {
        const { error } = await supabase.from("platform_course_modules").insert(payload);
        if (error) throw error;
        toast({ title: "Lesson created" });
      }
      setIsModuleDialogOpen(false);
      resetModuleForm();
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteModule = async (id: string) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase.from("platform_course_modules").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Lesson deleted" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(null);
    }
  };

  const toggleModulePublished = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from("platform_course_modules")
        .update({ is_published: !current }).eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: "course" | "module") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const { error } = await supabase.storage.from('module-covers').upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('module-covers').getPublicUrl(path);
      if (target === "course") {
        setCourseForm(prev => ({ ...prev, cover_image_url: publicUrl }));
      } else {
        setModuleForm(prev => ({ ...prev, cover_image_url: publicUrl }));
      }
      toast({ title: "Image uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  // Filters
  const filteredCourses = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === "all" || c.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const filteredModules = moduleViewCourseId === "_all"
    ? modules
    : modules.filter(m => m.course_id === moduleViewCourseId);

  const getCourse = (id: string) => courses.find(c => c.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Course Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, edit, and manage courses and their lessons
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="courses" className="gap-2">
            <BookOpen className="w-4 h-4" /> Courses ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="lessons" className="gap-2">
            <List className="w-4 h-4" /> Lessons ({modules.length})
          </TabsTrigger>
        </TabsList>

        {/* ============ COURSES TAB ============ */}
        <TabsContent value="courses" className="space-y-4 mt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={resetCourseForm}>
                  <Plus className="w-4 h-4" /> Add Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
                  <DialogDescription>
                    {isEditingCourse ? "Update course details" : "Add a new course with Vimeo video"}
                  </DialogDescription>
                </DialogHeader>
                <CourseFormFields form={courseForm} setForm={setCourseForm}
                  isUploading={isUploading} onUpload={e => handleImageUpload(e, "course")} />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCourseDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveCourse} disabled={isSaving}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isEditingCourse ? "Save Changes" : "Create Course"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Badge variant="secondary">{filteredCourses.length} courses</Badge>
          </div>

          {filteredCourses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
                <p className="text-muted-foreground mb-4">Create your first course to get started</p>
                <Button onClick={() => { resetCourseForm(); setIsCourseDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> Create Course
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-center">Lessons</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Live</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map(course => {
                    const lessonCount = modules.filter(m => m.course_id === course.id).length;
                    return (
                      <TableRow key={course.id}>
                        <TableCell className="font-mono text-sm">{course.order_index}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {course.cover_image_url ? (
                              <img src={course.cover_image_url} alt="" className="w-16 h-10 object-cover rounded" />
                            ) : (
                              <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                                <Image className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{course.title}</p>
                              {course.skill_outcome && (
                                <p className="text-xs text-muted-foreground line-clamp-1">{course.skill_outcome}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><Badge variant="outline">{course.category}</Badge></TableCell>
                        <TableCell><Badge variant={
                          course.level === "Beginner" ? "secondary" : course.level === "Intermediate" ? "default" : "destructive"
                        }>{course.level}</Badge></TableCell>
                        <TableCell className="text-center">{lessonCount}</TableCell>
                        <TableCell className="text-center">
                          {course.is_coming_soon ? (
                            <Badge variant="secondary">Coming Soon</Badge>
                          ) : (
                            <Badge variant="default">Active</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch checked={course.is_published}
                            onCheckedChange={() => toggleCoursePublished(course.id, course.is_published)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditCourse(course)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon"
                              onClick={() => handleDeleteCourse(course.id)}
                              disabled={isDeleting === course.id}>
                              {isDeleting === course.id ? (
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
        </TabsContent>

        {/* ============ LESSONS TAB ============ */}
        <TabsContent value="lessons" className="space-y-4 mt-4">
          <div className="flex items-center gap-4">
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
                  <Button className="gap-2" onClick={resetModuleForm}>
                    <Plus className="w-4 h-4" /> Add Lesson
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{isEditingModule ? "Edit Lesson" : "Create New Lesson"}</DialogTitle>
                    <DialogDescription>
                      {isEditingModule ? "Update lesson details" : "Add a new lesson to a course"}
                    </DialogDescription>
                  </DialogHeader>
                  <ModuleFormFields form={moduleForm} setForm={setModuleForm}
                    courses={courses} isUploading={isUploading}
                    onUpload={e => handleImageUpload(e, "module")} />
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveModule} disabled={isSaving}>
                      {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      {isEditingModule ? "Save Changes" : "Create Lesson"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {filteredModules.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Video className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Lessons Yet</h3>
                <p className="text-muted-foreground mb-4">Create a course first, then add lessons</p>
              </CardContent>
            </Card>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Lesson</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-center">Duration</TableHead>
                    <TableHead className="text-center">Preview</TableHead>
                    <TableHead className="text-center">Live</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModules.map(mod => {
                    const course = getCourse(mod.course_id);
                    return (
                      <TableRow key={mod.id}>
                        <TableCell className="font-mono text-sm">{mod.order_index}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {mod.cover_image_url ? (
                              <img src={mod.cover_image_url} alt="" className="w-16 h-10 object-cover rounded" />
                            ) : (
                              <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                                <Video className="w-4 h-4 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{mod.title}</p>
                              {mod.video_url && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Video className="w-3 h-3" /> Video attached
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{course?.title || "Unknown"}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {mod.video_duration ? (
                            <span className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                              <Clock className="w-3 h-3" /> {mod.video_duration}
                            </span>
                          ) : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {mod.is_free_preview ? (
                            <Badge variant="secondary" className="gap-1">
                              <Eye className="w-3 h-3" /> Free
                            </Badge>
                          ) : <span className="text-xs text-muted-foreground">No</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch checked={mod.is_published}
                            onCheckedChange={() => toggleModulePublished(mod.id, mod.is_published)} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditModule(mod)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon"
                              onClick={() => handleDeleteModule(mod.id)}
                              disabled={isDeleting === mod.id}>
                              {isDeleting === mod.id ? (
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

// --- Course Form Component ---
interface CourseFormFieldsProps {
  form: any;
  setForm: (fn: (prev: any) => any) => void;
  isUploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CourseFormFields = ({ form, setForm, isUploading, onUpload }: CourseFormFieldsProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Label>Title *</Label>
        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          placeholder="Course title" />
      </div>
      <div className="col-span-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder="Course description" rows={3} />
      </div>
      <div>
        <Label>Category</Label>
        <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Level</Label>
        <Select value={form.level} onValueChange={v => setForm(p => ({ ...p, level: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Label>Video URL (Vimeo)</Label>
        <Input value={form.video_url} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))}
          placeholder="https://vimeo.com/123456789" />
        <p className="text-xs text-muted-foreground mt-1">Paste a Vimeo URL or embed URL</p>
      </div>
      <div className="col-span-2">
        <Label>Cover Image</Label>
        <div className="flex items-center gap-4 mt-2">
          {form.cover_image_url && (
            <img src={form.cover_image_url} alt="" className="w-32 h-20 object-cover rounded-md" />
          )}
          <div className="flex-1">
            <Input type="file" accept="image/*" onChange={onUpload} disabled={isUploading}
              className="hidden" id="course-cover-upload" />
            <Button type="button" variant="outline"
              onClick={() => document.getElementById('course-cover-upload')?.click()}
              disabled={isUploading} className="gap-2">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload Image
            </Button>
            <Input value={form.cover_image_url} onChange={e => setForm(p => ({ ...p, cover_image_url: e.target.value }))}
              placeholder="https://..." className="mt-2" />
          </div>
        </div>
      </div>
      <div>
        <Label>Duration</Label>
        <Input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))}
          placeholder="e.g. 2h 30m" />
      </div>
      <div>
        <Label>Video Duration</Label>
        <Input value={form.video_duration} onChange={e => setForm(p => ({ ...p, video_duration: e.target.value }))}
          placeholder="10:30" />
      </div>
      <div className="col-span-2">
        <Label>Skill Outcome</Label>
        <Input value={form.skill_outcome} onChange={e => setForm(p => ({ ...p, skill_outcome: e.target.value }))}
          placeholder="What students will learn" />
      </div>
      <div>
        <Label>Order Index</Label>
        <Input type="number" value={form.order_index}
          onChange={e => setForm(p => ({ ...p, order_index: e.target.value }))} />
      </div>
      <div className="flex items-center gap-3 pt-6">
        <Switch checked={form.is_coming_soon}
          onCheckedChange={v => setForm(p => ({ ...p, is_coming_soon: v }))} />
        <Label>Coming Soon</Label>
      </div>
    </div>
  </div>
);

// --- Module/Lesson Form Component ---
interface ModuleFormFieldsProps {
  form: any;
  setForm: (fn: (prev: any) => any) => void;
  courses: PlatformCourse[];
  isUploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ModuleFormFields = ({ form, setForm, courses, isUploading, onUpload }: ModuleFormFieldsProps) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <Label>Course *</Label>
        <Select value={form.course_id || "_none"} onValueChange={v => setForm(p => ({ ...p, course_id: v === "_none" ? "" : v }))}>
          <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
          <SelectContent>
            {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Label>Title *</Label>
        <Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
          placeholder="Lesson title" />
      </div>
      <div className="col-span-2">
        <Label>Description</Label>
        <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          placeholder="Lesson description" rows={3} />
      </div>
      <div className="col-span-2">
        <Label>Video URL (Vimeo)</Label>
        <Input value={form.video_url} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))}
          placeholder="https://vimeo.com/123456789" />
      </div>
      <div className="col-span-2">
        <Label>Cover Image</Label>
        <div className="flex items-center gap-4 mt-2">
          {form.cover_image_url && (
            <img src={form.cover_image_url} alt="" className="w-32 h-20 object-cover rounded-md" />
          )}
          <div className="flex-1">
            <Input type="file" accept="image/*" onChange={onUpload} disabled={isUploading}
              className="hidden" id="lesson-cover-upload" />
            <Button type="button" variant="outline"
              onClick={() => document.getElementById('lesson-cover-upload')?.click()}
              disabled={isUploading} className="gap-2">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload Image
            </Button>
            <Input value={form.cover_image_url} onChange={e => setForm(p => ({ ...p, cover_image_url: e.target.value }))}
              placeholder="https://..." className="mt-2" />
          </div>
        </div>
      </div>
      <div>
        <Label>Video Duration</Label>
        <Input value={form.video_duration} onChange={e => setForm(p => ({ ...p, video_duration: e.target.value }))}
          placeholder="10:30" />
      </div>
      <div>
        <Label>Order Index</Label>
        <Input type="number" value={form.order_index}
          onChange={e => setForm(p => ({ ...p, order_index: e.target.value }))} />
      </div>
      <div className="flex items-center gap-3 col-span-2 pt-2">
        <Switch checked={form.is_free_preview}
          onCheckedChange={v => setForm(p => ({ ...p, is_free_preview: v }))} />
        <Label>Free Preview (accessible without purchase)</Label>
      </div>
    </div>
  </div>
);

export default AdminCourses;
