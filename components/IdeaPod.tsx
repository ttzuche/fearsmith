
import React, { useState, useRef } from 'react';
import { StoryConfig, ContentFormat, ViralIdea } from '../types';
import { generateViralIdeas } from '../services/geminiService';
import { DURATION_OPTIONS, ART_STYLES, CATEGORIES } from '../constants';
import { useAppStore } from '../store/useStore';

interface Props {
  config: StoryConfig;
  setConfig: (config: StoryConfig) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const IdeaPod: React.FC<Props> = ({ config, setConfig, onGenerate, isGenerating }) => {
  const { characterReferenceImage, setCharacterReferenceImage, addUsage } = useAppStore();
  const [ideas, setIdeas] = useState<ViralIdea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  
  const [generationMode, setGenerationMode] = useState<'scratch' | 'reference'>('scratch');
  const [referenceScript, setReferenceScript] = useState('');
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('popular');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateIdeas = async () => {
    if (!process.env.API_KEY) return; 
    setLoadingIdeas(true);
    try {
      const ref = generationMode === 'reference' ? referenceScript : undefined;
      const { ideas: generatedIdeas, tokens } = await generateViralIdeas(config.format, config.duration, ref);
      addUsage({ tokens });
      setIdeas(generatedIdeas);
      setConfig({ ...config, referenceScript: ref });
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingIdeas(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCharacterReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectIdea = (idea: ViralIdea) => {
    setConfig({ ...config, selectedIdea: idea });
  };
  
  const currentStyle = ART_STYLES.find(s => s.id === config.artStyleId) || ART_STYLES[0];
  const filteredStyles = selectedCategory === 'all' 
    ? ART_STYLES 
    : ART_STYLES.filter(s => s.category === selectedCategory);

  const inputClass = "flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all text-zinc-200";
  const textAreaClass = "flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all text-zinc-200 resize-none";
  const labelClass = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-400 mb-2 block";

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in slide-in-from-bottom-4 duration-700 relative">
      
      {/* Header */}
      <div className="text-center mb-10 space-y-4">
        <h2 className="text-5xl md:text-6xl font-display text-white tracking-wide">The FearSmith Engine</h2>
        <p className="text-zinc-400 text-lg font-light max-w-2xl mx-auto">
          Generate viral-ready horror concepts based on successful YouTube trends.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar: Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 shadow-sm backdrop-blur-sm space-y-6 sticky top-24">
             
             {/* Mode Switcher */}
             <div className="bg-zinc-950 p-1 rounded-lg flex border border-zinc-800">
                <button 
                  onClick={() => setGenerationMode('scratch')}
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${generationMode === 'scratch' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  AI Brainstorm
                </button>
                <button 
                  onClick={() => setGenerationMode('reference')}
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded transition-colors ${generationMode === 'reference' ? 'bg-blood-900/50 text-blood-200 shadow-sm border border-blood-800/30' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  Mimic Viral
                </button>
             </div>

             <div className="space-y-2">
               <label className={labelClass}>Video Format</label>
               <select 
                 className={inputClass}
                 value={config.format}
                 onChange={(e) => setConfig({...config, format: e.target.value as ContentFormat})}
               >
                 {Object.values(ContentFormat).map(f => <option key={f} value={f}>{f}</option>)}
               </select>
             </div>

             <div className="space-y-2">
               <label className={labelClass}>Target Duration</label>
               <select
                 className={inputClass}
                 value={config.duration}
                 onChange={(e) => setConfig({...config, duration: e.target.value})}
               >
                 {DURATION_OPTIONS.map((d) => (
                   <option key={d} value={d}>{d}</option>
                 ))}
               </select>
             </div>
             
             {/* Identity Forge: Character Reference */}
             <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                   <label className={labelClass + " !mb-0"}>Identity Forge</label>
                   <span className="text-[9px] font-bold bg-blood-950 text-blood-400 px-1.5 py-0.5 rounded border border-blood-900/30">CONSISTENCY</span>
                </div>
                <div 
                   onClick={() => fileInputRef.current?.click()}
                   className="relative aspect-square w-full rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-950 hover:bg-zinc-900 hover:border-zinc-600 transition-all cursor-pointer overflow-hidden group flex flex-col items-center justify-center gap-2"
                >
                   {characterReferenceImage ? (
                      <>
                        <img src={characterReferenceImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-black/60 px-3 py-1 rounded">Change Reference</span>
                        </div>
                      </>
                   ) : (
                      <>
                        <span className="text-2xl opacity-40 group-hover:opacity-80 transition-opacity">👤</span>
                        <span className="text-[10px] text-zinc-500 font-bold uppercase text-center px-4">Upload Character Image for Consistency</span>
                      </>
                   )}
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                   />
                </div>
                {characterReferenceImage && (
                   <button 
                     onClick={(e) => { e.stopPropagation(); setCharacterReferenceImage(null); }}
                     className="w-full py-1 text-[9px] text-zinc-600 hover:text-red-500 uppercase font-bold tracking-widest transition-colors"
                   >
                     Clear Reference
                   </button>
                )}
             </div>

             {/* Style Selector Button */}
             <div className="space-y-2">
                <label className={labelClass}>Visual Style</label>
                <button
                  onClick={() => setShowStyleModal(true)}
                  className="w-full flex items-center justify-between h-12 rounded-md border border-zinc-700 bg-zinc-900 px-3 hover:bg-zinc-800 transition-colors group"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-bold text-white group-hover:text-blood-400 transition-colors">{currentStyle.name}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{CATEGORIES.find(c => c.id === currentStyle.category)?.name || "Custom"}</span>
                  </div>
                  <span className="text-zinc-500 text-xs">▼</span>
                </button>
             </div>

             {/* Dynamic Input based on Mode */}
             {generationMode === 'reference' && (
               <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                 <div className="flex justify-between">
                    <label className={labelClass}>Reference Transcript</label>
                    <span className="text-[10px] text-blood-500 font-bold uppercase">Required</span>
                 </div>
                 <textarea
                   className={`${textAreaClass} h-32 font-mono text-xs`}
                   value={referenceScript}
                   onChange={(e) => setReferenceScript(e.target.value)}
                   placeholder="Paste a viral horror script here. The AI will analyze its engagement structure and generate NEW ideas with the same vibe."
                 />
               </div>
             )}

             <div className="space-y-2">
               <label className={labelClass}>Protagonist Description</label>
               <textarea
                 className={textAreaClass}
                 value={config.characterDescription}
                 onChange={(e) => setConfig({...config, characterDescription: e.target.value})}
                 placeholder="e.g. A young woman with short blue hair, wearing a yellow raincoat and glasses."
               />
               <p className="text-[10px] text-zinc-500">
                 Text description to supplement the visual reference image.
               </p>
             </div>

             <button
              onClick={handleGenerateIdeas}
              disabled={loadingIdeas || isGenerating || (generationMode === 'reference' && referenceScript.length < 50)}
              className={`
                w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 uppercase tracking-wider
                ${generationMode === 'reference' 
                   ? 'bg-blood-600 hover:bg-blood-700 text-white shadow-lg shadow-blood-900/20' 
                   : 'bg-white text-black hover:bg-zinc-200'}
              `}
            >
              {loadingIdeas ? "Thinking..." : generationMode === 'reference' ? "Analyze & Generate" : "Generate 5 Ideas"}
            </button>
          </div>
        </div>

        {/* Right Content: Ideas Grid */}
        <div className="lg:col-span-3">
          {ideas.length === 0 && !loadingIdeas && (
            <div className="h-full min-h-[400px] border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 flex-col gap-4 bg-zinc-900/10">
               <span className="text-4xl">💀</span>
               <p>
                 {generationMode === 'reference' 
                   ? 'Paste a transcript and click Analyze to clone its viral success.' 
                   : 'Configure settings and click generate to summon ideas.'}
               </p>
            </div>
          )}

          {loadingIdeas && (
             <div className="grid grid-cols-1 gap-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-32 bg-zinc-900/50 rounded-xl animate-pulse border border-zinc-800"></div>
                ))}
             </div>
          )}

          {ideas.length > 0 && !loadingIdeas && (
            <div className="space-y-6">
               <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-widest">
                    {generationMode === 'reference' ? 'Viral Clones Generated' : 'Original Concepts Generated'}
                  </h3>
               </div>
               <div className="grid grid-cols-1 gap-4">
                  {ideas.map((idea, idx) => {
                    const isSelected = config.selectedIdea === idea;
                    return (
                      <div 
                        key={idx}
                        onClick={() => selectIdea(idea)}
                        className={`
                          relative group cursor-pointer p-6 rounded-xl border transition-all duration-300
                          ${isSelected 
                            ? 'bg-blood-900/20 border-blood-500 shadow-[0_0_15px_rgba(225,29,72,0.2)] scale-[1.01]' 
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50'}
                        `}
                      >
                         <div className="flex justify-between items-start mb-2">
                           <h3 className={`font-display text-xl tracking-wide ${isSelected ? 'text-blood-400' : 'text-zinc-200 group-hover:text-white'}`}>
                             {idea.title}
                           </h3>
                           {isSelected && <span className="text-blood-500 font-bold text-xs uppercase border border-blood-500/50 px-2 py-1 rounded">Selected</span>}
                         </div>
                         
                         <p className="text-zinc-400 text-sm leading-relaxed mb-4">{idea.hook}</p>
                         
                         <div className="flex items-center gap-2 text-xs">
                            <span className="font-bold text-zinc-500 uppercase">Viral Factor:</span>
                            <span className="text-zinc-300 italic">{idea.viralFactor}</span>
                         </div>
                      </div>
                    )
                  })}
               </div>

               <div className="sticky bottom-4 flex justify-end">
                  <button
                    onClick={() => {
                      setConfig({ ...config, referenceScript: generationMode === 'reference' ? referenceScript : undefined });
                      onGenerate();
                    }}
                    disabled={!config.selectedIdea || isGenerating}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blood-600 text-white hover:bg-blood-700 h-12 px-8 uppercase tracking-widest shadow-xl shadow-blood-900/20"
                  >
                    {isGenerating ? "Writing Script..." : "Proceed with Selected Idea →"}
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>

      {showStyleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <div>
                   <h3 className="text-2xl font-display font-bold text-white">Select Visual Style</h3>
                   <p className="text-sm text-zinc-400">Choose the artistic direction for your nightmare generation.</p>
                </div>
                <button onClick={() => setShowStyleModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">✕</button>
              </div>
              <div className="flex overflow-x-auto border-b border-zinc-800 bg-zinc-900/30 px-6 py-2 scrollbar-hide gap-2">
                 {CATEGORIES.map(cat => (
                   <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap transition-all ${selectedCategory === cat.id ? 'bg-white text-black shadow-lg' : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'}`}>
                     <span className="mr-2">{cat.icon}</span>{cat.name}
                   </button>
                 ))}
              </div>
              <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-800">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {filteredStyles.map(style => {
                     const isSelected = config.artStyleId === style.id;
                     return (
                       <div key={style.id} onClick={() => { setConfig({ ...config, artStyleId: style.id }); setShowStyleModal(false); }} className={`cursor-pointer rounded-xl border p-4 transition-all relative group ${isSelected ? 'bg-zinc-900 border-blood-500 ring-1 ring-blood-500' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 hover:bg-zinc-900/50'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-bold ${isSelected ? 'text-blood-400' : 'text-zinc-200 group-hover:text-white'}`}>{style.name}</h4>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-blood-500 shadow-[0_0_8px_rgba(225,29,72,1)]"></div>}
                          </div>
                          <p className="text-xs text-zinc-500 mb-3 leading-relaxed">{style.description}</p>
                          <div className="flex flex-wrap gap-2">
                             {style.isPremium && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-950/30 text-amber-500 border border-amber-900/30">Premium</span>}
                             {style.isBeta && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-950/30 text-blue-500 border border-blue-900/30">Beta</span>}
                          </div>
                       </div>
                     )
                   })}
                 </div>
              </div>
              <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end">
                 <button onClick={() => setShowStyleModal(false)} className="px-6 py-2 rounded-md bg-zinc-200 hover:bg-white text-zinc-900 font-bold text-sm uppercase tracking-wide transition-colors">Confirm Selection</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default IdeaPod;
