
import React from 'react';
import { Scene, ContentFormat } from '../types';
import SceneCard from './SceneCard';
import { useAppStore } from '../store/useStore';

interface Props {
  scenes: Scene[];
  isGenerating: boolean;
  onGenerateNextBatch: () => void;
  onProceed: () => void;
  nextSceneNumber: number;
  batchSize: number;
  format: ContentFormat;
  scriptContent: string;
}

const VisualStoryboard: React.FC<Props> = ({ 
  scenes, 
  isGenerating, 
  onGenerateNextBatch, 
  onProceed,
  format,
  scriptContent
}) => {
  const { updateScene, isScriptFinished, processedCharCount } = useAppStore();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleImageGenerated = (sceneNumber: number, imageUrl: string) => {
    updateScene(sceneNumber, { generatedImageUrl: imageUrl });
  };

  // --- Statistics ---
  const imagesRendered = scenes.filter(s => !!s.generatedImageUrl).length;
  const renderProgress = scenes.length > 0 ? (imagesRendered / scenes.length) * 100 : 0;
  
  // Use processedCharCount for precise progress tracking, force 100% if finished
  const scriptProgress = isScriptFinished 
    ? 100 
    : (scriptContent.length > 0 ? Math.min(100, (processedCharCount / scriptContent.length) * 100) : 0);

  return (
    <div className="h-full flex flex-col space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Total Scenes</span>
          <span className="text-2xl font-mono text-white">{scenes.length}</span>
          <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-zinc-500" style={{ width: '100%' }}></div>
          </div>
        </div>
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Images Rendered</span>
          <span className="text-2xl font-mono text-white">{imagesRendered} / {scenes.length}</span>
          <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${renderProgress}%` }}></div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Script Processed</span>
          <span className="text-2xl font-mono text-white">{Math.round(scriptProgress)}%</span>
          <div className="mt-2 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${scriptProgress}%` }}></div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 flex flex-col">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Status</span>
          <span className={`text-sm font-bold uppercase tracking-widest mt-1 ${isScriptFinished ? 'text-green-500' : 'text-amber-500'}`}>
            {isScriptFinished ? "SCRIPT VISUALIZED ✓" : isGenerating ? "Processing..." : "Needs More Scenes"}
          </span>
          <p className="text-[9px] text-zinc-600 mt-2">
            {isScriptFinished ? "Ready to proceed to audio studio." : "Generate more batches to finish script."}
          </p>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-void-950 border border-void-800 rounded-xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
        <div>
          <h2 className="text-4xl font-display font-bold text-white tracking-wide">Visual Storyboard</h2>
          <p className="text-zinc-400 text-base mt-2 max-w-xl">
            Visualize your nightmare. Each batch breaks down a piece of your narrative into prompts.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
           
           {!isScriptFinished && (
             <button
              onClick={onGenerateNextBatch}
              disabled={isGenerating}
              className={`
                inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold uppercase tracking-wider ring-offset-void-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50
                h-12 px-6
                ${isGenerating 
                  ? 'bg-zinc-800 text-zinc-400' 
                  : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200/90'}
              `}
            >
              {isGenerating ? (
                 <span className="flex items-center gap-2">
                   <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Dreaming...
                 </span>
              ) : (
                 <span>Generate Next Batch</span>
              )}
            </button>
           )}

          {scenes.length > 0 && (
            <button
              onClick={onProceed}
              className={`
                inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-bold uppercase tracking-wider ring-offset-void-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blood-600 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-12 px-6 
                ${isScriptFinished 
                  ? 'bg-blood-600 text-white hover:bg-blood-700 shadow-[0_0_20px_rgba(225,29,72,0.2)]' 
                  : 'bg-zinc-800 text-zinc-500 cursor-help'}
              `}
              title={!isScriptFinished ? "You should finish processing the script before proceeding." : ""}
            >
              {isScriptFinished ? "PROCEED TO AUDIO STUDIO →" : "Finish Script Processing First"}
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-grow pb-20">
        {scenes.length === 0 ? (
          <div className="h-[500px] border-2 border-dashed border-zinc-800 bg-zinc-900/30 rounded-xl flex items-center justify-center text-zinc-600 flex-col gap-6">
             <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-4xl shadow-lg">
               👁️
             </div>
             <div className="text-center space-y-2">
               <p className="text-xl font-medium text-zinc-300">Your canvas is empty</p>
               <p className="text-base text-zinc-500">Generate the first batch of scenes to start visualizing your script.</p>
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
             {scenes.map((scene) => (
               <SceneCard 
                  key={scene.sceneNumber} 
                  scene={scene} 
                  onCopy={handleCopy} 
                  onImageGenerated={(url) => handleImageGenerated(scene.sceneNumber, url)}
                  format={format}
               />
             ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default VisualStoryboard;
