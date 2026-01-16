import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, FileVideo } from 'lucide-react';
import { VideoFile } from '../types';

interface VideoUploaderProps {
  onVideoSelected: (video: VideoFile) => void;
  onClear: () => void;
  selectedVideo: VideoFile | null;
  disabled?: boolean;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ 
  onVideoSelected, 
  onClear, 
  selectedVideo,
  disabled 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file.');
      return;
    }

    // Limit file size for this demo to prevent browser crash on Base64 conversion
    // 50MB limit
    if (file.size > 50 * 1024 * 1024) {
      alert('File is too large for this demo. Please upload a video smaller than 50MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // Extract base64 part (remove data:video/mp4;base64, prefix)
      const base64Data = result.split(',')[1];
      
      onVideoSelected({
        file,
        previewUrl: URL.createObjectURL(file),
        base64Data,
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  }, [onVideoSelected]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  if (selectedVideo) {
    return (
      <div className="w-full relative rounded-xl overflow-hidden border border-slate-700 bg-slate-800/50 shadow-xl">
        <video 
          src={selectedVideo.previewUrl} 
          controls 
          className="w-full max-h-[400px] object-contain bg-black"
        />
        <div className="p-4 flex justify-between items-center border-t border-slate-700">
          <div className="flex items-center space-x-2 text-slate-300">
            <FileVideo className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-medium truncate max-w-[200px]">{selectedVideo.file.name}</span>
            <span className="text-xs text-slate-500">({(selectedVideo.file.size / (1024 * 1024)).toFixed(2)} MB)</span>
          </div>
          {!disabled && (
            <button 
              onClick={onClear}
              className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition-colors"
              title="Remove video"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && fileInputRef.current?.click()}
      className={`
        w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
          : 'border-slate-600 hover:border-indigo-400 hover:bg-slate-800/50 bg-slate-800/20'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleChange} 
        accept="video/*" 
        className="hidden" 
        disabled={disabled}
      />
      
      <div className="bg-slate-800 p-4 rounded-full mb-4 shadow-lg ring-1 ring-white/10">
        <Upload className={`w-8 h-8 ${isDragging ? 'text-indigo-400' : 'text-slate-400'}`} />
      </div>
      
      <p className="text-lg font-medium text-slate-200 mb-2">
        {isDragging ? 'Drop video here' : 'Click or Drag video here'}
      </p>
      <p className="text-sm text-slate-500 max-w-xs text-center">
        Supports MP4, MOV, WebM (Max 50MB)
      </p>
    </div>
  );
};
