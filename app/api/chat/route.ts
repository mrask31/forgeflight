import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, type CoreMessage } from 'ai';
import { SYSTEM_INSTRUCTION, STUDY_MODE_CONTEXTS } from '@/lib/ai/system-instruction';
import type { StudyMode } from '@/types/chat';

// Using Node.js runtime for better AI SDK compatibility
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, mode } = await req.json();

    // Build system message with mode context if applicable
    let systemMessage = SYSTEM_INSTRUCTION;
    if (mode && STUDY_MODE_CONTEXTS[mode as StudyMode]) {
      systemMessage += '\n\n' + STUDY_MODE_CONTEXTS[mode as StudyMode];
    }

    // Manually map messages to CoreMessage format to preserve image attachments
    const coreMessages: CoreMessage[] = messages.map((message: { role: string; content: string; experimental_attachments?: Array<{ name: string; contentType: string; url: string }> }) => {
      if (message.role === 'user' && message.experimental_attachments && message.experimental_attachments.length > 0) {
        // User message with image attachments - build multimodal content array
        return {
          role: 'user',
          content: [
            { type: 'text', text: message.content || 'Analyze this image.' },
            ...message.experimental_attachments.map((attachment: { name: string; contentType: string; url: string }) => ({
              type: 'image',
              image: new URL(attachment.url) // Wrap in URL() so SDK can parse MIME type from data: prefix
            }))
          ]
        };
      }
      // Regular text-only message
      return { 
        role: message.role as 'user' | 'assistant', 
        content: message.content 
      };
    });

    // Unified routing: ALL requests go to Gemini (handles text and images natively)
    const geminiApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!geminiApiKey) {
      console.error('🚨 MISSING API KEY: GOOGLE_GENERATIVE_AI_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'AI service configuration error. Please contact support.',
          code: 'MISSING_API_KEY'
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('📡 Routing to Gemini (Unified Multimodal)');
    console.log('🤖 Model: gemini-2.5-flash');

    const google = createGoogleGenerativeAI({ apiKey: geminiApiKey });

    try {
      const result = await streamText({
        model: google('gemini-2.5-flash'),
        system: systemMessage,
        messages: coreMessages,
        temperature: 0.7,
        maxTokens: 2000,
      });

      return result.toAIStreamResponse();
    } catch (geminiError) {
      console.error('CRITICAL_AI_ERROR (Gemini):', geminiError);
      console.error('Gemini error details:', JSON.stringify(geminiError, null, 2));
      throw geminiError;
    }
  } catch (error) {
    console.error('🚨 API ERROR:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    
    // Return user-friendly error
    return new Response(
      JSON.stringify({ 
        error: 'Unable to generate response. Please try again.',
        code: 'AI_SERVICE_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
