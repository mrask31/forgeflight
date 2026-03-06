# Requirements Document

## Introduction

ForgeFlight currently uses Google Gemini 2.5 Flash as its sole AI model for all interactions. This feature introduces a sophisticated multi-model architecture that leverages the strengths of different AI models for specific tasks: Claude 3.7 Sonnet for text-based reasoning and tutoring, and Google Gemini 2.5 Flash for image analysis of sectional charts and aviation documents. The system will intelligently route requests based on message content while maintaining the existing chat interface and user experience.

## Glossary

- **Chat_Router**: The API route component that analyzes incoming messages and selects the appropriate AI model
- **Claude_Provider**: The Anthropic Claude 3.7 Sonnet model integration for text-based interactions
- **Gemini_Provider**: The Google Gemini 2.5 Flash model integration for image processing
- **Message_Attachment**: An image file uploaded by the user through the chat interface
- **Sectional_Scanner**: The image upload feature that allows students to submit sectional charts for analysis
- **Podcast_Player**: The audio playback component for pre-recorded aviation briefings
- **System_Instruction**: The prompt configuration that defines the AI's behavior and teaching methodology
- **Socratic_Method**: A teaching approach that guides students to answers through questions rather than direct answers

## Requirements

### Requirement 1: Multi-Model Provider Integration

**User Story:** As a developer, I want to integrate both Claude and Gemini AI providers, so that the system can leverage different models for different tasks.

#### Acceptance Criteria

1. THE Chat_Router SHALL import the Anthropic provider from @ai-sdk/anthropic package
2. THE Chat_Router SHALL import the Google provider from @ai-sdk/google package
3. THE Chat_Router SHALL validate the ANTHROPIC_API_KEY environment variable exists before processing text-only requests
4. THE Chat_Router SHALL validate the GOOGLE_GENERATIVE_AI_API_KEY environment variable exists before processing image requests
5. IF an API key is missing, THEN THE Chat_Router SHALL return a 500 error with code MISSING_API_KEY

### Requirement 2: Intelligent Model Routing

**User Story:** As the system, I want to automatically route messages to the appropriate AI model, so that each model handles the tasks it excels at.

#### Acceptance Criteria

1. WHEN a user message contains a Message_Attachment, THE Chat_Router SHALL route the request to Gemini_Provider using model gemini-2.5-flash
2. WHEN a user message contains only text with no attachments, THE Chat_Router SHALL route the request to Claude_Provider using model claude-3-7-sonnet-20250219
3. THE Chat_Router SHALL detect attachments by checking the experimental_attachments array in the message payload
4. THE Chat_Router SHALL log which model is being used for each request
5. FOR ALL requests, THE Chat_Router SHALL maintain the existing streaming response format

### Requirement 3: Socratic Tutoring Methodology

**User Story:** As a student pilot, I want the AI to guide me to answers rather than just telling me, so that I develop deeper understanding and critical thinking skills.

#### Acceptance Criteria

1. THE System_Instruction SHALL include guidance to use the Socratic method for coursework questions
2. WHEN a student asks a knowledge question, THE Claude_Provider SHALL respond with guiding questions rather than direct answers
3. THE System_Instruction SHALL instruct the AI to ask "What do you think would happen if..." style questions
4. THE System_Instruction SHALL require the AI to celebrate correct reasoning before providing additional context
5. THE System_Instruction SHALL require the AI to gently correct misconceptions by asking clarifying questions first

### Requirement 4: Knowledge Base Verification

**User Story:** As a student pilot, I want all aviation information to be verified against official sources, so that I can trust the accuracy of what I'm learning.

#### Acceptance Criteria

1. THE System_Instruction SHALL require verification of all speeds and limitations against the Cessna 172S POH
2. THE System_Instruction SHALL require verification of all procedures against Elite Aviation training materials
3. WHEN the AI provides information outside the training materials, THE Claude_Provider SHALL explicitly disclose this fact
4. IF the AI is uncertain about a specific value or procedure, THEN THE Claude_Provider SHALL state this clearly and recommend verification with an instructor
5. THE System_Instruction SHALL prohibit hallucination of aviation data

