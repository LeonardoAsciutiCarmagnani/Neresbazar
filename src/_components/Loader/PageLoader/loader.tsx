import { LucideLoaderCircle } from "lucide-react";

export default function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <LucideLoaderCircle
            size={50}
            className="animate-spin text-amber-600 drop-shadow-lg"
          />
        </div>
        <span className="text-sm font-medium text-gray-500">Carregando...</span>
      </div>
    </div>
  );
}
