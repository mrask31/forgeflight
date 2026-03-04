import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { SYSTEM_INSTRUCTION, STUDY_MODE_CONTEXTS } from '@/lib/ai/system-instruction';
import type { StudyMode } from '@/types/chat';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, mode } = await req.json();

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured');
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

    // Build system message with mode context if applicable
    let systemMessage = SYSTEM_INSTRUCTION;
    if (mode && STUDY_MODE_CONTEXTS[mode as StudyMode]) {
      systemMessage += '\n\n' + STUDY_MODE_CONTEXTS[mode as StudyMode];
    }

    // Call Gemini API with streaming and multimodal support
    const result = await streamText({
      model: google('gemini-1.5-pro'),
      system: systemMessage,
      messages: messages,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Return streaming response
    return result.toAIStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    
    // Return user-friendly error
    return new Response(
      JSON.stringify({ 
        error: 'Unable to generate response. Please try again.',
        code: 'AI_SERVICE_ERROR'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
