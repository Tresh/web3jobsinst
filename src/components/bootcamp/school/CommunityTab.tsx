import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  MessageSquare,
  Heart,
  Send,
  Pin,
  Megaphone,
  Trophy,
  HelpCircle,
  Sparkles,
  Loader2,
  Plus,
  Image as ImageIcon,
  ChevronRight,
} from "lucide-react";
import type { Bootcamp, BootcampTask, BootcampTaskSubmission } from "@/types/bootcamp";
import { useBootcampCommunityTopics, useBootcampTopicMessages } from "@/hooks/useBootcampCommunity";
import BootcampAICoach from "../BootcampAICoach";

interface CommunityPost {
  id: string;
  bootcamp_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  title: string;
  content: string;
  category: string;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

interface CommunityTabProps {
  bootcamp: Bootcamp;
  isHost: boolean;
  currentDay: number;
  tasks: BootcampTask[];
  submissions: BootcampTaskSubmission[];
  onSubmitTask: (taskId: string, text?: string, url?: string) => Promise<{ success: boolean; error?: string }>;
  refetch: () => void;
}

const categories = [
  { id: "announcements", label: "📢 Announcements", icon: <Megaphone className="w-4 h-4" />, hostOnly: true },
  { id: "wins", label: "🏆 Wins", icon: <Trophy className="w-4 h-4" />, hostOnly: false },
  { id: "challenges", label: "💪 Challenges", icon: <Sparkles className="w-4 h-4" />, hostOnly: false },
  { id: "introductions", label: "👋 Introductions", icon: <Heart className="w-4 h-4" />, hostOnly: false },
  { id: "help", label: "❓ Help", icon: <HelpCircle className="w-4 h-4" />, hostOnly: false },
];

const CommunityTab = ({
  bootcamp,
  isHost,
  currentDay,
  tasks,
  submissions,
  onSubmitTask,
  refetch,
}: CommunityTabProps) => {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showNewPost, setShowNewPost] = useState(false);
  const [showAICoach, setShowAICoach] = useState(false);
  const [showChatRoom, setShowChatRoom] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "wins" });
  const [posting, setPosting] = useState(false);

  const { topics, loading: loadingTopics } = useBootcampCommunityTopics(bootcamp.id);

  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, [bootcamp.id, selectedCategory]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("bootcamp_messages")
        .select("*")
        .eq("bootcamp_id", bootcamp.id)
        .eq("message_type", "post")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(50);

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform messages to posts format
      const transformedPosts: CommunityPost[] = (data || []).map((msg: any) => ({
        id: msg.id,
        bootcamp_id: msg.bootcamp_id,
        user_id: msg.user_id,
        user_name: msg.user_name,
        user_avatar: msg.user_avatar,
        title: msg.message.split("\n")[0] || "",
        content: msg.message.split("\n").slice(1).join("\n") || "",
        category: msg.topic_id || "general",
        is_pinned: msg.is_pinned,
        likes_count: 0,
        comments_count: 0,
        created_at: msg.created_at,
      }));
      
      setPosts(transformedPosts);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setPosting(true);
    try {
      const { error } = await supabase.from("bootcamp_messages").insert({
        bootcamp_id: bootcamp.id,
        user_id: user?.id,
        user_name: profile?.full_name || "Anonymous",
        user_avatar: profile?.avatar_url,
        message: `${newPost.title}\n${newPost.content}`,
        message_type: "post",
        topic_id: null,
        is_pinned: isHost && newPost.category === "announcements",
      });

      if (error) throw error;

      toast.success("Post created!");
      setShowNewPost(false);
      setNewPost({ title: "", content: "", category: "wins" });
      fetchPosts();
    } catch (err) {
      toast.error("Failed to create post");
    } finally {
      setPosting(false);
    }
  };

  const filteredPosts = selectedCategory
    ? posts.filter((p) => p.category === selectedCategory)
    : posts;

  const pinnedPosts = filteredPosts.filter((p) => p.is_pinned);
  const regularPosts = filteredPosts.filter((p) => !p.is_pinned);

  // Get today's pending tasks
  const todayTasks = tasks.filter((t) => t.day_number === currentDay);
  const pendingTasks = todayTasks.filter((task) => {
    const sub = submissions.find((s) => s.task_id === task.id);
    return !sub || sub.status !== "approved";
  });

  return (
    <div className="pb-24">
      {/* Quick Actions Bar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="px-4 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {pendingTasks.length > 0 && (
            <Badge className="bg-primary text-primary-foreground shrink-0">
              {pendingTasks.length} tasks pending
            </Badge>
          )}
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={() => setShowAICoach(true)}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            AI Coach
          </Button>
        </div>

        {/* Category Filters */}
        <div className="px-4 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedCategory === null
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Rooms Section */}
      {topics.length > 0 && !selectedCategory && (
        <div className="px-4 py-4 border-b">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">💬 Chat Rooms</h3>
          <div className="grid grid-cols-2 gap-2">
            {topics.slice(0, 4).map((topic) => (
              <button
                key={topic.id}
                onClick={() => setShowChatRoom(topic.id)}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left"
              >
                <span className="text-lg">{topic.icon || "💬"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{topic.title}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pinned Posts */}
      {pinnedPosts.length > 0 && (
        <div className="px-4 py-4 border-b bg-primary/5">
          <h3 className="text-sm font-medium text-primary mb-3 flex items-center gap-2">
            <Pin className="w-4 h-4" /> Pinned
          </h3>
          <div className="space-y-3">
            {pinnedPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : regularPosts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground/70">Be the first to share something!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {regularPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* New Post FAB */}
      <div className="fixed bottom-20 right-4 z-40">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg"
          onClick={() => setShowNewPost(true)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>

      {/* New Post Dialog */}
      <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={newPost.category}
                onValueChange={(value) => setNewPost({ ...newPost, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((cat) => !cat.hostOnly || isHost)
                    .map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="What's on your mind?"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                placeholder="Share your thoughts, wins, or questions..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPost(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePost} disabled={posting}>
              {posting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Coach Dialog */}
      <BootcampAICoach 
        open={showAICoach} 
        onOpenChange={setShowAICoach} 
        bootcamp={bootcamp} 
        currentDay={currentDay} 
      />
    </div>
  );
};

// Post Card Component
const PostCard = ({ post }: { post: CommunityPost }) => {
  const [liked, setLiked] = useState(false);
  const timeAgo = getTimeAgo(post.created_at);

  const categoryInfo = categories.find((c) => c.id === post.category);

  return (
    <div className="p-4 rounded-xl bg-card border border-border/50">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post.user_avatar || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {post.user_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm">{post.user_name}</p>
            {categoryInfo && (
              <Badge variant="secondary" className="text-xs">
                {categoryInfo.label}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{timeAgo}</p>
        </div>
        {post.is_pinned && (
          <Pin className="w-4 h-4 text-primary shrink-0" />
        )}
      </div>

      {/* Content */}
      <div className="mb-3">
        <h4 className="font-medium mb-1">{post.title}</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-border/50">
        <button
          onClick={() => setLiked(!liked)}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? "text-red-500" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          <span>{post.likes_count + (liked ? 1 : 0)}</span>
        </button>
        <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <MessageSquare className="w-4 h-4" />
          <span>{post.comments_count}</span>
        </button>
      </div>
    </div>
  );
};

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

export default CommunityTab;
