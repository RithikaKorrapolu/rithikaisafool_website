// Please Hold - Data Types

export interface Message {
  id: number;
  threadId: number;
  filename: string;
  duration: number; // in seconds
  recordedAt: string;
  speaker?: string; // optional speaker name/alias
  transcript?: string; // AI-generated transcript of the audio
  audioUrl?: string; // URL to fetch audio from device
}

export interface StrandAnalytics {
  totalDuration: number;
  messageCount: number;
  avgMessageDuration: number;
  longestMessage: { id: number; duration: number } | null;
  shortestMessage: { id: number; duration: number } | null;
  totalWords: number;
  avgWordsPerMessage: number;
  topWords: { word: string; count: number }[];
  transcriptCompleteness: number; // percentage of messages with transcripts
  recordingTimespan: { first: string; last: string } | null;
}

export interface Strand {
  id: number;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  totalDuration: number; // total seconds
  messageCount: number;
  voiceCount: number;
  isActive: boolean;
}

export interface DeviceStatus {
  state: 'idle' | 'recording' | 'playing';
  currentThread: number;
  currentMessage: number;
  ip?: string;
  connected?: boolean; // true if device is reachable
}

export interface PleaseHoldData {
  strands: Strand[];
  deviceStatus: DeviceStatus;
  stats: {
    totalMessages: number;
    totalVoices: number;
    totalHours: number;
    totalStrands: number;
  };
}
