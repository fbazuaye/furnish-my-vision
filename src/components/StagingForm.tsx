
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Wand2 } from "lucide-react";
import { StagedImage } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";

interface StagingFormProps {
  imageUrl: string;
  onStaging: (stagedImage: StagedImage) => void;
  onStartOver: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export const StagingForm = ({ 
  imageUrl, 
  onStaging, 
  onStartOver, 
  isProcessing, 
  setIsProcessing 
}: StagingFormProps) => {
  const [roomType, setRoomType] = useState("");
  const [style, setStyle] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const roomTypes = [
    { value: "living-room", label: "Living Room" },
    { value: "bedroom", label: "Bedroom" },
    { value: "kitchen", label: "Kitchen" },
    { value: "dining-room", label: "Dining Room" },
    { value: "office", label: "Home Office" },
    { value: "bathroom", label: "Bathroom" },
  ];

  const styles = [
    { value: "modern", label: "Modern" },
    { value: "traditional", label: "Traditional" },
    { value: "minimalist", label: "Minimalist" },
    { value: "scandinavian", label: "Scandinavian" },
    { value: "industrial", label: "Industrial" },
    { value: "bohemian", label: "Bohemian" },
  ];

  const generatePrompt = () => {
    if (customPrompt.trim()) {
      return customPrompt;
    }
    
    const roomLabel = roomTypes.find(r => r.value === roomType)?.label || roomType;
    const styleLabel = styles.find(s => s.value === style)?.label || style;
    
    return `Transform this empty room into a beautifully furnished ${styleLabel.toLowerCase()} ${roomLabel.toLowerCase()}. Add appropriate furniture, decor, and styling that matches the ${styleLabel.toLowerCase()} aesthetic. Ensure the furniture placement looks natural and the lighting is warm and inviting.`;
  };

  const handleStaging = async () => {
    if (!roomType || !style) {
      toast.error("Please select both room type and style");
      return;
    }

    setIsProcessing(true);
    
    try {
      const prompt = generatePrompt();
      
      const { data, error } = await supabase.functions.invoke('generate-staged-image', {
        body: {
          originalImageUrl: imageUrl,
          prompt: prompt,
          roomType: roomTypes.find(r => r.value === roomType)?.label || roomType,
          style: styles.find(s => s.value === style)?.label || style
        }
      });

      if (error) throw error;

      const stagedImage: StagedImage = {
        id: data.id,
        originalUrl: data.originalUrl,
        stagedUrl: data.stagedUrl,
        prompt: data.prompt,
        roomType: data.roomType,
        style: data.style,
        timestamp: data.timestamp,
      };

      onStaging(stagedImage);
      toast.success("Room staged successfully!");
    } catch (error: any) {
      console.error("Staging error:", error);
      toast.error(error.message || "Failed to stage room. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={onStartOver}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Upload Different Image
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original Image */}
        <Card>
          <CardHeader>
            <CardTitle>Original Room</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={imageUrl}
              alt="Original room"
              className="w-full h-64 object-cover rounded-lg"
            />
          </CardContent>
        </Card>

        {/* Staging Options */}
        <Card>
          <CardHeader>
            <CardTitle>Staging Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room-type">Room Type</Label>
                <Select value={roomType} onValueChange={setRoomType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((room) => (
                      <SelectItem key={room.value} value={room.value}>
                        {room.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Furniture Style</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    {styles.map((styleOption) => (
                      <SelectItem key={styleOption.value} value={styleOption.value}>
                        {styleOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-prompt">Custom Instructions (Optional)</Label>
              <Textarea
                id="custom-prompt"
                placeholder="Add specific furniture or styling requests..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleStaging}
              disabled={isProcessing || !roomType || !style}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isProcessing ? "Staging Room..." : "Stage Room"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview of generated prompt */}
      {(roomType && style) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>AI Prompt Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 italic">{generatePrompt()}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
