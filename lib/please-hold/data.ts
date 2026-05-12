// Please Hold - Data Service
// Fetches data from cloud storage (Vercel Blob) with fallback to device or mock data

import { Message, Strand, DeviceStatus, PleaseHoldData, StrandAnalytics } from './types';

// Device IP - set via environment variable (only used as fallback)
const DEVICE_IP = process.env.PLEASE_HOLD_DEVICE_IP || process.env.NEXT_PUBLIC_PLEASE_HOLD_DEVICE_IP || null;

// Base URL for API calls (works in both server and client contexts)
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // Client-side: relative URL
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000';
};

// Fetch recordings from cloud storage
async function fetchFromCloud(): Promise<{
  threads: Array<{
    id: number;
    messages: Array<{
      id: number;
      path: string;
      audioUrl: string;
      duration: number;
      size: number;
      uploadedAt: string;
    }>;
    createdAt: string;
    updatedAt: string;
  }>;
  lastUpdated: string;
  source: string;
} | null> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/please-hold/upload`, {
      signal: AbortSignal.timeout(5000),
      cache: 'no-store', // Always get fresh data
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.log('[Please Hold] Cloud fetch failed:', error);
    return null;
  }
}

// Convert cloud data to our Strand format
function cloudDataToStrands(cloudData: Awaited<ReturnType<typeof fetchFromCloud>>): Strand[] {
  if (!cloudData || !cloudData.threads) return [];

  return cloudData.threads.map((thread, index) => {
    const messages: Message[] = thread.messages.map(msg => ({
      id: msg.id,
      threadId: thread.id,
      filename: msg.path.split('/').pop() || `${String(msg.id).padStart(3, '0')}.wav`,
      duration: Math.round(msg.duration),
      recordedAt: msg.uploadedAt || new Date().toISOString(),
      speaker: `Voice ${msg.id}`,
      audioUrl: msg.audioUrl,
    }));

    const totalDuration = messages.reduce((sum, m) => sum + m.duration, 0);

    return {
      id: thread.id,
      title: `Thread #${thread.id}`,
      description: `${messages.length} message${messages.length !== 1 ? 's' : ''} recorded`,
      createdAt: thread.createdAt || new Date().toISOString(),
      updatedAt: thread.updatedAt || new Date().toISOString(),
      messages,
      totalDuration,
      messageCount: messages.length,
      voiceCount: messages.length,
      isActive: index === 0, // Most recent thread is active
    };
  });
}

// Fetch status from real device (fallback)
async function fetchFromDevice(): Promise<{
  state: string;
  currentThread: number;
  currentMessage: number;
  wifiMode: string;
  ssid: string;
  ip: string;
  threads: Array<{
    id: number;
    messages: Array<{
      id: number;
      path: string;
      duration: number;
      size: number;
    }>;
  }>;
} | null> {
  if (!DEVICE_IP) return null;

  try {
    const response = await fetch(`http://${DEVICE_IP}/status`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.log('[Please Hold] Device not reachable');
    return null;
  }
}

// Convert device data to our Strand format
function deviceDataToStrands(deviceData: Awaited<ReturnType<typeof fetchFromDevice>>): Strand[] {
  if (!deviceData || !deviceData.threads) return [];

  return deviceData.threads.map(thread => {
    const messages: Message[] = thread.messages.map(msg => ({
      id: msg.id,
      threadId: thread.id,
      filename: msg.path.split('/').pop() || `${String(msg.id).padStart(3, '0')}.wav`,
      duration: Math.round(msg.duration),
      recordedAt: new Date().toISOString(),
      speaker: `Voice ${msg.id}`,
      audioUrl: `http://${DEVICE_IP}${msg.path}`,
    }));

    const totalDuration = messages.reduce((sum, m) => sum + m.duration, 0);

    return {
      id: thread.id,
      title: `Thread #${thread.id}`,
      description: `${messages.length} message${messages.length !== 1 ? 's' : ''} recorded`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages,
      totalDuration,
      messageCount: messages.length,
      voiceCount: messages.length,
      isActive: thread.id === deviceData.currentThread,
    };
  });
}

// Common words to exclude from word frequency
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
  'it', 'its', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she',
  'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
  'her', 'our', 'their', 'what', 'which', 'who', 'whom', 'whose',
  'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'also',
  'now', 'here', 'there', 'then', 'once', 'if', 'as', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'up', 'down', 'out',
  'off', 'over', 'under', 'again', 'further', 'about', 'because', 'until',
  'while', 'although', 'though', 'since', 'unless', 'like', 'get', 'got',
  'im', "i'm", "it's", "that's", "don't", "doesn't", "didn't", "won't",
  "wouldn't", "couldn't", "shouldn't", "can't", "cannot", 'yeah', 'yes',
  'no', 'okay', 'ok', 'um', 'uh', 'like', 'know', 'think', 'going', 'go',
  'really', 'actually', 'basically', 'literally', 'just', 'well'
]);

