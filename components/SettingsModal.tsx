import React, { useState } from 'react';
import { X, Server, UserCheck, MessageSquare, Box, Info, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { GeneratorSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GeneratorSettings;
  onSettingsChange: (settings: GeneratorSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}) => {
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen) return null;

  const handleChange = (key: keyof GeneratorSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            Advanced Configuration
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Self-Hosting Guide Toggle */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl overflow-hidden">
            <button 
              onClick={() => setShowGuide(!showGuide)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-indigo-500/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span className="text-sm font-semibold text-indigo-100">Self-Hosting & Custom Models Guide</span>
              </div>
              {showGuide ? <ChevronUp className="w-4 h-4 text-indigo-400" /> : <ChevronDown className="w-4 h-4 text-indigo-400" />}
            </button>
            
            {showGuide && (
              <div className="p-4 pt-0 text-xs text-slate-300 space-y-3 border-t border-indigo-500/10 leading-relaxed">
                <p>
                  You can use SubGen AI with your own infrastructure or specialized models:
                </p>
                <ul className="list-disc ml-4 space-y-2 text-slate-400">
                  <li>
                    <strong className="text-indigo-300">Self-Hosting:</strong> Deploy a Gemini-compatible API proxy on your server. Enter your server's base URL in the <code className="text-slate-200">Custom Endpoint</code> field.
                  </li>
                  <li>
                    <strong className="text-indigo-300">Fine-Tuned Models:</strong> Use custom-trained models for specific domains (e.g., medical, adult, technical). Provide the full resource name (e.g., <code className="text-slate-200">tunedModels/my-model-123</code>) in the <code className="text-slate-200">Model ID</code> field.
                  </li>
                  <li>
                    <strong className="text-indigo-300">Privacy:</strong> Using a custom endpoint allows you to route requests through your own secure gateway before they reach the inference engine.
                  </li>
                </ul>
              </div>
            )}
          </div>

          {/* Speaker Identification */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <UserCheck className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-200 block">
                    Speaker Identification
                  </label>
                  <p className="text-xs text-slate-400 mt-1">
                    Label distinct speakers (e.g., "Speaker 1:", "Interviewer:") in the subtitles.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.enableSpeakerLabels}
                  onChange={(e) => handleChange('enableSpeakerLabels', e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          <div className="h-px bg-slate-700/50" />

          {/* Content Context */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-1">
               <MessageSquare className="w-4 h-4 text-emerald-400" />
               <label className="text-sm font-semibold text-slate-200">Content Context / Domain</label>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Describe the content type (e.g., "Medical", "Legal", "NSFW", "Gaming"). 
              This guides the model's vocabulary and specialized understanding.
            </p>
            <input
              type="text"
              value={settings.contentContext}
              onChange={(e) => handleChange('contentContext', e.target.value)}
              placeholder="e.g. Technical, Academic, Adult, Sport..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
            />
          </div>

          <div className="h-px bg-slate-700/50" />

          {/* Model Selection */}
          <div className="space-y-3">
             <div className="flex items-center gap-2 mb-1">
               <Box className="w-4 h-4 text-purple-400" />
               <label className="text-sm font-semibold text-slate-200">AI Model & Endpoint</label>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Configure the specific inference target. Leave endpoint blank for default Google Cloud usage.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1 uppercase tracking-wider font-bold">Model Name / ID</label>
                <input
                  type="text"
                  value={settings.modelId}
                  onChange={(e) => handleChange('modelId', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-200 font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1 uppercase tracking-wider font-bold">Custom Endpoint URL (Optional)</label>
                <input
                  type="text"
                  value={settings.customEndpoint || ''}
                  onChange={(e) => handleChange('customEndpoint', e.target.value)}
                  placeholder="https://proxy.example.com/v1"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-200 font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-500/20 transition-all active:scale-95"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
