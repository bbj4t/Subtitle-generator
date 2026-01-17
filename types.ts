export interface VideoFile {
  file: File;
  previewUrl: string;
  base64Data?: string;
  mimeType: string;
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  READING_FILE = 'READING_FILE',
  ANALYZING = 'ANALYZING', // Gemini is thinking
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface SubtitleResponse {
  rawSrt: string;
  filename: string;
}

export interface GeneratorSettings {
  enableSpeakerLabels: boolean;
  contentContext: string;
  modelId: string;
  customEndpoint?: string;
}

export interface SubtitleEntry {
  id: string;
  index: number;
  startTime: string;
  endTime: string;
  text: string;
}
