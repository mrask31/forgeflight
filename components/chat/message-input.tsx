'use client';

import { FormEvent, useRef, ChangeEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  disabled: boolean;
  placeholder?: string;
  onFileSelect?: (file: File) => void;
}

export function MessageInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = 'Ask about flying the Cessna 172...',
  onFileSelect,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <form onSubmit={onSubmit} className="border-t border-background-tertiary p-4">
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
          disabled={disabled || !value.trim()}
          className="flex-shrink-0 p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
