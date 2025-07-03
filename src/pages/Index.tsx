
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { StagingForm } from "@/components/StagingForm";
import { ResultsGallery } from "@/components/ResultsGallery";
import { Header } from "@/components/Header";

export interface StagedImage {
  id: string;
  originalUrl: string;
  stagedUrl: string;
  prompt: string;
  roomType: string;
  style: string;
  timestamp: Date;
}

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl);
  };

  const handleStaging = (stagedImage: StagedImage) => {
    setStagedImages(prev => [stagedImage, ...prev]);
    setUploadedImage(null); // Reset for next upload
  };

  const handleStartOver = () => {
    setUploadedImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {!uploadedImage ? (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                AI-Powered Virtual Staging
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Transform empty rooms into beautifully furnished spaces with AI. 
                Upload a photo and watch as we stage it with professional furniture.
              </p>
            </div>
            
            <ImageUpload onImageUpload={handleImageUpload} />
            
            {stagedImages.length > 0 && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  Your Staged Properties
                </h2>
                <ResultsGallery images={stagedImages} />
              </div>
            )}
          </>
        ) : (
          <StagingForm
            imageUrl={uploadedImage}
            onStaging={handleStaging}
            onStartOver={handleStartOver}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
