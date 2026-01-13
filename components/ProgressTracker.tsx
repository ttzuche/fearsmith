
import React, { useState } from 'react';
import { ProjectStage } from '../types';
import { useAppStore } from '../store/useStore';

interface Props {
  currentStage: ProjectStage;
  setStage: (stage: ProjectStage) => void;
  maxStageReached: ProjectStage;
}

const steps = [
  { id: ProjectStage.IDEA, label: "Idea Lab" },
  { id: ProjectStage.SCRIPT, label: "Narrative" },
  { id: ProjectStage.STORYBOARD, label: "Visuals" },
  { id: ProjectStage.AUDIO, label: "Audio Studio" },
  { id: ProjectStage.EXPORT, label: "Export" },
];

const ProgressTracker: React.FC<Props> = ({ currentStage, setStage, maxStageReached }) => {
  const { usage } = useAppStore();
  const [showUsageDetails, setShowUsageDetails] = useState(false);

  return (
    <div className="w-full bg-void-950 border-b border-void-800 sticky top-0 z-50 shadow-2xl">
      
      {/* Top Utility Bar: Logo & Resources */}
      <div className="bg-black/40 border-b border-void-900/50 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blood-600 text-lg">💀</span>
            <h1 className="text-lg font-display font-bold text-white tracking-[0.2em] uppercase">
              FearSmith
            </h1>
          </div>

          {/* Resource Monitor Section */}
          <div className="relative">
            <div 
              className="flex items-center gap-4 bg-zinc-950/80 border border-zinc-800 px-4 py-1 rounded-full hover:border-blood-900/50 cursor-help transition-all group"
              onMouseEnter={() => setShowUsageDetails(true)}
              onMouseLeave={() => setShowUsageDetails(false)}
            >
               <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-blood-500 transition-colors">System Resources</span>
               <div className="w-px h-3 bg-zinc-800"></div>
               <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">TOKENS</span>
                  <span className="text-xs font-mono text-zinc-300">{(usage.tokens / 1000).toFixed(1)}K</span>
               </div>
               <div className="w-px h-2 bg-zinc-800"></div>
               <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">ASSETS</span>
                  <span className="text-xs font-mono text-zinc-300">{usage.images + usage.audio}</span>
               </div>
               <div className="w-1.5 h-1.5 rounded-full bg-blood-600 animate-pulse shadow-[0_0_5px_rgba(225,29,72,0.8)]"></div>
            </div>

            {showUsageDetails && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl p-5 animate-in fade-in slide-in-from-top-1 duration-200 z-[60] backdrop-blur-xl">
                 <h4 className="text-[10px] font-bold text-blood-500 uppercase tracking-[0.2em] mb-4 border-b border-zinc-800 pb-2">Session Resource Matrix</h4>
                 
                 <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <span className="text-xs text-zinc-400">Total Tokens</span>
                       <span className="text-sm font-mono text-white">{usage.tokens.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs text-zinc-400">Images Generated</span>
                       <span className="text-sm font-mono text-white">{usage.images}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs text-zinc-400">Audio Clips Generated</span>
                       <span className="text-sm font-mono text-white">{usage.audio}</span>
                    </div>
                 </div>

                 <div className="mt-5 pt-4 border-t border-zinc-800 space-y-2">
                    <div className="text-[9px] text-zinc-500 leading-relaxed italic">
                      Note: Gemini Free Tier allows approx. 1,500 requests per day for Flash models and 50 for Pro. Limits reset daily.
                    </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bar: Dedicated row for stages */}
      <div className="max-w-7xl mx-auto py-4 px-6 flex justify-center overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-4 md:space-x-12 min-w-max">
          {steps.map((step, index) => {
            const isActive = currentStage === step.id;
            const isCompleted = step.id < currentStage;
            const isClickable = step.id <= maxStageReached;

            return (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex items-center group ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-40'}`}
                  onClick={() => isClickable && setStage(step.id)}
                >
                  <div className={`
                    relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full border-2 text-[10px] md:text-sm font-bold transition-all duration-300
                    ${isActive 
                      ? 'border-blood-500 bg-blood-900/20 text-blood-100 shadow-[0_0_20px_rgba(225,29,72,0.4)] scale-110' 
                      : isCompleted 
                        ? 'border-blood-800 bg-void-900 text-blood-700' 
                        : 'border-void-700 bg-void-900 text-void-600'}
                  `}>
                    {isCompleted ? '✓' : index + 1}
                    {isActive && (
                       <span className="absolute -inset-1 rounded-full border border-blood-500/30 animate-ping"></span>
                    )}
                  </div>
                  <div className="flex flex-col ml-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest font-sans ${isActive ? 'text-blood-400' : 'text-zinc-600 group-hover:text-zinc-400 transition-colors'}`}>
                      Stage 0{index + 1}
                    </span>
                    <span className={`text-xs md:text-sm font-medium font-display tracking-wide ${isActive ? 'text-gray-100' : 'text-zinc-500'}`}>
                      {step.label}
                    </span>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 md:w-16 h-px ${isCompleted ? 'bg-blood-900' : 'bg-void-800'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      
    </div>
  );
};

export default ProgressTracker;
