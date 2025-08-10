
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toPng } from 'html-to-image';

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  filename?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ targetRef, filename = 'ranking' }) => {
  const exportAsImage = async () => {
    if (!targetRef.current) return;

    try {
      const dataUrl = await toPng(targetRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        cacheBust: true
      });

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
    }
  };

  return (
    <Button
      onClick={exportAsImage}
      variant="outline"
      className="flex items-center gap-2"
    >
      <Download size={16} />
      Export as Image
    </Button>
  );
};

export default ExportButton;
