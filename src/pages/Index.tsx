
import React, { useState, useRef, useCallback, useEffect } from 'react';
import ImageUploader from '@/components/ImageUploader';
import RankingGrid from '@/components/RankingGrid';
import TierList from '@/components/TierList';
import ExportButton from '@/components/ExportButton';
import { Button } from '@/components/ui/button';
import { X, RectangleHorizontal, List, Grid3X3 } from 'lucide-react';

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

type AspectRatio = 'wide' | 'square' | 'vertical';
type AppMode = 'ranking' | 'tierlist';

const Index = () => {
  const [unrankedImages, setUnrankedImages] = useState<ImageItem[]>([]);
  const [rankedImages, setRankedImages] = useState<ImageItem[]>([]);
  const [tierData, setTierData] = useState<TierData>({
    'tier-1': [],
    'tier-2': [],
    'tier-3': [],
    'tier-4': [],
    'tier-5': []
  });
  const [tierConfigs, setTierConfigs] = useState<TierConfigs>({
    'tier-1': { name: 'S', color: 'bg-red-500' },
    'tier-2': { name: 'A', color: 'bg-orange-500' },
    'tier-3': { name: 'B', color: 'bg-yellow-500' },
    'tier-4': { name: 'C', color: 'bg-green-500' },
    'tier-5': { name: 'D', color: 'bg-blue-500' }
  });
  const [tierOrder, setTierOrder] = useState<string[]>(['tier-1', 'tier-2', 'tier-3', 'tier-4', 'tier-5']);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('wide');
  const [mode, setMode] = useState<AppMode>('ranking');
  const exportRef = useRef<HTMLDivElement>(null);
  const additionalUploadRef = useRef<HTMLInputElement>(null);

  // Load images from localStorage on mount
  useEffect(() => {
    const savedUnranked = localStorage.getItem('ranking-app-unranked');
    const savedRanked = localStorage.getItem('ranking-app-ranked');
    const savedTierData = localStorage.getItem('ranking-app-tierdata');
    const savedTierConfigs = localStorage.getItem('ranking-app-tierconfigs');
    const savedTierOrder = localStorage.getItem('ranking-app-tierorder');
    
    if (savedUnranked) {
      try {
        setUnrankedImages(JSON.parse(savedUnranked));
      } catch (error) {
        console.error('Error loading unranked images:', error);
      }
    }
    
    if (savedRanked) {
      try {
        setRankedImages(JSON.parse(savedRanked));
      } catch (error) {
        console.error('Error loading ranked images:', error);
      }
    }
    
    if (savedTierData) {
      try {
        setTierData(JSON.parse(savedTierData));
      } catch (error) {
        console.error('Error loading tier data:', error);
      }
    }
    
    if (savedTierConfigs) {
      try {
        setTierConfigs(JSON.parse(savedTierConfigs));
      } catch (error) {
        console.error('Error loading tier configs:', error);
      }
    }
    
    if (savedTierOrder) {
      try {
        setTierOrder(JSON.parse(savedTierOrder));
      } catch (error) {
        console.error('Error loading tier order:', error);
      }
    }
  }, []);

  // Save to localStorage whenever images change
  useEffect(() => {
    localStorage.setItem('ranking-app-unranked', JSON.stringify(unrankedImages));
  }, [unrankedImages]);

  useEffect(() => {
    localStorage.setItem('ranking-app-ranked', JSON.stringify(rankedImages));
  }, [rankedImages]);

  useEffect(() => {
    localStorage.setItem('ranking-app-tierdata', JSON.stringify(tierData));
  }, [tierData]);

  useEffect(() => {
    localStorage.setItem('ranking-app-tierconfigs', JSON.stringify(tierConfigs));
  }, [tierConfigs]);

  useEffect(() => {
    localStorage.setItem('ranking-app-tierorder', JSON.stringify(tierOrder));
  }, [tierOrder]);

  const toggleAspectRatio = useCallback(() => {
    setAspectRatio(prev => {
      switch (prev) {
        case 'wide': return 'square';
        case 'square': return 'vertical';
        case 'vertical': return 'wide';
        default: return 'wide';
      }
    });
  }, []);

  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'ranking' ? 'tierlist' : 'ranking');
  }, []);

  const updateTierConfig = useCallback((tier: string, config: TierConfig) => {
    setTierConfigs(prev => ({
      ...prev,
      [tier]: config
    }));
  }, []);

  const addTier = useCallback(() => {
    const newTierId = `tier-${Date.now()}`;
    const newTierName = String.fromCharCode(65 + tierOrder.length); // A, B, C, etc.
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-blue-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-gray-500',
      'bg-cyan-500', 'bg-lime-500', 'bg-amber-500', 'bg-emerald-500', 'bg-violet-500'
    ];
    const newColor = colors[tierOrder.length % colors.length];
    
    setTierOrder(prev => [...prev, newTierId]);
    setTierConfigs(prev => ({
      ...prev,
      [newTierId]: { name: newTierName, color: newColor }
    }));
    setTierData(prev => ({
      ...prev,
      [newTierId]: []
    }));
  }, [tierOrder]);

  const removeTier = useCallback((tierId: string) => {
    if (tierOrder.length <= 2) return; // Minimum 2 tiers
    
    // Move images from removed tier to unranked
    const imagesInTier = tierData[tierId] || [];
    setUnrankedImages(prev => [...prev, ...imagesInTier]);
    
    // Remove from order, configs, and data
    setTierOrder(prev => prev.filter(id => id !== tierId));
    setTierConfigs(prev => {
      const newConfigs = { ...prev };
      delete newConfigs[tierId];
      return newConfigs;
    });
    setTierData(prev => {
      const newData = { ...prev };
      delete newData[tierId];
      return newData;
    });
  }, [tierOrder, tierData]);

  const getAspectRatioClass = (ratio: AspectRatio) => {
    switch (ratio) {
      case 'wide': return 'aspect-video';
      case 'square': return 'aspect-square';
      case 'vertical': return 'aspect-[3/4]';
      default: return 'aspect-video';
    }
  };

  const handleImagesUpload = useCallback((files: File[]) => {
    const newImages: ImageItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      src: URL.createObjectURL(file),
      alt: file.name
    }));
    
    setUnrankedImages(prev => [...prev, ...newImages]);
  }, []);

  const handleReorder = useCallback((newOrder: ImageItem[]) => {
    setRankedImages(newOrder);
  }, []);

  const handleTierUpdate = useCallback((newTierData: TierData) => {
    setTierData(newTierData);
  }, []);

  const moveToRanking = useCallback((image: ImageItem) => {
    setUnrankedImages(prev => prev.filter(img => img.id !== image.id));
    if (mode === 'ranking') {
      setRankedImages(prev => [...prev, image]);
    } else {
      // Add to first tier
      const firstTier = tierOrder[0];
      if (firstTier) {
        setTierData(prev => ({ ...prev, [firstTier]: [...(prev[firstTier] || []), image] }));
      }
    }
  }, [mode, tierOrder]);

  const moveToUnranked = useCallback((image: ImageItem) => {
    if (mode === 'ranking') {
      setRankedImages(prev => prev.filter(img => img.id !== image.id));
    } else {
      // Remove from all tiers
      setTierData(prev => {
        const newData = { ...prev };
        for (const tierId of tierOrder) {
          newData[tierId] = (newData[tierId] || []).filter(img => img.id !== image.id);
        }
        return newData;
      });
    }
    setUnrankedImages(prev => [...prev, image]);
  }, [mode, tierOrder]);

  const clearAll = useCallback(() => {
    // Clean up object URLs to prevent memory leaks
    const allTierImages = Object.values(tierData).flat();
    [...unrankedImages, ...rankedImages, ...allTierImages].forEach(image => {
      URL.revokeObjectURL(image.src);
    });
    setUnrankedImages([]);
    setRankedImages([]);
    
    // Reset to default tiers
    const defaultTierData: TierData = {};
    const defaultTierOrder = ['tier-1', 'tier-2', 'tier-3', 'tier-4', 'tier-5'];
    defaultTierOrder.forEach(tierId => {
      defaultTierData[tierId] = [];
    });
    setTierData(defaultTierData);
    setTierOrder(defaultTierOrder);
    setTierConfigs({
      'tier-1': { name: 'S', color: 'bg-red-500' },
      'tier-2': { name: 'A', color: 'bg-orange-500' },
      'tier-3': { name: 'B', color: 'bg-yellow-500' },
      'tier-4': { name: 'C', color: 'bg-green-500' },
      'tier-5': { name: 'D', color: 'bg-blue-500' }
    });
    
    // Clear localStorage
    localStorage.removeItem('ranking-app-unranked');
    localStorage.removeItem('ranking-app-ranked');
    localStorage.removeItem('ranking-app-tierdata');
    localStorage.removeItem('ranking-app-tierconfigs');
    localStorage.removeItem('ranking-app-tierorder');
  }, [unrankedImages, rankedImages, tierData]);

  const allTierImages = Object.values(tierData).flat();
  const allImages = [...unrankedImages, ...rankedImages, ...allTierImages];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Rankings Creator</h1>
        </div>

        {allImages.length === 0 ? (
          <ImageUploader onImagesUpload={handleImagesUpload} />
        ) : (
            <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <input
                  ref={additionalUploadRef}
                  id="additional-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handleImagesUpload(files);
                    }
                    e.currentTarget.value = "";
                  }}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => additionalUploadRef.current?.click()}
                  aria-label="Add more images"
                >
                  Add More Images
                </Button>
                <Button
                  variant="outline"
                  onClick={toggleMode}
                  className="flex items-center gap-2"
                  aria-label={`Current mode: ${mode}. Click to switch mode`}
                >
                  {mode === 'ranking' ? <List size={16} /> : <Grid3X3 size={16} />}
                  {mode === 'ranking' ? 'Ranking' : 'Tier List'}
                </Button>
                <Button
                  variant="outline"
                  onClick={toggleAspectRatio}
                  className="flex items-center gap-2"
                  aria-label={`Current: ${aspectRatio}. Click to change aspect ratio`}
                >
                  <RectangleHorizontal size={16} />
                  {aspectRatio === 'wide' ? 'Wide' : aspectRatio === 'square' ? 'Square' : 'Vertical'}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearAll}
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <X size={16} />
                  Clear All
                </Button>
              </div>
              {((mode === 'ranking' && rankedImages.length > 0) || (mode === 'tierlist' && allTierImages.length > 0)) && (
                <ExportButton targetRef={exportRef} filename={mode === 'ranking' ? 'my-ranking' : 'my-tierlist'} />
              )}
            </div>

            {mode === 'ranking' && rankedImages.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Your Rankings</h2>
                <p className="text-l text-muted-foreground">Click ranked images to remove them & drag to reorder</p>
                <div ref={exportRef}>
                  <RankingGrid 
                    images={rankedImages} 
                    onReorder={handleReorder}
                    onImageClick={moveToUnranked}
                    aspectRatio={aspectRatio}
                  />
                </div>
              </div>
            )}

            {mode === 'tierlist' && allTierImages.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Your Tier List</h2>
                    <p className="text-l text-muted-foreground">Drag images between tiers & click to remove them</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addTier} variant="outline" size="sm">
                      Add Tier
                    </Button>
                  </div>
                </div>
                <div ref={exportRef}>
                  <TierList 
                    tierData={tierData}
                    tierConfigs={tierConfigs}
                    tierOrder={tierOrder}
                    onTierUpdate={handleTierUpdate}
                    onTierConfigUpdate={updateTierConfig}
                    onTierRemove={removeTier}
                    onImageClick={moveToUnranked}
                    aspectRatio={aspectRatio}
                  />
                </div>
              </div>
            )}
            
            {unrankedImages.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Uploaded Images</h2>
                <p className="text-l text-muted-foreground">Click an image to add it to your {mode === 'ranking' ? 'ranking' : 'tier list'}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {unrankedImages.map((image) => (
                    <div
                      key={image.id}
                      onClick={() => moveToRanking(image)}
                      className={`${getAspectRatioClass(aspectRatio)} bg-muted rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg`}
                    >
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
