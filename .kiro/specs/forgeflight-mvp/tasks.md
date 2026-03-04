# Implementation Plan: ForgeFlight MVP

## Overview

This implementation plan breaks down the ForgeFlight MVP into discrete coding tasks that build incrementally toward a fully functional AI-powered flight training application. The implementation follows a bottom-up approach: starting with project setup and configuration, then building authentication, UI components, AI integration, and finally wiring everything together with comprehensive testing.

Each task references specific requirements from the requirements document and includes property-based testing sub-tasks to validate correctness properties from the design document.

## Tasks

- [x] 1. Project setup and configuration
  - Initialize Next.js 14+ project with TypeScript and App Router
  - Install and configure core dependencies: Supabase, Vercel AI SDK, Tailwind CSS, shadcn/ui
  - Set up TypeScript configuration with strict mode enabled
  - Configure Tailwind with custom aviation-themed color palette and dark mode
  - Create `.env.example` file with all required environment variables
  - Create environment validation utility in `lib/env.ts`
  - Set up project directory structure (app, components, lib, types folders)
  - _Requirements: 8.1, 8.2, 8.3, 9.1, 9.2, 7.1, 7.2, 7.3, 7.4_

- [x] 2. Type definitions and data models
  - [x] 2.1 Create TypeScript type definitions for chat messages and study modes
    - Define `Message`, `MessageRole`, `StudyMode`, `StudyModeConfig` types in `types/chat.ts`
    - Define `ChatRequest` and `ChatResponse` interfaces
    - _Requirements: 9.3, 9.5_
  
  - [x] 2.2 Create TypeScript type definitions for authentication
    - Define `LoginCredentials`, `AuthError`, `User`, `Session` types in `types/auth.ts`
    - _Requirements: 9.3, 9.4_
  
  - [x] 2.3 Create Supabase database type definitions
    - Generate or define database schema types in `types/database.ts`
    - _Requirements: 9.4_

- [x] 3. Supabase authentication setup
  - [x] 3.1 Create Supabase client utilities
    - Implement browser client in `lib/supabase/client.ts` using `@supabase/ssr`
    - Implement server client in `lib/supabase/server.ts` with cookie handling
    - _Requirements: 1.1, 8.2_
  
  - [x] 3.2 Implement Next.js middleware for route protection
    - Create `middleware.ts` with session validation logic
    - Implement redirect logic for unauthenticated users accessing `/dashboard`
    - Implement redirect logic for authenticated users accessing `/login`
    - Configure middleware matcher for protected routes
    - _Requirements: 1.5, 2.1, 2.2, 2.3_
  
  - [ ]* 3.3 Write property tests for authentication
    - **Property 4: Unauthenticated access redirects to login**
    - **Validates: Requirements 1.5, 2.1, 2.2**
    - **Property 6: Expired sessions redirect to login**
    - **Validates: Requirements 2.3**

- [x] 4. Login page and authentication UI
  - [x] 4.1 Create login form component
    - Implement `components/auth/login-form.tsx` with email and password inputs
    - Add form validation for empty fields and email format
    - Implement `handleSubmit` function calling Supabase `signInWithPassword`
    - Add loading state during authentication
    - Add error state display with user-friendly messages
    - Use shadcn/ui Button, Input, and Card components
    - _Requirements: 1.1, 1.2, 1.3, 10.1_
  
  - [x] 4.2 Create login page
    - Implement `app/(auth)/login/page.tsx` with centered layout
    - Integrate LoginForm component
    - Add ForgeFlight branding and title
    - Style with aviation-themed dark mode design
    - _Requirements: 1.1, 7.3, 7.4_
  
  - [ ]* 4.3 Write property tests for authentication flows
    - **Property 1: Valid credentials create authenticated sessions**
    - **Validates: Requirements 1.2**
    - **Property 2: Invalid credentials prevent access**
    - **Validates: Requirements 1.3, 10.1**
    - **Property 3: Session persistence across refreshes**
    - **Validates: Requirements 1.4**
  
  - [ ]* 4.4 Write unit tests for login form
    - Test login form renders with email and password fields
    - Test validation errors for empty fields
    - Test error message display for invalid credentials

