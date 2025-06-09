
import React, { useRef } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  filename?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ targetRef, filename = 'ranking' }) => {
  const exportAsImage = async () => {
    if (!targetRef.current) return;

    try {
      const canvas = await html2canvas(targetRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL();
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
