'use client';

import * as React from 'react';
import type { PutBlobResult } from '@vercel/blob';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, ImagePlus } from "lucide-react";

export default function AvatarUploadPage() {
  const inputFileRef = React.useRef<HTMLInputElement>(null);
  const [blob, setBlob] = React.useState<PutBlobResult | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploading(true);

    try {
      if (!inputFileRef.current?.files) {
        throw new Error('No file selected');
      }

      const file = inputFileRef.current.files[0];
      const response = await fetch(
        `/api/avatar/upload?filename=${file.name}`,
        {
          method: 'POST',
          body: file,
        },
      );

      const newBlob = await response.json();
      setBlob(newBlob);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Upload Your Avatar</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImagePlus className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF up to 4MB
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  ref={inputFileRef}
                  accept="image/*"
                />
              </label>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={uploading}
          >
            {uploading ? (
              <span className="flex items-center">
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Upload Avatar
              </span>
            )}
          </Button>
        </form>

        {blob && (
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold">Upload Complete!</h2>
            <div className="overflow-hidden rounded-lg border bg-muted p-2">
              <pre className="text-sm">{JSON.stringify(blob, null, 2)}</pre>
            </div>
            <img
              src={blob.url}
              alt="Uploaded avatar"
              className="mt-4 rounded-full w-24 h-24 object-cover mx-auto"
            />
          </div>
        )}
      </Card>
    </div>
  );
}