- [x] 5. AI service integration and system instructions
  - [x] 5.1 Create hardcoded system instruction
    - Implement `lib/ai/system-instruction.ts` with complete Forge AI instructor prompt
    - Define Forge's role, teaching style, and core rules
    - Include Cessna 172 reference data (speeds, limitations)
    - Define three study mode contexts: METAR/Weather, Emergency Scenarios, Checkride Prep
    - Export `SYSTEM_INSTRUCTION` constant and `STUDY_MODE_CONTEXTS` object
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
  
  - [x] 5.2 Implement chat API route
    - Create `app/api/chat/route.ts` with POST handler
    - Validate `GEMINI_API_KEY` environment variable
    - Parse request body for messages and optional study mode
    - Append study mode context to system instruction when mode is active
    - Call Gemini API using Vercel AI SDK `streamText` function
    - Return streaming response using `toAIStreamResponse()`
    - Implement error handling for API failures with user-friendly messages
    - Log errors to console for debugging
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 6.8, 8.5, 10.2, 10.3, 10.5_
  
  - [ ]* 5.3 Write property tests for AI service
    - **Property 14: User messages forwarded to Gemini API**
    - **Validates: Requirements 5.2**
    - **Property 15: API errors return user-friendly messages**
    - **Validates: Requirements 5.5, 10.2**
    - **Property 16: Conversation context maintained across messages**
    - **Validates: Requirements 5.6**
    - **Property 17: System instruction included in every API call**
    - **Validates: Requirements 6.8**
  
  - [ ]* 5.4 Write unit tests for chat API route
    - Test API returns 500 when GEMINI_API_KEY is missing
    - Test API handles malformed request bodies
    - Test streaming response format is correct
    - Test error responses include user-friendly messages

- [x] 6. Chat interface components
  - [x] 6.1 Create message list component
    - Implement `components/chat/message-list.tsx` to display conversation history
    - Add distinct styling for user vs AI messages (aligned right/left, different colors)
    - Implement auto-scroll to latest message
    - Add loading indicator for pending AI responses
    - Ensure mobile-responsive message bubbles with max-width 80%
    - _Requirements: 3.2, 3.4, 3.5, 3.7, 7.6_
  
  - [x] 6.2 Create message input component
    - Implement `components/chat/message-input.tsx` with controlled text input
    - Add submit button with send icon
    - Implement Enter key to submit functionality
    - Add disabled state during AI response loading
    - Style with shadcn/ui Input and Button components
    - Ensure mobile-friendly input sizing
    - _Requirements: 3.2, 3.3, 3.7_
  
  - [x] 6.3 Create quick actions component
    - Implement `components/chat/quick-actions.tsx` with three study mode buttons
    - Label buttons: "METAR & Weather", "Emergency Scenarios", "Checkride Prep"
    - Implement active/inactive visual states (filled vs outlined)
    - Add click handler to emit mode selection to parent
    - Ensure only one button can be active at a time
    - Style as pill-shaped buttons with hover animations
    - Make responsive with wrapping on mobile
    - _Requirements: 4.1, 4.2, 4.6, 4.7_
  
  - [x] 6.4 Create main chat interface component
    - Implement `components/chat/chat-interface.tsx` as container component
    - Integrate Vercel AI SDK `useChat` hook for message management
    - Manage conversation state: messages array, input value, loading state
    - Manage active study mode state
    - Implement `handleSendMessage` to send messages to `/api/chat` endpoint
    - Implement `handleQuickAction` to set active study mode
    - Pass study mode context to API when mode is active
    - Integrate MessageList, MessageInput, and QuickActions child components
    - Implement error handling with user-friendly error display
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.3, 4.4, 4.5, 10.2, 10.4_
  
  - [ ]* 6.5 Write property tests for chat interface
    - **Property 7: User messages appear in conversation history**
    - **Validates: Requirements 3.2**
    - **Property 8: Messages sent to AI service**
    - **Validates: Requirements 3.3**
    - **Property 9: AI responses appear in conversation history**
    - **Validates: Requirements 3.4, 5.3**
    - **Property 10: Loading indicator during AI response**
    - **Validates: Requirements 3.5**
    - **Property 11: Conversation history persistence during session**
    - **Validates: Requirements 3.6**
  
  - [ ]* 6.6 Write unit tests for chat components
    - Test chat interface renders on dashboard
    - Test empty message submission is prevented
    - Test loading spinner appears during API call
    - Test user and AI messages have distinct CSS classes

