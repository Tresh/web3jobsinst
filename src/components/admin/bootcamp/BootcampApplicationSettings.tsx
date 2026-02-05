import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import type { ApplicationQuestion, RequiredPostLink } from "@/types/bootcamp";

interface BootcampApplicationSettingsProps {
  bootcampId: string;
  initialQuestions: ApplicationQuestion[] | null;
  initialPostLinks: RequiredPostLink[] | null;
  onSave?: () => void;
}

const BootcampApplicationSettings = ({
  bootcampId,
  initialQuestions,
  initialPostLinks,
  onSave,
}: BootcampApplicationSettingsProps) => {
  const [questions, setQuestions] = useState<ApplicationQuestion[]>(initialQuestions || []);
  const [postLinks, setPostLinks] = useState<RequiredPostLink[]>(initialPostLinks || []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setQuestions(initialQuestions || []);
    setPostLinks(initialPostLinks || []);
  }, [initialQuestions, initialPostLinks]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { id: crypto.randomUUID(), question: "", required: true },
    ]);
  };

  const updateQuestion = (id: string, field: keyof ApplicationQuestion, value: string | boolean) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const addPostLink = () => {
    setPostLinks([
      ...postLinks,
      { id: crypto.randomUUID(), label: "", placeholder: "https://...", required: true },
    ]);
  };

  const updatePostLink = (id: string, field: keyof RequiredPostLink, value: string | boolean) => {
    setPostLinks(postLinks.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removePostLink = (id: string) => {
    setPostLinks(postLinks.filter((p) => p.id !== id));
  };

  const handleSave = async () => {
    // Validate questions
    const validQuestions = questions.filter((q) => q.question.trim() !== "");
    const validLinks = postLinks.filter((p) => p.label.trim() !== "");

    setSaving(true);
    try {
      const { error } = await supabase
        .from("bootcamps")
        .update({
          application_questions: JSON.parse(JSON.stringify(validQuestions)),
          required_post_links: JSON.parse(JSON.stringify(validLinks)),
        })
        .eq("id", bootcampId);

      if (error) throw error;

      toast.success("Application settings saved");
      onSave?.();
    } catch (err: any) {
      toast.error("Failed to save settings", { description: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Custom Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Custom Application Questions</CardTitle>
          <CardDescription>
            Add questions that applicants must answer when applying to your bootcamp.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((q, index) => (
            <div key={q.id} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30">
              <GripVertical className="w-4 h-4 text-muted-foreground mt-3 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="space-y-2">
                  <Label htmlFor={`q-${q.id}`}>Question {index + 1}</Label>
                  <Input
                    id={`q-${q.id}`}
                    value={q.question}
                    onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
                    placeholder="e.g., What's your biggest challenge right now?"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`req-${q.id}`}
                    checked={q.required}
                    onCheckedChange={(checked) => updateQuestion(q.id, "required", checked)}
                  />
                  <Label htmlFor={`req-${q.id}`} className="text-sm font-normal">
                    Required
                  </Label>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive shrink-0"
                onClick={() => removeQuestion(q.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addQuestion}>
            <Plus className="w-4 h-4 mr-2" />
            Add Question
          </Button>
        </CardContent>
      </Card>

      {/* Required Post Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required Post Links</CardTitle>
          <CardDescription>
            Require applicants to submit social media post links (e.g., tweet about the bootcamp).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {postLinks.map((p, index) => (
            <div key={p.id} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/30">
              <GripVertical className="w-4 h-4 text-muted-foreground mt-3 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`label-${p.id}`}>Label</Label>
                    <Input
                      id={`label-${p.id}`}
                      value={p.label}
                      onChange={(e) => updatePostLink(p.id, "label", e.target.value)}
                      placeholder="e.g., Tweet Link"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`placeholder-${p.id}`}>Placeholder</Label>
                    <Input
                      id={`placeholder-${p.id}`}
                      value={p.placeholder}
                      onChange={(e) => updatePostLink(p.id, "placeholder", e.target.value)}
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id={`preq-${p.id}`}
                    checked={p.required}
                    onCheckedChange={(checked) => updatePostLink(p.id, "required", checked)}
                  />
                  <Label htmlFor={`preq-${p.id}`} className="text-sm font-normal">
                    Required
                  </Label>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive shrink-0"
                onClick={() => removePostLink(p.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addPostLink}>
            <Plus className="w-4 h-4 mr-2" />
            Add Required Link
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Save Application Settings
        </Button>
      </div>
    </div>
  );
};

export default BootcampApplicationSettings;
