'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

// Type alias for use in component
type SpeechRecognition = SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}
import type { Strand as APIStrand, PleaseHoldData, StrandAnalytics } from '@/lib/please-hold/types';
import { formatDuration as formatDurationFromLib, formatDurationLong, formatRelativeTime } from '@/lib/please-hold/data';

// ─── STRANDS & MOMENTS DATA MODEL ─────────────────────────────────────────
interface Moment {
  id: number;
  title: string;
  speaker: string;
  duration: number; // in seconds
  date: string;
  sentiment?: 'sweet' | 'nostalgic' | 'reflective' | 'sincere' | 'whimsical' | 'melancholy' | 'funny';
}

interface Strand {
  id: string;
  title: string;
  description: string;
  totalDuration: number; // in seconds
  momentCount: number;
  moments: Moment[];
  createdAt: string;
  keywords: string[];
  insight: string; // qualitative highlight
}

const strandsData: Strand[] = [
  {
    id: 'strand-1',
    title: 'Things We Remember',
    description: 'A thread about the small things that stay with us',
    totalDuration: 312, // 5:12
    momentCount: 8,
    createdAt: '3 days ago',
    keywords: ['mother', 'kitchen', 'home', 'hands', 'morning'],
    insight: 'Someone laughed 17 times telling their story',
    moments: [
      { id: 1, title: 'Things my mother used to say', speaker: 'Mira', duration: 42, date: '3 hours ago', sentiment: 'nostalgic' },
      { id: 2, title: 'My grandmother\'s kitchen', speaker: 'Soraya', duration: 36, date: '8 hours ago', sentiment: 'sweet' },
      { id: 3, title: 'The sound of my father whistling', speaker: 'Rui', duration: 44, date: '1 day ago', sentiment: 'nostalgic' },
      { id: 4, title: 'On hands, mostly', speaker: 'Maeve', duration: 11, date: '1 day ago', sentiment: 'reflective' },
      { id: 5, title: 'A list of small mercies', speaker: 'Eli', duration: 22, date: '2 days ago', sentiment: 'sincere' },
      { id: 6, title: 'Three things I forgot to say', speaker: 'Theo', duration: 53, date: '2 days ago', sentiment: 'melancholy' },
      { id: 7, title: 'Letters I never sent', speaker: 'Luca', duration: 38, date: '3 days ago', sentiment: 'sincere' },
      { id: 8, title: 'The weight of names', speaker: 'Kai', duration: 52, date: '3 days ago', sentiment: 'reflective' },
    ],
  },
  {
    id: 'strand-2',
    title: 'Walking Home',
    description: 'Stories from the journey back',
    totalDuration: 198, // 3:18
    momentCount: 5,
    createdAt: '1 week ago',
    keywords: ['walk', 'home', 'evening', 'quiet', 'steps'],
    insight: 'Two people said the exact same thing about rain',
    moments: [
      { id: 9, title: 'On the long walk home', speaker: 'Aïsha', duration: 18, date: '5 days ago', sentiment: 'reflective' },
      { id: 10, title: 'What the river was doing', speaker: 'Jun', duration: 49, date: '5 days ago', sentiment: 'whimsical' },
      { id: 11, title: 'A weather report from inside', speaker: 'Inés', duration: 27, date: '6 days ago', sentiment: 'whimsical' },
      { id: 12, title: 'What silence sounds like', speaker: 'Omar', duration: 45, date: '6 days ago', sentiment: 'reflective' },
      { id: 13, title: 'A door I keep opening', speaker: 'Vera', duration: 19, date: '1 week ago', sentiment: 'melancholy' },
    ],
  },
  {
    id: 'strand-3',
    title: 'Almost Calling',
    description: 'The ones we almost reached out to',
    totalDuration: 247, // 4:07
    momentCount: 6,
    createdAt: '2 weeks ago',
    keywords: ['phone', 'waiting', 'silence', 'voice', 'miss'],
    insight: 'The longest pause was 8 seconds — just breathing',
    moments: [
      { id: 14, title: 'Almost calling, never calling', speaker: 'June', duration: 33, date: '1 week ago', sentiment: 'melancholy' },
      { id: 15, title: 'A song I keep almost remembering', speaker: 'Tomás', duration: 31, date: '1 week ago', sentiment: 'nostalgic' },
      { id: 16, title: 'The smell of something burning', speaker: 'Yael', duration: 21, date: '1 week ago', sentiment: 'funny' },
      { id: 17, title: 'The color of Tuesday', speaker: 'Nina', duration: 29, date: '2 weeks ago', sentiment: 'whimsical' },
      { id: 18, title: 'Something borrowed', speaker: 'Ava', duration: 34, date: '2 weeks ago', sentiment: 'sweet' },
      { id: 19, title: 'The first snow', speaker: 'Leo', duration: 99, date: '2 weeks ago', sentiment: 'nostalgic' },
    ],
  },
];

// Helper to format duration
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// ─── Extended chain data for the full timeline ────────────────────────────
const fullChainData = [
  { n: 2847, name: 'Mira', dur: '0:42', title: 'Things my mother used to say', date: '3 hours ago', responding: 'A song I keep almost remembering' },
  { n: 2846, name: 'Tomás', dur: '0:31', title: 'A song I keep almost remembering', date: '8 hours ago', responding: 'On the long walk home' },
  { n: 2845, name: 'Aïsha', dur: '0:18', title: 'On the long walk home', date: '1 day ago', responding: 'What the river was doing' },
  { n: 2844, name: 'Jun', dur: '0:49', title: 'What the river was doing', date: '1 day ago', responding: 'A list of small mercies' },
  { n: 2843, name: 'Eli', dur: '0:22', title: 'A list of small mercies', date: '2 days ago', responding: "My grandmother's kitchen" },
  { n: 2842, name: 'Soraya', dur: '0:36', title: "My grandmother's kitchen", date: '2 days ago', responding: 'On hands, mostly' },
  { n: 2841, name: 'Maeve', dur: '0:11', title: 'On hands, mostly', date: '3 days ago', responding: 'Three things I forgot to say' },
  { n: 2840, name: 'Theo', dur: '0:53', title: 'Three things I forgot to say', date: '3 days ago', responding: 'A weather report from inside' },
  { n: 2839, name: 'Inés', dur: '0:27', title: 'A weather report from inside', date: '4 days ago', responding: 'The sound of my father whistling' },
  { n: 2838, name: 'Rui', dur: '0:44', title: 'The sound of my father whistling', date: '4 days ago', responding: 'Almost calling, never calling' },
  { n: 2837, name: 'June', dur: '0:33', title: 'Almost calling, never calling', date: '5 days ago', responding: 'The smell of something burning' },
  { n: 2836, name: 'Yael', dur: '0:21', title: 'The smell of something burning', date: '5 days ago', responding: 'Letters I never sent' },
  { n: 2835, name: 'Luca', dur: '0:38', title: 'Letters I never sent', date: '6 days ago', responding: 'The color of Tuesday' },
  { n: 2834, name: 'Nina', dur: '0:29', title: 'The color of Tuesday', date: '6 days ago', responding: 'What silence sounds like' },
  { n: 2833, name: 'Omar', dur: '0:45', title: 'What silence sounds like', date: '1 week ago', responding: 'A door I keep opening' },
  { n: 2832, name: 'Vera', dur: '0:19', title: 'A door I keep opening', date: '1 week ago', responding: 'The weight of names' },
  { n: 2831, name: 'Kai', dur: '0:52', title: 'The weight of names', date: '1 week ago', responding: 'Something borrowed' },
  { n: 2830, name: 'Ava', dur: '0:34', title: 'Something borrowed', date: '1 week ago', responding: 'The first snow' },
];

// ─── Mock data ─────────────────────────────────────────────────────────────
const chainData = [
  { n: 2847, name: 'Mira',    dur: '0:42', current: true,  title: 'Things my mother used to say' },
  { n: 2846, name: 'Tomás',   dur: '0:31', title: 'A song I keep almost remembering' },
  { n: 2845, name: 'Aïsha',   dur: '0:18', title: 'On the long walk home' },
  { n: 2844, name: 'Jun',     dur: '0:49', title: 'What the river was doing' },
  { n: 2843, name: 'Eli',     dur: '0:22', title: 'A list of small mercies' },
  { n: 2842, name: 'Soraya',  dur: '0:36', title: "My grandmother's kitchen" },
  { n: 2841, name: 'Maeve',   dur: '0:11', title: 'On hands, mostly' },
  { n: 2840, name: 'Theo',    dur: '0:53', title: 'Three things I forgot to say' },
  { n: 2839, name: 'Inés',    dur: '0:27', title: 'A weather report from inside' },
  { n: 2838, name: 'Rui',     dur: '0:44', title: 'The sound of my father whistling' },
  { n: 2837, name: 'June',    dur: '0:33', title: 'Almost calling, never calling' },
  { n: 2836, name: 'Yael',    dur: '0:21', title: 'The smell of something burning' },
];

// ─── Deterministic pseudo-random for waveforms ─────────────────────────────
function seed(n: number) {
  let x = n + 1;
  return () => (x = (x * 9301 + 49297) % 233280) / 233280;
}

// ─── Waveform component ────────────────────────────────────────────────────
function Wave({
  width = 620,
  height = 110,
  progress = 0,
  animated = false,
  count = 110,
  seedN = 7
}: {
  width?: number;
  height?: number;
  progress?: number;
  animated?: boolean;
  count?: number;
  seedN?: number;
}) {
  const bars = useMemo(() => {
    const r = seed(seedN);
    return Array.from({ length: count }, (_, i) => {
      const env = Math.sin((i / count) * Math.PI) ** 0.7;
      const v = 0.35 + r() * 0.65;
      return Math.max(0.08, env * v);
    });
  }, [count, seedN]);

  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!animated) return;
    let raf: number;
    let last = performance.now();
    const tick = (n: number) => {
      setPhase((p) => p + (n - last) * 0.005);
      last = n;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated]);

  const gap = 3;
  const barW = (width - (count - 1) * gap) / count;

  return (
    <svg width={width} height={height} style={{ display: 'block' }} suppressHydrationWarning>
      {bars.map((h, i) => {
        const wob = animated ? 0.7 + 0.3 * Math.sin(phase + i * 0.42) : 1;
        const bh = Math.round(Math.max(2, h * height * wob) * 100) / 100;
        const y = Math.round(((height - bh) / 2) * 100) / 100;
        const x = Math.round(i * (barW + gap) * 100) / 100;
        const played = i / count < progress;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={Math.round(barW * 100) / 100}
            height={bh}
            rx={Math.round(barW * 0.4 * 100) / 100}
            fill={played ? '#e63a26' : '#f5f1e8'}
            opacity={played ? 1 : 0.32}
            suppressHydrationWarning
          />
        );
      })}
      {progress > 0 && (
        <line
          x1={progress * width}
          x2={progress * width}
          y1={4}
          y2={height - 4}
          stroke="#e63a26"
          strokeWidth="1.4"
        />
      )}
    </svg>
  );
}

// ─── Mini waveform for chain cards ─────────────────────────────────────────
function MiniWave({
  width = 180,
  height = 38,
  seedN,
  accent = false,
  played = false
}: {
  width?: number;
  height?: number;
  seedN: number;
  accent?: boolean;
  played?: boolean;
}) {
  const bars = useMemo(() => {
    const r = seed(seedN);
    return Array.from({ length: 36 }, (_, i) => {
      const env = Math.sin((i / 36) * Math.PI) ** 0.6;
      return Math.max(0.1, env * (0.4 + r() * 0.6));
    });
  }, [seedN]);

  const gap = 2;
  const barW = (width - 35 * gap) / 36;

  return (
    <svg width={width} height={height} style={{ display: 'block' }} suppressHydrationWarning>
      {bars.map((h, i) => {
        const bh = Math.round(Math.max(2, h * height) * 100) / 100;
        const y = Math.round(((height - bh) / 2) * 100) / 100;
        const x = Math.round(i * (barW + gap) * 100) / 100;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={Math.round(barW * 100) / 100}
            height={bh}
            rx={Math.round(barW * 0.4 * 100) / 100}
            fill={accent ? '#e63a26' : '#f5f1e8'}
            opacity={accent ? 1 : (played ? 0.85 : 0.28)}
            suppressHydrationWarning
          />
        );
      })}
    </svg>
  );
}

// ─── PH Monogram ───────────────────────────────────────────────────────────
function PHMark({ size = 28, color = '#f5f1e8' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="28" stroke={color} strokeWidth="1.4" />
      <path d="M 18 18 L 18 42 M 18 18 Q 30 18 30 24 Q 30 30 18 30" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M 36 18 L 36 42 M 36 30 L 46 30 M 46 18 L 46 42" stroke={color} strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── Device Illustration (SVG) ─────────────────────────────────────────────
function DeviceRender({ pulse = false }: { pulse?: boolean }) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
      {/* Paper pedestal shadow */}
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(26,22,18,0.10), transparent 55%)' }}
      />

      <svg viewBox="0 0 400 500" className="w-[92%] h-auto mx-auto">
        <defs>
          <radialGradient id="puckBody" cx="50%" cy="35%" r="70%">
            <stop offset="0" stopColor="#2a221c" />
            <stop offset="0.6" stopColor="#1a1411" />
            <stop offset="1" stopColor="#0d0907" />
          </radialGradient>
          <radialGradient id="puckTop" cx="50%" cy="40%" r="60%">
            <stop offset="0" stopColor="#3a2f26" />
            <stop offset="0.7" stopColor="#1f1812" />
            <stop offset="1" stopColor="#15110d" />
          </radialGradient>
          <radialGradient id="brassBtn" cx="40%" cy="35%" r="65%">
            <stop offset="0" stopColor="#f4d889" />
            <stop offset="0.4" stopColor="#c9a14a" />
            <stop offset="1" stopColor="#7a5a1c" />
          </radialGradient>
          <linearGradient id="bodyEdge" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a221c" />
            <stop offset="1" stopColor="#0a0805" />
          </linearGradient>
          <radialGradient id="grilleDot" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#000" stopOpacity="0.7" />
            <stop offset="1" stopColor="#000" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Shadow under device */}
        <ellipse cx="200" cy="430" rx="170" ry="22" fill="rgba(26,22,18,0.18)" />
        <ellipse cx="200" cy="425" rx="140" ry="14" fill="rgba(26,22,18,0.30)" />

        {/* Device body — puck */}
        <ellipse cx="200" cy="380" rx="160" ry="34" fill="#0a0805" />
        <rect x="40" y="290" width="320" height="92" fill="url(#bodyEdge)" />
        <ellipse cx="200" cy="290" rx="160" ry="34" fill="url(#puckBody)" />

        {/* Top inset */}
        <ellipse cx="200" cy="285" rx="148" ry="30" fill="url(#puckTop)" />
        <ellipse cx="200" cy="282" rx="140" ry="27" fill="none" stroke="rgba(216,184,99,0.18)" strokeWidth="0.6" />

        {/* Speaker grille — concentric dots */}
        {Array.from({ length: 8 }).map((_, ring) => {
          const rx = 22 + ring * 14;
          const ry = rx * 0.21;
          const dotCount = 6 + ring * 4;
          return Array.from({ length: dotCount }).map((__, i) => {
            const a = (i / dotCount) * Math.PI * 2;
            const x = 200 + Math.cos(a) * rx;
            const y = 285 + Math.sin(a) * ry;
            return <circle key={`${ring}-${i}`} cx={x} cy={y} r="1.2" fill="url(#grilleDot)" />;
          });
        }).flat()}

        {/* Brass button */}
        <ellipse cx="200" cy="278" rx="44" ry="11" fill="rgba(0,0,0,0.55)" />
        <ellipse cx="200" cy="274" rx="42" ry="10" fill="url(#brassBtn)" />
        <ellipse cx="200" cy="270" rx="40" ry="9" fill="url(#brassBtn)" stroke="#3a2a0a" strokeWidth="0.6" />
        <ellipse cx="194" cy="266" rx="14" ry="2.5" fill="#fff8d8" opacity="0.55" />

        {/* Engraved ring text */}
        <g fontFamily="'JetBrains Mono', monospace" fontSize="6" fill="rgba(216,184,99,0.55)" letterSpacing="2" textAnchor="middle">
          <text x="200" y="248">PLEASE  HOLD  ·  PRESS  TO  LISTEN</text>
        </g>

        {/* LED indicator */}
        <circle cx="345" cy="295" r="2.2" fill={pulse ? '#3a8a4f' : '#2a4a2a'}>
          {pulse && <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />}
        </circle>

        {/* Cord */}
        <path d="M 200 405 Q 200 460 280 480" stroke="#1a1411" strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Serial engraving */}
        <text x="200" y="408" fontFamily="'JetBrains Mono', monospace" fontSize="4" fill="rgba(216,184,99,0.4)" textAnchor="middle" letterSpacing="2">
          PH—0247  ·  ED.  001
        </text>
      </svg>

      {/* Pulse ring when playing */}
      {pulse && (
        <div
          className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] rounded-full border border-[#e63a26] opacity-50"
          style={{ animation: 'pulse 2.4s ease-out infinite' }}
        />
      )}
    </div>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────
