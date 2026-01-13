// Interface for the global Puter object
declare global {
  interface Window {
    puter: any;
  }
}

// Helper to prevent infinite hangs
const withTimeout = <T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error(errorMsg)), ms);
    promise.then((res) => {
      clearTimeout(timeoutId);
      resolve(res);
    }).catch((err) => {
      clearTimeout(timeoutId);
      reject(err);
    });
  });
};

export const generatePuterAudio = async (text: string, voice: string, engine: string, styleInstruction?: string): Promise<string> => {
  if (!window.puter) {
    throw new Error("Puter.js library not loaded. Please refresh the page.");
  }
  
  // List of known OpenAI voices supported by Puter.js
  const OPENAI_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  const isOpenAI = OPENAI_VOICES.includes(voice.toLowerCase());

  try {
    let audio;
    
    // Set a timeout (60s for OpenAI as it can be slow, 30s for standard)
    if (isOpenAI) {
      // Use OpenAI Provider
      console.log(`[PuterService] Generating OpenAI Audio. Voice: ${voice}, Style: ${styleInstruction}`);
      const task = window.puter.ai.txt2speech(text, {
        provider: 'openai',
        model: 'tts-1', // Standard TTS model
        voice: voice.toLowerCase(),
        instructions: styleInstruction || "Speak clearly."
      });
      audio = await withTimeout(task, 60000, "Request timed out (server busy). Please try again.");
    } else {
      // Use Default/AWS Provider
      console.log(`[PuterService] Generating Standard Audio. Voice: ${voice}, Engine: ${engine}`);
      const task = window.puter.ai.txt2speech(text, {
        voice: voice,
        engine: engine,
        language: "en-US"
      });
      audio = await withTimeout(task, 30000, "Request timed out. Please try again.");
    }
    
    // The Puter API returns an HTMLAudioElement. We extract the src URL.
    if (audio && audio.src) {
      return audio.src;
    } else {
      throw new Error("Audio generated but no source URL found.");
    }
  } catch (error: any) {
    console.error("Puter Audio Error:", error);
    throw new Error(error.message || "Failed to generate audio via Puter.js");
  }
};