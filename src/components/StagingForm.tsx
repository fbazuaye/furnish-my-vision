
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Wand2 } from "lucide-react";
import { StagedImage } from "@/pages/Index";

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
  const [apiKey, setApiKey] = useState("");

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

    if (!apiKey.trim()) {
      toast.error("Please enter your Runware API key");
      return;
    }

    setIsProcessing(true);
    
    try {
      const prompt = generatePrompt();
      
      // Call Runware API to generate the staged image
      const response = await fetch('https://api.runware.ai/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            taskType: "authentication",
            apiKey: apiKey
          },
          {
            taskType: "imageInference",
            taskUUID: crypto.randomUUID(),
            positivePrompt: prompt,
            width: 1024,
            height: 1024,
            model: "runware:100@1",
            numberResults: 1,
            outputFormat: "WEBP",
            CFGScale: 1,
            scheduler: "FlowMatchEulerDiscreteScheduler",
            strength: 0.8
          }
        ])
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error || result.errors) {
        throw new Error(result.errorMessage || result.errors?.[0]?.message || "Failed to generate image");
      }

      const imageData = result.data?.find((item: any) => item.taskType === "imageInference");
      
      if (!imageData?.imageURL) {
        throw new Error("No image was generated");
      }
      
      const stagedImage: StagedImage = {
        id: Date.now().toString(),
        originalUrl: imageUrl,
        stagedUrl: imageData.imageURL,
        prompt: prompt,
        roomType: roomTypes.find(r => r.value === roomType)?.label || roomType,
        style: styles.find(s => s.value === style)?.label || style,
        timestamp: new Date(),
      };

      onStaging(stagedImage);
      toast.success("Room staged successfully!");
    } catch (error) {
      console.error("Staging error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to stage room. Please try again.");
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
            <div className="space-y-2">
              <Label htmlFor="api-key">Runware API Key</Label>
              <Input
                id="api-key"
                type="password"
                placeholder="Enter your Runware API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Get your API key from{" "}
                <a 
                  href="https://runware.ai" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  runware.ai
                </a>
              </p>
            </div>

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
              disabled={isProcessing || !roomType || !style || !apiKey.trim()}
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
