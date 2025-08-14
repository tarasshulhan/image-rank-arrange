
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
  S: ImageItem[];
  A: ImageItem[];
  B: ImageItem[];
  C: ImageItem[];
  D: ImageItem[];
}

type AspectRatio = 'wide' | 'square' | 'vertical';
type AppMode = 'ranking' | 'tierlist';

const Index = () => {
  const [unrankedImages, setUnrankedImages] = useState<ImageItem[]>([]);
  const [rankedImages, setRankedImages] = useState<ImageItem[]>([]);
  const [tierData, setTierData] = useState<TierData>({
    S: [],
    A: [],
    B: [],
    C: [],
    D: []
  });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('wide');
  const [mode, setMode] = useState<AppMode>('ranking');
  const exportRef = useRef<HTMLDivElement>(null);
  const additionalUploadRef = useRef<HTMLInputElement>(null);

  // Load images from localStorage on mount
  useEffect(() => {
    const savedUnranked = localStorage.getItem('ranking-app-unranked');
    const savedRanked = localStorage.getItem('ranking-app-ranked');
    const savedTierData = localStorage.getItem('ranking-app-tierdata');
    
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
      setTierData(prev => ({ ...prev, S: [...prev.S, image] }));
    }
  }, [mode]);

  const moveToUnranked = useCallback((image: ImageItem) => {
    if (mode === 'ranking') {
      setRankedImages(prev => prev.filter(img => img.id !== image.id));
    } else {
      // Remove from all tiers
      setTierData(prev => ({
        S: prev.S.filter(img => img.id !== image.id),
        A: prev.A.filter(img => img.id !== image.id),
        B: prev.B.filter(img => img.id !== image.id),
        C: prev.C.filter(img => img.id !== image.id),
        D: prev.D.filter(img => img.id !== image.id),
      }));
    }
    setUnrankedImages(prev => [...prev, image]);
  }, [mode]);

  const clearAll = useCallback(() => {
    // Clean up object URLs to prevent memory leaks
    const allTierImages = Object.values(tierData).flat();
    [...unrankedImages, ...rankedImages, ...allTierImages].forEach(image => {
      URL.revokeObjectURL(image.src);
    });
    setUnrankedImages([]);
    setRankedImages([]);
    setTierData({ S: [], A: [], B: [], C: [], D: [] });
    // Clear localStorage
    localStorage.removeItem('ranking-app-unranked');
    localStorage.removeItem('ranking-app-ranked');
    localStorage.removeItem('ranking-app-tierdata');
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
                <h2 className="text-xl font-semibold text-foreground">Your Tier List</h2>
                <p className="text-l text-muted-foreground">Drag images between tiers & click to remove them</p>
                <div ref={exportRef}>
                  <TierList 
                    tierData={tierData}
                    onTierUpdate={handleTierUpdate}
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
