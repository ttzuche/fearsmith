
import React, { useState, useEffect, useRef } from 'react';
import { Scene, StoryConfig } from '../types';
import { GEMINI_VOICES, PUTER_VOICES, AUDIO_STYLES } from '../constants';
import { generateNarration } from '../services/geminiService';
import { generatePuterAudio } from '../services/puterService';
import { useAppStore } from '../store/useStore';

interface Props {
  script: string;
  config: StoryConfig;
  onAudioGenerated: (url: string) => void;
  onProceed: () => void;
  audioUrl: string | null;
}

const AudioStudio: React.FC<Props> = ({ config, onAudioGenerated, onProceed }) => {
  
  const { 
    scenes,
    audioSegments: segments, 
    setAudioSegments, 
    updateSegment,
    audioProvider: provider,
    audioEngine: engine,
    audioVoice: selectedVoice,
    audioStyle,
    setAudioSettings,
    setAudioDuration,
    addUsage
  } = useAppStore();

  const [isTestingVoice, setIsTestingVoice] = useState(false);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentVoiceList = provider === 'gemini' ? GEMINI_VOICES : PUTER_VOICES;
  const selectedVoiceObj = PUTER_VOICES.find(v => v.id === selectedVoice);
  const isHQVoice = selectedVoiceObj?.provider === 'openai' && provider === 'puter';

  useEffect(() => {
    const valid = currentVoiceList.some(v => v.id === selectedVoice);
    if (!valid && currentVoiceList.length > 0) {
      setAudioSettings({ audioVoice: currentVoiceList[0].id });
    }
  }, [provider, currentVoiceList, selectedVoice, setAudioSettings]);

  useEffect(() => {
    if (scenes.length === 0) return;

    const newSegments = scenes.map((scene) => {
      const existing = segments.find(s => s.id === scene.sceneNumber);
      return {
        id: scene.sceneNumber,
        text: scene.script || "(Silence)",
        url: (existing && existing.text === scene.script) ? existing.url : null,
        isGenerating: existing ? existing.isGenerating : false
      };
    });

    const isDifferent = newSegments.length !== segments.length || 
                       newSegments.some((s, i) => s.text !== segments[i]?.text);
    
    if (isDifferent) {
      setAudioSegments(newSegments);
    }
  }, [scenes, segments, setAudioSegments]);

  const generateAudioFile = async (text: string) => {
    if (provider === 'gemini') {
      return await generateNarration(text, selectedVoice);
    } else {
      const styleInstruction = isHQVoice 
        ? AUDIO_STYLES.find(s => s.id === audioStyle)?.instruction 
        : undefined;
      return await generatePuterAudio(text, selectedVoice, engine, styleInstruction);
    }
  };

  const handleTestVoice = async () => {
    setIsTestingVoice(true);
    try {
      const text = "The shadows lengthen, and the nightmare begins.";
      const url = await generateAudioFile(text);
      if (testAudioRef.current) {
        testAudioRef.current.src = url;
        testAudioRef.current.play();
      }
    } catch (e: any) {
      console.error(e);
      alert("Voice test failed: " + e.message);
    } finally {
      setIsTestingVoice(false);
    }
  };

  const handleGenerateSegment = async (id: number) => {
    const segment = segments.find(s => s.id === id);
    if (!segment) return;
    updateSegment(id, { isGenerating: true });
    try {
      const url = await generateAudioFile(segment.text);
      
      // Capture duration
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        setAudioDuration(id, audio.duration);
      });

      addUsage({ audio: 1 });
      updateSegment(id, { url, isGenerating: false });
    } catch (e) {
      console.error(e);
      updateSegment(id, { isGenerating: false });
    }
  };

  const handleCancelGeneration = (id: number) => {
    updateSegment(id, { isGenerating: false });
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 animate-in slide-in-from-right-8 duration-500">
      <div className="text-center mb-10 space-y-2">
        <h2 className="text-4xl font-display font-bold text-white tracking-wide">Audio Studio</h2>
        <p className="text-zinc-400 text-lg">Generate voiceovers for each visual scene.</p>
      </div>

      {scenes.length === 0 ? (
        <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-xl p-20 text-center">
           <p className="text-zinc-500">You must generate storyboard scenes before you can generate audio for them.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 sticky top-24 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-3">AI Engine</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAudioSettings({ audioProvider: 'puter' })}
                    className={`px-3 py-2 rounded text-xs font-bold border transition-all ${provider === 'puter' ? 'bg-zinc-100 text-zinc-900 border-zinc-100' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
                  >
                    HQ (Free)
                  </button>
                  <button
                    onClick={() => setAudioSettings({ audioProvider: 'gemini' })}
                    className={`px-3 py-2 rounded text-xs font-bold border transition-all ${provider === 'gemini' ? 'bg-blood-600 text-white border-blood-600' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
                  >
                    Gemini
                  </button>
                </div>
              </div>

              {provider === 'puter' && !isHQVoice && (
                <div>
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-3">Engine Mode</h3>
                  <select 
                    value={engine} 
                    onChange={(e) => setAudioSettings({ audioEngine: e.target.value as any })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-300 focus:outline-none focus:border-zinc-600"
                  >
                    <option value="neural">Neural</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-3">Select Voice</h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 pr-2">
                  {currentVoiceList.map((voice) => (
                    <div 
                      key={voice.id}
                      onClick={() => setAudioSettings({ audioVoice: voice.id })}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 relative overflow-hidden ${selectedVoice === voice.id ? 'bg-zinc-800 border-zinc-500' : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-sm ${selectedVoice === voice.id ? 'text-white' : 'text-zinc-400'}`}>{voice.label}</span>
                      </div>
                      <p className="text-[10px] text-zinc-500">{voice.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {isHQVoice && (
                <div>
                  <h3 className="text-sm font-bold text-blood-400 uppercase tracking-widest mb-3">Narration Style</h3>
                  <select 
                    value={audioStyle} 
                    onChange={(e) => setAudioSettings({ audioStyle: e.target.value })}
                    className="w-full bg-zinc-950 border border-blood-900/50 rounded px-3 py-2 text-sm text-zinc-200"
                  >
                    {AUDIO_STYLES.map(style => <option key={style.id} value={style.id}>{style.label}</option>)}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <button
                  onClick={handleTestVoice}
                  disabled={isTestingVoice}
                  className="w-full inline-flex items-center justify-center rounded-md text-xs font-bold border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 h-9 px-4 uppercase tracking-wide"
                >
                  {isTestingVoice ? "Loading..." : "▶ Test Voice"}
                </button>
                <audio ref={testAudioRef} className="hidden" />
                <button
                  onClick={onProceed}
                  className="w-full inline-flex items-center justify-center rounded-md text-sm font-bold bg-white text-zinc-950 hover:bg-zinc-200 h-10 px-6 uppercase tracking-wide"
                >
                  Finish Project →
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {segments.map((segment) => (
              <div key={segment.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-4">
                   <div className="flex-grow">
                      <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">SCENE {segment.id} NARRATION</div>
                      <div className="font-mono text-sm text-zinc-300 leading-relaxed">{segment.text}</div>
                   </div>
                   <div className="flex items-center gap-2 shrink-0">
                     <button
                        onClick={() => handleGenerateSegment(segment.id)}
                        disabled={segment.isGenerating}
                        className={`shrink-0 inline-flex items-center justify-center rounded-md text-xs font-bold uppercase h-9 px-6 ${segment.url ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' : 'bg-blood-600 text-white shadow-lg'}`}
                      >
                        {segment.isGenerating ? "..." : segment.url ? "Regenerate" : "Generate"}
                      </button>
                      {segment.isGenerating && (
                         // Fix: Reference segment.id instead of undefined id
                         <button onClick={() => handleCancelGeneration(segment.id)} className="h-9 w-9 rounded-md bg-zinc-800 text-zinc-400 hover:text-red-400 flex items-center justify-center">
                           &times;
                         </button>
                      )}
                   </div>
                </div>
                {segment.url && (
                  <div className="bg-zinc-900/50 rounded-lg p-3 flex items-center gap-4 border border-zinc-800/50">
                    <audio controls src={segment.url} className="h-8 flex-grow opacity-80" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioStudio;
