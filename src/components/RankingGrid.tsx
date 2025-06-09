
import React, { useState, useCallback } from 'react';
import RankableImage from './RankableImage';

interface ImageItem {
  id: string;
  src: string;
  alt: string;
}

interface RankingGridProps {
  images: ImageItem[];
  onReorder: (newOrder: ImageItem[]) => void;
  onImageClick?: (image: ImageItem) => void;
}

const RankingGrid: React.FC<RankingGridProps> = ({ images, onReorder, onImageClick }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = useCallback((index: number) => (e: React.DragEvent<HTMLDivElement>) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((targetIndex: number) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const newOrder = [...images];
    const draggedItem = newOrder[draggedIndex];
    
    // Remove dragged item
    newOrder.splice(draggedIndex, 1);
    
    // Insert at new position
    newOrder.splice(targetIndex, 0, draggedItem);
    
    onReorder(newOrder);
    setDraggedIndex(null);
  }, [draggedIndex, images, onReorder]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const handleImageClick = useCallback((index: number) => {
    if (onImageClick && draggedIndex === null) {
      onImageClick(images[index]);
    }
  }, [onImageClick, images, draggedIndex]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {images.map((image, index) => (
        <div key={image.id} onDragEnd={handleDragEnd}>
          <RankableImage
            src={image.src}
            alt={image.alt}
            rank={index + 1}
            onDragStart={handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={handleDrop(index)}
            onImageClick={() => handleImageClick(index)}
            isDragging={draggedIndex === index}
          />
        </div>
      ))}
    </div>
  );
};

export default RankingGrid;
