
import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploaderProps {
  onImagesUpload: (files: File[]) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImagesUpload }) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      onImagesUpload(files);
    }
  }, [onImagesUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onImagesUpload(files);
    }
  }, [onImagesUpload]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
    >
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileInput}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload" className="cursor-pointer">
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-foreground mb-2">
          Upload your images
        </p>
        <p className="text-sm text-muted-foreground">
          Drag and drop images here, or click to select files
        </p>
      </label>
    </div>
  );
};

export default ImageUploader;
