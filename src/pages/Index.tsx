
import React, { useState, useRef, useCallback, useEffect } from 'react';
import ImageUploader from '@/components/ImageUploader';
import RankingGrid from '@/components/RankingGrid';
import ExportButton from '@/components/ExportButton';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImageItem {
  id: string;
  src: string;
  alt: string;
}

const Index = () => {
  const [unrankedImages, setUnrankedImages] = useState<ImageItem[]>([]);
  const [rankedImages, setRankedImages] = useState<ImageItem[]>([]);
  const exportRef = useRef<HTMLDivElement>(null);
  const additionalUploadRef = useRef<HTMLInputElement>(null);

  // Load images from localStorage on mount
  useEffect(() => {
    const savedUnranked = localStorage.getItem('ranking-app-unranked');
    const savedRanked = localStorage.getItem('ranking-app-ranked');
    
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
  }, []);

  // Save to localStorage whenever images change
  useEffect(() => {
    localStorage.setItem('ranking-app-unranked', JSON.stringify(unrankedImages));
  }, [unrankedImages]);

  useEffect(() => {
    localStorage.setItem('ranking-app-ranked', JSON.stringify(rankedImages));
  }, [rankedImages]);

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

  const moveToRanking = useCallback((image: ImageItem) => {
    setUnrankedImages(prev => prev.filter(img => img.id !== image.id));
    setRankedImages(prev => [...prev, image]);
  }, []);

  const moveToUnranked = useCallback((image: ImageItem) => {
    setRankedImages(prev => prev.filter(img => img.id !== image.id));
    setUnrankedImages(prev => [...prev, image]);
  }, []);

  const clearAll = useCallback(() => {
    // Clean up object URLs to prevent memory leaks
    [...unrankedImages, ...rankedImages].forEach(image => {
      URL.revokeObjectURL(image.src);
    });
    setUnrankedImages([]);
    setRankedImages([]);
    // Clear localStorage
    localStorage.removeItem('ranking-app-unranked');
    localStorage.removeItem('ranking-app-ranked');
  }, [unrankedImages, rankedImages]);

  const allImages = [...unrankedImages, ...rankedImages];

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
                  onClick={clearAll}
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <X size={16} />
                  Clear All
                </Button>
              </div>
              {rankedImages.length > 0 && (
                <ExportButton targetRef={exportRef} filename="my-ranking" />
              )}
            </div>

            {rankedImages.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Your Rankings</h2>
                <p className="text-l text-muted-foreground">Click ranked images to remove them & drag to reorder</p>
                <div ref={exportRef}>
                  <RankingGrid 
                    images={rankedImages} 
                    onReorder={handleReorder}
                    onImageClick={moveToUnranked}
                  />
                </div>
              </div>
            )}
            
            {unrankedImages.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Uploaded Images</h2>
                <p className="text-l text-muted-foreground">Click an image to add it to your ranking</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {unrankedImages.map((image) => (
                    <div
                      key={image.id}
                      onClick={() => moveToRanking(image)}
                      className="aspect-video bg-muted rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-lg"
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
