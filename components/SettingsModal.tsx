import React from 'react';
import { X, Server, UserCheck, MessageSquare, Box } from 'lucide-react';
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
              Describe the content type (e.g., "Medical Procedure", "Legal Deposition", "Adult/NSFW", "Gaming"). 
              This guides the model's vocabulary and safety filters.
            </p>
            <input
              type="text"
              value={settings.contentContext}
              onChange={(e) => handleChange('contentContext', e.target.value)}
              placeholder="e.g. General, Medical, Technical, Adult..."
              className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
              Specify the model ID. Use a fine-tuned model ID (e.g., <code>tunedModels/my-custom-model</code>) if available.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Model Name / ID</label>
                <input
                  type="text"
                  value={settings.modelId}
                  onChange={(e) => handleChange('modelId', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-200 font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Custom Endpoint URL (Optional)</label>
                <input
                  type="text"
                  value={settings.customEndpoint || ''}
                  onChange={(e) => handleChange('customEndpoint', e.target.value)}
                  placeholder="https://my-self-hosted-instance/v1"
                  className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-sm text-slate-200 font-mono placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Leave empty to use official Google Gemini API.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-800 border-t border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
