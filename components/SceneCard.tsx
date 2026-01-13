
import React, { useState } from 'react';
import { Scene, ContentFormat } from '../types';
import { generateSceneImage } from '../services/geminiService';
import { useAppStore } from '../store/useStore';

interface SceneCardProps {
  scene: Scene;
  onCopy: (text: string) => void;
  onImageGenerated: (url: string) => void;
  format: ContentFormat;
}

const SceneCard: React.FC<SceneCardProps> = ({ scene, onCopy, onImageGenerated, format }) => {
  const { characterReferenceImage, addUsage } = useAppStore();
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyPrompt = () => {
    onCopy(scene.fullPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleCopyScript = () => {
    onCopy(scene.script || "");
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImg(true);
    setError(null);
    try {
      // Pass formal aspect ratio to API config
      const targetRatio = isWide ? "16:9" : "9:16";
      const imageUrl = await generateSceneImage(scene.fullPrompt, targetRatio, characterReferenceImage || undefined);
      addUsage({ images: 1 });
      onImageGenerated(imageUrl);
    } catch (e) {
      setError("Failed to generate image");
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const isWide = format.includes('16:9') || format === ContentFormat.LONG || format === ContentFormat.SERIES;

  return (
    <div className="group flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all duration-300 shadow-lg hover:shadow-2xl h-full">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="font-mono text-zinc-500 text-xs font-bold tracking-widest">SCENE</span>
          <span className="font-display text-2xl text-white pt-1">{scene.sceneNumber.toString().padStart(2, '0')}</span>
        </div>
        <div className="h-2 w-2 rounded-full bg-blood-600/50 group-hover:bg-blood-500 transition-colors shadow-[0_0_8px_rgba(225,29,72,0.4)]"></div>
      </div>

      {/* Image Preview Area */}
      <div className={`${isWide ? 'aspect-video' : 'aspect-[9/16]'} bg-black relative border-b border-zinc-800 group-hover:border-zinc-700 transition-colors overflow-hidden`}>
        {scene.generatedImageUrl ? (
          <img 
            src={scene.generatedImageUrl} 
            alt={`Scene ${scene.sceneNumber}`} 
            className="w-full h-full object-cover block"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
             <div className="text-zinc-700 text-6xl opacity-20 font-display">?</div>
             <p className="text-zinc-600 text-sm">No image generated</p>
          </div>
        )}
        
        {/* Overlay Button */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-3 items-center justify-center backdrop-blur-sm">
           <button 
             onClick={handleGenerateImage}
             disabled={isGeneratingImg}
             className="bg-white text-black font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform shadow-xl uppercase text-xs tracking-widest"
           >
             {isGeneratingImg ? "Rendering..." : scene.generatedImageUrl ? "Regenerate" : "Generate Image"}
           </button>
           
           {scene.generatedImageUrl && (
             <a
               href={scene.generatedImageUrl}
               download={`scene-${scene.sceneNumber}.png`}
               className="bg-zinc-800 text-white font-bold py-2 px-6 rounded-full hover:bg-zinc-700 transition-colors shadow-xl uppercase text-xs tracking-widest border border-zinc-600"
               onClick={(e) => e.stopPropagation()}
             >
               Download Image
             </a>
           )}
        </div>
        
        {error && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-900/90 text-white text-xs p-2 text-center">
            {error}
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow gap-6">
        
        {/* Visual Section */}
        <div className="space-y-3 flex-grow">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Visual Prompt</h4>
            <button 
              onClick={handleCopyPrompt}
              className={`text-[10px] font-bold px-3 py-1.5 rounded transition-colors uppercase tracking-wide border ${
                copiedPrompt 
                  ? 'bg-green-950 border-green-900 text-green-400' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
              }`}
            >
              {copiedPrompt ? "Copied" : "Copy Prompt"}
            </button>
          </div>
          
          <div className="text-sm leading-7 text-zinc-300 font-sans">
            {scene.visualDescription}
          </div>
        </div>

        <div className="h-px bg-zinc-800 w-full"></div>

        {/* Script Section */}
        <div className="space-y-3">
           <div className="flex justify-between items-center">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Narration</h4>
            <button 
              onClick={handleCopyScript}
              disabled={!scene.script}
              className={`text-[10px] font-bold px-3 py-1.5 rounded transition-colors uppercase tracking-wide border ${
                copiedScript 
                  ? 'bg-green-950 border-green-900 text-green-400' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600'
              }`}
            >
              {copiedScript ? "Copied" : "Copy Text"}
            </button>
          </div>
          <div className="bg-zinc-900/50 rounded-lg p-4 text-sm font-mono text-zinc-400 border border-zinc-800/50 leading-relaxed">
            {scene.script || "No audio for this scene."}
          </div>
        </div>
      </div>
      
      {/* Footer / Editor Note */}
      {scene.editingTips && (
        <div className="bg-zinc-900 border-t border-zinc-800 px-6 py-4">
          <div className="flex gap-3 items-start">
            <span className="text-[10px] font-bold text-amber-600 uppercase mt-0.5 tracking-wider">Note</span>
            <p className="text-xs text-zinc-500 leading-relaxed">{scene.editingTips}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SceneCard;
