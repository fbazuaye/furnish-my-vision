import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sofa, Palette, Lightbulb, Hammer, Star, Gift } from "lucide-react";

interface StagingElements {
  furniture: string[];
  decor: string[];
  lighting: string[];
  colors: string[];
  materials: string[];
  accessories: string[];
}

interface StagingBreakdownProps {
  stagingElements: StagingElements;
  roomType: string;
  style: string;
}

export const StagingBreakdown = ({ stagingElements, roomType, style }: StagingBreakdownProps) => {
  const sections = [
    {
      title: "Furniture",
      items: stagingElements.furniture,
      icon: Sofa,
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    },
    {
      title: "Decor",
      items: stagingElements.decor,
      icon: Star,
      color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    },
    {
      title: "Lighting",
      items: stagingElements.lighting,
      icon: Lightbulb,
      color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    },
    {
      title: "Colors",
      items: stagingElements.colors,
      icon: Palette,
      color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
    },
    {
      title: "Materials",
      items: stagingElements.materials,
      icon: Hammer,
      color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    },
    {
      title: "Accessories",
      items: stagingElements.accessories,
      icon: Gift,
      color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    }
  ];

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sofa className="w-5 h-5" />
          Staging Breakdown - {roomType} ({style})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sections.map((section, index) => {
          if (!section.items || section.items.length === 0) return null;
          
          const Icon = section.icon;
          
          return (
            <div key={section.title}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
                <h4 className="font-medium text-sm">{section.title}</h4>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {section.items.map((item, itemIndex) => (
                  <Badge 
                    key={itemIndex} 
                    variant="secondary" 
                    className={`text-xs ${section.color}`}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
              {index < sections.length - 1 && <Separator className="mt-3" />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};