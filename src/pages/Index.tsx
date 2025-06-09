
import React, { useState, useRef, useCallback } from 'react';
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
  const [images, setImages] = useState<ImageItem[]>([]);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleImagesUpload = useCallback((files: File[]) => {
    const newImages: ImageItem[] = files.map((file) => ({
      id: crypto.randomUUID(),
      src: URL.createObjectURL(file),
      alt: file.name
    }));
    
    setImages(prev => [...prev, ...newImages]);
  }, []);

  const handleReorder = useCallback((newOrder: ImageItem[]) => {
    setImages(newOrder);
  }, []);

  const clearAll = useCallback(() => {
    // Clean up object URLs to prevent memory leaks
    images.forEach(image => {
      URL.revokeObjectURL(image.src);
    });
    setImages([]);
  }, [images]);

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Image Ranker</h1>
          <p className="text-lg text-muted-foreground">
            Upload images and drag them to create your perfect ranking
          </p>
        </div>

        {images.length === 0 ? (
          <ImageUploader onImagesUpload={handleImagesUpload} />
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <label htmlFor="additional-upload">
                  <input
                    id="additional-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        handleImagesUpload(files);
                      }
                    }}
                    className="hidden"
                  />
                  <Button variant="outline" className="cursor-pointer">
                    Add More Images
                  </Button>
                </label>
                <Button
                  variant="outline"
                  onClick={clearAll}
                  className="flex items-center gap-2 text-destructive hover:text-destructive"
                >
                  <X size={16} />
                  Clear All
                </Button>
              </div>
              <ExportButton targetRef={exportRef} filename="my-ranking" />
            </div>

            <div ref={exportRef} className="bg-background p-6 rounded-lg">
              <RankingGrid images={images} onReorder={handleReorder} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
