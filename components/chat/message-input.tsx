'use client';

import { FormEvent, useRef, ChangeEvent, useState, useEffect } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import type { Message } from 'ai/react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent, options?: { experimental_attachments?: FileList }) => void;
  disabled: boolean;
  placeholder?: string;
  append: (message: Message | { role: 'user'; content: string; experimental_attachments?: Array<{ name: string; contentType: string; url: string }> }) => void;
}

export function MessageInput({
  value,
  onChange,
  disabled,
  placeholder = 'Ask about flying the Cessna 172...',
  append,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFiles(files);
      
      // Create preview URL
      const file = files[0];
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
    
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFiles(null);
    setPreviewUrl(null);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!value.trim() && (!selectedFiles || selectedFiles.length === 0)) return;

    const textToSend = value.trim() || 'Please analyze this image.';

    if (selectedFiles && selectedFiles.length > 0) {
      const file = selectedFiles[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        
        append({
          role: 'user',
          content: textToSend,
          experimental_attachments: [
            {
              name: file.name,
              contentType: file.type,
              url: base64String,
            },
          ],
        });

        // Clear UI state
        onChange('');
        setSelectedFiles(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      
      reader.readAsDataURL(file);
    } else {
      // Text only submission
      append({
        role: 'user',
        content: textToSend,
      });
      onChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e as unknown as FormEvent);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <form onSubmit={handleFormSubmit} className="border-t border-background-tertiary p-4">
      {previewUrl && (
        <div className="mb-3 relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-24 rounded-lg border border-gray-700"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 p-3 bg-background-tertiary hover:bg-background-tertiary/80 text-gray-400 hover:text-primary-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Upload sectional chart or flight map"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          rows={1}
          className="flex-1 px-4 py-3 bg-background-tertiary border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            minHeight: '48px',
            maxHeight: '120px',
            fontSize: '16px' // Prevent iOS zoom
          }}
        />

        <button
          type="submit"
          disabled={disabled || (!value.trim() && !selectedFiles)}
          className="flex-shrink-0 p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
