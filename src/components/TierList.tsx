import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ImageItem {
  id: string;
  src: string;
  alt: string;
}

interface TierData {
  [key: string]: ImageItem[];
}

interface TierConfig {
  name: string;
  color: string;
}

interface TierConfigs {
  [key: string]: TierConfig;
}

interface TierListProps {
  tierData: TierData;
  tierConfigs: TierConfigs;
  tierOrder: string[];
  unrankedImages: ImageItem[];
  onTierUpdate: (newTierData: TierData) => void;
  onTierConfigUpdate: (tier: string, config: TierConfig) => void;
  onTierRemove: (tier: string) => void;
  onImageClick?: (image: ImageItem) => void;
  onImageMove?: (image: ImageItem) => void;
  aspectRatio: 'wide' | 'square' | 'vertical';
}

const TierList: React.FC<TierListProps> = ({ tierData, tierConfigs, tierOrder, unrankedImages, onTierUpdate, onTierConfigUpdate, onTierRemove, onImageClick, onImageMove, aspectRatio }) => {
  const [draggedImage, setDraggedImage] = useState<{ image: ImageItem; sourceTier: string } | null>(null);
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [tempTierName, setTempTierName] = useState('');

  const availableColors = [
    'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-gray-500',
    'bg-cyan-500', 'bg-lime-500', 'bg-amber-500', 'bg-emerald-500', 'bg-violet-500',
    'bg-rose-500', 'bg-sky-500', 'bg-slate-500', 'bg-zinc-500', 'bg-neutral-500'
  ];

  const getAspectRatioClass = (ratio: 'wide' | 'square' | 'vertical') => {
    switch (ratio) {
      case 'wide': return 'aspect-video';
      case 'square': return 'aspect-square';
      case 'vertical': return 'aspect-[3/4]';
      default: return 'aspect-video';
    }
  };

  const handleDragStart = useCallback((image: ImageItem, sourceTier: string) => (e: React.DragEvent) => {
    setDraggedImage({ image, sourceTier });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((targetTier: string) => (e: React.DragEvent) => {
    e.preventDefault();
    
    const imageId = e.dataTransfer.getData('image-id');
    const source = e.dataTransfer.getData('source');
    
    if (source === 'unranked') {
      // Moving from unranked to tier
      const image = unrankedImages.find(img => img.id === imageId);
      if (image && onImageMove) {
        // Create a temporary drag state to move to specific tier
        setDraggedImage({ image, sourceTier: 'unranked' });
        
        const newTierData = { ...tierData };
        newTierData[targetTier] = [...(newTierData[targetTier] || []), image];
        onTierUpdate(newTierData);
        onImageMove(image);
        setDraggedImage(null);
      }
      return;
    }
    
    if (!draggedImage) return;

    const { image, sourceTier } = draggedImage;
    
    if (sourceTier === targetTier) {
      setDraggedImage(null);
      return;
    }

    const newTierData = { ...tierData };
    
    // Remove from source tier
    newTierData[sourceTier] = (newTierData[sourceTier] || []).filter(img => img.id !== image.id);
    
    // Add to target tier
    newTierData[targetTier] = [...(newTierData[targetTier] || []), image];
    
    onTierUpdate(newTierData);
    setDraggedImage(null);
  }, [draggedImage, tierData, onTierUpdate]);

  const handleDragEnd = useCallback(() => {
    setDraggedImage(null);
  }, []);

  const handleImageClick = useCallback((image: ImageItem) => {
    if (onImageClick && !draggedImage && !editingTier) {
      onImageClick(image);
    }
  }, [onImageClick, draggedImage, editingTier]);

  const handleTierClick = useCallback((tier: string) => {
    if (!draggedImage) {
      setEditingTier(tier);
      setTempTierName(tierConfigs[tier].name);
    }
  }, [draggedImage, tierConfigs]);

  const handleTierNameChange = useCallback((value: string) => {
    setTempTierName(value);
  }, []);

  const handleTierNameSave = useCallback(() => {
    if (editingTier && tempTierName.trim()) {
      onTierConfigUpdate(editingTier, { ...tierConfigs[editingTier], name: tempTierName.trim() });
    }
    setEditingTier(null);
    setTempTierName('');
  }, [editingTier, tempTierName, onTierConfigUpdate, tierConfigs]);

  const handleTierNameCancel = useCallback(() => {
    setEditingTier(null);
    setTempTierName('');
  }, []);

  const handleColorChange = useCallback((tier: string, color: string) => {
    onTierConfigUpdate(tier, { ...tierConfigs[tier], color });
  }, [onTierConfigUpdate, tierConfigs]);

  return (
    <div className="space-y-4">
      {tierOrder.map((tier) => (
        <div key={tier} className="flex gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div 
                className={`${tierConfigs[tier]?.color || 'bg-gray-500'} text-white font-bold text-lg w-20 h-20 flex flex-col items-center justify-center rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => handleTierClick(tier)}
              >
                {tierConfigs[tier]?.name === tier.split('-')[0].toUpperCase() ? (
                  <div className="text-2xl">{tierConfigs[tier]?.name}</div>
                ) : (
                  <div className="text-sm font-semibold truncate w-full text-center px-1">{tierConfigs[tier]?.name}</div>
                )}
              </div>
              {tierOrder.length > 2 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onTierRemove(tier)}
                  className="h-8 w-8 p-0"
                >
                  ×
                </Button>
              )}
            </div>
            {editingTier === tier && (
              <div className="w-20 space-y-2">
                <Input
                  value={tempTierName}
                  onChange={(e) => handleTierNameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTierNameSave();
                    if (e.key === 'Escape') handleTierNameCancel();
                  }}
                  className="text-xs h-8"
                  placeholder="Name"
                  autoFocus
                />
                <div className="flex flex-wrap gap-1">
                  {availableColors.map((color) => (
                    <button
                      key={color}
                      className={`w-4 h-4 rounded-full border ${color} ${tierConfigs[tier]?.color === color ? 'border-white border-2' : 'border-gray-300'}`}
                      onClick={() => handleColorChange(tier, color)}
                      aria-label={`Set tier color to ${color}`}
                    />
                  ))}
                </div>
                <div className="flex gap-1">
                  <Button size="sm" className="text-xs h-6 px-2" onClick={handleTierNameSave}>Save</Button>
                  <Button size="sm" variant="outline" className="text-xs h-6 px-2" onClick={handleTierNameCancel}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
          <div
            className="flex-1 min-h-[80px] border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 transition-colors hover:border-muted-foreground/50"
            onDragOver={handleDragOver}
            onDrop={handleDrop(tier)}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              {(tierData[tier] || []).map((image) => (
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
            {(tierData[tier] || []).length === 0 && (
              <div className="text-muted-foreground text-center py-8">
                Drop images here for {tierConfigs[tier]?.name || 'this tier'}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TierList;