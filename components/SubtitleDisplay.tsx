import React, { useState, useEffect, useCallback } from 'react';
import { Download, Copy, Check, Plus, Trash2, Clock, Type } from 'lucide-react';
import { SubtitleEntry } from '../types';

interface SubtitleDisplayProps {
  srtContent: string;
  filename?: string;
}

export const SubtitleDisplay: React.FC<SubtitleDisplayProps> = ({ srtContent, filename = "subtitles" }) => {
  const [entries, setEntries] = useState<SubtitleEntry[]>([]);
  const [copied, setCopied] = useState(false);

  // Parse raw SRT into objects
  useEffect(() => {
    const lines = srtContent.split(/\r?\n\r?\n/);
    const parsedEntries: SubtitleEntry[] = lines
      .map((block, idx) => {
        const parts = block.trim().split(/\r?\n/);
        if (parts.length < 3) return null;

        const index = parseInt(parts[0], 10);
        const timeMatch = parts[1].match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
        if (!timeMatch) return null;

        const text = parts.slice(2).join('\n');

        return {
          id: Math.random().toString(36).substr(2, 9),
          index: index || idx + 1,
          startTime: timeMatch[1],
          endTime: timeMatch[2],
          text
        };
      })
      .filter((e): e is SubtitleEntry => e !== null);

    setEntries(parsedEntries);
  }, [srtContent]);

  const formatToSRT = useCallback(() => {
    return entries
      .map((e, idx) => {
        return `${idx + 1}\n${e.startTime} --> ${e.endTime}\n${e.text}`;
      })
      .join('\n\n');
  }, [entries]);

  const handleDownload = () => {
    const content = formatToSRT();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeFilename = filename.replace(/\.[^/.]+$/, "").replace(/\s+/g, "_");
    link.download = `${safeFilename}.srt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formatToSRT()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const updateEntry = (id: string, field: keyof SubtitleEntry, value: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const deleteEntry = (id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const addEntry = () => {
    const lastEntry = entries[entries.length - 1];
    let newStartTime = "00:00:00,000";
    let newEndTime = "00:00:01,000";

    if (lastEntry) {
      newStartTime = lastEntry.endTime;
      // Simple logic to add 2 seconds to the last end time for default
      const [h, m, s_ms] = lastEntry.endTime.split(':');
      const [s, ms] = s_ms.split(',');
      let totalSeconds = parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + 2;
      const nh = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
      const nm = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
      const ns = (totalSeconds % 60).toString().padStart(2, '0');
      newEndTime = `${nh}:${nm}:${ns},${ms}`;
    }

    const newEntry: SubtitleEntry = {
      id: Math.random().toString(36).substr(2, 9),
      index: entries.length + 1,
      startTime: newStartTime,
      endTime: newEndTime,
      text: ""
    };
    setEntries([...entries, newEntry]);
  };

  return (
    <div className="w-full flex flex-col space-y-4 animate-fade-in-up">
      <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
        <div>
          <h3 className="text-lg font-semibold text-white">Subtitle Editor</h3>
          <p className="text-xs text-slate-400">Modify timestamps and text before exporting</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-600 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .srt</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {entries.map((entry, idx) => (
          <div key={entry.id} className="group relative bg-slate-900 border border-slate-700/50 rounded-xl p-4 transition-all hover:border-indigo-500/50 hover:bg-slate-800/50">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Timing info */}
              <div className="flex flex-col space-y-2 w-full sm:w-48 flex-shrink-0">
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono mb-1">
                  <span className="bg-slate-800 px-2 py-0.5 rounded text-indigo-400">#{idx + 1}</span>
                  <Clock className="w-3 h-3" />
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    value={entry.startTime}
                    onChange={(e) => updateEntry(entry.id, 'startTime', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-300 focus:border-indigo-500 outline-none"
                    placeholder="00:00:00,000"
                  />
                  <div className="text-[10px] text-slate-600 text-center">to</div>
                  <input
                    type="text"
                    value={entry.endTime}
                    onChange={(e) => updateEntry(entry.id, 'endTime', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-300 focus:border-indigo-500 outline-none"
                    placeholder="00:00:00,000"
                  />
                </div>
              </div>

              {/* Text info */}
              <div className="flex-grow flex flex-col space-y-2">
                 <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                  <Type className="w-3 h-3" />
                  <span>Dialogue</span>
                </div>
                <textarea
                  value={entry.text}
                  onChange={(e) => updateEntry(entry.id, 'text', e.target.value)}
                  className="w-full h-20 bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-indigo-500 outline-none resize-none leading-relaxed"
                  placeholder="Enter subtitle text..."
                />
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col justify-end gap-2">
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="text-center py-12 bg-slate-900/50 border border-dashed border-slate-700 rounded-xl">
            <p className="text-slate-500 text-sm">No entries found. Click below to add one manually.</p>
          </div>
        )}

        <button
          onClick={addEntry}
          className="w-full py-4 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center space-x-2 text-slate-500 hover:text-indigo-400 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all group"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium text-sm">Add New Subtitle Entry</span>
        </button>
      </div>
    </div>
  );
};