function Header({ activeTab, setActiveTab }: { activeTab: string; setActiveTab: (tab: string) => void }) {
  const tabs = [
    { k: 'listen2', label: 'Listen 2' },
    { k: 'listen', label: 'Listen' },
    { k: 'chain', label: 'The Chain' },
    { k: 'export', label: 'Export' },
    { k: 'device', label: 'Device' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10" style={{ background: 'rgba(0,0,0,0.85)' }}>
      <div className="max-w-[1200px] mx-auto px-8 py-[18px] flex items-center gap-8">
        <div className="flex items-center gap-3">
          <PHMark size={26} />
          <span className="font-serif text-lg font-medium tracking-tight text-[#f5f1e8]">
            Please Hold
          </span>
        </div>

        <nav className="flex gap-1 ml-6">
          {tabs.map((t) => (
            <button
              key={t.k}
              onClick={() => setActiveTab(t.k)}
              className="px-3 py-1.5 bg-transparent border-none text-sm cursor-pointer rounded"
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                color: activeTab === t.k ? '#f5f1e8' : 'rgba(245,241,232,0.62)',
                fontWeight: activeTab === t.k ? 600 : 400,
                boxShadow: activeTab === t.k ? 'inset 0 -2px 0 0 #e63a26' : 'none',
              }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2.5 font-mono text-[11px] tracking-[1.5px] uppercase" style={{ color: 'rgba(245,241,232,0.38)' }}>
          <span className="w-2 h-2 rounded-full bg-[#3a8a4f]" style={{ boxShadow: '0 0 10px #3a8a4f88' }} />
          Connected · PH-0247
        </div>
      </div>
    </header>
  );
}

// ─── The Chain Timeline View ───────────────────────────────────────────────
function ChainTimeline({
  playingId,
  setPlayingId,
}: {
  playingId: number | null;
  setPlayingId: (id: number | null) => void;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  return (
    <section className="max-w-[900px] mx-auto px-8 py-16">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-4 mb-4 text-[14px] tracking-[3px] uppercase font-medium" style={{ color: '#f5f1e8' }}>
          <span className="w-2.5 h-2.5 rounded-full bg-[#dcff73]" />
          <span>The Chain</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>{fullChainData.length} of 84 messages</span>
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-[#f5f1e8] mb-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Every voice, connected.
        </h1>
        <p className="text-[rgba(245,241,232,0.62)] text-lg max-w-xl mx-auto">
          Each message responds to the one before it. Scroll through the chain to see how the conversation evolved.
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical connecting line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-px bg-gradient-to-b from-[#e63a26] via-[rgba(245,241,232,0.2)] to-transparent" />

        <div className="space-y-0">
          {fullChainData.map((msg, index) => {
            const isPlaying = playingId === msg.n;
            const isExpanded = expandedId === msg.n;
            const isCurrent = index === 0;

            return (
              <div key={msg.n} className="relative">
                {/* Timeline node */}
                <div className="absolute left-0 top-6 flex items-center">
                  <div
                    className="w-[46px] h-[46px] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
                    style={{
                      background: isCurrent ? '#e63a26' : isPlaying ? '#e63a26' : '#0e0e0e',
                      border: isCurrent || isPlaying ? 'none' : '2px solid rgba(245,241,232,0.2)',
                      boxShadow: isCurrent ? '0 0 20px rgba(230,58,38,0.4)' : isPlaying ? '0 0 20px rgba(230,58,38,0.4)' : 'none',
                    }}
                    onClick={() => setPlayingId(isPlaying ? null : msg.n)}
                  >
                    {isPlaying ? (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="#fff">
                        <rect x="3" y="2" width="3.5" height="12" />
                        <rect x="9.5" y="2" width="3.5" height="12" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 16 16" fill={isCurrent ? '#fff' : '#f5f1e8'}>
                        <path d="M4 2 L14 8 L4 14 Z" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Message card */}
                <div
                  className="ml-[70px] py-6 cursor-pointer group"
                  onClick={() => setExpandedId(isExpanded ? null : msg.n)}
                >
                  {/* Connection indicator */}
                  {index > 0 && (
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-mono tracking-[1.5px] uppercase text-[rgba(245,241,232,0.38)]">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M8 2 L8 14 M3 9 L8 14 L13 9" />
                      </svg>
                      responding to &ldquo;{msg.responding}&rdquo;
                    </div>
                  )}

                  <div
                    className="p-6 rounded-lg transition-all duration-300"
                    style={{
                      background: isCurrent ? 'rgba(230,58,38,0.1)' : isExpanded ? '#161616' : '#0e0e0e',
                      border: isCurrent ? '1px solid rgba(230,58,38,0.3)' : '1px solid rgba(245,241,232,0.08)',
                    }}
                  >
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono text-[10px] tracking-[1.5px] uppercase" style={{ color: isCurrent ? '#e63a26' : 'rgba(245,241,232,0.38)' }}>
                            #{msg.n}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#e63a26] text-white">
                              Current
                            </span>
                          )}
                        </div>
                        <h3 className="font-serif italic text-xl text-[#f5f1e8] group-hover:text-white transition-colors">
                          &ldquo;{msg.title}&rdquo;
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[11px] text-[rgba(245,241,232,0.62)]">{msg.dur}</div>
                        <div className="font-mono text-[10px] text-[rgba(245,241,232,0.38)] mt-1">{msg.date}</div>
                      </div>
                    </div>

                    {/* Waveform */}
                    <div className="mb-4">
                      <MiniWave width={700} height={44} seedN={msg.n} accent={isPlaying} played={index < 3} />
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: isCurrent ? '#e63a26' : 'rgba(245,241,232,0.4)' }} />
                        <span className="text-[13px] font-medium text-[#f5f1e8]">{msg.name}</span>
                      </div>

                      {isExpanded && (
                        <div className="flex items-center gap-3">
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent text-[rgba(245,241,232,0.62)] border border-white/10 rounded-full cursor-pointer text-[11px] font-medium hover:border-white/30 transition-colors">
                            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                              <path d="M3 8 L7 11 L11 8 M7 11 L7 2 M2 12 L12 12" />
                            </svg>
                            Save
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-transparent text-[rgba(245,241,232,0.62)] border border-white/10 rounded-full cursor-pointer text-[11px] font-medium hover:border-white/30 transition-colors">
                            <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
                              <circle cx="3" cy="7" r="1.5" />
                              <circle cx="11" cy="3" r="1.5" />
                              <circle cx="11" cy="11" r="1.5" />
                              <path d="M4.5 6 L9.5 3.5 M4.5 8 L9.5 10.5" />
                            </svg>
                            Share
                          </button>
                          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f1e8] text-black border-none rounded-full cursor-pointer text-[11px] font-medium">
                            Jump to this message
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider line between messages */}
                {index < fullChainData.length - 1 && (
                  <div className="ml-[70px] border-b border-white/5" />
                )}
              </div>
            );
          })}
        </div>

        {/* Load more indicator */}
        <div className="ml-[70px] py-12 text-center">
          <button className="inline-flex items-center gap-3 px-6 py-3 bg-[#0e0e0e] border border-white/10 rounded-full text-[13px] font-medium text-[rgba(245,241,232,0.62)] hover:border-white/30 transition-colors cursor-pointer">
            <span>Load more messages</span>
            <span className="font-mono text-[10px] tracking-wider text-[rgba(245,241,232,0.38)]">2,829 remaining</span>
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Sentiment Cluster Section ──────────────────────────────────────────────
function SentimentClusterSection() {
  const [hoveredMessage, setHoveredMessage] = useState<number | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState<string | null>(null);

  // Messages with sentiment scores (x = sweet to funny, y = quiet to loud)
  const messages = [
    { id: 1, title: 'Things my mother used to say', speaker: 'Mira', sentiment: 'sweet', x: 15, y: 35 },
    { id: 2, title: 'A song I keep almost remembering', speaker: 'Tomás', sentiment: 'nostalgic', x: 25, y: 45 },
    { id: 3, title: 'On the long walk home', speaker: 'Aïsha', sentiment: 'reflective', x: 35, y: 55 },
    { id: 4, title: 'What the river was doing', speaker: 'Jun', sentiment: 'whimsical', x: 65, y: 40 },
    { id: 5, title: 'A list of small mercies', speaker: 'Eli', sentiment: 'sweet', x: 20, y: 25 },
    { id: 6, title: "My grandmother's kitchen", speaker: 'Soraya', sentiment: 'nostalgic', x: 30, y: 30 },
    { id: 7, title: 'On hands, mostly', speaker: 'Maeve', sentiment: 'reflective', x: 40, y: 60 },
    { id: 8, title: 'Three things I forgot to say', speaker: 'Theo', sentiment: 'sincere', x: 22, y: 50 },
    { id: 9, title: 'A weather report from inside', speaker: 'Inés', sentiment: 'whimsical', x: 70, y: 35 },
    { id: 10, title: 'The sound of my father whistling', speaker: 'Rui', sentiment: 'nostalgic', x: 28, y: 40 },
    { id: 11, title: 'Almost calling, never calling', speaker: 'June', sentiment: 'melancholy', x: 18, y: 70 },
    { id: 12, title: 'The smell of something burning', speaker: 'Yael', sentiment: 'funny', x: 75, y: 55 },
    { id: 13, title: 'Letters I never sent', speaker: 'Luca', sentiment: 'sincere', x: 25, y: 65 },
    { id: 14, title: 'The color of Tuesday', speaker: 'Nina', sentiment: 'whimsical', x: 80, y: 30 },
    { id: 15, title: 'What silence sounds like', speaker: 'Omar', sentiment: 'reflective', x: 45, y: 75 },
    { id: 16, title: 'A door I keep opening', speaker: 'Vera', sentiment: 'melancholy', x: 20, y: 80 },
    { id: 17, title: 'The weight of names', speaker: 'Kai', sentiment: 'sincere', x: 30, y: 55 },
    { id: 18, title: 'Something borrowed', speaker: 'Ava', sentiment: 'sweet', x: 18, y: 20 },
    { id: 19, title: 'Why I stopped singing', speaker: 'Sam', sentiment: 'melancholy', x: 15, y: 85 },
    { id: 20, title: 'The joke my dad always told', speaker: 'Dani', sentiment: 'funny', x: 85, y: 45 },
    { id: 21, title: 'Counting stairs', speaker: 'River', sentiment: 'whimsical', x: 72, y: 25 },
    { id: 22, title: 'What I should have said', speaker: 'Alex', sentiment: 'sincere', x: 28, y: 72 },
    { id: 23, title: 'The last good morning', speaker: 'Jordan', sentiment: 'nostalgic', x: 32, y: 48 },
    { id: 24, title: 'Dancing alone', speaker: 'Taylor', sentiment: 'funny', x: 78, y: 60 },
    { id: 25, title: 'A recipe from memory', speaker: 'Morgan', sentiment: 'sweet', x: 12, y: 32 },
    { id: 26, title: 'The bus that never came', speaker: 'Casey', sentiment: 'funny', x: 82, y: 38 },
    { id: 27, title: 'Holding my breath', speaker: 'Quinn', sentiment: 'reflective', x: 42, y: 68 },
    { id: 28, title: 'The perfect cup of tea', speaker: 'Avery', sentiment: 'sweet', x: 15, y: 28 },
  ];

  const sentiments = [
    { name: 'sweet', color: '#ffb4c4', label: 'Sweet' },
    { name: 'sincere', color: '#a5d8e6', label: 'Sincere' },
    { name: 'nostalgic', color: '#dcff73', label: 'Nostalgic' },
    { name: 'reflective', color: '#c4b5fd', label: 'Reflective' },
    { name: 'melancholy', color: '#94a3b8', label: 'Melancholy' },
    { name: 'whimsical', color: '#fcd34d', label: 'Whimsical' },
    { name: 'funny', color: '#fb923c', label: 'Funny' },
  ];

  const getColor = (sentiment: string) => {
    return sentiments.find(s => s.name === sentiment)?.color || '#f5f1e8';
  };

  const filteredMessages = selectedSentiment
    ? messages.filter(m => m.sentiment === selectedSentiment)
    : messages;

  return (
    <div className="py-12 px-8 rounded-2xl" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="text-center mb-10">
        <h3 className="text-3xl font-bold tracking-tight text-[#f5f1e8] mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          The emotional landscape
        </h3>
        <p className="text-[rgba(245,241,232,0.5)] text-[15px]">
          Every message, mapped by feeling
        </p>
      </div>

      {/* Sentiment filter pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <button
          onClick={() => setSelectedSentiment(null)}
          className="px-4 py-2 rounded-full text-[12px] tracking-[1px] font-medium cursor-pointer transition-all"
          style={{
            background: selectedSentiment === null ? '#f5f1e8' : 'transparent',
            color: selectedSentiment === null ? '#000' : 'rgba(245,241,232,0.6)',
            border: selectedSentiment === null ? 'none' : '1px solid rgba(245,241,232,0.2)',
          }}
        >
          All
        </button>
        {sentiments.map(s => (
          <button
            key={s.name}
            onClick={() => setSelectedSentiment(selectedSentiment === s.name ? null : s.name)}
            className="px-4 py-2 rounded-full text-[12px] tracking-[1px] font-medium cursor-pointer transition-all flex items-center gap-2"
            style={{
              background: selectedSentiment === s.name ? s.color : 'transparent',
              color: selectedSentiment === s.name ? '#000' : 'rgba(245,241,232,0.6)',
              border: selectedSentiment === s.name ? 'none' : '1px solid rgba(245,241,232,0.2)',
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Scatter plot */}
      <div className="relative h-[450px] max-w-4xl mx-auto rounded-xl overflow-hidden" style={{ background: '#111' }}>
        {/* Axis labels */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] tracking-[2px] uppercase" style={{ color: 'rgba(245,241,232,0.3)' }}>
          Quiet → Loud
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] tracking-[2px] uppercase" style={{ color: 'rgba(245,241,232,0.3)' }}>
          Sweet & Sincere → Funny & Whimsical
        </div>

        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.1 }}>
          {[25, 50, 75].map(p => (
            <g key={p}>
              <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="#f5f1e8" strokeWidth="1" />
              <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#f5f1e8" strokeWidth="1" />
            </g>
          ))}
        </svg>

        {/* Thread connecting all dots */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="threadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#dcff73" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#a5d8e6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffb4c4" stopOpacity="0.6" />
            </linearGradient>
          </defs>
          {/* Connect messages in order */}
          {filteredMessages.slice(0, -1).map((msg, i) => {
            const nextMsg = filteredMessages[i + 1];
            if (!nextMsg) return null;
            return (
              <line
                key={`thread-${msg.id}-${nextMsg.id}`}
                x1={`${msg.x}%`}
                y1={`${msg.y}%`}
                x2={`${nextMsg.x}%`}
                y2={`${nextMsg.y}%`}
                stroke="url(#threadGradient)"
                strokeWidth="1"
                strokeDasharray="4 4"
                style={{ opacity: selectedSentiment ? 0.3 : 0.5 }}
              />
            );
          })}
        </svg>

        {/* Message dots */}
        {filteredMessages.map((msg, i) => {
          const isHovered = hoveredMessage === msg.id;
          const color = getColor(msg.sentiment);

          return (
            <div
              key={msg.id}
              className="absolute cursor-pointer transition-all duration-300"
              style={{
                left: `${msg.x}%`,
                top: `${msg.y}%`,
                transform: `translate(-50%, -50%) scale(${isHovered ? 1.5 : 1})`,
                zIndex: isHovered ? 10 : 1,
              }}
              onMouseEnter={() => setHoveredMessage(msg.id)}
              onMouseLeave={() => setHoveredMessage(null)}
            >
              {/* Dot */}
              <div
                className="w-4 h-4 rounded-full transition-all"
                style={{
                  background: color,
                  boxShadow: isHovered ? `0 0 20px ${color}` : 'none',
                  animation: `wordPulse ${2 + (i % 3) * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />

              {/* Tooltip */}
              {isHovered && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 px-4 py-3 rounded-lg whitespace-nowrap"
                  style={{ background: '#1a1a1a', border: '1px solid rgba(245,241,232,0.1)' }}
                >
                  <div className="text-[13px] italic mb-1" style={{ fontFamily: 'Georgia, serif', color: '#f5f1e8' }}>
                    "{msg.title}"
                  </div>
                  <div className="flex items-center gap-2 text-[10px] tracking-[1px] uppercase" style={{ color: 'rgba(245,241,232,0.5)' }}>
                    <span>{msg.speaker}</span>
                    <span>·</span>
                    <span style={{ color }}>{msg.sentiment}</span>
                  </div>
                  {/* Play button */}
                  <button className="mt-2 w-full py-1.5 rounded-full text-[10px] font-medium flex items-center justify-center gap-1.5" style={{ background: color, color: '#000' }}>
                    <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4 2L14 8L4 14Z" />
                    </svg>
                    Play
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Quadrant labels */}
        <div className="absolute top-6 left-8 text-[11px] italic" style={{ fontFamily: 'Georgia, serif', color: 'rgba(245,241,232,0.25)' }}>
          tender & quiet
        </div>
        <div className="absolute top-6 right-8 text-[11px] italic" style={{ fontFamily: 'Georgia, serif', color: 'rgba(245,241,232,0.25)' }}>
          playful & light
        </div>
        <div className="absolute bottom-10 left-8 text-[11px] italic" style={{ fontFamily: 'Georgia, serif', color: 'rgba(245,241,232,0.25)' }}>
          deep & sincere
        </div>
        <div className="absolute bottom-10 right-8 text-[11px] italic" style={{ fontFamily: 'Georgia, serif', color: 'rgba(245,241,232,0.25)' }}>
          loud & joyful
        </div>
      </div>

      {/* Legend counts */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
        {sentiments.map(s => {
          const count = messages.filter(m => m.sentiment === s.name).length;
          return (
            <div key={s.name} className="flex items-center gap-2 text-[12px]" style={{ color: 'rgba(245,241,232,0.5)' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
              <span>{s.label}</span>
              <span style={{ color: s.color }}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Things We Noticed Section ──────────────────────────────────────────────
function ThingsWeNoticedSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const observations = [
    {
      text: 'someone laughed 17 times',
      detail: "Mira couldn't stop giggling while telling this story",
      timestamp: '2:34',
      chapter: 'Things my mother used to say',
      speaker: 'Mira',
    },
    {
      text: 'this got quiet for a while',
      detail: 'A 4-second pause in the middle of the message',
      timestamp: '1:47',
      chapter: 'Almost calling, never calling',
      speaker: 'June',
    },
    {
      text: 'people kept talking about home',
      detail: '127 mentions across 82 messages',
      timestamp: '0:23',
      chapter: 'On the long walk home',
      speaker: 'Aïsha',
    },
    {
      text: 'someone whispered this one',
      detail: 'Recorded at 2am, barely audible',
      timestamp: '0:42',
      chapter: 'Three things I forgot to say',
      speaker: 'Theo',
    },
    {
      text: 'the longest message was 4 minutes',
      detail: 'They had a lot to say about their grandmother',
      timestamp: '0:00',
      chapter: "My grandmother's kitchen",
      speaker: 'Soraya',
    },
    {
      text: 'someone started crying here',
      detail: 'A moment of unexpected vulnerability',
      timestamp: '1:12',
      chapter: 'A list of small mercies',
      speaker: 'Eli',
    },
    {
      text: 'this one was recorded outside',
      detail: 'You can hear birds in the background',
      timestamp: '0:08',
      chapter: 'What the river was doing',
      speaker: 'Jun',
    },
    {
      text: 'two people said the same thing',
      detail: 'Both mentioned "the smell of rain"',
      timestamp: '0:31',
      chapter: 'A weather report from inside',
      speaker: 'Inés',
    },
  ];

  // Auto-rotate every 5 seconds when not playing
  useEffect(() => {
    if (isPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % observations.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, observations.length]);

  const current = observations[activeIndex];

  return (
    <div className="py-16 px-8 rounded-2xl text-center" style={{ background: '#0a0a0a' }}>
      {/* Main observation */}
      <div className="max-w-3xl mx-auto">
        {/* The observation text */}
        <div
          className="text-4xl md:text-5xl font-medium tracking-tight mb-6 transition-all duration-500"
          style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            color: '#f5f1e8',
          }}
        >
          "{current.text}"
        </div>

        {/* Detail */}
        <div className="text-[15px] mb-10" style={{ color: 'rgba(245,241,232,0.5)' }}>
          {current.detail}
        </div>

        {/* Audio player card */}
        <div
          className="inline-block p-6 rounded-xl mb-10"
          style={{ background: '#111', border: '1px solid rgba(245,241,232,0.1)' }}
        >
          <div className="flex items-center gap-6">
            {/* Play button */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-14 h-14 rounded-full flex items-center justify-center cursor-pointer border-none transition-transform hover:scale-105"
              style={{
                background: isPlaying ? '#e63a26' : '#dcff73',
              }}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 16 16" fill={isPlaying ? '#fff' : '#000'}>
                  <rect x="3" y="2" width="3.5" height="12" />
                  <rect x="9.5" y="2" width="3.5" height="12" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 16 16" fill="#000">
                  <path d="M4 2L14 8L4 14Z" />
                </svg>
              )}
            </button>

            {/* Track info */}
            <div className="text-left">
              <div className="text-[16px] italic mb-1" style={{ fontFamily: 'Georgia, serif', color: '#f5f1e8' }}>
                {current.chapter}
              </div>
              <div className="text-[12px] tracking-[1px] uppercase" style={{ color: 'rgba(245,241,232,0.4)' }}>
                {current.speaker} · {current.timestamp}
              </div>
            </div>

            {/* Mini waveform */}
            <div className="flex items-center gap-[2px] ml-4" suppressHydrationWarning>
              {Array.from({ length: 20 }).map((_, i) => {
                const height = Math.round((Math.sin((i / 20) * Math.PI) * 24 + 8) * 100) / 100;
                return (
                  <div
                    key={i}
                    className="w-[3px] rounded-full transition-all"
                    style={{
                      height: `${height}px`,
                      background: isPlaying ? '#dcff73' : 'rgba(245,241,232,0.3)',
                      animation: isPlaying ? `waveBar 0.5s ease-in-out infinite ${i * 0.05}s` : 'none',
                    }}
                    suppressHydrationWarning
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Dots navigation */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {observations.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveIndex(i);
                setIsPlaying(false);
              }}
              className="w-2 h-2 rounded-full cursor-pointer border-none transition-all"
              style={{
                background: i === activeIndex ? '#dcff73' : 'rgba(245,241,232,0.2)',
                transform: i === activeIndex ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* Arrow navigation */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              setActiveIndex((i) => (i - 1 + observations.length) % observations.length);
              setIsPlaying(false);
            }}
            className="w-10 h-10 rounded-full bg-transparent border border-white/20 flex items-center justify-center cursor-pointer text-[rgba(245,241,232,0.6)] hover:border-white/40 hover:text-[#f5f1e8] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M9 2 L4 7 L9 12" />
            </svg>
          </button>
          <span className="text-[12px] tracking-[2px] uppercase" style={{ color: 'rgba(245,241,232,0.4)' }}>
            {activeIndex + 1} of {observations.length}
          </span>
          <button
            onClick={() => {
              setActiveIndex((i) => (i + 1) % observations.length);
              setIsPlaying(false);
            }}
            className="w-10 h-10 rounded-full bg-transparent border border-white/20 flex items-center justify-center cursor-pointer text-[rgba(245,241,232,0.6)] hover:border-white/40 hover:text-[#f5f1e8] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M5 2 L10 7 L5 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Word Cloud Section ─────────────────────────────────────────────────────
function WordCloudSection() {
  // Words with count - size is calculated from count
  const keywords = [
    { word: 'home', count: 1247 },
    { word: 'remember', count: 892 },
    { word: 'mother', count: 743 },
    { word: 'quiet', count: 67 },
    { word: 'waiting', count: 1089 },
    { word: 'morning', count: 42 },
    { word: 'hands', count: 521 },
    { word: 'voice', count: 1183 },
    { word: 'silence', count: 867 },
    { word: 'kitchen', count: 34 },
    { word: 'father', count: 671 },
    { word: 'walking', count: 28 },
    { word: 'night', count: 798 },
    { word: 'song', count: 945 },
    { word: 'almost', count: 83 },
    { word: 'calling', count: 812 },
    { word: 'small', count: 19 },
    { word: 'years', count: 387 },
    { word: 'lost', count: 614 },
    { word: 'found', count: 56 },
    { word: 'door', count: 47 },
    { word: 'water', count: 31 },
    { word: 'light', count: 768 },
    { word: 'time', count: 1034 },
    { word: 'love', count: 1127 },
    { word: 'gone', count: 58 },
    { word: 'story', count: 847 },
    { word: 'listen', count: 589 },
  ];

  // Calculate size based on count (min 20px, max 56px)
  const maxCount = Math.max(...keywords.map(k => k.count));
  const minCount = Math.min(...keywords.map(k => k.count));
  const getSize = (count: number, word: string) => {
    const ratio = (count - minCount) / (maxCount - minCount);
    let size = 20 + ratio * 36; // 20px to 56px range
    // Make "love" 3x bigger
    if (word === 'love') size = size * 3;
    return size;
  };

  return (
    <div className="py-12 px-8 rounded-2xl text-center" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="mb-12">
        <h3 className="text-3xl font-bold tracking-tight text-[#f5f1e8] mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          What did people talk about?
        </h3>
        <p className="text-[rgba(245,241,232,0.5)] text-[15px]">
          The most common words across all 82 messages
        </p>
      </div>

      {/* Word cloud - true scattered positions */}
      <div className="relative h-[500px] max-w-5xl mx-auto overflow-hidden">
        {keywords
          .sort((a, b) => b.count - a.count)
          .map((item, i) => {
            const size = getSize(item.count, item.word);
            const isVeryHighFrequency = item.count >= 1000;
            const isHighFrequency = item.count >= 100 && item.count < 1000;
            const color = isVeryHighFrequency ? '#a5d8e6' : isHighFrequency ? '#dcff73' : '#f5f1e8';

            // Pre-calculated positions to avoid overlap - arranged in zones
            const positions: { [key: string]: { top: string; left: string; rotate: number } } = {
              'love': { top: '35%', left: '38%', rotate: -3 },
              'home': { top: '8%', left: '25%', rotate: 5 },
              'voice': { top: '15%', left: '58%', rotate: -4 },
              'waiting': { top: '55%', left: '15%', rotate: 6 },
              'time': { top: '60%', left: '55%', rotate: -2 },
              'song': { top: '25%', left: '5%', rotate: 8 },
              'remember': { top: '5%', left: '70%', rotate: -6 },
              'silence': { top: '45%', left: '72%', rotate: 4 },
              'calling': { top: '75%', left: '35%', rotate: -5 },
              'night': { top: '70%', left: '70%', rotate: 7 },
              'light': { top: '30%', left: '80%', rotate: -8 },
              'mother': { top: '82%', left: '55%', rotate: 3 },
              'father': { top: '48%', left: '2%', rotate: -4 },
              'lost': { top: '88%', left: '15%', rotate: 6 },
              'hands': { top: '18%', left: '35%', rotate: -7 },
              'listen': { top: '65%', left: '88%', rotate: 5 },
              'years': { top: '78%', left: '80%', rotate: -3 },
              'almost': { top: '38%', left: '60%', rotate: 8 },
              'quiet': { top: '52%', left: '42%', rotate: -6 },
              'gone': { top: '12%', left: '88%', rotate: 4 },
              'found': { top: '85%', left: '2%', rotate: -5 },
              'door': { top: '28%', left: '18%', rotate: 7 },
              'morning': { top: '42%', left: '25%', rotate: -8 },
              'water': { top: '92%', left: '42%', rotate: 3 },
              'kitchen': { top: '58%', left: '30%', rotate: -4 },
              'small': { top: '22%', left: '48%', rotate: 6 },
              'walking': { top: '72%', left: '5%', rotate: -7 },
              'story': { top: '2%', left: '45%', rotate: 5 },
            };

            const pos = positions[item.word] || { top: '50%', left: '50%', rotate: 0 };

            return (
              <span
                key={item.word}
                className="absolute cursor-default transition-all duration-300 hover:scale-110 hover:z-10 group whitespace-nowrap"
                style={{
                  fontSize: `${size}px`,
                  color: color,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontWeight: item.count >= 1000 ? 700 : item.count >= 500 ? 600 : 400,
                  opacity: 0.7 + (size / 200),
                  animation: `wordPulse ${2 + (i % 3) * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.12}s`,
                  top: pos.top,
                  left: pos.left,
                  transform: `rotate(${pos.rotate}deg)`,
                }}
                title={`${item.count} times`}
              >
                {item.word}
                <span
                  className="absolute -top-2 -right-4 text-[9px] font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: color }}
                >
                  {item.count}
                </span>
              </span>
            );
          })}
      </div>

      {/* Color scale legend */}
      <div className="mt-12 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: '#f5f1e8', opacity: 0.6 }} />
          <span className="text-[11px]" style={{ color: 'rgba(245,241,232,0.5)' }}>&lt; 100</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: '#dcff73' }} />
          <span className="text-[11px]" style={{ color: 'rgba(245,241,232,0.5)' }}>100 - 999</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: '#a5d8e6' }} />
          <span className="text-[11px]" style={{ color: 'rgba(245,241,232,0.5)' }}>1,000+</span>
        </div>
      </div>

      {/* Stats below */}
      <div className="mt-8 flex items-center justify-center gap-8 text-[11px] tracking-[2px] uppercase" style={{ color: 'rgba(245,241,232,0.4)' }}>
        <span>18,247 total words</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>386 unique words</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>avg. 15 words per message</span>
      </div>
    </div>
  );
}

// ─── Pulse of the Story ─────────────────────────────────────────────────────
function PulseOfTheStory() {
  // Activity data - each item represents a day with message count (max 3 visually)
  // 0 = no messages, higher numbers = more messages that day
  const activityData = [
    { day: 1, count: 1 },
    { day: 2, count: 0 },
    { day: 3, count: 2 },
    { day: 4, count: 0 },
    { day: 5, count: 0 },
    { day: 6, count: 0 },
    { day: 7, count: 0 },
    { day: 8, count: 1 },
    { day: 9, count: 3 },
    { day: 10, count: 2 },
    { day: 11, count: 0 },
    { day: 12, count: 1 },
    { day: 13, count: 0 },
    { day: 14, count: 0 },
    { day: 15, count: 0 },
    { day: 16, count: 0 },
    { day: 17, count: 0 },
    { day: 18, count: 1 },
    { day: 19, count: 2 },
    { day: 20, count: 3 },
    { day: 21, count: 3 },
    { day: 22, count: 1 },
    { day: 23, count: 0 },
    { day: 24, count: 2 },
    { day: 25, count: 0 },
    { day: 26, count: 0 },
    { day: 27, count: 1 },
    { day: 28, count: 0 },
    { day: 29, count: 0 },
    { day: 30, count: 0 },
    { day: 31, count: 0 },
    { day: 32, count: 0 },
    { day: 33, count: 0 },
    { day: 34, count: 0 },
    { day: 35, count: 0 },
    { day: 36, count: 1 },
    { day: 37, count: 2 },
    { day: 38, count: 3 },
    { day: 39, count: 2 },
    { day: 40, count: 1 },
    { day: 41, count: 0 },
    { day: 42, count: 0 },
    { day: 43, count: 2 },
    { day: 44, count: 1 },
    { day: 45, count: 0 },
  ];

  // Annotations for silent periods and active bursts
  const annotations = [
    { startDay: 4, endDay: 7, text: 'nothing happened for 4 days', type: 'silence' },
    { startDay: 9, endDay: 10, text: '3 voices in one night', type: 'burst' },
    { startDay: 14, endDay: 17, text: '4 days of quiet', type: 'silence' },
    { startDay: 20, endDay: 21, text: 'a burst of connection', type: 'burst' },
    { startDay: 29, endDay: 35, text: 'the longest silence — 7 days', type: 'silence' },
    { startDay: 38, endDay: 38, text: 'then someone picked up', type: 'burst' },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dx: number) => scrollRef.current?.scrollBy({ left: dx, behavior: 'smooth' });

  return (
    <div className="py-12 rounded-2xl" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <div className="text-center mb-8 px-8">
        <h3 className="text-3xl font-bold tracking-tight text-[#f5f1e8] mb-3" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          When did the story breathe?
        </h3>
        <p className="text-[rgba(245,241,232,0.5)] text-[15px]">
          Activity over 45 days — clusters of voices, stretches of silence
        </p>
      </div>

      {/* Scroll controls */}
      <div className="flex items-center justify-between px-8 mb-4">
        <button
          onClick={() => scrollBy(-300)}
          className="w-9 h-9 rounded-full bg-transparent border border-white/20 flex items-center justify-center cursor-pointer text-[rgba(245,241,232,0.6)] hover:border-white/40 hover:text-[#f5f1e8] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M9 2 L4 7 L9 12" />
          </svg>
        </button>
        <div className="text-[11px] tracking-[2px] uppercase" style={{ color: 'rgba(245,241,232,0.4)' }}>
          Scroll to explore timeline
        </div>
        <button
          onClick={() => scrollBy(300)}
          className="w-9 h-9 rounded-full bg-transparent border border-white/20 flex items-center justify-center cursor-pointer text-[rgba(245,241,232,0.6)] hover:border-white/40 hover:text-[#f5f1e8] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M5 2 L10 7 L5 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Timeline visualization */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-4"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(245,241,232,0.2) transparent' }}
      >
        <div className="relative px-8" style={{ minWidth: '1400px' }}>
          {/* Base line */}
          <div className="absolute left-8 right-8 top-1/2 h-px bg-white/10" style={{ marginTop: '32px' }} />

          {/* Dots container */}
          <div className="relative flex items-center gap-4 py-16">
            {activityData.map((day, i) => {
              const opacity = day.count === 0 ? 0 : Math.min(0.5 + day.count * 0.15, 1);
              const isHighActivity = day.count >= 3;

              return (
                <div key={i} className="relative flex flex-col items-center" style={{ minWidth: '24px' }}>
                  {/* Multiple dots for activity - stacked (max 3) */}
                  {day.count > 0 && (
                    <div className="relative flex flex-col items-center gap-1">
                      {Array.from({ length: Math.min(day.count, 3) }).map((_, dotIdx) => (
                        <div
                          key={dotIdx}
                          className="rounded-full"
                          style={{
                            width: Math.max(6, 12 - dotIdx * 2),
                            height: Math.max(6, 12 - dotIdx * 2),
                            background: isHighActivity ? '#dcff73' : '#f5f1e8',
                            opacity: opacity - dotIdx * 0.15,
                            boxShadow: isHighActivity && dotIdx === 0 ? '0 0 12px rgba(220, 255, 115, 0.5)' : 'none',
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Empty day marker */}
                  {day.count === 0 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                  )}

                  {/* Day number below */}
                  <div className="absolute -bottom-8 text-[9px]" style={{ color: 'rgba(245,241,232,0.25)' }}>
                    {day.day}
                  </div>
                </div>
              );
            })}

            {/* Future days indicator */}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
              {[46, 47, 48, 49, 50].map((day) => (
                <div key={day} className="relative flex flex-col items-center" style={{ minWidth: '24px' }}>
                  <div className="w-1.5 h-1.5 rounded-full border border-dashed border-white/20" />
                  <div className="absolute -bottom-8 text-[9px]" style={{ color: 'rgba(245,241,232,0.15)' }}>
                    {day}
                  </div>
                </div>
              ))}
              <div className="text-[11px] italic ml-4" style={{ color: 'rgba(245,241,232,0.3)', fontFamily: 'Georgia, serif' }}>
                waiting for voices...
              </div>
            </div>
          </div>

          {/* Annotations */}
          {annotations.map((ann, i) => {
            const startPos = (ann.startDay - 1) * 28 + 32; // 24px width + 4px gap
            const isSilence = ann.type === 'silence';

            return (
              <div
                key={i}
                className="absolute whitespace-nowrap"
                style={{
                  left: `${startPos}px`,
                  top: i % 2 === 0 ? '20px' : 'auto',
                  bottom: i % 2 === 1 ? '60px' : 'auto',
                }}
              >
                <div
                  className="text-[11px] italic"
                  style={{
                    fontFamily: 'Georgia, serif',
                    color: isSilence ? 'rgba(245,241,232,0.35)' : '#dcff73',
                  }}
                >
                  {ann.text}
                </div>
              </div>
            );
          })}

          {/* Month markers */}
          <div className="flex mt-4 pt-4 border-t border-white/5">
            <div className="border-l border-white/10 pl-2" style={{ width: '840px' }}>
              <span className="text-[11px] font-medium tracking-[1px] uppercase" style={{ color: 'rgba(245,241,232,0.4)' }}>March 2024</span>
            </div>
            <div className="border-l border-white/10 pl-2 flex-1">
              <span className="text-[11px] font-medium tracking-[1px] uppercase" style={{ color: 'rgba(245,241,232,0.4)' }}>April 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-8 mt-12 text-[11px]" style={{ color: 'rgba(245,241,232,0.5)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/20" />
          <span>Silence</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#f5f1e8]" />
          <span>1-4 voices</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#dcff73]" style={{ boxShadow: '0 0 8px rgba(220, 255, 115, 0.4)' }} />
          <span>5+ voices</span>
        </div>
      </div>

      {/* Story insight */}
      <div className="mt-12 text-center">
        <div className="inline-block px-6 py-4 rounded-lg" style={{ background: 'rgba(220, 255, 115, 0.08)', border: '1px solid rgba(220, 255, 115, 0.2)' }}>
          <div className="text-[13px] italic" style={{ fontFamily: 'Georgia, serif', color: '#dcff73' }}>
            "The longest silence lasted 7 days. Then someone finally picked up."
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Listening Section ─────────────────────────────────────────────────────
function ListeningSection() {
  const [time, setTime] = useState(207); // Start at 3:27
  const [isPlaying, setIsPlaying] = useState(false); // Start paused to avoid hydration issues
  const [volume, setVolume] = useState(70);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsPlaying(true); // Start playing after mount
  }, []);

  useEffect(() => {
    if (!isPlaying || !mounted) return;
    const interval = setInterval(() => {
      setTime((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, mounted]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Generate animated waveform bars
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!isPlaying || !mounted) return;
    let raf: number;
    const tick = () => {
      setPhase((p) => p + 0.1);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, mounted]);

  const barCount = 120; // Many more bars for full width

  return (
    <div className="flex flex-col items-center justify-center py-20 rounded-2xl" style={{ background: '#0a0a0a' }}>
      {/* Full-width waveform with playhead */}
      <div className="relative w-full h-40 flex items-center px-8">
        {/* Left line */}
        <div className="absolute left-8 right-1/2 top-1/2 h-px bg-white/20" style={{ marginRight: '20px' }} />

        {/* Waveform bars - full width */}
        <div className="absolute inset-x-8 flex items-center justify-center gap-[3px]">
          {Array.from({ length: barCount }).map((_, i) => {
            const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
            const baseHeight = Math.sin((i / barCount) * Math.PI) * 0.8 + 0.2;
            const animOffset = mounted && isPlaying ? Math.sin(phase + i * 0.2) * 0.3 : 0;
            const height = Math.round(Math.max(6, (baseHeight + animOffset) * 120 * (1 - distFromCenter * 0.2)));
            const opacity = mounted && isPlaying ? (0.9 - distFromCenter * 0.4) : 0.3;

            return (
              <div
                key={i}
                className="w-[3px] rounded-full transition-all duration-75"
                style={{
                  height: `${height}px`,
                  background: '#a5d8e6',
                  opacity: Math.round(opacity * 100) / 100,
                }}
              />
            );
          })}
        </div>

        {/* Playhead */}
        <div className="absolute left-1/2 top-4 bottom-4 flex flex-col items-center z-10">
          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-lg" style={{ boxShadow: '0 0 10px rgba(255,255,255,0.5)' }} />
          <div className="w-px flex-1 bg-white/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-lg" style={{ boxShadow: '0 0 10px rgba(255,255,255,0.5)' }} />
        </div>

        {/* Right line */}
        <div className="absolute left-1/2 right-8 top-1/2 h-px bg-white/20" style={{ marginLeft: '20px' }} />
      </div>

      {/* Chapter info */}
      <div className="mt-10 flex items-center gap-3 text-[12px] tracking-[2px] uppercase" style={{ color: 'rgba(245,241,232,0.5)' }}>
        <span className="w-2 h-2 rounded-full bg-[#a5d8e6]" />
        <span>Chapter 47 of 82</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span className="italic" style={{ fontFamily: 'Georgia, serif', textTransform: 'none', letterSpacing: 0 }}>&ldquo;Almost calling, never calling&rdquo;</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>June</span>
      </div>

      {/* Timer */}
      <div className="mt-6 text-[56px] font-light tracking-tight text-[#f5f1e8]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {formatTime(time)}
      </div>

      {/* Progress out of total */}
      <div className="mt-2 text-[14px] text-[rgba(245,241,232,0.4)]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        of 5h 24m
      </div>

      {/* Listening label */}
      <div className="mt-4 text-[14px] tracking-[2px] text-[rgba(245,241,232,0.5)]">
        {isPlaying ? 'Listening...' : 'Paused'}
      </div>

      {/* Controls */}
      <div className="mt-10 flex items-center gap-8">
        {/* Volume control */}
        <div className="flex items-center gap-3 w-40">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="rgba(245,241,232,0.5)" strokeWidth="1.5">
            <path d="M2 5.5h2l3-3v11l-3-3H2a1 1 0 01-1-1v-3a1 1 0 011-1z" />
            {volume > 0 && <path d="M10 5.5a3 3 0 010 5" />}
            {volume > 40 && <path d="M12 3.5a6 6 0 010 9" />}
          </svg>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgba(245,241,232,0.6) 0%, rgba(245,241,232,0.6) ${volume}%, rgba(245,241,232,0.2) ${volume}%, rgba(245,241,232,0.2) 100%)`,
            }}
          />
          <span className="text-[12px] text-[rgba(245,241,232,0.4)] w-8 text-right">{volume}%</span>
        </div>

        {/* Play/Stop button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border-none hover:scale-105 transition-transform"
          style={{
            background: isPlaying ? '#e63a26' : '#f5f1e8',
          }}
        >
          {isPlaying ? (
            <div className="w-5 h-5 rounded-sm bg-white" />
          ) : (
            <svg width="22" height="22" viewBox="0 0 16 16" fill="#000">
              <path d="M4 2L14 8L4 14Z" />
            </svg>
          )}
        </button>

        {/* Skip forward */}
        <button className="w-10 h-10 rounded-full bg-transparent border border-white/20 flex items-center justify-center cursor-pointer text-[rgba(245,241,232,0.6)] hover:border-white/40 hover:text-[#f5f1e8] transition-all">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13 2v12h-2V9L5 14V2l6 5V2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Stats Strip ───────────────────────────────────────────────────────────
function Stats() {
  const items = [
    { n: '84', l: 'Messages on the chain', sub: '+3 this week' },
    { n: '5h 24m', l: 'Total audio recorded', sub: 'Avg. 3:52 each' },
    { n: '56', l: 'Voices contributing', sub: '94% returning' },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-8 py-10 border-y border-white/10">
      <div className="flex items-center gap-4 mb-6 text-[14px] tracking-[3px] uppercase font-medium" style={{ color: '#f5f1e8' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#dcff73]" />
        <span>Stats</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Live</span>
      </div>
      <div className="grid grid-cols-3 gap-0">
        {items.map((it, i) => (
          <div
            key={i}
            className="py-6 px-8"
            style={{ borderLeft: i === 0 ? 'none' : '1px solid rgba(245,241,232,0.10)' }}
          >
            <div className="text-[48px] font-bold tracking-tight leading-none text-[#f5f1e8]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              {it.n}
            </div>
            <div className="mt-2.5 text-[14px] text-[rgba(245,241,232,0.62)]">
              {it.l}
            </div>
            <div className="mt-1 text-[11px] tracking-[2px] uppercase text-[rgba(245,241,232,0.38)]">
              {it.sub}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── The Chain ─────────────────────────────────────────────────────────────
function Chain() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollBy = (dx: number) => scrollRef.current?.scrollBy({ left: dx, behavior: 'smooth' });

  return (
    <section className="max-w-[1200px] mx-auto px-8 py-14">
      <div className="flex items-end justify-between mb-7">
        <div>
          <div className="flex items-center gap-4 mb-2 text-[14px] tracking-[3px] uppercase font-medium" style={{ color: '#f5f1e8' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-[#dcff73]" />
            <span>01</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>The Chain</span>
          </div>
          <div className="flex items-center gap-4 mb-4 text-[12px] tracking-[3px] uppercase font-medium" style={{ color: 'rgba(245,241,232,0.5)' }}>
            <span>Newest → Oldest</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-[#f5f1e8]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            56 voices, in order.
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => scrollBy(-400)}
            className="w-9 h-9 rounded-full bg-transparent border border-white/10 flex items-center justify-center cursor-pointer text-[rgba(245,241,232,0.62)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M9 2 L4 7 L9 12" />
            </svg>
          </button>
          <button
            onClick={() => scrollBy(400)}
            className="w-9 h-9 rounded-full bg-transparent border border-white/10 flex items-center justify-center cursor-pointer text-[rgba(245,241,232,0.62)]"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M5 2 L10 7 L5 12" />
            </svg>
          </button>
          <button className="inline-flex items-center gap-2 px-[18px] py-2.5 bg-[#f5f1e8] text-black border-none rounded-full cursor-pointer text-[13px] font-medium">
            <svg width="11" height="11" viewBox="0 0 14 14" fill="currentColor">
              <path d="M3 2 L12 7 L3 12 Z" />
            </svg>
            Play the entire chain
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-[90px] h-px bg-white/10 z-0" />

        <div
          ref={scrollRef}
          className="flex gap-3.5 overflow-x-auto pb-3 relative z-[1]"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'thin' }}
        >
          {chainData.map((m, i) => (
            <div
              key={m.n}
              className="min-w-[220px] flex-shrink-0 p-4 rounded relative"
              style={{
                scrollSnapAlign: 'start',
                background: m.current ? '#f5f1e8' : '#0e0e0e',
                color: m.current ? '#000' : '#f5f1e8',
                border: m.current ? 'none' : '1px solid rgba(245,241,232,0.10)',
              }}
            >
              {/* Timeline dot */}
              <div
                className="absolute -top-1.5 left-4 w-2.5 h-2.5 rounded-full"
                style={{
                  background: m.current ? '#e63a26' : 'rgba(245,241,232,0.62)',
                  boxShadow: m.current ? '0 0 0 4px rgba(230,58,38,0.22), 0 0 14px #e63a26' : 'none',
                }}
              />

              <div
                className="flex justify-between font-mono text-[9px] tracking-[1.5px] uppercase mb-3"
                style={{ color: m.current ? '#e63a26' : 'rgba(245,241,232,0.38)' }}
              >
                <span>#{m.n}</span>
                <span>{m.dur}</span>
              </div>

              <MiniWave width={188} height={36} seedN={m.n} accent={m.current} played={!m.current && i < 4} />

              <div
                className="mt-3.5 font-serif italic text-[15px] leading-tight line-clamp-2"
                style={{ color: m.current ? '#000' : '#f5f1e8' }}
              >
                &ldquo;{m.title}&rdquo;
              </div>

              <div
                className="mt-2.5 flex justify-between text-[11px]"
                style={{ color: m.current ? 'rgba(0,0,0,0.7)' : 'rgba(245,241,232,0.62)' }}
              >
                <span className="font-medium">{m.name}</span>
                <span style={{ opacity: 0.7 }}>#{m.n}</span>
              </div>
            </div>
          ))}

          {/* "And more" tail */}
          <div className="min-w-[180px] flex-shrink-0 flex items-center px-[18px] italic text-[15px] leading-snug text-[rgba(245,241,232,0.62)]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            …and more, all the way back to the first voice.
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-16 mb-16 border-t border-white/10" />

      {/* Option 02 Label */}
      <div className="flex items-center gap-4 mb-8 text-[14px] tracking-[3px] uppercase font-medium" style={{ color: '#f5f1e8' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#dcff73]" />
        <span>02</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Full Tracklist</span>
      </div>

      {/* Tracklist and Player Section */}
      <div className="grid grid-cols-2 gap-12">
        {/* Left: Tracklist */}
        <div>
          <div className="flex items-center gap-4 mb-8 text-[12px] tracking-[3px] uppercase font-medium" style={{ color: 'rgba(245,241,232,0.5)' }}>
            <span>Tracklist</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>56 Voices</span>
          </div>

          <div className="space-y-0">
            {[
              { time: '0:00', title: 'Cold open', dur: '1:14', name: 'Curators', location: '' },
              { time: '1:14', title: 'A song my father whistled', dur: '0:31', name: 'Rui', location: 'São Paulo' },
              { time: '1:45', title: 'I keep almost calling', dur: '0:33', name: 'June', location: 'Lisbon', current: true },
              { time: '2:18', title: 'What I noticed walking home', dur: '0:18', name: 'Eli', location: 'Berlin' },
              { time: '2:36', title: 'On hands, mostly', dur: '0:42', name: 'Maeve', location: 'Dublin' },
              { time: '3:18', title: "My grandmother's kitchen", dur: '0:12', name: 'Soraya', location: 'Dubai' },
              { time: '3:30', title: 'Interlude — dial tones', dur: '0:24', name: 'Curators', location: '' },
              { time: '3:54', title: 'A list of small mercies', dur: '0:48', name: 'Theo', location: 'Toronto' },
              { time: '4:42', title: 'Closing remarks', dur: '1:06', name: 'Curators', location: '' },
            ].map((track, i) => (
              <div
                key={i}
                className="group flex items-start py-5 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                style={{
                  background: track.current ? 'rgba(220, 255, 115, 0.08)' : 'transparent',
                  marginLeft: track.current ? '-16px' : 0,
                  marginRight: track.current ? '-16px' : 0,
                  paddingLeft: track.current ? '16px' : 0,
                  paddingRight: track.current ? '16px' : 0,
                  borderLeft: track.current ? '2px solid #dcff73' : 'none',
                }}
              >
                <div className="w-16 text-[14px] text-[rgba(245,241,232,0.4)]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {track.time}
                </div>
                <div className="flex-1">
                  <div
                    className="text-[18px] italic mb-1"
                    style={{
                      fontFamily: 'Georgia, serif',
                      color: track.current ? '#dcff73' : '#f5f1e8',
                    }}
                  >
                    {track.title}
                  </div>
                  <div className="text-[11px] tracking-[2px] uppercase" style={{ color: 'rgba(245,241,232,0.4)' }}>
                    {track.name}{track.location && ` · ${track.location}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-[14px] text-[rgba(245,241,232,0.4)]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {track.dur}
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-transparent border border-white/20 flex items-center justify-center text-[rgba(245,241,232,0.5)] hover:border-white/40 hover:text-[#f5f1e8] transition-all"
                    title="Share"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="4" cy="8" r="2" />
                      <circle cx="12" cy="4" r="2" />
                      <circle cx="12" cy="12" r="2" />
                      <path d="M6 7l4-2M6 9l4 2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Audio Player */}
        <div className="sticky top-8 self-start">
          <div className="p-8 rounded-lg" style={{ background: '#0e0e0e', border: '1px solid rgba(245,241,232,0.1)' }}>
            {/* Now Playing Header */}
            <div className="flex items-center gap-4 mb-6 text-[12px] tracking-[3px] uppercase font-medium" style={{ color: 'rgba(245,241,232,0.5)' }}>
              <span className="w-2 h-2 rounded-full bg-[#dcff73]" />
              <span>Now Playing</span>
            </div>

            {/* Current Track Info */}
            <div className="mb-6">
              <div className="text-[24px] italic mb-2" style={{ fontFamily: 'Georgia, serif', color: '#f5f1e8' }}>
                I keep almost calling
              </div>
              <div className="text-[12px] tracking-[2px] uppercase" style={{ color: 'rgba(245,241,232,0.5)' }}>
                June · Lisbon
              </div>
            </div>

            {/* Waveform */}
            <div className="mb-6">
              <MiniWave width={400} height={60} seedN={2837} accent={true} />
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[35%] rounded-full bg-[#dcff73]" />
              </div>
              <div className="flex justify-between mt-2 text-[11px]" style={{ color: 'rgba(245,241,232,0.4)' }}>
                <span>1:45</span>
                <span>5:24</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {/* Previous */}
              <button className="w-10 h-10 rounded-full bg-transparent border border-white/20 flex items-center justify-center cursor-pointer text-[#f5f1e8] hover:border-white/40 transition-colors">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 2v12h2V9l6 5V2L5 7V2z" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button className="w-14 h-14 rounded-full bg-[#f5f1e8] flex items-center justify-center cursor-pointer text-black hover:scale-105 transition-transform">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 2L14 8L4 14Z" />
                </svg>
              </button>

              {/* Next */}
              <button className="w-10 h-10 rounded-full bg-transparent border border-white/20 flex items-center justify-center cursor-pointer text-[#f5f1e8] hover:border-white/40 transition-colors">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13 2v12h-2V9L5 14V2l6 5V2z" />
                </svg>
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 mb-8">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(245,241,232,0.5)" strokeWidth="1.5">
                <path d="M2 5.5h2l3-3v11l-3-3H2a1 1 0 01-1-1v-3a1 1 0 011-1z" />
                <path d="M10 5.5a3 3 0 010 5M12 3.5a6 6 0 010 9" />
              </svg>
              <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full w-[70%] rounded-full bg-white/40" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="text-center">
                <div className="text-[20px] font-bold text-[#f5f1e8]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>56</div>
                <div className="text-[10px] tracking-[1px] uppercase text-[rgba(245,241,232,0.4)]">Voices</div>
              </div>
              <div className="text-center">
                <div className="text-[20px] font-bold text-[#f5f1e8]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>5:24</div>
                <div className="text-[10px] tracking-[1px] uppercase text-[rgba(245,241,232,0.4)]">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-[20px] font-bold text-[#f5f1e8]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>3</div>
                <div className="text-[10px] tracking-[1px] uppercase text-[rgba(245,241,232,0.4)]">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mt-16 mb-16 border-t border-white/10" />

      {/* Option 03 Label */}
      <div className="flex items-center gap-4 mb-6 text-[14px] tracking-[3px] uppercase font-medium" style={{ color: '#f5f1e8' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#dcff73]" />
        <span>03</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Browse All Messages</span>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 rounded-full text-[12px] tracking-[1px] uppercase font-medium bg-[#f5f1e8] text-black cursor-pointer border-none">
            Newest → Oldest
          </button>
          <button className="px-4 py-2 rounded-full text-[12px] tracking-[1px] uppercase font-medium bg-transparent text-[rgba(245,241,232,0.6)] border border-white/20 cursor-pointer hover:border-white/40 hover:text-[#f5f1e8] transition-all">
            Oldest → Newest
          </button>
          <button className="px-4 py-2 rounded-full text-[12px] tracking-[1px] uppercase font-medium bg-transparent text-[rgba(245,241,232,0.6)] border border-white/20 cursor-pointer hover:border-white/40 hover:text-[#f5f1e8] transition-all flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 4h12M2 8h8M2 12h4M14 10l-2 2 2 2M10 14l2-2-2-2" />
            </svg>
            Shuffle
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="rgba(245,241,232,0.4)" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3 3" />
          </svg>
          <input
            type="text"
            placeholder="Search messages..."
            className="pl-9 pr-4 py-2 w-[220px] rounded-full text-[13px] bg-transparent border border-white/20 text-[#f5f1e8] placeholder-[rgba(245,241,232,0.3)] focus:border-white/40 focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Grid of Audio Message Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { title: 'Things my mother used to say', name: 'Mira', location: 'Tokyo', dur: '0:42' },
          { title: 'A song my father whistled', name: 'Rui', location: 'São Paulo', dur: '0:31' },
          { title: 'On the long walk home', name: 'Aïsha', location: 'Marrakech', dur: '0:18' },
          { title: 'What the river was doing', name: 'Jun', location: 'Seoul', dur: '0:49' },
          { title: 'A list of small mercies', name: 'Eli', location: 'Berlin', dur: '0:22' },
          { title: "My grandmother's kitchen", name: 'Soraya', location: 'Dubai', dur: '0:36' },
          { title: 'On hands, mostly', name: 'Maeve', location: 'Dublin', dur: '0:11' },
          { title: 'Three things I forgot to say', name: 'Theo', location: 'Toronto', dur: '0:53' },
          { title: 'A weather report from inside', name: 'Inés', location: 'Madrid', dur: '0:27' },
          { title: 'The sound of my father whistling', name: 'Rui', location: 'São Paulo', dur: '0:44' },
          { title: 'Almost calling, never calling', name: 'June', location: 'Lisbon', dur: '0:33' },
          { title: 'The smell of something burning', name: 'Yael', location: 'Tel Aviv', dur: '0:21' },
        ].map((msg, i) => (
          <div
            key={i}
            className="group p-5 rounded-lg cursor-pointer hover:bg-white/5 transition-all"
            style={{ background: '#0e0e0e', border: '1px solid rgba(245,241,232,0.1)' }}
          >
            {/* Duration badge */}
            <div className="flex justify-between items-start mb-4">
              <div className="text-[10px] tracking-[2px] uppercase font-medium" style={{ color: 'rgba(245,241,232,0.4)' }}>
                #{84 - i}
              </div>
              <div className="text-[11px] font-medium" style={{ color: 'rgba(245,241,232,0.5)' }}>
                {msg.dur}
              </div>
            </div>

            {/* Mini waveform */}
            <div className="mb-4 opacity-60 group-hover:opacity-100 transition-opacity">
              <MiniWave width={200} height={32} seedN={i * 7} />
            </div>

            {/* Title */}
            <div
              className="text-[15px] italic mb-3 line-clamp-2 group-hover:text-[#dcff73] transition-colors"
              style={{ fontFamily: 'Georgia, serif', color: '#f5f1e8' }}
            >
              {msg.title}
            </div>

            {/* Author */}
            <div className="flex items-center justify-between">
              <div className="text-[11px] tracking-[1px] uppercase" style={{ color: 'rgba(245,241,232,0.4)' }}>
                {msg.name} · {msg.location}
              </div>

              {/* Play button on hover */}
              <button className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-full bg-[#f5f1e8] flex items-center justify-center transition-opacity">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="#000">
                  <path d="M4 2L14 8L4 14Z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load more button */}
      <div className="mt-8 text-center">
        <button className="inline-flex items-center gap-3 px-8 py-4 bg-transparent text-[rgba(245,241,232,0.7)] border border-white/20 rounded-full cursor-pointer text-[14px] font-medium hover:border-white/40 hover:text-[#f5f1e8] transition-all">
          Load more messages
          <span className="text-[12px] opacity-50">72 remaining</span>
        </button>
      </div>

      {/* Divider */}
      <div className="mt-16 mb-16 border-t border-white/10" />

      {/* Option 04 Label */}
      <div className="flex items-center gap-4 mb-8 text-[14px] tracking-[3px] uppercase font-medium" style={{ color: '#f5f1e8' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#dcff73]" />
        <span>04</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Live Listening</span>
      </div>

      {/* Listening Section */}
      <ListeningSection />

      {/* Divider */}
      <div className="mt-16 mb-16 border-t border-white/10" />

      {/* Option 05 Label */}
      <div className="flex items-center gap-4 mb-8 text-[14px] tracking-[3px] uppercase font-medium" style={{ color: '#f5f1e8' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#dcff73]" />
        <span>05</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Pulse of the Story</span>
      </div>

      {/* Pulse Section */}
      <PulseOfTheStory />

      {/* Divider */}
      <div className="mt-16 mb-16 border-t border-white/10" />

      {/* Option 06 Label */}
      <div className="flex items-center gap-4 mb-8 text-[14px] tracking-[3px] uppercase font-medium" style={{ color: '#f5f1e8' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#dcff73]" />
        <span>06</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Top Keywords</span>
      </div>

      {/* Word Cloud Section */}
      <WordCloudSection />

      {/* Divider */}
      <div className="mt-16 mb-16 border-t border-white/10" />

      {/* Option 07 Label */}
      <div className="flex items-center gap-4 mb-8 text-[14px] tracking-[3px] uppercase font-medium" style={{ color: '#f5f1e8' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#dcff73]" />
        <span>07</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Things We Noticed</span>
      </div>

      {/* Things We Noticed Section */}
      <ThingsWeNoticedSection />

      {/* Divider */}
      <div className="mt-16 mb-16 border-t border-white/10" />

      {/* Option 08 Label */}
      <div className="flex items-center gap-4 mb-8 text-[14px] tracking-[3px] uppercase font-medium" style={{ color: '#f5f1e8' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#dcff73]" />
        <span>08</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Sentiment Map</span>
      </div>

      {/* Sentiment Cluster Section */}
      <SentimentClusterSection />

      {/* Divider */}
      <div className="mt-16 border-t border-white/10" />
    </section>
  );
}

// ─── Export Section ────────────────────────────────────────────────────────
function ExportSection() {
  const cards = [
    {
      eyebrow: 'Download',
      title: 'The chain, as audio.',
      body: 'A single MP3 of every message in order, with timestamps and voice cards as chapter marks.',
      cta: 'Download .mp3 (218 MB)',
      meta: 'Also available · WAV · stems · CSV transcript',
    },
    {
      eyebrow: 'Public link',
      title: 'Send a strand.',
      body: 'Pick a span — the last 10 messages, your favourite hour, just yours and the one before it. We make a small, beautiful page.',
      cta: 'Create a strand →',
      meta: 'Private by default · expires when you say so',
    },
    {
      eyebrow: 'Gift',
      title: 'Send to someone.',
      body: 'Mail a friend their own device, pre-loaded with a strand of your choosing. The chain continues from them.',
      cta: 'Send a device →',
      meta: 'Ships in 3–5 days · $89 incl. shipping',
    },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-8 py-14 pb-20">
      <div className="mb-7">
        <div className="flex items-center gap-4 mb-4 text-[14px] tracking-[3px] uppercase font-medium" style={{ color: '#f5f1e8' }}>
          <span className="w-2.5 h-2.5 rounded-full bg-[#dcff73]" />
          <span>Export</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Send</span>
        </div>
        <h2 className="text-4xl font-bold tracking-tight text-[#f5f1e8]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
          Take a piece of it with you.
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-[18px]">
        {cards.map((c, i) => (
          <div
            key={i}
            className="p-7 rounded flex flex-col min-h-[280px]"
            style={{ background: '#0e0e0e', border: '1px solid rgba(245,241,232,0.10)' }}
          >
            <div className="text-[11px] font-bold tracking-[2.5px] uppercase mb-3.5 flex items-center gap-2.5 text-[#f5f1e8]">
              <span className="w-2 h-2 rounded-full bg-[#e63a26]" />
              0{i + 1} · {c.eyebrow}
            </div>

            <div className="font-serif italic text-[28px] leading-none tracking-tight mb-3.5 text-[#f5f1e8]">
              {c.title}
            </div>

            <div className="text-[13.5px] leading-relaxed text-[rgba(245,241,232,0.62)] flex-1">
              {c.body}
            </div>

            <button className="self-start mt-[22px] px-4 py-2.5 bg-[#f5f1e8] text-black border-none rounded cursor-pointer text-[13px] font-medium">
              {c.cta}
            </button>

            <div className="mt-3.5 font-mono text-[10px] tracking-[1.5px] uppercase text-[rgba(245,241,232,0.38)]">
              {c.meta}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── MINI WAVEFORM (for strand rows - dark theme) ─────────────────────────────
function MiniWaveformDark({ width = 100, height = 24, seedN = 1 }: { width?: number; height?: number; seedN?: number }) {
  const bars = useMemo(() => {
    let x = seedN + 1;
    return Array.from({ length: 40 }, (_, i) => {
      x = (x * 9301 + 49297) % 233280;
      const rand = x / 233280;
      const env = Math.sin((i / 40) * Math.PI) ** 0.6;
      return Math.max(0.1, env * (0.3 + rand * 0.7));
    });
  }, [seedN]);

  return (
    <svg width={width} height={height} style={{ display: 'block' }} suppressHydrationWarning>
      {bars.map((h, i) => {
        const barH = Math.round(Math.max(2, h * height * 0.9) * 100) / 100;
        const y = Math.round(((height - barH) / 2) * 100) / 100;
        const x = Math.round(i * (width / 40) * 100) / 100;
        return (
          <rect key={i} x={x} y={y} width={2} height={barH} rx={1} fill="white" opacity={0.5} suppressHydrationWarning />
        );
      })}
    </svg>
  );
}

// ─── AVATAR STACK (dark theme) ────────────────────────────────────────────────
function AvatarStackDark({ count, extra }: { count: number; extra: number }) {
  const colors = ['#c4a574', '#8b7355', '#a08060', '#d4b896'];
  return (
    <div className="flex items-center">
      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
        <div
          key={i}
          className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center text-[10px] font-medium"
          style={{ background: colors[i % colors.length], marginLeft: i > 0 ? '-8px' : 0 }}
        />
      ))}
      {extra > 0 && (
        <span className="ml-2 text-[12px] text-white/50">+{extra}</span>
      )}
    </div>
  );
}

// ─── YOUR STRANDS (Landing View) - Dark Glassmorphism ───────────────────────────
function YourStrands({
  onSelectStrand,
  recordedAudios,
  setRecordedAudios,
}: {
  onSelectStrand: (strand: Strand) => void;
  recordedAudios: { strandId: number; messageId: number; url: string }[];
  setRecordedAudios: React.Dispatch<React.SetStateAction<{ strandId: number; messageId: number; url: string }[]>>;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [data, setData] = useState<PleaseHoldData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/please-hold');
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Device simulation state
  const [deviceState, setDeviceState] = useState<'idle' | 'recording' | 'playing'>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  // Audio recording
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const [micPermission, setMicPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Web Speech API for real-time transcription
  const speechRecognition = useRef<SpeechRecognition | null>(null);
  const [liveTranscript, setLiveTranscript] = useState('');

  // Refresh data from API
  const refreshData = async () => {
    try {
      const response = await fetch('/api/please-hold');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  };

  // Simulate NEW STRAND button (K3Minus on device)
  const handleNewStrand = async () => {
    try {
      const response = await fetch('/api/please-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'new-strand' }),
      });
      if (response.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to create strand:', err);
    }
  };

  // RECORD button (K1Plus on device) - hold to record actual audio
  const handleRecordStart = async () => {
    // Auto-create first strand if none exists
    if (!currentStrand) {
      try {
        await fetch('/api/please-hold', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'new-strand' }),
        });
        await refreshData();
      } catch (err) {
        console.error('Failed to create initial strand:', err);
        return;
      }
    }

    // Request microphone permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicPermission('granted');

      // Start recording
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.start(100); // Collect data every 100ms
      setDeviceState('recording');
      setRecordingTime(0);
      setLiveTranscript('');
      recordingInterval.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

      // Start Web Speech API for real-time transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        speechRecognition.current = new SpeechRecognition();
        speechRecognition.current.continuous = true;
        speechRecognition.current.interimResults = true;
        speechRecognition.current.lang = 'en-US';

        speechRecognition.current.onresult = (event) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setLiveTranscript(transcript);
        };

        speechRecognition.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
        };

        speechRecognition.current.start();
      }
    } catch (err) {
      console.error('Microphone access denied:', err);
      setMicPermission('denied');
    }
  };

  const handleRecordStop = async () => {
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }

    // Stop speech recognition and get final transcript
    let transcript = liveTranscript;
    if (speechRecognition.current) {
      speechRecognition.current.stop();
      speechRecognition.current = null;
    }

    const duration = recordingTime;

    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();

      // Stop all tracks
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());

      // Wait for final data
      await new Promise<void>(resolve => {
        if (mediaRecorder.current) {
          mediaRecorder.current.onstop = () => resolve();
        } else {
          resolve();
        }
      });

      // Create audio blob and URL
      if (audioChunks.current.length > 0 && duration > 0) {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Save to API with transcript from Web Speech API
        try {
          const response = await fetch('/api/please-hold', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'record', duration, transcript }),
          });
          if (response.ok) {
            const result = await response.json();
            // Store the audio URL with strand/message info
            setRecordedAudios(prev => [...prev, {
              strandId: result.message.threadId,
              messageId: result.message.id,
              url: audioUrl,
            }]);
            await refreshData();
          }
        } catch (err) {
          console.error('Failed to save recording:', err);
        }
      }
    }

    setDeviceState('idle');
    setRecordingTime(0);
    setLiveTranscript('');
  };

  // Audio playback
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(0);

  // Transcript view
  const [showTranscript, setShowTranscript] = useState(false);

  // Store current playlist in ref to avoid closure issues
  const currentPlaylist = useRef<typeof recordedAudios>([]);

  // PLAY button (K2Set on device) - plays only the LATEST recorded message
  const handlePlay = async () => {
    if (deviceState === 'playing') {
      // Stop playback
      if (audioPlayer.current) {
        audioPlayer.current.pause();
        audioPlayer.current.currentTime = 0;
      }
      setDeviceState('idle');
      setCurrentPlayingIndex(0);
    } else {
      // Get audios for current strand
      const strandAudios = recordedAudios.filter(a => a.strandId === currentStrand?.id);
      if (strandAudios.length === 0) return;

      // Only play the latest (last) message
      const latestAudio = strandAudios[strandAudios.length - 1];

      setDeviceState('playing');
      setCurrentPlayingIndex(strandAudios.length - 1);

      // Play the latest audio only
      const audio = new Audio(latestAudio.url);
      audioPlayer.current = audio;

      audio.onended = () => {
        setDeviceState('idle');
        setCurrentPlayingIndex(0);
      };

      audio.onerror = (e) => {
        console.error('Audio error:', e);
        setDeviceState('idle');
      };

      audio.play().catch(err => {
        console.error('Playback error:', err);
        setDeviceState('idle');
      });
    }
  };

  const playAudioAtIndex = (index: number) => {
    const audios = currentPlaylist.current;

    if (index >= audios.length) {
      setDeviceState('idle');
      setCurrentPlayingIndex(0);
      return;
    }

    const audio = new Audio(audios[index].url);
    audioPlayer.current = audio;
    setCurrentPlayingIndex(index);

    audio.onended = () => {
      // Play next audio
      playAudioAtIndex(index + 1);
    };

    audio.onerror = (e) => {
      console.error('Audio error at index', index, e);
      // Skip to next on error
      playAudioAtIndex(index + 1);
    };

    audio.play().catch(err => {
      console.error('Playback error:', err);
      setDeviceState('idle');
    });
  };

  // Reset all data
  const handleReset = async () => {
    // Stop any playback
    if (audioPlayer.current) {
      audioPlayer.current.pause();
    }
    // Revoke all audio URLs to free memory
    recordedAudios.forEach(a => URL.revokeObjectURL(a.url));
    setRecordedAudios([]);
    setDeviceState('idle');

    try {
      await fetch('/api/please-hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to reset:', err);
    }
  };

  // Get current strand (the active one or first)
  const currentStrand = data?.strands.find(s => s.isActive) || data?.strands[0];

  // Count recordings for current strand
  const currentStrandRecordings = recordedAudios.filter(a => a.strandId === currentStrand?.id).length;
  const otherStrands = data?.strands.filter(s => s.id !== currentStrand?.id) || [];

  // Format duration helper for display
  const formatStrandDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Transform API strand to local Strand type for detail view
  const toLocalStrand = (apiStrand: APIStrand): Strand => ({
    id: `strand-${apiStrand.id}`,
    title: apiStrand.title,
    description: apiStrand.description,
    totalDuration: apiStrand.totalDuration,
    momentCount: apiStrand.messageCount,
    createdAt: formatRelativeTime(apiStrand.createdAt),
    keywords: [],
    insight: `${apiStrand.voiceCount} different voices contributed`,
    moments: apiStrand.messages.map(msg => ({
      id: msg.id,
      title: `Message ${msg.id}`,
      speaker: msg.speaker || 'Anonymous',
      duration: msg.duration,
      date: formatRelativeTime(msg.recordedAt),
      sentiment: undefined,
    })),
  });

  // Placeholder gradient backgrounds for strand thumbnails
  const strandGradients = [
    'linear-gradient(135deg, #d4a574 0%, #8b5a3c 100%)',
    'linear-gradient(135deg, #7a9b6e 0%, #4a6b3e 100%)',
    'linear-gradient(135deg, #9b7355 0%, #5b4335 100%)',
    'linear-gradient(135deg, #6a7a8a 0%, #3a4a5a 100%)',
    'linear-gradient(135deg, #c4956a 0%, #8a6540 100%)',
  ];

  return (
    <div className="min-h-screen w-full" style={{ background: '#000000', overflowX: 'clip' }}>
      {/* Header Navigation */}
      <header className="flex items-center justify-between px-4 md:px-10 py-4 md:py-6">
        <div className="text-xl md:text-2xl italic text-white/90" style={{ fontFamily: 'Georgia, serif' }}>
          please hold
        </div>
        <nav className="flex items-center gap-4 md:gap-8">
          <a href="#" className="hidden md:block text-[14px] text-white/50 hover:text-white/80 transition-colors">The Device</a>
          <a href="#" className="hidden md:block text-[14px] text-white/50 hover:text-white/80 transition-colors">The Archive</a>
          <a href="#" className="hidden md:block text-[14px] text-white/50 hover:text-white/80 transition-colors">About</a>
          <button className="px-4 md:px-5 py-2 md:py-2.5 rounded-full text-[13px] md:text-[14px] font-medium text-black bg-white hover:bg-white/90 transition-colors">
            Listen Live
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-4 md:px-10 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center relative">
        <div className="order-2 lg:order-1">
          <h1 className="text-[32px] md:text-[48px] lg:text-[56px] leading-[1.1] mb-4 md:mb-6 text-white text-center lg:text-left" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            One device.<br />Countless stories.
          </h1>
          <p className="text-[15px] md:text-[18px] leading-relaxed mb-6 md:mb-8 text-white/50 text-center lg:text-left">
            Please Hold is a shared voice device.<br />
            Someone speaks. You listen.<br />
            You respond. The next person listens.<br />
            The conversation never ends.
          </p>
          <a href="#" className="inline-flex items-center justify-center lg:justify-start gap-2 text-[14px] md:text-[15px] font-medium text-white/70 hover:text-white transition-colors w-full lg:w-auto">
            Listen to the latest message
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2v8M2 6l4 4 4-4" />
            </svg>
          </a>

          {/* Stats */}
          <div className="grid grid-cols-2 md:flex md:items-center gap-4 md:gap-0 mt-8 md:mt-14">
            {[
              { value: data?.stats.totalMessages.toLocaleString() || '—', label: 'messages left' },
              { value: data?.stats.totalVoices.toLocaleString() || '—', label: 'different voices' },
              { value: data?.stats.totalHours.toLocaleString() || '—', label: 'hours of recordings' },
              { value: data?.stats.totalStrands.toLocaleString() || '—', label: 'conversation strands' },
            ].map((stat, i) => (
              <div key={i} className="md:pr-8 text-center lg:text-left md:border-l md:border-white/10 md:pl-8 first:border-l-0 first:pl-0">
                <div className="text-[24px] md:text-[32px] font-light text-white">{stat.value}</div>
                <div className="text-[11px] md:text-[13px] text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Image - 3D Rotating */}
        <div className="flex justify-center relative order-1 lg:order-2 mb-8 lg:mb-0" style={{ perspective: '1000px' }}>
          <div
            className="relative"
            style={{
              transformStyle: 'preserve-3d',
              animation: 'deviceFloat 8s ease-in-out infinite',
            }}
          >
            {/* Audio wave pulses - emanate from device center */}
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute rounded-full border border-white/20 pointer-events-none hidden md:block"
                style={{
                  top: '50%',
                  left: '50%',
                  width: '200px',
                  height: '200px',
                  marginLeft: '-100px',
                  marginTop: '-100px',
                  animation: `waveExpand 12s ease-out infinite`,
                  animationDelay: `${i * 2.4}s`,
                }}
              />
            ))}

            {/* Main device face */}
            <div
              className="w-[260px] h-[220px] md:w-[320px] md:h-[270px] lg:w-[380px] lg:h-[320px] rounded-[30px] md:rounded-[40px] flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Device depth/side (3D effect) */}
              <div
                className="absolute inset-0 rounded-[30px] md:rounded-[40px]"
                style={{
                  background: 'linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)',
                  transform: 'translateZ(-30px)',
                  boxShadow: 'inset 0 0 30px rgba(0,0,0,0.5)',
                }}
              />

              {/* Speaker grille */}
              <div className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 w-20 md:w-28 h-10 md:h-16 rounded-xl md:rounded-2xl overflow-hidden" style={{ background: '#0a0a0a', transform: 'translateZ(2px)' }}>
                <div className="w-full h-full" style={{ background: 'repeating-linear-gradient(90deg, #333 0px, #333 2px, transparent 2px, transparent 5px)' }} />
              </div>
              {/* Buttons */}
              <div className="flex items-center gap-6 md:gap-10 mt-6 md:mt-8" style={{ transform: 'translateZ(8px)' }}>
                <div className="flex flex-col items-center gap-2 md:gap-3">
                  <div
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/90"
                    style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.3), inset 0 -2px 4px rgba(0,0,0,0.1)' }}
                  />
                  <span className="text-[10px] md:text-[11px] text-white/40 tracking-wide">listen</span>
                </div>
                <div className="flex flex-col items-center gap-2 md:gap-3">
                  <div
                    className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#e05050]"
                    style={{ boxShadow: '0 4px 20px rgba(224,80,80,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)' }}
                  />
                  <span className="text-[10px] md:text-[11px] text-white/40 tracking-wide">record</span>
                </div>
              </div>
              {/* Bottom button */}
              <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 md:gap-2" style={{ transform: 'translateZ(4px)' }}>
                <div className="w-8 h-8 md:w-11 md:h-11 rounded-full border-2 border-white/20" />
                <span className="text-[9px] md:text-[11px] text-white/40 tracking-wide">new strand</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Animation Keyframes */}
        <style jsx>{`
          @keyframes deviceFloat {
            0% {
              transform: rotateY(-25deg) rotateX(10deg) translateY(0px);
            }
            25% {
              transform: rotateY(0deg) rotateX(-5deg) translateY(-15px);
            }
            50% {
              transform: rotateY(25deg) rotateX(10deg) translateY(0px);
            }
            75% {
              transform: rotateY(0deg) rotateX(-5deg) translateY(-15px);
            }
            100% {
              transform: rotateY(-25deg) rotateX(10deg) translateY(0px);
            }
          }
          @keyframes waveExpand {
            0% {
              transform: scale(1);
              opacity: 0.5;
            }
            100% {
              transform: scale(10);
              opacity: 0;
            }
          }
        `}</style>
      </section>

      {/* Current Strand Card - Glass Panel */}
      <section
        className="mx-4 md:mx-8 mb-6 md:mb-8 p-4 md:p-8 rounded-xl md:rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-start justify-between mb-4 md:mb-6">
          <span className="text-[10px] md:text-[11px] tracking-[2px] uppercase text-white/40">Current Strand</span>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[12px] md:text-[13px] border transition-all flex items-center gap-1 md:gap-2 ${
                showTranscript
                  ? 'text-white bg-white/10 border-white/30'
                  : 'text-white/70 border-white/20 hover:bg-white/5'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 3h10M2 7h7M2 11h10" />
              </svg>
              <span className="hidden sm:inline">Transcript</span>
            </button>
            <button
              onClick={() => currentStrand && onSelectStrand(toLocalStrand(currentStrand))}
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-full text-[12px] md:text-[13px] text-white/70 border border-white/20 hover:bg-white/5 transition-all flex items-center gap-1 md:gap-2"
            >
              <span className="hidden sm:inline">View full strand</span>
              <span className="sm:hidden">View</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 3l4 4-4 4" />
              </svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-16">
          {/* Left - Strand Info */}
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
            {/* Album art thumbnail */}
            <div
              className="w-[100px] h-[100px] md:w-[140px] md:h-[140px] rounded-xl flex-shrink-0 overflow-hidden mx-auto sm:mx-0"
              style={{ background: strandGradients[0] }}
            >
              {/* Placeholder image effect */}
              <div className="w-full h-full flex items-end justify-center pb-4 opacity-60">
                <svg viewBox="0 0 100 60" className="w-3/4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <circle key={i} cx={12 + i * 11} cy={30} r={4} fill="white" opacity={0.7} />
                  ))}
                </svg>
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-[22px] md:text-[28px] font-semibold text-white mb-1">
                {loading ? 'Loading...' : `Strand #${currentStrand?.id || '—'}`}
              </h3>
              <p className="text-[12px] md:text-[14px] text-white/40 mb-3 md:mb-4">
                {currentStrand ? `Started ${formatRelativeTime(currentStrand.createdAt)} · ${currentStrand.messageCount} messages` : '—'}
              </p>
              <div className="flex gap-2 mb-4 md:mb-5 justify-center sm:justify-start flex-wrap">
                <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[11px] md:text-[12px] border border-white/15 text-white/60">
                  {currentStrand ? formatStrandDuration(currentStrand.totalDuration) : '—'} total
                </span>
                <span className="px-2 md:px-3 py-1 md:py-1.5 rounded-full text-[11px] md:text-[12px] border border-white/15 text-white/60">
                  {currentStrand?.voiceCount || '—'} voices
                </span>
              </div>
              <p className="text-[13px] md:text-[15px] text-white/60 leading-relaxed mb-4 md:mb-5">
                {currentStrand?.description || 'Loading strand description...'}
              </p>
              <div className="px-3 md:px-4 py-2 md:py-2.5 rounded-lg inline-block" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <span className="text-[11px] md:text-[13px] text-white/40">Latest speaker: </span>
                <span className="text-[11px] md:text-[13px] text-white/70 italic">
                  {currentStrand?.messages[currentStrand.messages.length - 1]?.speaker || 'Anonymous'}
                </span>
              </div>
            </div>
          </div>

          {/* Right - Latest Message Player */}
          <div>
            <span className="text-[10px] md:text-[11px] tracking-[2px] uppercase text-white/40 mb-4 md:mb-5 block text-center lg:text-left">Latest Message</span>

            <div className="mb-4 md:mb-6 text-center lg:text-left">
              <div className="text-[14px] md:text-[16px] font-medium text-white">
                {currentStrand?.messages[currentStrand.messages.length - 1]?.speaker || 'Anonymous'}
              </div>
              <div className="text-[12px] md:text-[13px] text-white/40">
                {currentStrand?.messages[currentStrand.messages.length - 1]
                  ? `${formatRelativeTime(currentStrand.messages[currentStrand.messages.length - 1].recordedAt)} · ${formatDuration(currentStrand.messages[currentStrand.messages.length - 1].duration)}`
                  : '—'}
              </div>
            </div>

            {/* Waveform */}
            <div className="h-10 md:h-14 mb-4 md:mb-6 flex items-center">
              <svg viewBox="0 0 500 56" className="w-full h-full" preserveAspectRatio="none" suppressHydrationWarning>
                {Array.from({ length: 100 }).map((_, i) => {
                  // Deterministic pseudo-random using seed
                  let x = (i + 1) * 7919;
                  x = (x * 9301 + 49297) % 233280;
                  const rand = x / 233280;
                  const h = Math.round((8 + Math.sin(i * 0.15) * 16 + rand * 16) * 100) / 100;
                  const yPos = Math.round((28 - h/2) * 100) / 100;
                  return <rect key={i} x={i * 5} y={yPos} width={3} height={h} rx={1.5} fill="white" opacity={0.35} suppressHydrationWarning />;
                })}
              </svg>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4 md:gap-8">
              <button className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:bg-white/5 transition-all">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path d="M4 9h10M4 9l4-4M4 9l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <button
                onClick={handlePlay}
                disabled={currentStrandRecordings === 0}
                className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform ${
                  currentStrandRecordings === 0 ? 'opacity-30 cursor-not-allowed' : ''
                }`}
              >
                {deviceState === 'playing' ? (
                  <svg width="18" height="18" viewBox="0 0 22 22" fill="black" className="md:w-[22px] md:h-[22px]">
                    <rect x="5" y="3" width="4" height="16" rx="1" />
                    <rect x="13" y="3" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 22 22" fill="black" className="md:w-[22px] md:h-[22px]">
                    <path d="M6 4L18 11L6 18V4Z" />
                  </svg>
                )}
              </button>
              <button className="w-9 h-9 md:w-11 md:h-11 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:bg-white/5 transition-all">
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path d="M14 9H4M14 9l-4-4M14 9l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Progress */}
            <div className="flex items-center gap-3 md:gap-4 mt-4 md:mt-5">
              <span className="text-[12px] md:text-[13px] text-white/40 w-8 md:w-10">0:00</span>
              <div className="flex-1 h-[3px] rounded-full bg-white/15 relative">
                <div className="absolute left-0 top-0 w-0 h-full rounded-full bg-white" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white" />
              </div>
              <span className="text-[12px] md:text-[13px] text-white/40 w-8 md:w-10 text-right">
                {currentStrand?.messages[currentStrand.messages.length - 1]
                  ? formatDuration(currentStrand.messages[currentStrand.messages.length - 1].duration)
                  : '—'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Transcript Section */}
      {showTranscript && currentStrand && (
        <section
          className="mx-4 md:mx-8 mb-6 md:mb-8 p-4 md:p-8 rounded-xl md:rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.02)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-[10px] md:text-[11px] tracking-[2px] uppercase font-medium text-white/40">
              Full Transcript · Strand #{currentStrand.id}
            </h2>
            <span className="text-[12px] text-white/30">
              {currentStrand.messages.filter(m => m.transcript).length} / {currentStrand.messageCount} transcribed
            </span>
          </div>

          {currentStrand.messages.length === 0 ? (
            <p className="text-white/30 text-[14px] italic">No messages yet. Record something to see the transcript.</p>
          ) : (
            <div className="space-y-4">
              {currentStrand.messages.map((message, index) => (
                <div
                  key={message.id}
                  className="p-4 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-medium text-white/80">{message.speaker}</span>
                      <span className="text-[11px] text-white/30">·</span>
                      <span className="text-[11px] text-white/30">Message {index + 1}</span>
                    </div>
                    <span className="text-[11px] text-white/30">{formatDuration(message.duration)}</span>
                  </div>
                  <p className="text-[14px] leading-relaxed text-white/60">
                    {message.transcript || (
                      <span className="italic text-white/30">Transcription unavailable</span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* All Strands Section - Glass Panel */}
      <section
        className="mx-4 md:mx-8 mb-6 md:mb-8 p-4 md:p-8 rounded-xl md:rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3">
          <h2 className="text-[10px] md:text-[11px] tracking-[2px] uppercase font-medium text-white/40">All Strands</h2>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <select
              className="px-3 md:px-4 py-2 md:py-2.5 rounded-full text-[12px] md:text-[13px] cursor-pointer appearance-none pr-6 md:pr-8"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              <option>Recently active</option>
            </select>
            <select
              className="hidden sm:block px-3 md:px-4 py-2 md:py-2.5 rounded-full text-[12px] md:text-[13px] cursor-pointer appearance-none pr-6 md:pr-8"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              <option>All lengths</option>
            </select>
            <select
              className="hidden md:block px-4 py-2.5 rounded-full text-[13px] cursor-pointer appearance-none pr-8"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.7)',
              }}
            >
              <option>All time</option>
            </select>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="pl-3 md:pl-4 pr-8 md:pr-10 py-2 md:py-2.5 rounded-full text-[12px] md:text-[13px] w-28 md:w-48 placeholder:text-white/30"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.7)',
                }}
              />
              <svg className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-4 md:h-4 text-white/30" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="7" cy="7" r="5" />
                <path d="M11 11l3 3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Strands List */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-8 text-white/40">Loading strands...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-400">{error}</div>
          ) : (
            otherStrands.map((strand, i) => (
              <div
                key={strand.id}
                onClick={() => onSelectStrand(toLocalStrand(strand))}
                className="flex items-center gap-3 md:gap-5 p-3 md:p-4 rounded-lg md:rounded-xl cursor-pointer transition-all hover:bg-white/[0.03]"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {/* Thumbnail */}
                <div
                  className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex-shrink-0 overflow-hidden"
                  style={{ background: strandGradients[i % strandGradients.length] }}
                >
                  {/* Mini scene placeholder */}
                  <div className="w-full h-full flex items-end justify-center pb-2 opacity-50">
                    <svg viewBox="0 0 64 32" className="w-3/4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <circle key={j} cx={8 + j * 12} cy={16} r={3} fill="white" opacity={0.7} />
                      ))}
                    </svg>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 md:w-[220px] md:flex-shrink-0">
                  <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                    <span className="font-semibold text-[13px] md:text-[15px] text-white">#{strand.id}</span>
                    <span className="flex items-center gap-1 md:gap-1.5 text-[10px] md:text-[12px] text-white/40">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: strand.isActive ? '#22c55e' : '#6b7280' }} />
                      <span className="hidden sm:inline">{strand.isActive ? 'Active now' : `Updated ${formatRelativeTime(strand.updatedAt)}`}</span>
                    </span>
                  </div>
                  <p className="text-[11px] md:text-[13px] text-white/50 line-clamp-1 md:line-clamp-2 leading-snug">{strand.description}</p>
                </div>

                {/* Mini waveform - hidden on mobile */}
                <div className="hidden lg:block flex-shrink-0">
                  <MiniWaveformDark width={120} height={28} seedN={strand.id} />
                </div>

                {/* Stats - simplified on mobile */}
                <div className="hidden sm:block text-center w-12 md:w-16">
                  <div className="text-[14px] md:text-[18px] font-medium text-white">{strand.messageCount}</div>
                  <div className="text-[9px] md:text-[11px] text-white/40">msgs</div>
                </div>
                <div className="hidden md:block text-center w-14">
                  <div className="text-[18px] font-medium text-white">{strand.voiceCount}</div>
                  <div className="text-[11px] text-white/40">voices</div>
                </div>
                <div className="text-center w-14 md:w-20">
                  <div className="text-[13px] md:text-[18px] font-medium text-white">{formatStrandDuration(strand.totalDuration)}</div>
                  <div className="text-[9px] md:text-[11px] text-white/40">total</div>
                </div>
                <div className="hidden sm:block text-center w-16 md:w-24">
                  <div className="text-[12px] md:text-[15px] text-white/80">{formatRelativeTime(strand.updatedAt)}</div>
                  <div className="text-[9px] md:text-[11px] text-white/40">updated</div>
                </div>

                {/* Arrow */}
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5" className="opacity-25 flex-shrink-0 md:w-5 md:h-5">
                  <path d="M7 4l6 6-6 6" />
                </svg>
              </div>
            ))
          )}
        </div>

        {/* Load more */}
        <div className="flex justify-center mt-6 md:mt-8">
          <button
            className="px-6 md:px-10 py-2.5 md:py-3 rounded-full text-[13px] md:text-[14px] transition-all hover:bg-white/5"
            style={{
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.6)',
            }}
          >
            Load more strands
          </button>
        </div>
      </section>

      {/* Device Simulator Panel */}
      <section
        className="fixed bottom-0 left-0 right-0 p-4 md:p-6 z-50"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 100%)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="max-w-[600px] mx-auto">
          {/* Status indicator */}
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${deviceState !== 'idle' ? 'animate-pulse' : ''}`}
                style={{
                  background: deviceState === 'recording' ? '#ef4444' : deviceState === 'playing' ? '#22c55e' : '#6b7280',
                }}
              />
              <span className="text-[11px] tracking-[2px] uppercase text-white/50">
                {micPermission === 'denied'
                  ? 'Microphone access denied'
                  : deviceState === 'recording'
                  ? `Recording ${recordingTime}s`
                  : deviceState === 'playing'
                  ? `Playing ${currentPlayingIndex + 1}/${currentStrandRecordings}`
                  : currentStrand
                  ? `Strand #${currentStrand.id} · ${currentStrandRecordings} recording${currentStrandRecordings !== 1 ? 's' : ''}`
                  : 'Device Simulator · No strand yet'}
              </span>
            </div>
            {/* Live transcript while recording */}
            {deviceState === 'recording' && liveTranscript && (
              <p className="text-[12px] text-white/40 italic max-w-[400px] text-center line-clamp-2">
                "{liveTranscript}"
              </p>
            )}
          </div>

          {/* Device buttons - mimics hardware layout */}
          <div className="flex items-center justify-center gap-6 md:gap-10">
            {/* Play/Listen button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handlePlay}
                disabled={!currentStrand}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full transition-all ${
                  deviceState === 'playing'
                    ? 'bg-white scale-95'
                    : 'bg-white/90 hover:bg-white hover:scale-105'
                } ${!currentStrand ? 'opacity-30 cursor-not-allowed' : ''}`}
                style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.3)' }}
              >
                {deviceState === 'playing' ? (
                  <svg className="w-6 h-6 mx-auto text-black" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 mx-auto text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <span className="text-[10px] md:text-[11px] text-white/40 tracking-wide">listen</span>
            </div>

            {/* Record button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onMouseDown={handleRecordStart}
                onMouseUp={handleRecordStop}
                onMouseLeave={handleRecordStop}
                onTouchStart={handleRecordStart}
                onTouchEnd={handleRecordStop}
                className={`w-14 h-14 md:w-16 md:h-16 rounded-full transition-all ${
                  deviceState === 'recording'
                    ? 'bg-red-600 scale-95'
                    : 'bg-[#e05050] hover:bg-red-500 hover:scale-105'
                }`}
                style={{ boxShadow: '0 4px 20px rgba(224,80,80,0.4)' }}
              >
                <div
                  className={`w-5 h-5 md:w-6 md:h-6 mx-auto rounded-full bg-white/90 ${
                    deviceState === 'recording' ? 'animate-pulse' : ''
                  }`}
                />
              </button>
              <span className="text-[10px] md:text-[11px] text-white/40 tracking-wide">
                {deviceState === 'recording' ? 'release to save' : 'hold to record'}
              </span>
            </div>

            {/* New Strand button */}
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleNewStrand}
                className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-white/30 hover:border-white/50 hover:bg-white/5 transition-all hover:scale-105"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 mx-auto text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
              <span className="text-[10px] md:text-[11px] text-white/40 tracking-wide">new strand</span>
            </div>
          </div>

          {/* Reset button (small, subtle) */}
          <div className="flex justify-center mt-4">
            <button
              onClick={handleReset}
              className="text-[10px] text-white/30 hover:text-white/50 transition-colors"
            >
              Reset all data
            </button>
          </div>
        </div>
      </section>

      {/* Spacer for fixed bottom panel */}
      <div className="h-40" />
    </div>
  );
}

// ─── STRAND PLAYER (Main Playback View) ────────────────────────────────────
function StrandPlayer({
  strand,
  onBack,
  recordedAudios,
}: {
  strand: Strand;
  onBack: () => void;
  recordedAudios: { strandId: number; messageId: number; url: string }[];
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMomentIndex, setCurrentMomentIndex] = useState(0);
  const [momentProgress, setMomentProgress] = useState(0); // 0-1 within current moment
  const [showInsights, setShowInsights] = useState(false);
  const [analytics, setAnalytics] = useState<StrandAnalytics | null>(null);

  // Audio playback
  const audioPlayer = useRef<HTMLAudioElement | null>(null);

  // Get strand ID from the strand.id (format: "strand-36")
  const strandId = parseInt(strand.id.replace('strand-', ''));
  const strandAudios = recordedAudios.filter(a => a.strandId === strandId);

  // Fetch analytics for this strand
  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch(`/api/please-hold?type=analytics&strandId=${strandId}`);
        if (res.ok) {
          const data = await res.json();
          setAnalytics(data.analytics);
        }
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      }
    }
    fetchAnalytics();
  }, [strandId]);

  // Generate summary phrase based on analytics
  const getSummaryPhrase = () => {
    if (!analytics) return 'Loading insights...';
    if (analytics.messageCount === 0) return 'No messages recorded yet.';

    const phrases = [];

    // Duration insight
    if (analytics.totalDuration > 300) {
      phrases.push(`${Math.floor(analytics.totalDuration / 60)} minutes of conversation`);
    } else if (analytics.totalDuration > 60) {
      phrases.push(`A ${Math.floor(analytics.totalDuration / 60)}-minute exchange`);
    } else {
      phrases.push(`${analytics.totalDuration} seconds captured`);
    }

    // Word insight
    if (analytics.totalWords > 100 && analytics.topWords.length > 0) {
      const topWord = analytics.topWords[0].word;
      phrases.push(`"${topWord}" came up ${analytics.topWords[0].count} times`);
    } else if (analytics.totalWords > 0) {
      phrases.push(`${analytics.totalWords} words shared`);
    }

    // Completeness insight
    if (analytics.transcriptCompleteness === 100) {
      phrases.push('fully transcribed');
    } else if (analytics.transcriptCompleteness > 0) {
      phrases.push(`${analytics.transcriptCompleteness}% transcribed`);
    }

    return phrases.join(' · ');
  };

  // Editing state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(strand.title);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [selectedCover, setSelectedCover] = useState(0);

  // Cover gradient options
  const coverGradients = [
    'linear-gradient(135deg, #d4a574 0%, #8b5a3c 100%)',
    'linear-gradient(135deg, #7a9b6e 0%, #4a6b3e 100%)',
    'linear-gradient(135deg, #9b7355 0%, #5b4335 100%)',
    'linear-gradient(135deg, #6a7a8a 0%, #3a4a5a 100%)',
    'linear-gradient(135deg, #c4956a 0%, #8a6540 100%)',
    'linear-gradient(135deg, #8b7355 0%, #5d4a3a 100%)',
    'linear-gradient(135deg, #5a6a7a 0%, #3a4a5a 100%)',
    'linear-gradient(135deg, #9a8a7a 0%, #6a5a4a 100%)',
  ];

  const handleSaveName = async () => {
    // In production, this would update via API
    setIsEditingName(false);
    // For now, name is local only since the strand prop is from parent
  };

  const currentMoment = strand.moments[currentMomentIndex] || strand.moments[0];

  // Play audio at a specific index
  const playAudioAtIndex = (index: number) => {
    if (index >= strandAudios.length) {
      // No more audio to play
      setIsPlaying(false);
      setMomentProgress(1);
      return;
    }

    if (audioPlayer.current) {
      audioPlayer.current.pause();
    }

    const audioData = strandAudios[index];
    audioPlayer.current = new Audio(audioData.url);

    audioPlayer.current.onended = () => {
      // Play next audio
      const nextIndex = index + 1;
      if (nextIndex < strandAudios.length) {
        setCurrentMomentIndex(nextIndex);
        setMomentProgress(0);
        playAudioAtIndex(nextIndex);
      } else {
        setIsPlaying(false);
        setMomentProgress(1);
      }
    };

    audioPlayer.current.ontimeupdate = () => {
      if (audioPlayer.current && audioPlayer.current.duration) {
        const progress = audioPlayer.current.currentTime / audioPlayer.current.duration;
        setMomentProgress(progress);
      }
    };

    audioPlayer.current.onerror = (e) => {
      console.error('Audio playback error:', e);
      // Try next audio on error
      const nextIndex = index + 1;
      if (nextIndex < strandAudios.length) {
        playAudioAtIndex(nextIndex);
      } else {
        setIsPlaying(false);
      }
    };

    audioPlayer.current.play().catch(err => {
      console.error('Play failed:', err);
      setIsPlaying(false);
    });
  };

  // Handle play/pause
  const handlePlayPause = () => {
    if (isPlaying) {
      if (audioPlayer.current) {
        audioPlayer.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (strandAudios.length === 0) {
        console.log('No audio recordings available');
        return;
      }
      setIsPlaying(true);
      setCurrentMomentIndex(0);
      setMomentProgress(0);
      playAudioAtIndex(0);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioPlayer.current) {
        audioPlayer.current.pause();
      }
    };
  }, []);

  // Calculate total progress through strand
  const totalElapsed = useMemo(() => {
    let elapsed = 0;
    for (let i = 0; i < currentMomentIndex; i++) {
      elapsed += strand.moments[i].duration;
    }
    elapsed += momentProgress * currentMoment.duration;
    return elapsed;
  }, [currentMomentIndex, momentProgress, strand.moments, currentMoment.duration]);

  const totalProgress = totalElapsed / strand.totalDuration;

  // Calculate tick positions for each moment boundary
  const tickPositions = useMemo(() => {
    const ticks: { position: number; momentIndex: number }[] = [];
    let cumulative = 0;
    strand.moments.forEach((m, i) => {
      ticks.push({ position: cumulative / strand.totalDuration, momentIndex: i });
      cumulative += m.duration;
    });
    return ticks;
  }, [strand.moments, strand.totalDuration]);

  // Auto-progress when playing (only if no recorded audio - fallback for demo)
  useEffect(() => {
    // Skip if we have real audio - playback is handled by audio element
    if (strandAudios.length > 0) return;
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setMomentProgress((p) => {
        const newProgress = p + (0.05 / currentMoment.duration); // ~50ms tick
        if (newProgress >= 1) {
          // Move to next moment
          if (currentMomentIndex < strand.moments.length - 1) {
            setCurrentMomentIndex((i) => i + 1);
            return 0;
          } else {
            // End of strand
            setIsPlaying(false);
            return 1;
          }
        }
        return newProgress;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying, currentMoment.duration, currentMomentIndex, strand.moments.length, strandAudios.length]);

  // Sentiment colors
  const sentimentColors: Record<string, string> = {
    sweet: '#ffb4c4',
    nostalgic: '#dcff73',
    reflective: '#c4b5fd',
    sincere: '#a5d8e6',
    whimsical: '#fcd34d',
    melancholy: '#94a3b8',
    funny: '#fb923c',
  };

  const goToMoment = (index: number) => {
    // Clamp to valid range
    const clampedIndex = Math.max(0, Math.min(index, strandAudios.length - 1));
    setCurrentMomentIndex(clampedIndex);
    setMomentProgress(0);

    // If we have audio and it's playing, play from the new position
    if (strandAudios.length > 0) {
      if (audioPlayer.current) {
        audioPlayer.current.pause();
      }
      if (isPlaying) {
        playAudioAtIndex(clampedIndex);
      }
    }
  };

  return (
    <section className="max-w-[1000px] mx-auto px-8 py-12">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-8 text-[13px] text-[rgba(245,241,232,0.5)] hover:text-[#f5f1e8] transition-colors cursor-pointer bg-transparent border-none"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 3L5 8L10 13" />
        </svg>
        Back to Strands
      </button>

      {/* Strand header with cover */}
      <div className="mb-10">
        <div className="flex gap-6 mb-6">
          {/* Cover image */}
          <div className="relative group">
            <div
              className="w-32 h-32 rounded-xl flex-shrink-0 transition-all"
              style={{ background: coverGradients[selectedCover] }}
            />
            <button
              onClick={() => setShowCoverPicker(!showCoverPicker)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#f5f1e8" strokeWidth="1.5">
                <path d="M4 16l4-4 4 4 4-6" />
                <circle cx="7" cy="7" r="2" />
              </svg>
            </button>

            {/* Cover picker dropdown */}
            {showCoverPicker && (
              <div className="absolute top-full left-0 mt-2 p-3 rounded-xl z-10" style={{ background: '#1a1a1a', border: '1px solid rgba(245,241,232,0.1)' }}>
                <div className="grid grid-cols-4 gap-2">
                  {coverGradients.map((gradient, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedCover(i);
                        setShowCoverPicker(false);
                      }}
                      className={`w-12 h-12 rounded-lg cursor-pointer transition-all ${
                        selectedCover === i ? 'ring-2 ring-[#dcff73]' : ''
                      }`}
                      style={{ background: gradient }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Strand info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 text-[11px] tracking-[2px] uppercase" style={{ color: 'rgba(245,241,232,0.4)' }}>
              <span className="w-2 h-2 rounded-full bg-[#dcff73]" />
              <span>{strand.momentCount} moments</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{formatDuration(strand.totalDuration)} total</span>
            </div>

            {/* Editable title */}
            {isEditingName ? (
              <div className="flex items-center gap-3 mb-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  className="text-3xl font-bold tracking-tight bg-transparent border-b border-[#dcff73] outline-none text-[#f5f1e8]"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-3 py-1 rounded-lg text-[12px] font-medium bg-[#dcff73] text-black cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditedName(strand.title);
                    setIsEditingName(false);
                  }}
                  className="px-3 py-1 rounded-lg text-[12px] text-white/50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-2 group">
                <h1 className="text-3xl font-bold tracking-tight text-[#f5f1e8]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                  {editedName}
                </h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-white/10 cursor-pointer transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="#f5f1e8" strokeWidth="1.5">
                    <path d="M10 2l2 2M1 11l2 2 8-8-2-2-8 8zM11 5L9 3" />
                  </svg>
                </button>
              </div>
            )}

            <p className="text-[15px] text-[rgba(245,241,232,0.5)] mb-3">{strand.description}</p>

            {/* Summary phrase */}
            <div className="text-[13px] italic" style={{ color: '#dcff73', fontFamily: 'Georgia, serif' }}>
              {getSummaryPhrase()}
            </div>
          </div>
        </div>
      </div>

      {/* Current moment display */}
      <div className="p-8 rounded-xl mb-8" style={{ background: '#0e0e0e', border: '1px solid rgba(245,241,232,0.1)' }}>
        {/* Chapter indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 text-[12px] tracking-[2px] uppercase" style={{ color: 'rgba(245,241,232,0.4)' }}>
            <span>Chapter {currentMomentIndex + 1} of {strand.moments.length}</span>
            {currentMoment.sentiment && (
              <>
                <span style={{ opacity: 0.4 }}>·</span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: sentimentColors[currentMoment.sentiment] }} />
                  {currentMoment.sentiment}
                </span>
              </>
            )}
          </div>
          <div className="text-[12px]" style={{ color: 'rgba(245,241,232,0.4)' }}>
            {currentMoment.speaker}
          </div>
        </div>

        {/* Current moment title */}
        <h2 className="text-3xl font-medium italic mb-8" style={{ fontFamily: 'Georgia, serif', color: '#f5f1e8' }}>
          "{currentMoment.title}"
        </h2>

        {/* Waveform */}
        <div className="mb-6 overflow-hidden">
          <Wave width={850} height={80} progress={momentProgress} animated={isPlaying} seedN={currentMoment.id} />
        </div>

        {/* Play controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => goToMoment(Math.max(0, currentMomentIndex - 1))}
            className="w-12 h-12 rounded-full bg-transparent border border-white/20 flex items-center justify-center cursor-pointer text-[#f5f1e8] hover:border-white/40 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 2v12h2V9l6 5V2L5 7V2z" />
            </svg>
          </button>
          <button
            onClick={handlePlayPause}
            disabled={strandAudios.length === 0}
            className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${
              strandAudios.length === 0 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            style={{ background: '#dcff73' }}
          >
            {isPlaying ? (
              <svg width="22" height="22" viewBox="0 0 16 16" fill="#000">
                <rect x="3" y="2" width="3.5" height="12" />
                <rect x="9.5" y="2" width="3.5" height="12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 16 16" fill="#000">
                <path d="M4 2L14 8L4 14Z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => goToMoment(Math.min(strand.moments.length - 1, currentMomentIndex + 1))}
            className="w-12 h-12 rounded-full bg-transparent border border-white/20 flex items-center justify-center cursor-pointer text-[#f5f1e8] hover:border-white/40 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13 2v12h-2V9L5 14V2l6 5V2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* TIMELINE WITH CHAPTER TICKS */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3 text-[11px] tracking-[2px] uppercase" style={{ color: 'rgba(245,241,232,0.4)' }}>
          <span>{formatDuration(Math.floor(totalElapsed))}</span>
          <span>Story Progress</span>
          <span>{formatDuration(strand.totalDuration)}</span>
        </div>

        {/* Progress bar with ticks */}
        <div className="relative h-3 rounded-full overflow-visible" style={{ background: 'rgba(245,241,232,0.1)' }}>
          {/* Progress fill */}
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-75"
            style={{ width: `${totalProgress * 100}%`, background: '#dcff73' }}
          />

          {/* Chapter tick marks */}
          {tickPositions.map((tick, i) => (
            <div
              key={i}
              className="absolute top-0 h-full cursor-pointer group"
              style={{ left: `${tick.position * 100}%` }}
              onClick={() => goToMoment(tick.momentIndex)}
            >
              {/* Tick line */}
              <div
                className="absolute top-0 w-0.5 h-full transition-all"
                style={{
                  background: tick.momentIndex === currentMomentIndex ? '#f5f1e8' : 'rgba(245,241,232,0.3)',
                  transform: tick.momentIndex === currentMomentIndex ? 'scaleY(1.5)' : 'scaleY(1)',
                }}
              />
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="px-3 py-2 rounded-lg whitespace-nowrap text-[11px]" style={{ background: '#1a1a1a', border: '1px solid rgba(245,241,232,0.1)' }}>
                  <div className="text-[#f5f1e8]">{strand.moments[tick.momentIndex].title}</div>
                  <div style={{ color: 'rgba(245,241,232,0.4)' }}>{strand.moments[tick.momentIndex].speaker}</div>
                </div>
              </div>
            </div>
          ))}

          {/* Playhead */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 border-[#dcff73] bg-black transition-all duration-75"
            style={{ left: `${totalProgress * 100}%`, transform: `translateX(-50%) translateY(-50%)` }}
          />
        </div>
      </div>

      {/* CHAPTER LIST */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[14px] tracking-[2px] uppercase font-medium" style={{ color: '#f5f1e8' }}>
            Chapters
          </h3>
        </div>
        <div className="space-y-1">
          {strand.moments.map((moment, i) => {
            const isActive = i === currentMomentIndex;
            const isPast = i < currentMomentIndex;
            return (
              <div
                key={moment.id}
                onClick={() => goToMoment(i)}
                className="flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all"
                style={{
                  background: isActive ? 'rgba(220, 255, 115, 0.1)' : 'transparent',
                  borderLeft: isActive ? '2px solid #dcff73' : '2px solid transparent',
                }}
              >
                {/* Chapter number */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-medium"
                  style={{
                    background: isActive ? '#dcff73' : isPast ? 'rgba(245,241,232,0.2)' : 'rgba(245,241,232,0.08)',
                    color: isActive ? '#000' : isPast ? '#f5f1e8' : 'rgba(245,241,232,0.4)',
                  }}
                >
                  {i + 1}
                </div>

                {/* Title and speaker */}
                <div className="flex-1">
                  <div
                    className="text-[15px] italic mb-0.5"
                    style={{
                      fontFamily: 'Georgia, serif',
                      color: isActive ? '#dcff73' : isPast ? '#f5f1e8' : 'rgba(245,241,232,0.6)',
                    }}
                  >
                    {moment.title}
                  </div>
                  <div className="text-[11px] tracking-[1px] uppercase" style={{ color: 'rgba(245,241,232,0.4)' }}>
                    {moment.speaker}
                  </div>
                </div>

                {/* Duration */}
                <div className="text-[13px]" style={{ color: 'rgba(245,241,232,0.4)' }}>
                  {formatDuration(moment.duration)}
                </div>

                {/* Sentiment dot */}
                {moment.sentiment && (
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: sentimentColors[moment.sentiment] }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* INSIGHTS TOGGLE */}
      <button
        onClick={() => setShowInsights(!showInsights)}
        className="w-full p-4 rounded-xl flex items-center justify-between cursor-pointer transition-all"
        style={{
          background: showInsights ? 'rgba(220, 255, 115, 0.08)' : '#0e0e0e',
          border: showInsights ? '1px solid rgba(220, 255, 115, 0.3)' : '1px solid rgba(245,241,232,0.1)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-[14px] font-medium" style={{ color: '#f5f1e8' }}>Strand Insights</span>
          <span className="text-[12px]" style={{ color: 'rgba(245,241,232,0.4)' }}>Keywords, sentiment, patterns</span>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="#f5f1e8"
          strokeWidth="1.5"
          style={{ transform: showInsights ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <path d="M4 6L8 10L12 6" />
        </svg>
      </button>

      {/* INSIGHTS PANEL */}
      {showInsights && (
        <div className="mt-4 p-6 rounded-xl" style={{ background: '#0e0e0e', border: '1px solid rgba(245,241,232,0.1)' }}>
          {analytics ? (
            <div className="grid grid-cols-3 gap-6">
              {/* Top Words */}
              <div>
                <h4 className="text-[11px] tracking-[2px] uppercase mb-4" style={{ color: 'rgba(245,241,232,0.4)' }}>
                  Most Used Words
                </h4>
                {analytics.topWords.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analytics.topWords.slice(0, 8).map((word) => (
                      <span
                        key={word.word}
                        className="px-3 py-1.5 rounded-full text-[13px]"
                        style={{ background: 'rgba(220, 255, 115, 0.15)', color: '#dcff73' }}
                      >
                        {word.word} ({word.count})
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] text-white/40 italic">No transcript data yet</p>
                )}
              </div>

              {/* Duration Stats */}
              <div>
                <h4 className="text-[11px] tracking-[2px] uppercase mb-4" style={{ color: 'rgba(245,241,232,0.4)' }}>
                  Recording Stats
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[13px] text-white/60">Total Duration</span>
                    <span className="text-[13px] text-[#f5f1e8]">{formatDuration(analytics.totalDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[13px] text-white/60">Messages</span>
                    <span className="text-[13px] text-[#f5f1e8]">{analytics.messageCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[13px] text-white/60">Avg Length</span>
                    <span className="text-[13px] text-[#f5f1e8]">{formatDuration(Math.round(analytics.avgMessageDuration))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[13px] text-white/60">Total Words</span>
                    <span className="text-[13px] text-[#f5f1e8]">{analytics.totalWords}</span>
                  </div>
                  {analytics.longestMessage && (
                    <div className="flex justify-between">
                      <span className="text-[13px] text-white/60">Longest Message</span>
                      <span className="text-[13px] text-[#f5f1e8]">{formatDuration(analytics.longestMessage.duration)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transcript Stats */}
              <div>
                <h4 className="text-[11px] tracking-[2px] uppercase mb-4" style={{ color: 'rgba(245,241,232,0.4)' }}>
                  Transcript Analysis
                </h4>
                <div className="space-y-4">
                  {/* Completeness bar */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-[12px] text-white/60">Transcribed</span>
                      <span className="text-[12px] text-[#dcff73]">{analytics.transcriptCompleteness}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#dcff73]"
                        style={{ width: `${analytics.transcriptCompleteness}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[13px] text-white/60">Avg Words/Message</span>
                    <span className="text-[13px] text-[#f5f1e8]">{analytics.avgWordsPerMessage}</span>
                  </div>

                  {analytics.recordingTimespan && (
                    <div className="text-[12px] text-white/40 italic">
                      First: {formatRelativeTime(analytics.recordingTimespan.first)}<br />
                      Last: {formatRelativeTime(analytics.recordingTimespan.last)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-white/40">
              Loading analytics...
            </div>
          )}
        </div>
      )}

      {/* PULSE OF THE STRAND - Activity timeline */}
      <div className="mt-10 py-8 rounded-2xl" style={{ background: '#0a0a0a' }}>
        <div className="text-center mb-6 px-8">
          <h3 className="text-2xl font-bold tracking-tight text-[#f5f1e8] mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Pulse of the Strand
          </h3>
          <p className="text-[rgba(245,241,232,0.5)] text-[14px]">
            When did this conversation breathe?
          </p>
        </div>

        {/* Activity visualization */}
        <div className="px-8">
          {strand.moments.length > 0 ? (
            <>
              {/* Timeline bar */}
              <div className="relative h-20 flex items-center">
                {/* Base line */}
                <div className="absolute left-0 right-0 top-1/2 h-px bg-white/10" />

                {/* Activity dots for each message */}
                <div className="relative flex items-center justify-around w-full">
                  {strand.moments.map((moment, i) => {
                    const isHighActivity = moment.duration > 60;
                    return (
                      <div key={moment.id} className="relative flex flex-col items-center group cursor-pointer">
                        <div
                          className="rounded-full transition-all group-hover:scale-150"
                          style={{
                            width: Math.min(16, 8 + moment.duration / 15),
                            height: Math.min(16, 8 + moment.duration / 15),
                            background: isHighActivity ? '#dcff73' : '#f5f1e8',
                            boxShadow: isHighActivity ? '0 0 12px rgba(220, 255, 115, 0.5)' : 'none',
                          }}
                        />
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="px-3 py-2 rounded-lg whitespace-nowrap text-[11px]" style={{ background: '#1a1a1a', border: '1px solid rgba(245,241,232,0.1)' }}>
                            <div className="text-[#f5f1e8]">{moment.title}</div>
                            <div style={{ color: 'rgba(245,241,232,0.4)' }}>{formatDuration(moment.duration)}</div>
                          </div>
                        </div>
                        {/* Message number */}
                        <div className="absolute top-full mt-2 text-[9px]" style={{ color: 'rgba(245,241,232,0.3)' }}>
                          #{i + 1}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-8 text-[11px]" style={{ color: 'rgba(245,241,232,0.5)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#f5f1e8]" />
                  <span>Short message</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#dcff73]" style={{ boxShadow: '0 0 8px rgba(220, 255, 115, 0.4)' }} />
                  <span>Long message (60s+)</span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-white/40 italic">
              No messages recorded yet
            </div>
          )}
        </div>
      </div>

      {/* SENTIMENT MAP - Emotional landscape */}
      <div className="mt-10 py-8 px-8 rounded-2xl" style={{ background: '#0a0a0a' }}>
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold tracking-tight text-[#f5f1e8] mb-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Emotional Landscape
          </h3>
          <p className="text-[rgba(245,241,232,0.5)] text-[14px]">
            Every message, mapped by feeling
          </p>
        </div>

        {strand.moments.length > 0 ? (
          <>
            {/* Scatter plot */}
            <div className="relative h-[300px] max-w-2xl mx-auto rounded-xl overflow-hidden" style={{ background: '#111' }}>
              {/* Axis labels */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] tracking-[1px] uppercase" style={{ color: 'rgba(245,241,232,0.3)' }}>
                Short → Long
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] tracking-[1px] uppercase" style={{ color: 'rgba(245,241,232,0.3)' }}>
                First → Last
              </div>

              {/* Grid lines */}
              <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.1 }}>
                {[25, 50, 75].map(p => (
                  <g key={p}>
                    <line x1={`${p}%`} y1="0" x2={`${p}%`} y2="100%" stroke="#f5f1e8" strokeWidth="1" />
                    <line x1="0" y1={`${p}%`} x2="100%" y2={`${p}%`} stroke="#f5f1e8" strokeWidth="1" />
                  </g>
                ))}
              </svg>

              {/* Thread connecting all dots */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  <linearGradient id="strandThreadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dcff73" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#a5d8e6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ffb4c4" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                {strand.moments.slice(0, -1).map((moment, i) => {
                  const nextMoment = strand.moments[i + 1];
                  if (!nextMoment) return null;
                  // X position based on order (first to last)
                  const x1 = 10 + (i / Math.max(1, strand.moments.length - 1)) * 80;
                  const x2 = 10 + ((i + 1) / Math.max(1, strand.moments.length - 1)) * 80;
                  // Y position based on duration (inverted: longer = higher)
                  const maxDuration = Math.max(...strand.moments.map(m => m.duration), 120);
                  const y1 = 90 - (moment.duration / maxDuration) * 80;
                  const y2 = 90 - (nextMoment.duration / maxDuration) * 80;
                  return (
                    <line
                      key={`thread-${moment.id}`}
                      x1={`${x1}%`}
                      y1={`${y1}%`}
                      x2={`${x2}%`}
                      y2={`${y2}%`}
                      stroke="url(#strandThreadGradient)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      style={{ opacity: 0.5 }}
                    />
                  );
                })}
              </svg>

              {/* Message dots */}
              {strand.moments.map((moment, i) => {
                // X position based on order
                const x = 10 + (i / Math.max(1, strand.moments.length - 1)) * 80;
                // Y position based on duration (inverted: longer = higher)
                const maxDuration = Math.max(...strand.moments.map(m => m.duration), 120);
                const y = 90 - (moment.duration / maxDuration) * 80;
                const color = moment.sentiment ? sentimentColors[moment.sentiment] || '#dcff73' : '#dcff73';

                return (
                  <div
                    key={moment.id}
                    className="absolute cursor-pointer transition-all duration-300 group"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {/* Dot */}
                    <div
                      className="w-4 h-4 rounded-full transition-all group-hover:scale-150"
                      style={{
                        background: color,
                        boxShadow: `0 0 8px ${color}40`,
                      }}
                    />

                    {/* Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="px-4 py-3 rounded-lg whitespace-nowrap" style={{ background: '#1a1a1a', border: '1px solid rgba(245,241,232,0.1)' }}>
                        <div className="text-[13px] italic mb-1" style={{ fontFamily: 'Georgia, serif', color: '#f5f1e8' }}>
                          "{moment.title}"
                        </div>
                        <div className="flex items-center gap-2 text-[10px] tracking-[1px] uppercase" style={{ color: 'rgba(245,241,232,0.5)' }}>
                          <span>{moment.speaker}</span>
                          <span>·</span>
                          <span>{formatDuration(moment.duration)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Quadrant labels */}
              <div className="absolute top-4 left-6 text-[10px] italic" style={{ fontFamily: 'Georgia, serif', color: 'rgba(245,241,232,0.2)' }}>
                early & long
              </div>
              <div className="absolute top-4 right-6 text-[10px] italic" style={{ fontFamily: 'Georgia, serif', color: 'rgba(245,241,232,0.2)' }}>
                recent & long
              </div>
              <div className="absolute bottom-8 left-6 text-[10px] italic" style={{ fontFamily: 'Georgia, serif', color: 'rgba(245,241,232,0.2)' }}>
                early & short
              </div>
              <div className="absolute bottom-8 right-6 text-[10px] italic" style={{ fontFamily: 'Georgia, serif', color: 'rgba(245,241,232,0.2)' }}>
                recent & short
              </div>
            </div>

            {/* Message count summary */}
            <div className="flex items-center justify-center gap-6 mt-6 text-[11px]" style={{ color: 'rgba(245,241,232,0.5)' }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#dcff73]" />
                <span>{strand.moments.length} messages mapped</span>
              </div>
              {analytics && (
                <div className="flex items-center gap-2">
                  <span>Avg duration: {formatDuration(Math.round(analytics.avgMessageDuration))}</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-white/40 italic">
            Record messages to see the emotional landscape
          </div>
        )}
      </div>
    </section>
  );
}

// ─── LISTEN 2 VIEW (Container) ─────────────────────────────────────────────
function Listen2View() {
  const [selectedStrand, setSelectedStrand] = useState<Strand | null>(null);
  const [recordedAudios, setRecordedAudios] = useState<{ strandId: number; messageId: number; url: string }[]>([]);

  if (selectedStrand) {
    return (
      <StrandPlayer
        strand={selectedStrand}
        onBack={() => setSelectedStrand(null)}
        recordedAudios={recordedAudios}
      />
    );
  }

  return (
    <YourStrands
      onSelectStrand={setSelectedStrand}
      recordedAudios={recordedAudios}
      setRecordedAudios={setRecordedAudios}
    />
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/10 mt-6">
      <div className="max-w-[1200px] mx-auto px-8 py-9 flex justify-between items-start font-mono text-[11px] tracking-[1.5px] uppercase text-[rgba(245,241,232,0.38)]">
        <div className="flex items-center gap-3">
          <PHMark size={22} color="rgba(245,241,232,0.38)" />
          <span>Please Hold · Edition 001</span>
        </div>
        <div className="flex gap-6">
          <span className="cursor-pointer hover:text-[#f5f1e8] transition-colors">Care for your device</span>
          <span className="cursor-pointer hover:text-[#f5f1e8] transition-colors">Privacy</span>
          <span className="cursor-pointer hover:text-[#f5f1e8] transition-colors">Subscribe to The Podcast</span>
          <span className="cursor-pointer hover:text-[#f5f1e8] transition-colors">Contact</span>
        </div>
      </div>
    </footer>
  );
}

// ─── 3D Rotating Cylinder ────────────────────────────────────────────────
function RotatingPhone() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    let raf: number;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = now - last;
      setRotation((r) => (r + delta * 0.012) % 360);
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const segments = 24;
  const radius = 60;
  const height = 120;

  return (
    <div
      className="relative"
      style={{
        width: radius * 2,
        height: height,
        transformStyle: 'preserve-3d',
        transform: `rotateX(-15deg) rotateY(${rotation}deg)`,
      }}
    >
      {/* Cylinder sides - multiple segments */}
      {Array.from({ length: segments }).map((_, i) => {
        const angle = (i / segments) * 360;
        const segmentWidth = (2 * Math.PI * radius) / segments + 1; // +1 for overlap
        return (
          <div
            key={i}
            className="absolute"
            style={{
              width: segmentWidth,
              height: height,
              left: '50%',
              top: 0,
              marginLeft: -segmentWidth / 2,
              background: `linear-gradient(90deg,
                rgba(220, 220, 220, 1) 0%,
                rgba(255, 255, 255, 1) 50%,
                rgba(220, 220, 220, 1) 100%)`,
              borderLeft: '1px solid rgba(255, 255, 255, 0.5)',
              borderRight: '1px solid rgba(255, 255, 255, 0.5)',
              transformOrigin: 'center center',
              transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
              backfaceVisibility: 'hidden',
            }}
          />
        );
      })}

      {/* PLEASE HOLD text on cylinder - multiple positions for visibility */}
      {[0, 90, 180, 270].map((angle) => (
        <div
          key={angle}
          className="absolute flex items-center justify-center"
          style={{
            width: 100,
            height: 20,
            left: '50%',
            top: '50%',
            marginLeft: -50,
            marginTop: -10,
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '12px',
            fontWeight: 900,
            letterSpacing: '2px',
            color: '#000000',
            textTransform: 'uppercase',
            transformOrigin: 'center center',
            transform: `rotateY(${angle}deg) translateZ(${radius + 1}px)`,
            backfaceVisibility: 'hidden',
          }}
        >
          Please Hold
        </div>
      ))}

      {/* Top cap */}
      <div
        className="absolute rounded-full"
        style={{
          width: radius * 2,
          height: radius * 2,
          left: 0,
          top: -radius + height / 2,
          background: 'radial-gradient(circle at 40% 40%, #ffffff 0%, #e8e8e8 60%, #d0d0d0 100%)',
          border: '2px solid rgba(255, 255, 255, 0.8)',
          transform: `rotateX(90deg) translateZ(${height / 2}px)`,
          boxShadow: 'inset 0 0 30px rgba(255, 255, 255, 0.3)',
        }}
      />

      {/* Bottom cap */}
      <div
        className="absolute rounded-full"
        style={{
          width: radius * 2,
          height: radius * 2,
          left: 0,
          top: -radius + height / 2,
          background: 'radial-gradient(circle at 60% 60%, #f0f0f0 0%, #d8d8d8 60%, #c0c0c0 100%)',
          border: '2px solid rgba(255, 255, 255, 0.6)',
          transform: `rotateX(90deg) translateZ(${-height / 2}px)`,
        }}
      />

      {/* Decorative rings */}
      {[0.15, 0.5, 0.85].map((pos, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: radius * 2 + 4,
            height: radius * 2 + 4,
            left: -2,
            top: -radius + height / 2 - 2,
            border: '1px solid rgba(255, 255, 255, 0.4)',
            transform: `rotateX(90deg) translateZ(${height * (0.5 - pos)}px)`,
          }}
        />
      ))}

      {/* Glow effect */}
      <div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) translateZ(-60px)',
          background: 'radial-gradient(ellipse, rgba(255, 255, 255, 0.25) 0%, transparent 60%)',
          filter: 'blur(30px)',
        }}
      />
    </div>
  );
}

// ─── Ambient Background Wave ───────────────────────────────────────────────
function AmbientWave({
  playing,
  progress,
}: {
  playing: boolean;
  progress: number;
}) {
  const count = 120; // More bars, thinner
  const bars = useMemo(() => {
    const r = seed(42);
    return Array.from({ length: count }, (_, i) => {
      const env = Math.sin((i / count) * Math.PI) ** 0.4;
      const v = 0.2 + r() * 0.8;
      return Math.max(0.05, env * v);
    });
  }, []);

  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState(0);
  const [breathe, setBreathe] = useState(0);
  const [pulseRings, setPulseRings] = useState<number[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let raf: number;
    let last = performance.now();
    let lastPulse = 0;
    const tick = (n: number) => {
      const delta = n - last;
      setPhase((p) => p + delta * (playing ? 0.006 : 0.0015));
      setBreathe((b) => b + delta * 0.0006);

      // Add pulse rings periodically when playing
      if (playing && n - lastPulse > 2000) {
        lastPulse = n;
        setPulseRings((rings) => [...rings.slice(-4), n]);
      }

      last = n;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Echo pulse rings */}
      {pulseRings.map((ringTime, idx) => (
        <div
          key={ringTime}
          className="absolute rounded-full border pointer-events-none"
          style={{
            width: '100px',
            height: '100px',
            borderColor: 'rgba(245,241,232,0.3)',
            animation: 'echo-pulse 3s ease-out forwards',
            animationDelay: `${idx * 0.1}s`,
          }}
        />
      ))}

      {/* Ambient glow */}
      <div
        className="absolute w-[1600px] h-[800px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(ellipse, rgba(245,241,232,0.12) 0%, transparent 55%)',
          transform: `scale(${mounted ? 1 + Math.sin(breathe) * 0.18 : 1})`,
        }}
        suppressHydrationWarning
      />

      {/* Waveform bars - full screen */}
      <svg
        className="absolute inset-0 w-full h-full z-10"
        viewBox="0 0 1600 800"
        preserveAspectRatio="xMidYMid slice"
        style={{
          transform: `scale(${mounted ? 1.2 + Math.sin(breathe) * 0.03 : 1.2})`,
        }}
        suppressHydrationWarning
      >
        {bars.map((h, i) => {
          const breatheOffset = mounted ? Math.sin(breathe + i * 0.08) * 0.25 : 0;
          const wob = mounted ? 0.4 + 0.6 * Math.sin(phase + i * 0.15) + breatheOffset : 0.7;
          const barHeight = Math.round(Math.max(8, h * 750 * wob));
          const y = Math.round((800 - barHeight) / 2);
          const gap = 6;
          const barW = 4;
          const totalWidth = count * barW + (count - 1) * gap;
          const startX = (1600 - totalWidth) / 2;
          const x = Math.round(startX + i * (barW + gap));

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={barHeight}
              rx={2}
              fill="#ffffff"
              opacity={0.1}
            />
          );
        })}
      </svg>

      {/* Horizontal echo lines */}
      <div
        className="absolute w-full h-px top-1/4 opacity-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(245,241,232,0.25), transparent)',
          animation: playing ? 'echo-line 3s ease-out infinite' : 'none',
        }}
      />
      <div
        className="absolute w-full h-px bottom-1/4 opacity-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(245,241,232,0.25), transparent)',
          animation: playing ? 'echo-line 3s ease-out infinite 1.5s' : 'none',
        }}
      />
    </div>
  );
}

// ─── Hero Section ──────────────────────────────────────────────────────────
function Hero({
  playing,
  setPlaying,
  progress,
  setProgress,
}: {
  playing: boolean;
  setPlaying: (v: boolean) => void;
  progress: number;
  setProgress: (v: number) => void;
}) {
  const phrases = [
    'was crafted by ~56 different people',
    'has 82 different chapters',
    'is 5h 24m long',
  ];
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState(phrases[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const currentPhrase = phrases[phraseIndex];
    const typeSpeed = isDeleting ? 30 : 50;
    const pauseTime = 3000;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (displayText.length < currentPhrase.length) {
          setDisplayText(currentPhrase.slice(0, displayText.length + 1));
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), pauseTime);
        }
      } else {
        // Deleting
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          // Finished deleting, move to next phrase
          setIsDeleting(false);
          setPhraseIndex((i) => (i + 1) % phrases.length);
        }
      }
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, phraseIndex, mounted]);

  return (
    <section className="relative h-screen flex flex-col items-center justify-center">
      {/* Logo in top left */}
      <div className="absolute top-8 left-8 z-30">
        <span className="text-[14px] tracking-[3px] uppercase font-medium" style={{ color: '#f5f1e8' }}>
          Please Hold
        </span>
      </div>

      {/* Ambient background waveform */}
      <AmbientWave playing={playing} progress={progress} />

      {/* Content overlay */}
      <div className="relative z-20 text-center">
        {/* Headline */}
        <h1
          className="text-5xl md:text-6xl font-bold tracking-tight text-[#f5f1e8] mb-8 max-w-3xl mx-auto"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            mixBlendMode: 'difference',
          }}
        >
          This story <span style={{ color: '#dcff73' }}>{displayText}</span>
          <span className="animate-blink" style={{ color: '#dcff73' }}>|</span>
        </h1>

        {/* 3D Phone */}
        <div className="mb-8 flex justify-center" style={{ perspective: '800px' }}>
          <RotatingPhone />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 mb-12 text-[14px] tracking-[3px] uppercase font-medium" style={{ color: '#f5f1e8' }}>
          <span className="w-2.5 h-2.5 rounded-full bg-[#dcff73]" />
          <span>On the line</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Message #2,847</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>3h ago</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-5">
          <button
            onClick={() => setPlaying(!playing)}
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full border-none cursor-pointer text-[18px] font-medium transition-all duration-300 hover:scale-105"
            style={{
              background: playing ? '#e63a26' : '#f5f1e8',
              color: playing ? '#fff' : '#000',
              boxShadow: playing
                ? '0 0 40px rgba(230,58,38,0.4), 0 4px 20px rgba(0,0,0,0.3)'
                : '0 4px 20px rgba(0,0,0,0.3)',
            }}
          >
            {playing ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="3" y="2" width="3.5" height="12" />
                  <rect x="9.5" y="2" width="3.5" height="12" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M3 2 L14 8 L3 14 Z" />
                </svg>
                Play the story
              </>
            )}
          </button>

          <button
            className="inline-flex items-center gap-3 px-10 py-5 bg-transparent text-[rgba(245,241,232,0.7)] border border-white/20 rounded-full cursor-pointer text-[18px] font-medium hover:border-white/40 hover:text-[#f5f1e8] transition-all duration-300"
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 8 Q5 4 8 8 Q11 12 14 8" />
              <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
            </svg>
            Take me somewhere random
          </button>
        </div>

        {/* Search for a specific moment */}
        <div className="mt-8 relative max-w-md mx-auto">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="rgba(245,241,232,0.4)" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3 3" />
          </svg>
          <input
            type="text"
            placeholder="Search for a specific moment..."
            className="w-full pl-11 pr-4 py-3 rounded-full text-[14px] bg-transparent border border-white/20 text-[#f5f1e8] placeholder-[rgba(245,241,232,0.4)] focus:border-white/40 focus:outline-none transition-colors text-center"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          />
        </div>
      </div>
    </section>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────
export default function PleaseHoldPage() {
  const [activeTab, setActiveTab] = useState('listen2');
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0.18);
  const [playingId, setPlayingId] = useState<number | null>(null);

  // Auto-progress when playing
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => {
        const next = p + 0.0025;
        if (next >= 1) return 0;
        return next;
      });
    }, 60);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <main className="min-h-screen bg-black text-[#f5f1e8]" style={{ minWidth: 1280 }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;0,8..60,700;1,8..60,400;1,8..60,500&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');

        :root {
          --font-serif: 'Source Serif 4', Georgia, serif;
          --font-mono: 'JetBrains Mono', ui-monospace, monospace;
          --font-sans: 'Inter', system-ui, sans-serif;
        }

        .font-serif { font-family: var(--font-serif); }
        .font-mono { font-family: var(--font-mono); }

        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }

        @keyframes pulse-dot {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .animate-blink {
          animation: blink 1s infinite;
        }

        @keyframes echo-pulse {
          0% {
            width: 100px;
            height: 100px;
            opacity: 0.6;
            border-width: 2px;
          }
          100% {
            width: 2000px;
            height: 2000px;
            opacity: 0;
            border-width: 1px;
          }
        }

        @keyframes echo-line {
          0% {
            opacity: 0;
            transform: scaleX(0);
          }
          20% {
            opacity: 0.5;
            transform: scaleX(0.3);
          }
          100% {
            opacity: 0;
            transform: scaleX(1);
          }
        }

        @keyframes wordPulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        @keyframes waveBar {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(0.5);
          }
        }

        ::selection { background: #e63a26; color: #f5f1e8; }
      `}</style>

      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === 'listen2' && (
        <Listen2View />
      )}

      {activeTab === 'listen' && (
        <>
          <Hero playing={playing} setPlaying={setPlaying} progress={progress} setProgress={setProgress} />
          <Stats />
          <Chain />
          <ExportSection />
        </>
      )}

      {activeTab === 'chain' && (
        <ChainTimeline playingId={playingId} setPlayingId={setPlayingId} />
      )}

      {activeTab === 'export' && (
        <div className="max-w-[1200px] mx-auto px-8 py-16">
          <Stats />
          <ExportSection />
        </div>
      )}

      {activeTab === 'device' && (
        <section className="max-w-[600px] mx-auto px-8 py-16 text-center">
          <div className="font-mono text-[10px] tracking-[3px] uppercase mb-6 text-[rgba(245,241,232,0.38)]">
            Your Device
          </div>
          <DeviceRender pulse={false} />
          <div className="mt-8 space-y-4">
            <div className="p-6 rounded-lg bg-[#0e0e0e] border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[rgba(245,241,232,0.62)]">Serial Number</span>
                <span className="font-mono text-[#f5f1e8]">PH—0247</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[rgba(245,241,232,0.62)]">Edition</span>
                <span className="font-mono text-[#f5f1e8]">001</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[rgba(245,241,232,0.62)]">Status</span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#3a8a4f]" />
                  <span className="font-mono text-[#3a8a4f]">Connected</span>
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[rgba(245,241,232,0.62)]">Last Sync</span>
                <span className="font-mono text-[#f5f1e8]">2 minutes ago</span>
              </div>
            </div>
            <button className="w-full py-3 bg-[#f5f1e8] text-black rounded-lg font-medium cursor-pointer border-none">
              Sync Now
            </button>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
