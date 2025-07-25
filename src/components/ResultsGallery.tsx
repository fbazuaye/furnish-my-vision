
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { StagedImage } from "@/pages/Index";
import { StagingBreakdown } from "@/components/StagingBreakdown";
import { toast } from "sonner";
import { useState } from "react";

interface ResultsGalleryProps {
  images: StagedImage[];
}

export const ResultsGallery = ({ images }: ResultsGalleryProps) => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleExpanded = (imageId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(imageId)) {
      newExpanded.delete(imageId);
    } else {
      newExpanded.add(imageId);
    }
    setExpandedCards(newExpanded);
  };

  const handleDownload = async (image: StagedImage) => {
    try {
      const response = await fetch(image.stagedUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `staged-${image.roomType}-${image.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={image.stagedUrl}
                alt={`Staged ${image.roomType}`}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownload(image)}
                  className="bg-white/90 hover:bg-white"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="secondary">{image.roomType}</Badge>
                  <Badge variant="outline">{image.style}</Badge>
                </div>
                {image.stagingElements && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleExpanded(image.id)}
                    className="p-1 h-8 w-8"
                  >
                    {expandedCards.has(image.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2">
                {image.prompt}
              </p>
              
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                {image.timestamp.toLocaleDateString()}
              </div>

              {image.stagingElements && expandedCards.has(image.id) && (
                <StagingBreakdown 
                  stagingElements={image.stagingElements}
                  roomType={image.roomType}
                  style={image.style}
                />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
