'use client';

import { FormEvent, useRef, useState, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    
    if (file) {
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
    
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!value.trim() && !selectedFile) return;

    const textToSend = value.trim() || 'Please analyze this document.';

    if (selectedFile) {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        
        append({
          role: 'user',
          content: textToSend,
          experimental_attachments: [
            {
              name: selectedFile.name,
              contentType: selectedFile.type,
              url: base64String,
            },
          ],
        });

        // Clear UI state
        onChange('');
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      };
      
      reader.readAsDataURL(selectedFile);
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
      {selectedFile && (
        <div className="relative inline-block mb-2 mt-2">
          {selectedFile.type?.includes('pdf') ? (
            <div className="flex items-center gap-2 p-3 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-xl">📄</span>
              <span className="text-sm text-slate-200 truncate max-w-[200px]">{selectedFile.name}</span>
            </div>
          ) : (
            <img 
              src={URL.createObjectURL(selectedFile)} 
              alt="Preview" 
              className="h-20 w-auto rounded-lg object-cover border border-slate-700" 
            />
          )}
          <button
            type="button"
            onClick={handleRemoveFile}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 transition-colors rounded-full w-6 h-6 text-white text-xs flex items-center justify-center shadow-lg"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex-shrink-0 p-3 bg-background-tertiary hover:bg-background-tertiary/80 text-gray-400 hover:text-primary-500 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Upload sectional chart, flight map, or PDF document"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
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
          disabled={disabled || (!value.trim() && !selectedFile)}
          className="flex-shrink-0 p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
