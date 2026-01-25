import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ECardTemplate } from "./ECardTemplate";
import { useScholarPhotoUpload } from "@/hooks/useScholarPhotoUpload";
import { useECardTaskTracking } from "@/hooks/useECardTaskTracking";
import { generateQuoteTweetUrl, openTwitterShare } from "@/lib/twitterShare";
import { downloadECard } from "@/lib/eCardCanvas";
import { Download, Share2, Upload, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";

interface ECardGeneratorProps {
  scholarName: string;
  programTitle: string;
  pinnedTweetUrl?: string;
}

export function ECardGenerator({
  scholarName,
  programTitle,
  pinnedTweetUrl = "https://twitter.com/web3jobs_inst/status/example",
}: ECardGeneratorProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadPhoto, isUploading, photoUrl, setPhotoUrl } = useScholarPhotoUpload();
  const { trackECardGeneration } = useECardTaskTracking();
  const [isDownloading, setIsDownloading] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const displayPhotoUrl = photoUrl || localPreviewUrl;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create local preview immediately
    const localUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(localUrl);

    // Upload to Supabase
    const uploadedUrl = await uploadPhoto(file);
    if (uploadedUrl) {
      // Clean up local preview URL
      URL.revokeObjectURL(localUrl);
      setLocalPreviewUrl(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Use canvas-based generation for pixel-perfect output
      await downloadECard({
        scholarName,
        programTitle,
        photoUrl: displayPhotoUrl,
      });
      
      // Track e-card generation as task completion
      const trackResult = await trackECardGeneration();
      if (trackResult.submitted) {
        toast.success(`E-Card downloaded! Task submitted for ${trackResult.xpPending} XP review.`);
      } else {
        toast.success("E-Card downloaded successfully!");
      }
    } catch (error) {
      console.error("Error generating e-card:", error);
      toast.error("Failed to generate e-card. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareOnTwitter = () => {
    const tweetText = `🎓 I just got accepted into the ${programTitle}! 

Excited to learn, build, and grow with this amazing community. Let's go! 🚀`;

    const shareUrl = generateQuoteTweetUrl({
      text: tweetText,
      quoteTweetUrl: pinnedTweetUrl,
      hashtags: ["Web3Scholarship", "BuildingTheFuture"],
    });

    openTwitterShare(shareUrl);
  };

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <Card className="border-dashed border-2 border-muted-foreground/25">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex flex-col items-center gap-3">
              {displayPhotoUrl ? (
                <div className="relative">
                  <img
                    src={displayPhotoUrl}
                    alt="Your photo"
                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={handleUploadClick}
                    disabled={isUploading}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div
                  onClick={handleUploadClick}
                  className="w-24 h-24 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors border-4 border-dashed border-muted-foreground/25"
                >
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  ) : (
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  )}
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium">Upload Your Photo</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Add a professional photo for your e-card (max 5MB)
              </p>
            </div>

            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!displayPhotoUrl && (
              <Button
                variant="outline"
                onClick={handleUploadClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Photo
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* E-Card Preview */}
      <div className="flex justify-center">
        <div className="transform scale-[0.6] origin-top md:scale-75 lg:scale-90">
          <ECardTemplate
            ref={cardRef}
            scholarName={scholarName}
            photoUrl={displayPhotoUrl}
            programTitle={programTitle}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          size="lg"
          onClick={handleDownload}
          disabled={isDownloading}
          className="gap-2"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Download E-Card
            </>
          )}
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={handleShareOnTwitter}
          className="gap-2"
        >
          <Share2 className="w-5 h-5" />
          Share on X (Twitter)
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-4 text-center">
        <h4 className="font-medium text-sm mb-2">💡 Earn XP for Sharing!</h4>
        <p className="text-xs text-muted-foreground">
          Download your e-card, share it on X by quoting our pinned post, and submit
          the link in your tasks to earn bonus XP!
        </p>
      </div>
    </div>
  );
}
