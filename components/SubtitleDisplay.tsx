import React, { useRef } from 'react';
import { Download, Copy, Check } from 'lucide-react';

interface SubtitleDisplayProps {
  srtContent: string;
  filename?: string;
}

export const SubtitleDisplay: React.FC<SubtitleDisplayProps> = ({ srtContent, filename = "subtitles" }) => {
  const [copied, setCopied] = React.useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleDownload = () => {
    const blob = new Blob([srtContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Ensure filename ends in .srt
    const safeFilename = filename.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_");
    link.download = `${safeFilename}.srt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(srtContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full flex flex-col space-y-3 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Generated Subtitles (SRT)</h3>
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .srt</span>
          </button>
        </div>
      </div>
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          readOnly
          value={srtContent}
          className="w-full h-80 bg-slate-900 border border-slate-700 rounded-xl p-4 text-sm font-mono text-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none leading-relaxed"
          placeholder="Subtitles will appear here..."
        />
        <div className="absolute top-2 right-4 text-xs text-slate-600 font-mono">
           SRT Format
        </div>
      </div>
    </div>
  );
};
