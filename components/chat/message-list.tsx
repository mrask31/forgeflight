'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Message } from 'ai';
import { Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && (
        <div className="text-center text-gray-400 mt-8">
          <p className="text-lg mb-2">✈️ Welcome to ForgeFlight</p>
          <p className="text-sm">Ask me anything about flying the Cessna 172!</p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] px-4 py-3 rounded-2xl break-words ${
              message.role === 'user'
                ? 'bg-primary-500 text-white rounded-tr-sm ml-auto'
                : 'bg-background-tertiary text-white rounded-tl-sm mr-auto'
            }`}
          >
            {message.role === 'assistant' ? (
              <div className="prose prose-invert prose-p:leading-relaxed max-w-none text-sm md:text-base prose-strong:text-sky-400 prose-strong:font-semibold prose-ul:my-2 prose-li:my-1">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            ) : (
              message.content.split('\n').map((line, i) => (
                <p key={i} className={i > 0 ? 'mt-2' : ''}>
                  {line}
                </p>
              ))
            )}
            
            {message.experimental_attachments && message.experimental_attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {message.experimental_attachments.map((attachment, idx) => (
                  <div key={idx}>
                    {attachment.contentType?.startsWith('image/') && (
                      <div className="relative w-full h-48">
                        <Image
                          src={attachment.url}
                          alt="Uploaded sectional or flight map"
                          fill
                          className="rounded-lg object-contain"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-background-tertiary text-white px-4 py-3 rounded-2xl rounded-tl-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
