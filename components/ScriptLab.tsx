import React from 'react';

interface Props {
  scriptContent: string;
  setScriptContent: (content: string) => void;
  onProceed: () => void;
  onRegenerate: () => void;
  isGenerating: boolean;
}

const ScriptLab: React.FC<Props> = ({ scriptContent, setScriptContent, onProceed, onRegenerate, isGenerating }) => {
  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in slide-in-from-right-8 duration-500">
      
      {/* Editor Panel */}
      <div className="flex-grow flex flex-col bg-zinc-950 border border-zinc-800 rounded-xl shadow-sm overflow-hidden">
        <div className="bg-zinc-900/50 px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-[10px] font-mono text-zinc-400">READ-WRITE</div>
            <span className="text-sm font-medium text-zinc-300">Narrative Editor</span>
          </div>
          <span className="text-xs text-zinc-500 font-mono">{(scriptContent.length / 1000).toFixed(1)}k chars</span>
        </div>
        
        <textarea 
          className={`flex-grow w-full bg-transparent p-6 text-zinc-300 font-mono text-sm leading-7 resize-none focus:outline-none scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent ${isGenerating ? 'opacity-50 cursor-wait' : ''}`}
          value={scriptContent}
          onChange={(e) => setScriptContent(e.target.value)}
          spellCheck={false}
          disabled={isGenerating}
          placeholder="// The story narrative will appear here..."
        />
      </div>

      {/* Sidebar Controls */}
      <div className="w-80 flex-shrink-0 flex flex-col gap-4">
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="text-lg font-display text-white tracking-wide">Actions</h3>
            <p className="text-xs text-zinc-500">Review the narrative flow. This text will be converted into voiceover.</p>
          </div>
          
          <button 
             onClick={onRegenerate}
             disabled={isGenerating}
             className="inline-flex items-center justify-center w-full whitespace-nowrap rounded-md text-sm font-medium ring-offset-void-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-zinc-800 bg-transparent hover:bg-zinc-800 hover:text-zinc-50 h-9 px-4 py-2"
          >
            {isGenerating ? (
               <span className="flex items-center gap-2">
                 <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                 Rewriting...
               </span>
            ) : "Regenerate Story"}
          </button>
          
          <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-lg">
             <div className="flex gap-2 items-center mb-2">
               <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               <h4 className="text-blue-500 text-xs font-bold uppercase">Note</h4>
             </div>
             <p className="text-xs text-blue-200/50 leading-relaxed">
               This is a continuous 3rd-person narrative. Do not add timestamps or scene headers manually. The Storyboard engine will automatically break this text into visual scenes in the next step.
             </p>
          </div>
        </div>

        <button
          onClick={onProceed}
          disabled={isGenerating}
          className="mt-auto inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-void-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-white text-zinc-950 hover:bg-zinc-200 h-12 px-4 py-2 shadow-lg"
        >
          Proceed to Storyboard →
        </button>
      </div>
    </div>
  );
};

export default ScriptLab;