// Calculate analytics for a strand
export function calculateStrandAnalytics(strand: Strand): StrandAnalytics {
  const messages = strand.messages;

  if (messages.length === 0) {
    return {
      totalDuration: 0,
      messageCount: 0,
      avgMessageDuration: 0,
      longestMessage: null,
      shortestMessage: null,
      totalWords: 0,
      avgWordsPerMessage: 0,
      topWords: [],
      transcriptCompleteness: 0,
      recordingTimespan: null,
    };
  }

  // Duration stats
  const totalDuration = messages.reduce((sum, m) => sum + m.duration, 0);
  const avgMessageDuration = totalDuration / messages.length;

  const sortedByDuration = [...messages].sort((a, b) => b.duration - a.duration);
  const longestMessage = { id: sortedByDuration[0].id, duration: sortedByDuration[0].duration };
  const shortestMessage = { id: sortedByDuration[sortedByDuration.length - 1].id, duration: sortedByDuration[sortedByDuration.length - 1].duration };

  // Transcript analysis
  const messagesWithTranscripts = messages.filter(m => m.transcript && m.transcript.trim().length > 0);
  const transcriptCompleteness = (messagesWithTranscripts.length / messages.length) * 100;

  // Word frequency
  const allText = messagesWithTranscripts.map(m => m.transcript || '').join(' ').toLowerCase();
  const words = allText.split(/\s+/).filter(w => w.length > 2 && !STOP_WORDS.has(w.replace(/[^a-z]/g, '')));
  const totalWords = words.length;
  const avgWordsPerMessage = messagesWithTranscripts.length > 0 ? totalWords / messagesWithTranscripts.length : 0;

  // Count word frequency
  const wordCounts: Record<string, number> = {};
  words.forEach(word => {
    const clean = word.replace(/[^a-z']/g, '');
    if (clean.length > 2) {
      wordCounts[clean] = (wordCounts[clean] || 0) + 1;
    }
  });

  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  // Time stats
  const sortedByTime = [...messages].sort((a, b) =>
    new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );
  const recordingTimespan = {
    first: sortedByTime[0].recordedAt,
    last: sortedByTime[sortedByTime.length - 1].recordedAt,
  };

  return {
    totalDuration,
    messageCount: messages.length,
    avgMessageDuration,
    longestMessage,
    shortestMessage,
    totalWords,
    avgWordsPerMessage: Math.round(avgWordsPerMessage),
    topWords,
    transcriptCompleteness: Math.round(transcriptCompleteness),
    recordingTimespan,
  };
}

// Real strand data - starts empty until device records actual data
// In production, this would fetch from the device at 192.168.4.1
let STRANDS: Strand[] = [];


// Create a new strand
export async function createStrand(title?: string, description?: string): Promise<Strand> {
  const newId = STRANDS.length > 0 ? Math.max(...STRANDS.map(s => s.id)) + 1 : 1;

  // Mark all existing strands as inactive
  STRANDS.forEach(s => s.isActive = false);

  const newStrand: Strand = {
    id: newId,
    title: title || `Strand #${newId}`,
    description: description || 'A new conversation begins...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    totalDuration: 0,
    messageCount: 0,
    voiceCount: 0,
    isActive: true,
  };

  STRANDS.unshift(newStrand); // Add to beginning
  deviceStatus.currentThread = newId;

  return newStrand;
}

// Record a new message to current strand
export async function recordMessage(duration?: number, transcript?: string): Promise<Message | null> {
  const currentStrand = STRANDS.find(s => s.isActive);
  if (!currentStrand) return null;

  const messageId = currentStrand.messages.length + 1;
  const messageDuration = duration || Math.floor(Math.random() * 120) + 15; // 15-135 seconds

  const newMessage: Message = {
    id: messageId,
    threadId: currentStrand.id,
    filename: `${String(messageId).padStart(3, '0')}.wav`,
    duration: messageDuration,
    recordedAt: new Date().toISOString(),
    speaker: 'You',
    transcript,
  };

  currentStrand.messages.push(newMessage);
  currentStrand.messageCount = currentStrand.messages.length;
  currentStrand.totalDuration += messageDuration;
  currentStrand.updatedAt = new Date().toISOString();

  // Count unique voices
  const uniqueSpeakers = new Set(currentStrand.messages.map(m => m.speaker));
  currentStrand.voiceCount = uniqueSpeakers.size;

  deviceStatus.currentMessage = messageId;

  return newMessage;
}

// Reset all data
export async function resetData(): Promise<void> {
  STRANDS = [];
  deviceStatus = {
    state: 'idle',
    currentThread: 0,
    currentMessage: 0,
    ip: '192.168.4.1',
  };
}

// Device status - starts with no current thread
let deviceStatus: DeviceStatus = {
  state: 'idle',
  currentThread: 0,
  currentMessage: 0,
  ip: '192.168.4.1',
};

// Format duration as MM:SS
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Format duration as "X min" or "X hr Y min"
export function formatDurationLong(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} hr ${mins} min`;
  }
  return `${mins} min`;
}

// Get all strands - fetches from cloud first, then device, then fallback
export async function getStrands(): Promise<Strand[]> {
  // Try cloud storage first (Vercel Blob)
  const cloudData = await fetchFromCloud();
  if (cloudData && cloudData.threads && cloudData.threads.length > 0) {
    const strands = cloudDataToStrands(cloudData);
    STRANDS = strands;
    console.log(`[Please Hold] Loaded ${strands.length} threads from cloud`);
    return strands;
  }

  // Try direct device connection as fallback
  const deviceData = await fetchFromDevice();
  if (deviceData && deviceData.threads && deviceData.threads.length > 0) {
    const strands = deviceDataToStrands(deviceData);
    STRANDS = strands;
    console.log(`[Please Hold] Loaded ${strands.length} threads from device`);
    return strands;
  }

  // Fall back to cached/mock data
  console.log('[Please Hold] Using cached/mock data');
  return STRANDS;
}

// Get a single strand by ID
export async function getStrand(id: number): Promise<Strand | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return STRANDS.find(s => s.id === id) || null;
}

// Get the current active strand
export async function getCurrentStrand(): Promise<Strand | null> {
  await new Promise(resolve => setTimeout(resolve, 50));
  return STRANDS.find(s => s.isActive) || STRANDS[0] || null;
}

// Get device status - fetches from device if available
export async function getDeviceStatus(): Promise<DeviceStatus> {
  // Try to fetch from real device
  const deviceData = await fetchFromDevice();
  if (deviceData) {
    return {
      state: deviceData.state as 'idle' | 'recording' | 'playing',
      currentThread: deviceData.currentThread,
      currentMessage: deviceData.currentMessage,
      ip: deviceData.ip,
      connected: true,
    };
  }

  // Fall back to mock status
  return { ...deviceStatus, connected: false };
}

// Get full data payload
export async function getPleaseHoldData(): Promise<PleaseHoldData> {
  const strands = await getStrands();
  const status = await getDeviceStatus();

  // Calculate stats from actual data
  const totalMessages = strands.reduce((sum, s) => sum + s.messageCount, 0);
  const totalVoices = strands.reduce((sum, s) => sum + s.voiceCount, 0);
  const totalSeconds = strands.reduce((sum, s) => sum + s.totalDuration, 0);
  const totalHours = Math.round(totalSeconds / 3600 * 10) / 10;
  // Current strand number is the highest ID (most recent), or 0 if no strands
  const totalStrands = strands.length > 0 ? Math.max(...strands.map(s => s.id)) : 0;

  return {
    strands,
    deviceStatus: status,
    stats: {
      totalMessages,
      totalVoices,
      totalHours,
      totalStrands,
    },
  };
}

// Get audio URL for a message
export function getAudioUrl(message: Message): string {
  // If message has audioUrl from device, use it
  if (message.audioUrl) {
    return message.audioUrl;
  }

  // If we have device IP, construct URL
  if (DEVICE_IP) {
    return `http://${DEVICE_IP}/thread_${String(message.threadId).padStart(3, '0')}/${message.filename}`;
  }

  // Fallback to local assets
  return `/assets/please-hold/audio/thread_${String(message.threadId).padStart(3, '0')}/${message.filename}`;
}

// Simulate starting playback
export async function startPlayback(strandId: number, messageIndex: number = 0): Promise<void> {
  deviceStatus = {
    ...deviceStatus,
    state: 'playing',
    currentThread: strandId,
    currentMessage: messageIndex,
  };
}

// Simulate stopping playback
export async function stopPlayback(): Promise<void> {
  deviceStatus = {
    ...deviceStatus,
    state: 'idle',
    currentMessage: 0,
  };
}

// Simulate starting recording
export async function startRecording(strandId: number): Promise<void> {
  deviceStatus = {
    ...deviceStatus,
    state: 'recording',
    currentThread: strandId,
  };
}

// Simulate stopping recording
export async function stopRecording(): Promise<void> {
  deviceStatus = {
    ...deviceStatus,
    state: 'idle',
  };
}

// Format relative time
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
