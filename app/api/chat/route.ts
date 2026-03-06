import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { SYSTEM_INSTRUCTION, STUDY_MODE_CONTEXTS } from '@/lib/ai/system-instruction';
import type { StudyMode } from '@/types/chat';

// Using Node.js runtime for better AI SDK compatibility
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { messages, mode } = await req.json();

    // Debug logging to see what we're receiving
    const lastMessage = messages[messages.length - 1];
    console.log('📨 Last message structure:', JSON.stringify({
      role: lastMessage?.role,
      hasContent: !!lastMessage?.content,
      hasExperimentalAttachments: !!lastMessage?.experimental_attachments,
      experimentalAttachmentsLength: lastMessage?.experimental_attachments?.length || 0,
      hasAttachments: !!lastMessage?.attachments,
      attachmentsLength: lastMessage?.attachments?.length || 0,
    }, null, 2));

    // Build system message with mode context if applicable
    let systemMessage = SYSTEM_INSTRUCTION;
    if (mode && STUDY_MODE_CONTEXTS[mode as StudyMode]) {
      systemMessage += '\n\n' + STUDY_MODE_CONTEXTS[mode as StudyMode];
    }

    // Detect if the last message contains an image attachment
    const hasAttachments = (lastMessage?.experimental_attachments && 
                           lastMessage.experimental_attachments.length > 0) ||
                          (lastMessage?.attachments && 
                           lastMessage.attachments.length > 0);

    console.log('🔍 Attachment detection result:', hasAttachments);

    if (hasAttachments) {
      // Route to Gemini for image analysis (Sectional Scanner)
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

      console.log('📡 Routing to Gemini (Sectional Scanner)');
      console.log('🤖 Model: gemini-2.5-flash');

      const google = createGoogleGenerativeAI({ apiKey: geminiApiKey });

      try {
        const result = await streamText({
          model: google('gemini-2.5-flash'),
          system: systemMessage,
          messages: messages,
          temperature: 0.7,
          maxTokens: 2000,
        });

        return result.toAIStreamResponse();
      } catch (geminiError) {
        console.error('CRITICAL_AI_ERROR (Gemini):', geminiError);
        console.error('Gemini error details:', JSON.stringify(geminiError, null, 2));
        throw geminiError;
      }
    } else {
      // Route to Claude for text-based Socratic tutoring
      const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
      if (!anthropicApiKey) {
        console.error('🚨 MISSING API KEY: ANTHROPIC_API_KEY not configured');
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

      console.log('📡 Routing to Claude (Grounded Truth)');
      console.log('🤖 Model: claude-3-5-sonnet-20241022');

      try {
        const result = await streamText({
          model: anthropic('claude-3-5-sonnet-20241022'),
          system: systemMessage,
          messages: messages,
          temperature: 0.7,
          maxTokens: 2000,
        });

        return result.toAIStreamResponse();
      } catch (anthropicError) {
        console.error('CRITICAL_AI_ERROR (Anthropic):', anthropicError);
        console.error('Anthropic error details:', JSON.stringify(anthropicError, null, 2));
        throw anthropicError;
      }
    }
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
