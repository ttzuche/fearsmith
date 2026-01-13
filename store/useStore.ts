
import { create } from 'zustand';
import { Scene, UsageStats } from '../types';

export interface AudioSegment {
  id: number;
  text: string;
  url: string | null;
  isGenerating: boolean;
}

interface AppState {
  scenes: Scene[];
  isScriptFinished: boolean;
  processedCharCount: number;
  audioDurations: Record<number, number>; // Maps sceneNumber to duration in seconds
  characterReferenceImage: string | null; // Base64 image data
  
  usage: UsageStats;
  addUsage: (stats: Partial<UsageStats>) => void;

  setScenes: (scenes: Scene[] | ((prev: Scene[]) => Scene[])) => void;
  setIsScriptFinished: (finished: boolean) => void;
  setProcessedCharCount: (count: number) => void;
  setCharacterReferenceImage: (image: string | null) => void;
  updateScene: (sceneNumber: number, partial: Partial<Scene>) => void;
  setAudioDuration: (sceneNumber: number, duration: number) => void;

  audioSegments: AudioSegment[];
  setAudioSegments: (segments: AudioSegment[]) => void;
  updateSegment: (id: number, partial: Partial<AudioSegment>) => void;

  // Audio Settings
  audioProvider: 'gemini' | 'puter';
  audioEngine: 'neural' | 'standard';
  audioVoice: string;
  audioStyle: string;
  setAudioSettings: (settings: Partial<{ 
    audioProvider: 'gemini' | 'puter', 
    audioEngine: 'neural' | 'standard', 
    audioVoice: string,
    audioStyle: string
  }>) => void;
}

export const useAppStore = create<AppState>((set) => ({
  scenes: [],
  isScriptFinished: false,
  processedCharCount: 0,
  audioDurations: {},
  characterReferenceImage: null,
  
  usage: {
    tokens: 0,
    images: 0,
    audio: 0
  },
  addUsage: (stats) => set((state) => ({
    usage: {
      tokens: state.usage.tokens + (stats.tokens || 0),
      images: state.usage.images + (stats.images || 0),
      audio: state.usage.audio + (stats.audio || 0)
    }
  })),

  setScenes: (scenes) => set((state) => ({
    scenes: typeof scenes === 'function' ? scenes(state.scenes) : scenes
  })),
  setIsScriptFinished: (finished) => set({ isScriptFinished: finished }),
  setProcessedCharCount: (count) => set({ processedCharCount: count }),
  setCharacterReferenceImage: (image) => set({ characterReferenceImage: image }),
  updateScene: (sceneNumber, partial) => set((state) => ({
    scenes: state.scenes.map((s) => s.sceneNumber === sceneNumber ? { ...s, ...partial } : s)
  })),
  setAudioDuration: (sceneNumber, duration) => set((state) => ({
    audioDurations: { ...state.audioDurations, [sceneNumber]: duration }
  })),

  audioSegments: [],
  setAudioSegments: (segments) => set({ audioSegments: segments }),
  updateSegment: (id, partial) => set((state) => ({
    audioSegments: state.audioSegments.map((s) => s.id === id ? { ...s, ...partial } : s)
  })),

  // Default initial settings
  audioProvider: 'puter',
  audioEngine: 'neural',
  audioVoice: 'onyx', // Default to HQ voice
  audioStyle: 'suspenseful',
  setAudioSettings: (settings) => set((state) => ({ ...state, ...settings })),
}));
