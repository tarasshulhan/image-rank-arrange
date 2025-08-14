import React, { useState, useCallback } from 'react';

interface ImageItem {
  id: string;
  src: string;
  alt: string;
}

interface TierData {
  S: ImageItem[];
  A: ImageItem[];
  B: ImageItem[];
  C: ImageItem[];
  D: ImageItem[];
}

interface TierConfig {
  name: string;
  color: string;
}

interface TierConfigs {
  S: TierConfig;
  A: TierConfig;
  B: TierConfig;
  C: TierConfig;
  D: TierConfig;
}

interface TierListProps {
  tierData: TierData;
  tierConfigs: TierConfigs;
  onTierUpdate: (newTierData: TierData) => void;
  onImageClick?: (image: ImageItem) => void;
  aspectRatio: 'wide' | 'square' | 'vertical';
}

const TierList: React.FC<TierListProps> = ({ tierData, tierConfigs, onTierUpdate, onImageClick, aspectRatio }) => {
  const [draggedImage, setDraggedImage] = useState<{ image: ImageItem; sourceTier: keyof TierData } | null>(null);

  const tierLabels: Array<keyof TierData> = ['S', 'A', 'B', 'C', 'D'];

  const getAspectRatioClass = (ratio: 'wide' | 'square' | 'vertical') => {
    switch (ratio) {
      case 'wide': return 'aspect-video';
      case 'square': return 'aspect-square';
      case 'vertical': return 'aspect-[3/4]';
      default: return 'aspect-video';
    }
  };

  const handleDragStart = useCallback((image: ImageItem, sourceTier: keyof TierData) => (e: React.DragEvent) => {
    setDraggedImage({ image, sourceTier });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((targetTier: keyof TierData) => (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!draggedImage) return;

    const { image, sourceTier } = draggedImage;
    
    if (sourceTier === targetTier) {
      setDraggedImage(null);
      return;
    }

    const newTierData = { ...tierData };
    
    // Remove from source tier
    newTierData[sourceTier] = newTierData[sourceTier].filter(img => img.id !== image.id);
    
    // Add to target tier
    newTierData[targetTier] = [...newTierData[targetTier], image];
    
    onTierUpdate(newTierData);
    setDraggedImage(null);
  }, [draggedImage, tierData, onTierUpdate]);

  const handleDragEnd = useCallback(() => {
    setDraggedImage(null);
  }, []);

  const handleImageClick = useCallback((image: ImageItem) => {
    if (onImageClick && !draggedImage) {
      onImageClick(image);
    }
  }, [onImageClick, draggedImage]);

  return (
    <div className="space-y-4">
      {tierLabels.map((tier) => (
        <div key={tier} className="flex gap-4">
          <div className={`${tierConfigs[tier].color} text-white font-bold text-lg w-20 h-20 flex flex-col items-center justify-center rounded-lg flex-shrink-0`}>
            <div className="text-xs opacity-75">{tier}</div>
            <div className="text-sm font-semibold truncate w-full text-center px-1">{tierConfigs[tier].name}</div>
          </div>
          <div
            className="flex-1 min-h-[80px] border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 transition-colors hover:border-muted-foreground/50"
            onDragOver={handleDragOver}
            onDrop={handleDrop(tier)}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              {tierData[tier].map((image) => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={handleDragStart(image, tier)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleImageClick(image)}
                  className={`
                    ${getAspectRatioClass(aspectRatio)} bg-muted rounded-lg overflow-hidden cursor-move transition-all duration-200
                    ${draggedImage?.image.id === image.id ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                    hover:scale-105 hover:shadow-lg
                    ${onImageClick ? 'cursor-pointer' : 'cursor-move'}
                  `}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
            {tierData[tier].length === 0 && (
              <div className="text-muted-foreground text-center py-8">
                Drop images here for {tier} tier
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TierList;