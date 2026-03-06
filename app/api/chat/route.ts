import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { SYSTEM_INSTRUCTION, STUDY_MODE_CONTEXTS } from '@/lib/ai/system-instruction';
import type { StudyMode } from '@/types/chat';

// Using Node.js runtime for better AI SDK compatibility
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, mode } = await req.json();

    // Validate API key
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
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

    // Build system message with mode context if applicable
    let systemMessage = SYSTEM_INSTRUCTION;
    if (mode && STUDY_MODE_CONTEXTS[mode as StudyMode]) {
      systemMessage += '\n\n' + STUDY_MODE_CONTEXTS[mode as StudyMode];
    }

    console.log('📡 Calling Gemini API with model: gemini-2.5-flash');

    // Create Google provider with explicit API key
    const google = createGoogleGenerativeAI({ apiKey });

    // Call Gemini API with streaming and multimodal support
    const result = await streamText({
      model: google('gemini-2.5-flash'),
      system: systemMessage,
      messages: messages,
      temperature: 0.7,
      maxTokens: 2000,
    });

    // Return streaming response
    return result.toAIStreamResponse();
  } catch (error) {
    console.error('🚨 GEMINI API ERROR:', error);
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
