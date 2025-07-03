
import { Home } from "lucide-react";

export const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Home className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              StageMaster Pro
            </h1>
            <p className="text-sm text-gray-600">
              Professional Virtual Staging
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
