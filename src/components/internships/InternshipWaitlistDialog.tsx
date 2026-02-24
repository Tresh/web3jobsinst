import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink, CheckCircle } from "lucide-react";

interface InternshipWaitlistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InternshipWaitlistDialog = ({ open, onOpenChange }: InternshipWaitlistDialogProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tweetUrl, setTweetUrl] = useState("");
  const [loadingTweet, setLoadingTweet] = useState(true);

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [twitterHandle, setTwitterHandle] = useState("");
  const [retweetLink, setRetweetLink] = useState("");
  const [tagProofLink, setTagProofLink] = useState("");

  useEffect(() => {
    if (open) {
      setFullName(profile?.full_name || "");
      setEmail(user?.email || "");
      fetchTweetUrl();
    }
  }, [open, profile, user]);

  const fetchTweetUrl = async () => {
    setLoadingTweet(true);
    const { data } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "internship_waitlist_tweet_url")
      .maybeSingle();
    setTweetUrl(data?.value || "");
    setLoadingTweet(false);
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!fullName.trim() || !email.trim()) {
      toast({ title: "Please fill in your name and email", variant: "destructive" });
      return;
    }
    if (tweetUrl && !retweetLink.trim()) {
      toast({ title: "Please provide your retweet link", variant: "destructive" });
      return;
    }
    if (tweetUrl && !tagProofLink.trim()) {
      toast({ title: "Please provide a link to your comment tagging 2 friends", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("internship_waitlist").insert({
      user_id: user.id,
      full_name: fullName.trim(),
      email: email.trim(),
      telegram_username: telegramUsername.trim() || null,
      twitter_handle: twitterHandle.trim() || null,
      retweet_link: retweetLink.trim() || null,
      tag_proof_link: tagProofLink.trim() || null,
    });

    if (error) {
      if (error.code === "23505") {
        toast({ title: "You've already joined the waitlist", variant: "destructive" });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "You're on the waitlist! 🎉", description: "We'll notify you when your application is reviewed." });
      onOpenChange(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Join Internship Waitlist
          </DialogTitle>
          <DialogDescription>
            Apply to join our internship program. Your application will be reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
          </div>

          <div className="space-y-2">
            <Label>Email *</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>

          <div className="space-y-2">
            <Label>Telegram Username</Label>
            <Input value={telegramUsername} onChange={(e) => setTelegramUsername(e.target.value)} placeholder="@username" />
          </div>

          <div className="space-y-2">
            <Label>Twitter / X Handle</Label>
            <Input value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} placeholder="@handle" />
          </div>

          {/* Tweet tasks */}
          {!loadingTweet && tweetUrl && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">Complete these steps to join:</p>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-sm">Retweet this post</p>
                </div>
                <a
                  href={tweetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 ml-6"
                >
                  Open Post <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Retweet Link *</Label>
                <Input
                  value={retweetLink}
                  onChange={(e) => setRetweetLink(e.target.value)}
                  placeholder="https://x.com/your_handle/status/..."
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                <p className="text-sm">Tag 2 friends in the comment section</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Comment Link (with tags) *</Label>
                <Input
                  value={tagProofLink}
                  onChange={(e) => setTagProofLink(e.target.value)}
                  placeholder="https://x.com/your_handle/status/..."
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading} className="w-full">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InternshipWaitlistDialog;
