'use client';

import { useState } from 'react';
import { useChat } from 'ai/react';
import { MessageList } from './message-list';
import { MessageInput } from './message-input';
import { QuickActions } from './quick-actions';
import type { StudyMode } from '@/types/chat';

export function ChatInterface() {
  const [activeMode, setActiveMode] = useState<StudyMode | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    body: {
      mode: activeMode,
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setError('Unable to connect to AI service. Please try again.');
    },
  });

  const handleQuickAction = (mode: StudyMode | null) => {
    setActiveMode(mode);
  };

  const handleFileSelect = async (file: File) => {
    try {
      // Convert file to base64 data URL
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Append message with image attachment
        await append({
          role: 'user',
          content: input || 'Please analyze this sectional chart or flight map.',
          experimental_attachments: [
            {
              name: file.name,
              contentType: file.type,
              url: base64String,
            },
          ],
        });
        
        // Clear input after sending
        handleInputChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('File upload error:', err);
      setError('Failed to upload image. Please try again.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <QuickActions
        onModeSelect={handleQuickAction}
        activeMode={activeMode}
        disabled={isLoading}
      />

      {error && (
        <div className="mx-4 mt-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <MessageList messages={messages} isLoading={isLoading} />

      <MessageInput
        value={input}
        onChange={(value) => handleInputChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>)}
        onSubmit={handleSubmit}
        disabled={isLoading}
        onFileSelect={handleFileSelect}
      />
    </div>
  );
}
