import React from 'react';
import { Loader2, Wand2 } from 'lucide-react';

export const LoadingOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 z-10 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
        <Loader2 className="w-12 h-12 text-indigo-400 animate-spin relative z-10" />
      </div>
      <h3 className="mt-4 text-xl font-semibold text-white">Analyzing Video Content</h3>
      <p className="text-slate-400 mt-2 text-sm max-w-xs text-center">
        Gemini Pro is watching your video, identifying visual cues, and transcribing dialogue...
      </p>
      <div className="mt-6 flex items-center space-x-2 text-xs text-indigo-300 bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-500/30">
        <Wand2 className="w-3 h-3" />
        <span>Generating AI Insights</span>
      </div>
    </div>
  );
};
