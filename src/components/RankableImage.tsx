
import React from 'react';

interface RankableImageProps {
  src: string;
  alt: string;
  rank: number;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onImageClick?: () => void;
  isDragging: boolean;
}

const RankableImage: React.FC<RankableImageProps> = ({
  src,
  alt,
  rank,
  onDragStart,
  onDragOver,
  onDrop,
  onImageClick,
  isDragging
}) => {
  const getRankSuffix = (rank: number): string => {
    if (rank % 100 >= 11 && rank % 100 <= 13) {
      return 'th';
    }
    switch (rank % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onImageClick) {
      onImageClick();
    }
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={handleClick}
      className={`
        relative group cursor-move transition-all duration-200 rounded-lg overflow-hidden
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        hover:scale-105 hover:shadow-lg
        ${onImageClick ? 'cursor-pointer' : 'cursor-move'}
      `}
    >
      <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          draggable={false}
        />
      </div>
      <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-sm font-bold shadow-lg ${rank === 1 ? 'bg-rank-gold text-rank-gold-foreground' : rank === 2 ? 'bg-rank-silver text-rank-silver-foreground' : rank === 3 ? 'bg-rank-bronze text-rank-bronze-foreground' : 'bg-primary text-primary-foreground'}`}>
        {rank}{getRankSuffix(rank)}
      </div>
    </div>
  );
};

export default RankableImage;
