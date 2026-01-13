
export enum ContentFormat {
  SHORT = 'YouTube Short (Vertical 9:16)',
  LONG = 'Long Form (Horizontal 16:9)',
  SERIES = 'Series Episode',
}

export enum ProjectStage {
  IDEA = 1,
  SCRIPT = 2,
  STORYBOARD = 3,
  AUDIO = 4,
  EXPORT = 5,
}

export interface ViralIdea {
  title: string;
  hook: string;
  viralFactor: string;
}

export interface StoryConfig {
  format: ContentFormat;
  selectedIdea: ViralIdea | null;
  duration: string; 
  voice: string;
  audioProvider: 'gemini' | 'puter';
  audioEngine: 'neural' | 'standard' | 'generative';
  audioStyle?: string;
  characterDescription: string;
  artStyleId: string;
  referenceScript?: string;
}

export interface Scene {
  sceneNumber: number;
  visualDescription: string;
  fullPrompt: string;
  styleBlock: string; 
  script?: string;
  editingTips?: string;
  generatedImageUrl?: string; 
  duration: number; // Duration in seconds for the timeline
}

export interface ScriptData {
  content: string;
  isEdited: boolean;
}

export interface GenerationStatus {
  isGenerating: boolean;
  currentTask: string;
  error: string | null;
}

export interface UsageStats {
  tokens: number;
  images: number;
  audio: number;
}
