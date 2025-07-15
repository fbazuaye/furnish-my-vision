
import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { StagingForm } from "@/components/StagingForm";
import { ResultsGallery } from "@/components/ResultsGallery";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { UserProfile } from "@/components/UserProfile";
import { StaticHomePage } from "@/components/StaticHomePage";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export interface StagedImage {
  id: string;
  originalUrl: string;
  stagedUrl: string;
  prompt: string;
  roomType: string;
  style: string;
  timestamp: Date;
  stagingElements?: {
    furniture: string[];
    decor: string[];
    lighting: string[];
    colors: string[];
    materials: string[];
    accessories: string[];
  };
}

const Index = () => {
  const { user, loading } = useAuth();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [stagedImages, setStagedImages] = useState<StagedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <StaticHomePage />;
  }

  if (showProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-4">
          <div className="flex space-x-4">
            <Link to="/">
              <Button variant="ghost">
                ← Back to Home
              </Button>
            </Link>
            <Button 
              onClick={() => setShowProfile(false)} 
              variant="outline"
            >
              ← Back to Staging
            </Button>
          </div>
        </div>
        <UserProfile user={user} onSignOut={() => setShowProfile(false)} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost">
                ← Back to Home
              </Button>
            </Link>
            <h2 className="text-lg font-semibold">Welcome, {user.user_metadata?.full_name || user.email}</h2>
          </div>
          <Button onClick={() => setShowProfile(true)} variant="outline">
            View Profile & Gallery
          </Button>
        </div>
      </div>
      
      <main className="flex-1 container mx-auto px-4 py-8">
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
                  Your Recent Staged Properties
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
      
      <Footer />
    </div>
  );
};

export default Index;
