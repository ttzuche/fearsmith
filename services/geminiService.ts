import {
  GoogleGenAI,
  Type,
  Modality,
  GenerateContentResponse,
} from "@google/genai";
import { Scene, StoryConfig, ViralIdea, ContentFormat } from "../types";
import {
  ART_STYLES,
  ASPECT_RATIO_SHORT,
  ASPECT_RATIO_LONG,
} from "../constants";
import {
  base64ToUint8Array,
  addWavHeader,
  arrayBufferToBase64,
} from "../utils/audioUtils";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJsonResponse = (text: string): string => {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
};

/**
 * Robust retry utility to handle transient API errors (500, 503, XHR failures).
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 2000
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const msg = error.message || JSON.stringify(error);
    const isRetryable =
      msg.includes("500") ||
      msg.includes("503") ||
      msg.includes("Internal error") ||
      msg.includes("Rpc failed") ||
      msg.includes("xhr error") ||
      msg.includes("network error") ||
      msg.includes("fetch failed") ||
      error.status === 500 ||
      error.status === 503 ||
      error.status === 429;

    if (retries > 0 && isRetryable) {
      console.warn(
        `Gemini API error (retryable), retrying in ${delay}ms...`,
        msg
      );
      await new Promise((res) => setTimeout(res, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

// --- STAGE 1: Generate Viral Ideas ---
export const generateViralIdeas = async (
  format: string,
  duration: string,
  referenceScript?: string
): Promise<{ ideas: ViralIdea[]; tokens: number }> => {
  const ai = getAI();

  let promptContext = "";
  if (referenceScript && referenceScript.trim().length > 10) {
    promptContext = `
    Analyze the "Viral DNA" of this reference transcript:
    """
    ${referenceScript.substring(0, 2000)}
    """
    Generate 5 original horror story ideas that match this successful storytelling style, hook intensity, and twist structure.
    `;
  } else {
    promptContext = `You are an expert horror storyteller and viral content strategist for YouTube channels like Mr. Nightmare.`;
  }

  const prompt = `
    ${promptContext}
    Generate 5 original viral horror story ideas for a ${format} video (${duration}).
    Focus on relatable setups, atmospheric dread, and shocking twists.
    Output Format: JSON Object with "ideas" key.
  `;

  // Removed Schema type annotation as it is not explicitly required and to follow guidelines
  const schema = {
    type: Type.OBJECT,
    properties: {
      ideas: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            hook: { type: Type.STRING },
            viralFactor: { type: Type.STRING },
          },
          required: ["title", "hook", "viralFactor"],
        },
      },
    },
    required: ["ideas"],
  };

  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
    });

    const data = JSON.parse(response.text || "{}");
    const totalTokens =
      (response.usageMetadata?.promptTokenCount || 0) +
      (response.usageMetadata?.candidatesTokenCount || 0);
    return { ideas: data.ideas || [], tokens: totalTokens };
  } catch (error) {
    console.error("Idea Generation Error:", error);
    throw new Error(
      "The Engine is currently overwhelmed. Please try again in a moment."
    );
  }
};

// --- STAGE 2: Generate Narrative Script ---
export const generateScriptFromIdea = async (
  config: StoryConfig
): Promise<{ script: string; tokens: number }> => {
  const ai = getAI();
  if (!config.selectedIdea) throw new Error("No idea selected");

  const characterInstruction = config.characterDescription
    ? `IMPORTANT: The main protagonist MUST match this physical description: ${config.characterDescription}. Ensure their gender, age, and features described here are reflected in their actions and dialogue throughout the script.`
    : "";

  let prompt = "";

  if (config.referenceScript && config.referenceScript.trim().length > 10) {
    prompt = `
      Using the reference horror story transcript I provided below as the storytelling style, tone,
      pacing, and emotional intensity reference, I want you to write a complete horror story script
      based on the following idea:
      [STORY IDEA: ${config.selectedIdea.title} - ${config.selectedIdea.hook}]
      
      ${characterInstruction}

      The story should be written to fit approximately [${config.duration}] when used as an AI
      voiceover.
      
      REFERENCE TRANSCRIPT:
      """
      ${config.referenceScript}
      """

      The narrator should not speak as if the events happened to them personally — instead, they are
      describing or retelling what happened to someone else (3rd-person narration style).
      
      Your goal is to create a viral-quality YouTube horror story script that feels human, immersive,
      and emotionally gripping — similar to what you’d see on channels like Mr. Nightmare, MJV
      Animations, or Horror Shorts Party.
      
      Requirements:
      - No timestamps, narration labels, or scene numbers — only the full story written naturally.
      - Keep the pacing tight, cinematic, and emotionally engaging.
      - Build suspense gradually and deliver a shocking twist ending.
      - Ensure the script length matches the specified duration (${config.duration}).
      - Character Naming: NEVER use "Elias".

      Final output:
      → A clean narrative script ready for narration.
    `;
  } else {
    prompt = `
      Write a complete horror story script based on:
      TITLE: ${config.selectedIdea.title}
      SUMMARY: ${config.selectedIdea.hook}
      
      ${characterInstruction}

      Requirements:
      - 3rd-person narration.
      - Approx ${config.duration}.
      - Atmospheric, cinematic pacing.
      - Shocking twist ending.
      - Assign a unique name (DO NOT use Elias).
      - Output narrative text only.
    `;
  }

  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: `You are a master horror storyteller. You specialize in 3rd-person atmospheric narration. ${characterInstruction} You never use overused names like Elias.`,
        },
      });
    });
    const totalTokens =
      (response.usageMetadata?.promptTokenCount || 0) +
      (response.usageMetadata?.candidatesTokenCount || 0);
    return {
      script: response.text || "Failed to generate script.",
      tokens: totalTokens,
    };
  } catch (error) {
    console.error("Script Generation Error:", error);
    throw new Error(
      "Failed to conjure the script. The dark forces are restless. Try again."
    );
  }
};

// --- STAGE 3: Generate Visual Prompts from Narrative ---
export const generatePromptsFromScript = async (
  inputScriptSegment: string,
  startSceneNumber: number,
  batchSize: number = 5,
  characterDescription: string,
  artStyleId: string,
  format: ContentFormat
): Promise<{
  scenes: Scene[];
  nextSceneNumber: number;
  finished: boolean;
  tokens: number;
}> => {
  const ai = getAI();
  const selectedStyle =
    ART_STYLES.find((s) => s.id === artStyleId) || ART_STYLES[0];

  const prompt = `
    Analyze this horror narrative and break it into visual scenes. 
    TEXT: "${inputScriptSegment}"
    Character Description: ${characterDescription}
    Batch Size: ${batchSize}
    Scene Starting Number: ${startSceneNumber}

    IMPORTANT: Each scene's "script" segment MUST BE SHORT. Aim for approx. 15-25 words (roughly 4-8 seconds of speech).
    Do not output long paragraphs. Break the story into small, cinematic visual beats.

    For each scene, generate a visual prompt, the verbatim script segment, and editing tips.
    Output Format: JSON.
  `;

  // Removed Schema type annotation
  const schema = {
    type: Type.OBJECT,
    properties: {
      scenes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sceneNumber: { type: Type.INTEGER },
            visualDescription: { type: Type.STRING },
            script: { type: Type.STRING },
            editingTips: { type: Type.STRING },
          },
          required: [
            "sceneNumber",
            "visualDescription",
            "script",
            "editingTips",
          ],
        },
      },
      hasMoreScenes: { type: Type.BOOLEAN },
    },
    required: ["scenes", "hasMoreScenes"],
  };

  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
    });

    const data = JSON.parse(response.text || "{}");
    const generatedScenes = (data.scenes || []).map((s: any) => ({
      sceneNumber: s.sceneNumber,
      visualDescription: s.visualDescription,
      styleBlock: selectedStyle.prompt,
      fullPrompt: `${selectedStyle.prompt}.\n\n${s.visualDescription}`,
      script: s.script || "(Silence)",
      editingTips: s.editingTips || "",
      duration: 6, // Set default to middle of 4-8 range
    }));

    const totalTokens =
      (response.usageMetadata?.promptTokenCount || 0) +
      (response.usageMetadata?.candidatesTokenCount || 0);

    return {
      scenes: generatedScenes,
      nextSceneNumber: startSceneNumber + generatedScenes.length,
      finished: !data.hasMoreScenes,
      tokens: totalTokens,
    };
  } catch (error) {
    console.error("Storyboard Error:", error);
    throw new Error(
      "Visualizing the nightmare failed. Please try the next batch again."
    );
  }
};

// --- IMAGE GENERATION ---
export const generateSceneImage = async (
  prompt: string,
  aspectRatio: "1:1" | "9:16" | "16:9" = "1:1",
  referenceImage?: string // Base64 data if available
): Promise<string> => {
  const ai = getAI();
  try {
    const response = await withRetry(async () => {
      const contents: any = { parts: [] };

      // If a reference image is provided, send it as the first part for character consistency
      if (referenceImage) {
        // Extract actual base64 data if it contains the data:image prefix
        const base64Data = referenceImage.includes(",")
          ? referenceImage.split(",")[1]
          : referenceImage;
        contents.parts.push({
          inlineData: {
            data: base64Data,
            mimeType: "image/png", // Assuming PNG for simplicity
          },
        });
        // Update prompt to instruct the model to use the reference image
        contents.parts.push({
          text: `Based on the character in the image provided, generate the following scene: ${prompt}`,
        });
      } else {
        contents.parts.push({ text: prompt });
      }

      return await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: contents,
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
          },
        },
      });
    });
    const part = response.candidates?.[0]?.content?.parts.find(
      (p) => p.inlineData
    );
    if (!part?.inlineData) throw new Error("No image data");
    return `data:image/png;base64,${part.inlineData.data}`;
  } catch (error) {
    console.error("Image Generation Error:", error);
    throw new Error("Failed to generate image.");
  }
};

// --- AUDIO GENERATION ---
export const generateNarration = async (
  text: string,
  voiceName: string = "Charon"
): Promise<string> => {
  const ai = getAI();
  try {
    const response = await withRetry(async () => {
      return await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: { parts: [{ text }] },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceName } },
          },
        },
      });
    });
    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data");
    const pcmBytes = base64ToUint8Array(base64Audio);
    const wavBuffer = addWavHeader(pcmBytes, 24000, 1);
    const wavBase64 = arrayBufferToBase64(wavBuffer);
    return `data:audio/wav;base64,${wavBase64}`;
  } catch (error) {
    throw new Error("Failed to generate narration.");
  }
};
