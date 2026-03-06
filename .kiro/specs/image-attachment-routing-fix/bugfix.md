# Bugfix Requirements Document

## Introduction

The polyglot router in the chat API is failing to detect image attachments, causing all requests (including those with images) to be routed to Claude instead of Gemini. This prevents users from analyzing sectional charts and flight maps, which is a core feature of the "Sectional Scanner" functionality. The bug occurs despite the frontend correctly sending attachment data via the `experimental_attachments` array.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user uploads an image file through the chat interface THEN the system routes the request to Claude (text-only model) instead of Gemini

1.2 WHEN the backend receives a message with `experimental_attachments` array THEN the system fails to detect the attachment and logs "Routing to Claude"

1.3 WHEN the frontend calls `append()` with image data in `experimental_attachments` THEN the attachment data does not reach the backend routing logic in a detectable format

### Expected Behavior (Correct)

2.1 WHEN a user uploads an image file through the chat interface THEN the system SHALL route the request to Google Gemini 2.5 Flash for image analysis

2.2 WHEN the backend receives a message with image attachment data THEN the system SHALL detect the attachment and log "Routing to Gemini (Sectional Scanner)"

2.3 WHEN the frontend calls `append()` with image data THEN the system SHALL preserve the attachment data through the API request so the backend can detect it

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user sends a text-only message without attachments THEN the system SHALL CONTINUE TO route the request to Claude for Socratic tutoring

3.2 WHEN the backend receives messages without attachments THEN the system SHALL CONTINUE TO log "Routing to Claude (Grounded Truth)"

3.3 WHEN quick action modes are selected THEN the system SHALL CONTINUE TO include the appropriate mode context in the system message

3.4 WHEN API keys are missing THEN the system SHALL CONTINUE TO return appropriate error responses with status 500
