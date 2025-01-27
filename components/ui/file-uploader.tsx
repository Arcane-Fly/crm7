import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { cn } from '@/lib/utils';

import { Button } from './button';

export interface FileUploaderProps {
  accept?: string;
  maxSize?: number;
  onFileSelect: (files: File[]) => void;
  multiple?: boolean;
  className?: string;
}

export function FileUploader({
  accept,
  maxSize = 10 * 1024 * 1024, // 10MB default
  onFileSelect,
  multiple = false,
  className,
}: FileUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      if (maxSize && acceptedFiles.some((file) => file.size > maxSize)) {
        setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
        return;
      }
      onFileSelect(acceptedFiles);
    },
    [maxSize, onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    multiple,
  });

  return (
    <div className='space-y-2'>
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary',
          isDragActive && 'border-primary bg-primary/10',
          className,
        )}
      >
        <input {...getInputProps()} />
        <p className='text-sm text-gray-600'>
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag and drop files here, or click to select files'}
        </p>
        <Button
          type='button'
          variant='outline'
          className='mt-2'
        >
          Select Files
        </Button>
      </div>
      {error && <p className='text-sm text-red-500'>{error}</p>}
    </div>
  );
}
