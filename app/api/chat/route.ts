import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, type CoreMessage } from 'ai';
import { SYSTEM_INSTRUCTION, STUDY_MODE_CONTEXTS } from '@/lib/ai/system-instruction';
import { FLIGHT_KNOWLEDGE_BASE } from '@/lib/ai/knowledge-base';
import type { StudyMode } from '@/types/chat';
import fs from 'fs';
import path from 'path';

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
        // User message with attachments - build multimodal content array
        const contentParts: Array<{ type: 'text'; text: string } | { type: 'image'; image: URL } | { type: 'file'; data: string; mimeType: string }> = [
          { type: 'text', text: message.content || 'Analyze this document.' }
        ];

        message.experimental_attachments.forEach((attachment: { name: string; contentType: string; url: string }) => {
          const isPDF = attachment.url.startsWith('data:application/pdf');
          
          if (isPDF) {
            // PDF: Extract pure base64 and use file type
            const pureBase64 = attachment.url.includes(',') ? attachment.url.split(',')[1] : attachment.url;
            contentParts.push({
              type: 'file',
              data: pureBase64,
              mimeType: 'application/pdf'
            });
          } else {
            // Image: Use full URL wrapper for MIME parsing
            contentParts.push({
              type: 'image',
              image: new URL(attachment.url)
            });
          }
        });

        return {
          role: 'user',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: contentParts as any // SDK types don't include file type yet
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

    // Server-Side Librarian: Read POH PDF from filesystem and inject into context
    let pohMessage: CoreMessage | null = null;
    try {
      const pohPath = path.join(process.cwd(), 'public', 'docs', 'POH-Cessna-172s.pdf');
      if (fs.existsSync(pohPath)) {
        const fileBuffer = fs.readFileSync(pohPath);
        const pohBase64 = fileBuffer.toString('base64');
        
        // Create a simulated message to inject the PDF into Gemini's Context Window
        pohMessage = {
          role: 'user',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          content: [
            { 
              type: 'text', 
              text: 'SYSTEM REFERENCE DOCUMENT: The following is the complete Pilot Operating Handbook (POH) for the Cessna 172S. Memorize this document completely, paying special attention to performance charts, tables, and emergency procedures. Use it as your primary source of truth for all Cessna 172S questions.' 
            },
            { 
              type: 'file', 
              data: pohBase64, 
              mimeType: 'application/pdf' 
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ] as any // SDK types don't include file type yet
        };
        console.log('📚 POH PDF loaded and injected into context');
      } else {
        console.warn('⚠️ POH PDF not found at:', pohPath);
      }
    } catch (error) {
      console.error('❌ Could not read POH PDF:', error);
    }

    // Prepend the injected PDF to the user's actual messages
    const finalMessages = pohMessage ? [pohMessage, ...coreMessages] : coreMessages;

    try {
      const result = await streamText({
        model: google('gemini-2.5-flash'),
        system: `${systemMessage}

# PERMANENT COURSE MATERIAL
You have permanently memorized the following textbooks. Use this specific information to answer student questions exactly:

${FLIGHT_KNOWLEDGE_BASE}`,
        messages: finalMessages,
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
