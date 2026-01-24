import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function useScholarPhotoUpload() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to upload a photo");
      return null;
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, WebP, or GIF)");
      return null;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be less than 5MB");
      return null;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${user.id}/profile-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("scholar-photos")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("scholar-photos")
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;
      setPhotoUrl(publicUrl);
      toast.success("Photo uploaded successfully!");
      return publicUrl;
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error("Failed to upload photo. Please try again.");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const clearPhoto = () => {
    setPhotoUrl(null);
  };

  return {
    uploadPhoto,
    clearPhoto,
    isUploading,
    photoUrl,
    setPhotoUrl,
  };
}
