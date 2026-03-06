# Implementation Plan: Multi-Model Polyglot Architecture

## Overview

This implementation adds a sophisticated multi-model AI architecture to ForgeFlight that intelligently routes requests between Claude 3.7 Sonnet (text-based Socratic tutoring) and Google Gemini 2.5 Flash (image analysis of sectional charts). The system maintains backward compatibility while adding image upload capabilities and functional audio briefing playback.

## Tasks

- [x] 1. Install required dependencies
  - Install @ai-sdk/anthropic package for Claude integration
  - Verify lucide-react is installed (already present in package.json)
  - _Requirements: 7.1, 7.3_

- [x] 2. Update environment configuration
  - [x] 2.1 Add ANTHROPIC_API_KEY to .env.local
    - Add environment variable with comment explaining it's for Claude 3.7 Sonnet
    - _Requirements: 8.1, 8.3_
  
  - [x] 2.2 Update GOOGLE_GENERATIVE_AI_API_KEY comment in .env.local
    - Add comment explaining it's for Gemini 2.5 Flash image analysis
    - _Requirements: 8.2, 8.3_

- [x] 3. Enhance system instruction with Socratic methodology
  - [x] 3.1 Add Socratic Teaching Methodology section to system-instruction.ts
    - Add guidance for using questions to guide students to answers
    - Include "What do you think would happen if..." prompting style
    - Add instructions to celebrate correct reasoning before adding context
    - Add instructions to gently correct misconceptions with clarifying questions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 3.2 Add Knowledge Base Verification section to system-instruction.ts
    - Add requirement to verify all speeds against Cessna 172S POH
    - Add requirement to verify all procedures against Elite Aviation materials
    - Add out-of-scope disclosure template for information outside training materials
    - Add instruction to state uncertainty and recommend verification with instructor
    - Add prohibition against hallucinating aviation data
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 4. Implement dual-model routing in Chat API route
  - [x] 4.1 Import Anthropic provider and create Claude integration
    - Import createAnthropic from @ai-sdk/anthropic
    - Add ANTHROPIC_API_KEY validation with clear error handling
    - Return 500 error with MISSING_API_KEY code if key is missing
    - _Requirements: 1.1, 1.3, 1.5, 8.4_
  
  - [x] 4.2 Update Google provider integration
    - Add GOOGLE_GENERATIVE_AI_API_KEY validation with clear error handling
    - Return 500 error with MISSING_API_KEY code if key is missing
    - _Requirements: 1.2, 1.4, 1.5, 8.4_
  
  - [x] 4.3 Implement intelligent routing logic
    - Detect attachments by checking experimental_attachments array in last message
    - Route to Gemini (gemini-2.5-flash) when attachments are present
    - Route to Claude (claude-3-7-sonnet-20250219) for text-only messages
    - Add console logging to show which model is being used for each request
    - Maintain existing streaming response format for both providers
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 9.1, 9.4_
  
  - [ ]* 4.4 Write property test for API key validation
    - **Property 1: API Key Validation**
    - **Validates: Requirements 1.3, 1.4, 1.5**
    - Test that missing API keys return 500 with MISSING_API_KEY code
  
  - [ ]* 4.5 Write property test for attachment-based routing
    - **Property 2: Attachment-Based Routing to Gemini**
    - **Validates: Requirements 2.1**
    - Test that messages with experimental_attachments route to Gemini
  
  - [ ]* 4.6 Write property test for text-only routing
    - **Property 3: Text-Only Routing to Claude**
    - **Validates: Requirements 2.2**
    - Test that messages without attachments route to Claude
  
  - [ ]* 4.7 Write property test for streaming response format
    - **Property 4: Streaming Response Format Preservation**
    - **Validates: Requirements 2.5, 9.4**
    - Test that both providers return AI SDK compatible streaming responses
  
  - [ ]* 4.8 Write property test for error message sanitization
    - **Property 7: Error Message Sanitization**
    - **Validates: Requirements 8.5**
    - Test that error responses don't expose API keys or sensitive data

