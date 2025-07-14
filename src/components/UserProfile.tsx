import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

  interface StagedImage {
    id: string;
    original_image_url: string;
    staged_image_url: string;
    prompt: string;
    room_type: string;
    style: string;
    created_at: string;
    staging_furniture?: string[];
    staging_decor?: string[];
    staging_lighting?: string[];
    staging_colors?: string[];
    staging_materials?: string[];
    staging_accessories?: string[];
  }

interface UserProfileProps {
  user: User;
  onSignOut: () => void;
}

export const UserProfile = ({ user, onSignOut }: UserProfileProps) => {
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStagedImages();
  }, []);

  const fetchStagedImages = async () => {
    try {
      const { data, error } = await supabase
        .from('staged_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStagedImages(data || []);
    } catch (error: any) {
      toast.error("Failed to load your images");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      onSignOut();
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>{getInitials(user.email || "U")}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.user_metadata?.full_name || "User"}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Generated Images */}
        <Card>
          <CardHeader>
            <CardTitle>Your Staged Images</CardTitle>
            <CardDescription>
              {stagedImages.length} image{stagedImages.length !== 1 ? 's' : ''} generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">Loading your images...</div>
            ) : stagedImages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No images generated yet. Start by uploading a room photo!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stagedImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="aspect-square relative">
                      <img
                        src={image.staged_image_url}
                        alt={`Staged ${image.room_type}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{image.room_type}</h3>
                      <p className="text-sm text-muted-foreground mb-2">Style: {image.style}</p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(image.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-sm">{image.prompt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};