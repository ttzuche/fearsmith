
import { useState } from 'react';
import { ProjectStage, StoryConfig, Scene, GenerationStatus, ContentFormat } from './types';
import { DEFAULT_CONFIG } from './constants';
import { generateScriptFromIdea, generatePromptsFromScript } from './services/geminiService';
import { useAppStore } from './store/useStore';

import ProgressTracker from './components/ProgressTracker';
import IdeaPod from './components/IdeaPod';
import ScriptLab from './components/ScriptLab';
import VisualStoryboard from './components/VisualStoryboard';
import AudioStudio from './components/AudioStudio';
import ExportHub from './components/ExportHub';

const App: React.FC = () => {
  // --- STORE ---
  const { 
    scenes, 
    setScenes, 
    isScriptFinished, 
    setIsScriptFinished,
    processedCharCount,
    setProcessedCharCount,
    addUsage
  } = useAppStore();

  // --- STATE ---
  const [currentStage, setCurrentStage] = useState<ProjectStage>(ProjectStage.IDEA);
  const [maxStageReached, setMaxStageReached] = useState<ProjectStage>(ProjectStage.IDEA);
  
  const [config, setConfig] = useState<StoryConfig>(DEFAULT_CONFIG);
  const [scriptContent, setScriptContent] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const [status, setStatus] = useState<GenerationStatus>({
    isGenerating: false,
    currentTask: '',
    error: null
  });

  // --- ACTIONS ---

  const advanceStage = (nextStage: ProjectStage) => {
    setCurrentStage(nextStage);
    if (nextStage > maxStageReached) {
      setMaxStageReached(nextStage);
    }
  };

  const handleGenerateScript = async () => {
    if (!process.env.API_KEY) {
      setStatus({ isGenerating: false, currentTask: '', error: "Missing API Key" });
      return;
    }
    
    if (!config.selectedIdea) {
      setStatus({ isGenerating: false, currentTask: '', error: "Please select an idea first." });
      return;
    }

    setStatus({ isGenerating: true, currentTask: 'Writing Narrative Script...', error: null });
    
    try {
      const { script, tokens } = await generateScriptFromIdea(config);
      addUsage({ tokens });
      setScriptContent(script);
      setScenes([]); 
      setIsScriptFinished(false);
      setProcessedCharCount(0);
      setStatus({ isGenerating: false, currentTask: '', error: null });
      advanceStage(ProjectStage.SCRIPT);
    } catch (e: any) {
      setStatus({ isGenerating: false, currentTask: '', error: e.message });
    }
  };

  const handleGenerateNextBatch = async () => {
    if (!process.env.API_KEY || isScriptFinished) return;
    
    const startSceneNum = scenes.length + 1;
    setStatus({ isGenerating: true, currentTask: `Visualizing Scenes ${startSceneNum}-${startSceneNum+4}...`, error: null });

    // Use processedCharCount for reliable slicing
    const textToProcess = scriptContent.substring(processedCharCount).trim();

    if (textToProcess.length < 5) {
      setIsScriptFinished(true);
      setProcessedCharCount(scriptContent.length); // Ensure 100%
      setStatus({ isGenerating: false, currentTask: '', error: null });
      return;
    }

    try {
      const result = await generatePromptsFromScript(
        textToProcess, 
        startSceneNum, 
        5, 
        config.characterDescription,
        config.artStyleId,
        config.format
      );
      
      addUsage({ tokens: result.tokens });

      // Calculate how much text was consumed by this batch
      const consumedText = result.scenes.map(s => s.script || "").join(" ");
      // We look for the last scene's text in the segment to update our cursor
      const lastSegmentText = result.scenes[result.scenes.length - 1].script || "";
      const lastIndexInSegment = textToProcess.lastIndexOf(lastSegmentText);
      
      let newOffset = processedCharCount;
      if (lastIndexInSegment !== -1) {
        newOffset += (lastIndexInSegment + lastSegmentText.length);
      } else {
        // Fallback: estimate by length if exact match fails
        newOffset += consumedText.length;
      }

      setScenes(prev => [...prev, ...result.scenes]);
      
      // Final check: is the remaining script exhausted?
      if (result.finished || newOffset >= scriptContent.length - 10) {
        setIsScriptFinished(true);
        setProcessedCharCount(scriptContent.length); // Snap to 100%
      } else {
        setProcessedCharCount(newOffset);
      }

      setStatus({ isGenerating: false, currentTask: '', error: null });
    } catch (e: any) {
      setStatus({ isGenerating: false, currentTask: '', error: e.message });
    }
  };

  return (
    <div className="min-h-screen font-sans bg-void-950 text-gray-200 flex flex-col selection:bg-blood-900/30 selection:text-blood-100">
      
      <ProgressTracker 
        currentStage={currentStage} 
        setStage={setCurrentStage}
        maxStageReached={maxStageReached}
      />

      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {currentStage === ProjectStage.IDEA && (
            <IdeaPod 
              config={config} 
              setConfig={setConfig} 
              onGenerate={handleGenerateScript}
              isGenerating={status.isGenerating}
            />
          )}

          {currentStage === ProjectStage.SCRIPT && (
            <ScriptLab 
              scriptContent={scriptContent}
              setScriptContent={setScriptContent}
              onProceed={() => advanceStage(ProjectStage.STORYBOARD)}
              onRegenerate={handleGenerateScript}
              isGenerating={status.isGenerating}
            />
          )}

          {currentStage === ProjectStage.STORYBOARD && (
            <VisualStoryboard 
              scenes={scenes}
              isGenerating={status.isGenerating}
              onGenerateNextBatch={handleGenerateNextBatch}
              onProceed={() => advanceStage(ProjectStage.AUDIO)}
              nextSceneNumber={scenes.length + 1}
              batchSize={5}
              format={config.format}
              scriptContent={scriptContent}
            />
          )}

          {currentStage === ProjectStage.AUDIO && (
             <AudioStudio 
               script={scriptContent}
               config={config}
               onAudioGenerated={setAudioUrl}
               audioUrl={audioUrl}
               onProceed={() => advanceStage(ProjectStage.EXPORT)}
             />
          )}

          {currentStage === ProjectStage.EXPORT && (
            <ExportHub 
              scenes={scenes} 
              script={scriptContent}
              audioUrl={audioUrl}
            />
          )}
        </div>

        {/* Global Loading Toast */}
        {status.error && (
          <div className="fixed bottom-6 right-6 bg-red-950 text-red-200 px-6 py-4 rounded-lg shadow-2xl border border-red-800 z-50 animate-[slideIn_0.3s_ease-out]">
            <div className="font-bold mb-1">Error Encountered</div>
            <div className="text-sm opacity-90">{status.error}</div>
          </div>
        )}
      </main>
      
    </div>
  );
};

export default App;
