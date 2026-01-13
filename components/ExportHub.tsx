
import React, { useState, useEffect, useRef } from 'react';
import { Scene } from '../types';
import { useAppStore } from '../store/useStore';

interface Props {
  scenes: Scene[];
  script: string;
  audioUrl: string | null;
}

const ExportHub: React.FC<Props> = ({ scenes: initialScenes, script, audioUrl: masterAudioUrl }) => {
  const { audioSegments, audioDurations } = useAppStore();
  const [scenes, setScenes] = useState<Scene[]>(() => {
    // Initialize durations from the store if available
    return initialScenes.map(scene => ({
      ...scene,
      duration: audioDurations[scene.sceneNumber] || scene.duration || 6
    }));
  });
  
  // Update local scenes if audioDurations changes
  useEffect(() => {
    setScenes(prev => prev.map(s => ({
      ...s,
      duration: audioDurations[s.sceneNumber] || s.duration || 6
    })));
  }, [audioDurations]);

  // Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  
  const playbackIntervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalDuration = scenes.reduce((acc, s) => acc + (s.duration || 6), 0);

  // Sync scene state with active scene based on current time
  useEffect(() => {
    let accumulatedTime = 0;
    let foundIndex = 0;
    for (let i = 0; i < scenes.length; i++) {
      const sceneDur = scenes[i].duration || 6;
      accumulatedTime += sceneDur;
      if (currentTime < accumulatedTime) {
        foundIndex = i;
        break;
      }
      if (i === scenes.length - 1) foundIndex = i;
    }
    
    if (foundIndex !== activeSceneIndex) {
      setActiveSceneIndex(foundIndex);
    }
  }, [currentTime, scenes, activeSceneIndex]);

  // Handle specific audio clip playback when scene changes during active playback
  useEffect(() => {
    if (isPlaying && audioRef.current) {
      const activeScene = scenes[activeSceneIndex];
      const segment = audioSegments.find(s => s.id === activeScene.sceneNumber);
      if (segment?.url) {
        audioRef.current.src = segment.url;
        audioRef.current.play().catch(e => console.warn("Audio playback interrupted"));
      }
    }
  }, [activeSceneIndex, isPlaying, scenes, audioSegments]);

  const togglePlayback = () => {
    if (isPlaying) {
      if (playbackIntervalRef.current) window.clearInterval(playbackIntervalRef.current);
      if (audioRef.current) audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      // Trigger first audio immediately
      const activeScene = scenes[activeSceneIndex];
      const segment = audioSegments.find(s => s.id === activeScene.sceneNumber);
      if (segment?.url && audioRef.current) {
        audioRef.current.src = segment.url;
        audioRef.current.play().catch(e => console.warn("Audio start failed"));
      }

      playbackIntervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            if (playbackIntervalRef.current) window.clearInterval(playbackIntervalRef.current);
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
    }
  };

  const handleDurationChange = (index: number, newVal: string) => {
    const val = parseFloat(newVal);
    if (isNaN(val) || val < 0.5) return;
    const newScenes = [...scenes];
    newScenes[index].duration = val;
    setScenes(newScenes);
  };

  const getAudioForScene = (scene: Scene) => {
    const segment = audioSegments.find(s => s.id === scene.sceneNumber);
    return segment?.url || null;
  };

  const activeScene = scenes[activeSceneIndex];
  const activeAudio = activeScene ? getAudioForScene(activeScene) : null;

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in slide-in-from-bottom-8 duration-500 pb-32">
      
      <audio ref={audioRef} className="hidden" />

      {/* Production Header */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-zinc-800 pb-8">
        <div>
          <h2 className="text-5xl font-display font-bold text-white tracking-wide uppercase">Production Studio</h2>
          <p className="text-zinc-500 mt-2 text-lg">Finalize timing and sync narration to visuals.</p>
        </div>
        <div className="flex gap-8 mt-6 md:mt-0">
          <div className="text-right px-6 border-r border-zinc-800">
             <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Total Length</div>
             <div className="text-3xl font-mono text-blood-500 mt-1">{totalDuration.toFixed(1)}s</div>
          </div>
          <div className="text-right">
             <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Playhead</div>
             <div className="text-3xl font-mono text-white mt-1">{currentTime.toFixed(1)}s</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left/Middle: Master Previewer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group">
             
             <div className="w-full h-full flex items-center justify-center relative bg-black">
                {activeScene?.generatedImageUrl ? (
                   <img 
                     src={activeScene.generatedImageUrl} 
                     className="w-full h-full object-contain animate-in fade-in duration-500" 
                     alt="Preview"
                   />
                ) : (
                   <div className="text-center space-y-4">
                      <div className="text-zinc-800 text-8xl font-display opacity-20">?</div>
                      <div className="bg-zinc-900 px-6 py-2 rounded-full border border-zinc-800">
                        <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">MISSING VISUAL</span>
                      </div>
                   </div>
                )}

                <div className="absolute top-4 left-4 flex gap-2">
                   <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-md border border-zinc-700/50 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blood-600 animate-pulse"></div>
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">Scene {activeSceneIndex + 1}</span>
                   </div>
                   {!activeAudio && (
                      <div className="bg-amber-950/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-amber-900/50 flex items-center gap-2">
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">⚠️ NO AUDIO</span>
                      </div>
                   )}
                </div>
             </div>

             <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 pointer-events-none">
                <button 
                  onClick={togglePlayback}
                  className="w-20 h-20 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center text-white text-3xl transition-all hover:scale-110 pointer-events-auto shadow-2xl"
                >
                  {isPlaying ? "▮▮" : "▶"}
                </button>
             </div>

             <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-900">
                <div 
                  className="h-full bg-blood-600 shadow-[0_0_10px_rgba(225,29,72,0.8)] transition-all duration-100 ease-linear" 
                  style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-lg">📝</div>
                   <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Full Transcript</span>
                </div>
                <button onClick={() => navigator.clipboard.writeText(script)} className="text-[10px] font-bold text-white hover:text-blood-400 uppercase">Copy All</button>
             </div>
             <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-lg">🔊</div>
                   <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Master Audio</span>
                </div>
                {masterAudioUrl && (
                  <a href={masterAudioUrl} download="full-narration.mp3" className="text-[10px] font-bold text-blood-500 hover:text-blood-400 uppercase">Download</a>
                )}
             </div>
          </div>
        </div>

        <div className="lg:col-span-1 h-full flex flex-col gap-4">
           <div className="flex items-center justify-between bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">Timeline Sync</h3>
              <span className="text-[10px] text-zinc-500 font-mono">{scenes.length} Scenes</span>
           </div>

           <div className="flex-grow overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
              {scenes.map((scene, idx) => {
                const isActive = activeSceneIndex === idx;
                const hasImg = !!scene.generatedImageUrl;
                const audio = getAudioForScene(scene);

                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      let time = 0;
                      for(let i=0; i<idx; i++) time += (scenes[i].duration || 6);
                      setCurrentTime(time);
                    }}
                    className={`relative flex gap-4 p-3 rounded-xl border cursor-pointer transition-all ${isActive ? 'bg-zinc-800 border-blood-600/50 scale-[1.02]' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}
                  >
                    <div className="w-16 h-16 rounded-lg bg-black overflow-hidden flex-shrink-0 border border-zinc-800">
                       {hasImg ? (
                          <img src={scene.generatedImageUrl} className="w-full h-full object-cover" alt="" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-700 font-bold uppercase p-1">No Img</div>
                       )}
                    </div>

                    <div className="flex-grow min-w-0 py-1">
                       <div className="flex items-center gap-2 mb-1">
                          <div className={`w-1.5 h-1.5 rounded-full ${audio ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Clip {idx + 1}</span>
                       </div>
                       <p className="text-[9px] text-zinc-500 line-clamp-2 italic mb-2">"{scene.script}"</p>
                       
                       <div className="flex items-center gap-2">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase">Dur:</label>
                          <input 
                             type="number"
                             step="0.1"
                             min="0.5"
                             className="bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] text-white w-12"
                             value={scene.duration}
                             onChange={(e) => handleDurationChange(idx, e.target.value)}
                             onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-[9px] text-zinc-500 font-bold uppercase">sec</span>
                       </div>
                    </div>
                  </div>
                )
              })}
           </div>

           <button className="mt-4 w-full bg-blood-600 hover:bg-blood-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest shadow-xl shadow-blood-900/20 active:scale-95 transition-all">
             Generate Final Render
           </button>
        </div>

      </div>

      <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8">
         <h3 className="text-xl font-display text-white mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-sm">🎬</span>
            Editor Guidelines
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
               <h4 className="text-xs font-bold text-blood-400 uppercase tracking-wider">Smart Timing</h4>
               <p className="text-xs text-zinc-500 leading-relaxed">Scenes now automatically match the duration of your generated audio clips. Less manual sync required.</p>
            </div>
            <div className="space-y-2">
               <h4 className="text-xs font-bold text-blood-400 uppercase tracking-wider">Audio-Visual Lock</h4>
               <p className="text-xs text-zinc-500 leading-relaxed">The production studio automatically plays the correct audio segment when its associated visual scene is on screen.</p>
            </div>
            <div className="space-y-2">
               <h4 className="text-xs font-bold text-blood-400 uppercase tracking-wider">Atmosphere</h4>
               <p className="text-xs text-zinc-500 leading-relaxed">For high-intensity horror, aim for slightly longer visual lingers (6-7s) to build dread before moving to the next beat.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ExportHub;
