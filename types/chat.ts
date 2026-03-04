export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
}

export type StudyMode = 
  | 'METAR_WEATHER' 
  | 'EMERGENCY_SCENARIOS' 
  | 'CHECKRIDE_PREP';

export interface StudyModeConfig {
  id: StudyMode;
  label: string;
  contextPrompt: string;
  icon?: string;
}

export interface ChatRequest {
  messages: Message[];
  mode?: StudyMode;
}

export interface ChatResponse {
  message: Message;
  error?: string;
}
