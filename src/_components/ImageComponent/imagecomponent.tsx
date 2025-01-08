import React, { useState } from "react";
import LazyLoad from "react-lazyload";
import { ImageOff } from "lucide-react";

interface OptimizedProductImageProps {
  /** URL da imagem do produto */
  src: string | null | undefined;
  /** Texto alternativo para acessibilidade */
  alt: string;
  /** Classes CSS adicionais para a imagem */
  className?: string;
  /** Callback executado quando a imagem termina de carregar */
  onLoadComplete?: () => void;
  /** Altura personalizada para o componente (opcional) */
  height?: "sm" | "md" | "lg" | number;
}

const OptimizedProductImage: React.FC<OptimizedProductImageProps> = ({
  src,
  alt,
  className = "",
  onLoadComplete = () => {},
  height = "md",
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);

  // Converter altura para pixels baseado no tamanho definido
  const getHeight = (): number => {
    if (typeof height === "number") return height;

    const heightMap: Record<string, number> = {
      sm: 112, // h-28
      md: 128, // h-32
      lg: 144, // h-36
    };

    return heightMap[height] || heightMap.md;
  };

  const handleLoad = (): void => {
    setIsLoading(false);
    onLoadComplete();
  };

  const handleError = (): void => {
    setIsLoading(false);
    setHasError(true);
  };

  if (!src) {
    return (
      <div
        className="flex w-full items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-500"
        style={{ height: `${getHeight()}px` }}
      >
        Sem imagem
      </div>
    );
  }

  return (
    <LazyLoad height={getHeight()} offset={100} once className="w-full">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100">
        <div className="absolute inset-0">
          {isLoading && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
          )}

          {hasError ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-100 p-4">
              <ImageOff className="h-6 w-6 text-gray-400" />
              <span className="text-center text-sm text-gray-500">
                Erro ao carregar imagem
              </span>
            </div>
          ) : (
            <div className="relative h-full w-full">
              <img
                src={src}
                alt={alt}
                className={`absolute inset-0 h-full w-full object-cover object-center transition-all duration-300 ${
                  isLoading
                    ? "scale-105 blur-sm opacity-0"
                    : "scale-100 blur-0 opacity-100"
                } ${className}`}
                onLoad={handleLoad}
                onError={handleError}
              />
            </div>
          )}
        </div>
      </div>
    </LazyLoad>
  );
};

export default OptimizedProductImage;
