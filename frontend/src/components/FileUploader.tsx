import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
  accept?: string;
  maxSizeMB?: number;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  accept = 'image/*',
  maxSizeMB = 10,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (files: FileList | null) => {
    if (!files?.length) {
      setPreviewName(null);
      onFileSelect?.(null);
      return;
    }
    const file = files[0];
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File must be smaller than ${maxSizeMB}MB`);
      return;
    }
    setError(null);
    setPreviewName(file.name);
    onFileSelect?.(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    handleFileChange(event.dataTransfer.files);
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          error ? 'border-destructive text-destructive' : 'border-border text-muted-foreground'
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <Upload className="h-8 w-8 mx-auto mb-2" />
        <p className="text-sm">{previewName ?? 'Click to upload or drag and drop photos'}</p>
        <p className="text-xs mt-1">PNG, JPG up to {maxSizeMB}MB</p>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        type="file"
        ref={inputRef}
        className="hidden"
        accept={accept}
        onChange={(event) => handleFileChange(event.target.files)}
      />
    </div>
  );
};

export default FileUploader;