- [x] 5. Checkpoint - Verify API routing works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Add image upload functionality to Message Input component
  - [x] 6.1 Add file upload UI elements
    - Import Paperclip icon from lucide-react
    - Add hidden file input with accept="image/*"
    - Add Paperclip button (48x48px touch target) to left of text input
    - Add state for attachedImage with file and preview properties
    - _Requirements: 5.1, 5.2_
  
  - [x] 6.2 Implement file selection and preview
    - Add onClick handler to Paperclip button to trigger file input
    - Add onChange handler to file input for file selection
    - Convert selected file to base64 using FileReader
    - Display thumbnail preview (max 100px height) when image is attached
    - Clear file input after successful upload to allow re-uploading same file
    - _Requirements: 5.3, 5.4, 5.7, 5.8_
  
  - [x] 6.3 Implement attachment submission
    - Format attachment using Vercel AI SDK experimental_attachments format
    - Include name, contentType, and url (base64 data URL) in attachment object
    - Add default text "Please analyze this sectional chart or flight map" when image attached without text
    - Call append() with message content and experimental_attachments array
    - _Requirements: 5.5, 5.6_
  
  - [ ]* 6.4 Write property test for base64 conversion
    - **Property 5: Base64 Conversion Round-Trip**
    - **Validates: Requirements 5.4**
    - Test that base64 conversion preserves image content
  
  - [ ]* 6.5 Write property test for attachment format compliance
    - **Property 6: Attachment Format Compliance**
    - **Validates: Requirements 5.5**
    - Test that attachments match Vercel AI SDK specification
  
  - [ ]* 6.6 Write unit tests for image upload UI
    - Test Paperclip button renders and is clickable
    - Test file input opens when Paperclip clicked
    - Test thumbnail preview displays after file selection
    - Test file input clears after successful upload
    - Test default text added when image attached without text
    - _Requirements: 5.1, 5.2, 5.3, 5.6, 5.7, 5.8_

- [x] 7. Add functional audio player to Quick Actions component
  - [x] 7.1 Enable Audio Briefing button and add player UI
    - Remove disabled attribute from "🎧 Audio Briefing (Beta)" button
    - Add state for showAudioPlayer (boolean)
    - Add onClick handler to toggle audio player visibility
    - Add HTML5 audio element with controls and src="/audio/briefing.mp3"
    - Style audio player to match dark mode aviation theme
    - Ensure audio player is mobile-responsive with touch-friendly controls
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_
  
  - [ ]* 7.2 Write unit tests for audio player
    - Test Audio Briefing button is not disabled
    - Test audio player hidden by default
    - Test audio player visible after button click
    - Test audio player has correct source path
    - Test audio player has controls attribute
    - Test button toggles player visibility on repeated clicks
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8. Checkpoint - Verify UI enhancements work
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Integration testing and verification
  - [x] 9.1 Test text-only chat flow with Claude
    - Send a text question and verify Claude responds with Socratic guidance
    - Verify console logs show "Routing to Claude"
    - Verify streaming response works correctly
    - _Requirements: 2.2, 2.4, 3.1, 9.1, 9.4_
  
  - [x] 9.2 Test image upload flow with Gemini
    - Upload a test image and verify Gemini analyzes it
    - Verify console logs show "Routing to Gemini"
    - Verify thumbnail preview displays correctly
    - Verify streaming response works correctly
    - _Requirements: 2.1, 2.4, 5.7, 9.4, 10.1, 10.2, 10.3_
  
  - [x] 9.3 Test audio player functionality
    - Click Audio Briefing button and verify player appears
    - Verify audio controls work (play, pause, seek)
    - Verify player styling matches app theme
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  
  - [x] 9.4 Test error handling
    - Test behavior when API keys are missing (should show friendly error)
    - Verify error messages don't expose sensitive data
    - _Requirements: 1.5, 8.4, 8.5_
  
  - [ ]* 9.5 Test mobile responsiveness
    - Test image upload on mobile device (camera integration)
    - Test audio player controls on touch devices
    - Test Paperclip button touch target size (48x48px minimum)
    - Verify no iOS zoom on input focus (16px font-size)
    - _Requirements: 5.2, 6.6_

- [x] 10. Final checkpoint and deployment preparation
  - Ensure all tests pass, ask the user if questions arise.
  - Verify .env.local has both API keys configured
  - Verify all backward compatibility maintained (existing features work)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key milestones
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- The design uses TypeScript, so all implementation will be in TypeScript
- Existing chat functionality must continue working throughout implementation
- All aviation data must be verified against Elite Aviation knowledge base
