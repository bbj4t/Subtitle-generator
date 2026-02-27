import React, { useState, useEffect } from 'react';
import { VideoUploader } from './components/VideoUploader';
import { SubtitleDisplay } from './components/SubtitleDisplay';
import { LoadingOverlay } from './components/LoadingOverlay';
import { SettingsModal } from './components/SettingsModal';
import { generateSubtitlesFromVideo } from './services/geminiService';
import { VideoFile, ProcessingStatus, GeneratorSettings } from './types';
import { Sparkles, Clapperboard, AlertCircle, Settings, Key, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  // API Key State
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isKeyChecking, setIsKeyChecking] = useState(true);

  // App State
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [srtContent, setSrtContent] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<GeneratorSettings>({
    enableSpeakerLabels: true,
    contentContext: '',
    modelId: 'gemini-3-flash-preview',
    customEndpoint: ''
  });

  useEffect(() => {
    const checkKey = async () => {
      try {
        if ((window as any).aistudio) {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          setHasApiKey(hasKey);
        } else {
          // Fallback for environments without the wrapper (e.g. local dev), allow entry
          // But in the specific workshop environment, this branch likely isn't taken.
          setHasApiKey(true);
        }
      } catch (e) {
        console.error("Failed to check API key status", e);
      } finally {
        setIsKeyChecking(false);
      }
    };
    checkKey();
  }, []);

  const handleApiKeySelect = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleVideoSelected = (video: VideoFile) => {
    setSelectedVideo(video);
    setStatus(ProcessingStatus.IDLE);
    setSrtContent(null);
    setErrorMsg(null);
  };

  const handleClear = () => {
    setSelectedVideo(null);
    setStatus(ProcessingStatus.IDLE);
    setSrtContent(null);
    setErrorMsg(null);
  };

  const handleGenerate = async () => {
    if (!selectedVideo || !selectedVideo.base64Data) return;

    try {
      setStatus(ProcessingStatus.ANALYZING);
      setErrorMsg(null);

      const subtitles = await generateSubtitlesFromVideo(
        selectedVideo.base64Data,
        selectedVideo.mimeType,
        settings
      );

      setSrtContent(subtitles);
      setStatus(ProcessingStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      
      const errorMessage = err?.message || '';
      
      // Handle key permission errors
      if (errorMessage.includes('403') || errorMessage.includes('Requested entity was not found')) {
        setErrorMsg("Permission denied. Please re-select your API key.");
        setHasApiKey(false); // Force re-selection
        setStatus(ProcessingStatus.IDLE);
        return;
      }

      setErrorMsg("Failed to generate subtitles. Please check your settings or try a shorter video.");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  // API Key Selection Screen
  if (!isKeyChecking && !hasApiKey) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl relative z-10 text-center space-y-6">
          <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto ring-1 ring-indigo-500/50">
             <Key className="w-8 h-8 text-indigo-400" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to SubGen AI</h1>
            <p className="text-slate-400 text-sm">
              To use the advanced Gemini 3 video analysis features, you need to connect your Google Cloud API Key.
            </p>
          </div>

          <div className="space-y-4">
             <button
              onClick={handleApiKeySelect}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Key className="w-4 h-4" />
              <span>Select API Key</span>
            </button>
            
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-slate-500 hover:text-indigo-400 transition-colors"
            >
              <span>View Billing Documentation</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-indigo-500/30">
      {/* Background Gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-900/10 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        
        {/* Settings Modal */}
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSettingsChange={setSettings}
        />

        {/* Header */}
        <header className="mb-12 text-center relative">
          <div className="absolute right-0 top-0 hidden md:block">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-400 hover:text-indigo-400 transition-colors bg-slate-800/50 rounded-full hover:bg-slate-800 border border-transparent hover:border-slate-700"
              title="Configure Model & Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          <div className="inline-flex items-center justify-center space-x-3 mb-4 bg-slate-800/50 p-2 pr-6 rounded-full border border-slate-700/50 backdrop-blur-sm">
             <div className="bg-indigo-600 p-2 rounded-full">
               <Clapperboard className="w-5 h-5 text-white" />
             </div>
             <span className="text-slate-200 font-medium tracking-wide text-sm">Gemini 3 Video Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400">
            SubGen AI
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Upload a video and let Gemini watch, listen, and generate perfect subtitles with context.
          </p>
          
          {/* Mobile Settings Button */}
          <div className="md:hidden mt-6 flex justify-center">
             <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 bg-slate-800/50 rounded-lg border border-slate-700"
            >
              <Settings className="w-4 h-4" />
              <span>Configure Settings</span>
            </button>
          </div>
        </header>

        {/* Main Content Card */}
        <main className="bg-slate-800/30 backdrop-blur-md rounded-2xl border border-white/5 p-6 md:p-8 shadow-2xl relative overflow-hidden">
          
          <div className="flex flex-col space-y-8">
            
            {/* 1. Upload Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center">
                  <span className="bg-slate-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs mr-2 text-slate-300">1</span>
                  Select Video
                </h2>
              </div>
              <div className="relative">
                {status === ProcessingStatus.ANALYZING && selectedVideo && (
                    <LoadingOverlay />
                )}
                <VideoUploader 
                  onVideoSelected={handleVideoSelected} 
                  onClear={handleClear} 
                  selectedVideo={selectedVideo}
                  disabled={status === ProcessingStatus.ANALYZING}
                />
              </div>
            </div>

            {/* 2. Action Section */}
            <div className="flex justify-between items-center">
              <div className="text-xs text-slate-500 hidden sm:block">
                 Model: <span className="text-indigo-400 font-mono">{settings.modelId}</span>
                 {settings.contentContext && <span className="ml-2">| Context: {settings.contentContext}</span>}
              </div>
              <button
                onClick={handleGenerate}
                disabled={!selectedVideo || status === ProcessingStatus.ANALYZING || status === ProcessingStatus.COMPLETED && !!srtContent}
                className={`
                  ml-auto group relative inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white transition-all duration-200 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 focus:ring-offset-slate-900
                  ${!selectedVideo 
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                    : status === ProcessingStatus.ANALYZING 
                      ? 'bg-slate-700 cursor-wait'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5'}
                `}
              >
                {status === ProcessingStatus.ANALYZING ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Generate Subtitles
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start space-x-3 text-red-200 animate-fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{errorMsg}</span>
              </div>
            )}

            {/* 3. Results Section */}
            {srtContent && (
              <div className="space-y-4 border-t border-white/10 pt-8 animate-slide-up">
                 <h2 className="text-lg font-semibold text-white flex items-center">
                  <span className="bg-emerald-600 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs mr-2 text-white">2</span>
                  Result
                </h2>
                <SubtitleDisplay srtContent={srtContent} filename={selectedVideo?.file.name || "video"} />
              </div>
            )}
            
          </div>
        </main>
        
        {/* Footer */}
        <footer className="mt-12 text-center text-slate-600 text-sm">
          <p>© {new Date().getFullYear()} SubGen AI. Powered by Google Gemini 3.</p>
        </footer>

      </div>
    </div>
  );
};

export default App;