- [x] 7. Checkpoint - Core functionality complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Quick action button integration
  - [x] 8.1 Wire quick action buttons to chat interface
    - Connect QuickActions component mode selection to ChatInterface state
    - Ensure active mode is passed to API route in chat requests
    - Verify study mode context is appended to system instruction
    - Test mode switching updates button visual states
    - _Requirements: 4.3, 4.4, 4.5, 4.6_
  
  - [ ]* 8.2 Write property tests for quick actions
    - **Property 12: Quick action buttons inject study mode context**
    - **Validates: Requirements 4.3, 4.4, 4.5**
    - **Property 13: Quick action visual feedback**
    - **Validates: Requirements 4.6**
  
  - [ ]* 8.3 Write unit tests for quick actions
    - Test three quick action buttons render with correct labels
    - Test clicking button changes visual state
    - Test only one button can be active at a time

- [x] 9. Dashboard page and layout
  - [x] 9.1 Create dashboard page
    - Implement `app/(protected)/dashboard/page.tsx`
    - Add ForgeFlight header with logout button
    - Integrate ChatInterface component
    - Implement logout handler calling Supabase `signOut()`
    - Style with aviation-themed dark mode design
    - Ensure responsive layout for mobile (320px+) and desktop
    - _Requirements: 2.1, 2.4, 3.1, 7.3, 7.4, 7.5_
  
  - [x] 9.2 Create root layout
    - Implement `app/layout.tsx` with dark mode class
    - Add global styles in `app/globals.css`
    - Configure Inter font family
    - Add metadata for page title and description
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 9.3 Write unit tests for dashboard
    - Test dashboard renders when authenticated
    - Test dashboard shows logout button
    - Test logout button clears session and redirects

- [x] 10. Environment configuration and validation
  - [x] 10.1 Implement environment variable validation
    - Create validation function in `lib/env.ts` checking for required variables
    - Call validation on application startup
    - Throw clear error messages when variables are missing
    - _Requirements: 8.4_
  
  - [ ]* 10.2 Write property tests for environment validation
    - **Property 18: Missing environment variables produce clear errors**
    - **Validates: Requirements 8.4**
  
  - [ ]* 10.3 Write unit tests for environment validation
    - Test validation function exists
    - Test .env.example contains all required variables

- [x] 11. Error handling implementation
  - [x] 11.1 Implement authentication error handling
    - Create error message mapping function for Supabase error codes
    - Add error display in login form component
    - Test invalid credentials show user-friendly messages
    - _Requirements: 10.1_
  
  - [x] 11.2 Implement AI service error handling
    - Add try-catch blocks in chat API route
    - Return user-friendly error messages for API failures
    - Add error display in chat interface
    - Test network errors show connection messages
    - _Requirements: 10.2, 10.3, 10.4_
  
  - [x] 11.3 Add error logging
    - Add console.error calls for all error scenarios
    - Include error context (component name, error type, timestamp)
    - _Requirements: 10.5_
  
  - [ ]* 11.4 Write property tests for error handling
    - **Property 2: Invalid credentials show errors** (already covered in 4.3)
    - **Property 15: API errors return friendly messages** (already covered in 5.3)
    - **Property 19: Errors logged to console**
    - **Validates: Requirements 10.5**
  
  - [ ]* 11.5 Write unit tests for error handling
    - Test auth errors display user-friendly messages
    - Test API errors display in chat interface
    - Test network errors show connection message

- [x] 12. Logout functionality
  - [x] 12.1 Implement logout handler
    - Add logout button to dashboard header
    - Implement logout function calling Supabase `signOut()`
    - Redirect to login page after logout
    - _Requirements: 1.6_
  
  - [ ]* 12.2 Write property tests for logout
    - **Property 5: Logout terminates session (round-trip)**
    - **Validates: Requirements 1.6**

- [x] 13. Final integration and testing
  - [x] 13.1 Integration testing
    - Test complete authentication flow: login → dashboard → logout
    - Test complete chat flow: send message → receive AI response
    - Test quick action flow: click button → send message → verify mode context
    - Verify all property tests pass
    - Verify all unit tests pass
    - _Requirements: All_
  
  - [x] 13.2 Type checking and linting
    - Run TypeScript compiler to verify no type errors
    - Run ESLint to verify code quality
    - Fix any type or lint errors
    - _Requirements: 9.1, 9.2, 9.6_
  
  - [x] 13.3 Responsive design verification
    - Test UI on mobile viewport (320px width)
    - Test UI on tablet viewport (768px width)
    - Test UI on desktop viewport (1024px+ width)
    - Verify all components are usable on mobile
    - _Requirements: 2.4, 3.7, 4.7, 7.5_

- [x] 14. Final checkpoint - Deployment preparation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based and unit tests that can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation at key milestones
- All code should use strict TypeScript with no `any` types
- All components should be mobile-responsive (320px minimum width)
- All aviation data must be accurate and based on Cessna 172 POH