### Requirement 5: Sectional Scanner Image Upload

**User Story:** As a student pilot, I want to upload sectional charts and aviation documents, so that I can get help understanding chart symbols and airspace.

#### Acceptance Criteria

1. THE Message_Input SHALL display a Paperclip icon button from lucide-react
2. THE Paperclip button SHALL be positioned to the left of the text input field
3. WHEN the Paperclip button is clicked, THE Message_Input SHALL open a file selection dialog accepting image files
4. WHEN an image is selected, THE Message_Input SHALL convert the file to base64 format
5. THE Message_Input SHALL send the image using the Vercel AI SDK experimental_attachments format
6. WHEN an image is attached without text, THE Message_Input SHALL include default text "Please analyze this sectional chart or flight map"
7. THE Message_Input SHALL display a thumbnail preview of the attached image before sending
8. THE Message_Input SHALL clear the file input after successful upload to allow re-uploading the same file

### Requirement 6: Podcast Player Functionality

**User Story:** As a student pilot, I want to listen to pre-recorded audio briefings, so that I can study while commuting or during other activities.

#### Acceptance Criteria

1. THE Quick_Actions component SHALL transform the "🎧 Audio Briefing (Beta)" button from disabled to functional
2. WHEN the Audio Briefing button is clicked, THE Quick_Actions SHALL reveal an HTML5 audio player element
3. THE audio player SHALL have its source set to /audio/briefing.mp3
4. THE audio player SHALL include native browser controls for play, pause, and seek
5. THE audio player SHALL match the aviation-themed dark mode styling of the application
6. THE audio player SHALL be mobile-responsive and functional on touch devices

### Requirement 7: Dependency Management

**User Story:** As a developer, I want all required packages installed, so that the multi-model architecture functions correctly.

#### Acceptance Criteria

1. THE project SHALL include @ai-sdk/anthropic package in package.json dependencies
2. THE project SHALL include @ai-sdk/google package in package.json dependencies
3. THE project SHALL include lucide-react package in package.json dependencies
4. THE project SHALL include ai package (Vercel AI SDK) in package.json dependencies
5. FOR ALL dependencies, THE package versions SHALL be compatible with Next.js App Router

### Requirement 8: Environment Configuration

**User Story:** As a developer, I want clear environment variable configuration, so that I can deploy the application with proper API credentials.

#### Acceptance Criteria

1. THE .env.local file SHALL include ANTHROPIC_API_KEY variable
2. THE .env.local file SHALL include GOOGLE_GENERATIVE_AI_API_KEY variable
3. THE .env.local file SHALL include comments explaining which model uses which key
4. THE Chat_Router SHALL provide clear error messages when environment variables are missing
5. THE error messages SHALL not expose sensitive configuration details to end users

### Requirement 9: Backward Compatibility

**User Story:** As a user, I want existing chat functionality to continue working, so that the upgrade doesn't disrupt my study workflow.

#### Acceptance Criteria

1. THE Chat_Interface SHALL maintain the existing useChat hook integration
2. THE Message_List SHALL continue to display messages in the same format
3. THE Quick_Actions study mode buttons SHALL continue to function identically
4. THE streaming response behavior SHALL remain unchanged for end users
5. FOR ALL existing features, THE user experience SHALL be preserved during the multi-model transition

### Requirement 10: Image Analysis Capabilities

**User Story:** As a student pilot, I want the AI to accurately analyze sectional charts, so that I can learn to read aviation maps correctly.

#### Acceptance Criteria

1. WHEN an image is uploaded, THE Gemini_Provider SHALL analyze all visible chart symbols and markings
2. THE Gemini_Provider SHALL identify airports, airspace boundaries, navigation aids, and obstacles in the image
3. THE Gemini_Provider SHALL explain chart features in clear, educational terms
4. THE Gemini_Provider SHALL ask questions to test the student's chart reading skills
5. IF chart details are unclear or ambiguous, THEN THE Gemini_Provider SHALL state this rather than guessing
