"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import FooterSignup from "@/components/FooterSignup";

// Animation scripts for the texting mockup
const OPTION_RESPONSES: Record<string, Array<{ text?: string; html?: string; image?: string; link?: { url: string; title: string; subtitle: string; thumbnail: string } }>> = {
  'When\'s the last time you felt proud?': [
    { text: "My 8 year old wrote this and won 2nd place in his poetry class. I cried reading it. I couldn't even make something this beautiful." },
    { html: `<b>A List of Objects and What They Need</b>

Dishwasher – Dirty Plates
Backpack – Homework
Gross Shoes – To Be Cleaned
My Friend Alice – Snacks
Long Giraffe – To Be Shorter
Lost Sock – To Be Found
My Mom – Hugs
My Dad – Love` },
    { text: 'Want more of this? Join the club' }
  ],
  'Has anything inspired you to create lately?': [
    { text: 'This is called "Kabuki II (the performance)" by Toni Hamel.' },
    { image: '/assets/kabuki.jpg' },
    { text: `"To me, this painting represents what it feels like to be an artist. Whenever I'm blocked, I come back to it. When you're in it, trying to make something real and good and beautiful, it's just hard work and it feels impossible and you're putting things in places that don't make sense. Like fish hanging from the sky. You have to be okay with it not making sense while you're in the creative process. But you have to keep going. These guys can't see the full beauty of what they're putting together but we can. We can."

- BK, age 42` },
    { text: 'Want more of this? Join the club' }
  ],
  'What\'s a song you associate with a specific memory?': [
    { link: { url: 'https://www.youtube.com/watch?v=cdxE4QtUz-8', title: 'Everyday Hustle', subtitle: 'Future', thumbnail: 'https://img.youtube.com/vi/cdxE4QtUz-8/hqdefault.jpg' } },
    { text: `"I majored in Finance and worked as an Investment Banker on Wall Street for 2 years. I thought that was the dream. My parents were so proud of me but it was hell. I was working 70 hours a week and having panic attacks every month. One day, I woke up and just decided I'm going to quit. I listened to this song on repeat and walked the 2 miles home. I felt so free."

- TA, aged 25` },
    { text: 'Want more of this? Join the club' }
  ]
};

interface ScriptStep {
  side: 'them' | 'me';
  text?: string;
  html?: string;
  image?: string;
  options?: string[];
  link?: { url: string; title: string; subtitle: string; thumbnail: string };
}

const SCRIPTS: ScriptStep[][] = [
  [
    { side: 'them', text: "The best things in life come from other people." },
    { side: 'them', text: "You get inspired, you feel seen, you fall in love." },
    { side: 'them', text: "pick one and we'll show you" },
    { side: 'them', options: ['When\'s the last time you felt proud?', 'Has anything inspired you to create lately?', 'What\'s a song you associate with a specific memory?'] },
  ],
];

const TYPING_BEFORE = 1400;
const PAUSE_AFTER_ME = 900;
const PAUSE_AFTER_THEM = 700;

interface MessageItem {
  _key: number;
  side: 'left' | 'right';
  text?: string;
  html?: string;
  image?: string;
  link?: { url: string; title: string; subtitle: string; thumbnail: string };
  typing?: boolean;
  animateIn?: boolean;
  options?: string[];
  selectedOption?: string;
  onSelect?: (option: string) => void;
}

// Options bubble component
function OptionsBubble({ options, selectedOption, animateIn, onSelect }: { options: string[]; selectedOption?: string; animateIn?: boolean; onSelect?: (option: string) => void }) {
  const [appeared, setAppeared] = useState(!animateIn);

  useEffect(() => {
    if (animateIn) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAppeared(true));
      });
    }
  }, [animateIn]);

  if (selectedOption) {
    return (
      <div className="px-3 py-1">
        <div className="flex items-center gap-1.5 mb-1.5 text-[11px] sm:text-[13px] text-black/40">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span>{options.length} options presented</span>
        </div>
        <div
          className="inline-block px-3 py-2 rounded-[16px] bg-[#E9E9EB]"
          style={{
            transform: appeared ? 'scale(1) translateY(0)' : 'scale(0.3) translate(-40px, 30px)',
            opacity: appeared ? 1 : 0,
            transition: 'transform 320ms cubic-bezier(0.22, 1.2, 0.36, 1), opacity 180ms ease-out',
            transformOrigin: 'bottom left',
          }}
        >
          <div className="text-[14px] sm:text-[15px] leading-[18px] sm:leading-[20px] text-black font-medium" style={{ letterSpacing: '-0.24px' }}>
            {selectedOption}
          </div>
          <div className="text-[11px] sm:text-[12px] text-black/50 mt-0.5">Selected Option</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="px-3 py-2"
      style={{
        opacity: appeared ? 1 : 0,
        transform: appeared ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 320ms cubic-bezier(0.22, 1.2, 0.36, 1)',
      }}
    >
      <div className="bg-[#E8E8ED] rounded-[16px] overflow-hidden">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onSelect?.(option)}
            className="w-full px-3 py-2.5 text-[14px] sm:text-[15px] leading-[18px] sm:leading-[20px] text-left text-[#007AFF] hover:bg-[#D8D8DD] transition-colors cursor-pointer"
            style={{
              letterSpacing: '-0.24px',
              borderBottom: idx < options.length - 1 ? '1px solid rgba(60, 60, 67, 0.12)' : 'none',
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

// Typing indicator
function TypingBubble({ isMe = false }: { isMe?: boolean }) {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
      <div
        className={`${isMe ? 'bg-[#0A7CFF]' : 'bg-[#E9E9EB]'} px-3.5 py-2.5 rounded-[20px] relative flex gap-1.5`}
        style={{ animation: 'typingBubbleIn 260ms cubic-bezier(0.22,1.2,0.36,1) both' }}
      >
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${isMe ? 'bg-white/60' : 'bg-black/40'}`}
            style={{
              animation: 'typingDot 1.2s infinite ease-in-out',
              animationDelay: `${i * 0.18}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Message bubble component
function MessageBubble({ item }: { item: MessageItem }) {
  const isMe = item.side === 'right';
  const [appeared, setAppeared] = useState(!item.animateIn);

  useEffect(() => {
    if (item.animateIn) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAppeared(true));
      });
    }
  }, [item.animateIn]);

  if (item.typing) return <TypingBubble isMe={isMe} />;

  if (item.options) {
    return <OptionsBubble options={item.options} selectedOption={item.selectedOption} animateIn={item.animateIn} onSelect={item.onSelect} />;
  }

  if (item.image) {
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
        <div
          className="max-w-[82%] rounded-[18px] overflow-hidden bg-[#E9E9EB]"
          style={{
            transform: appeared ? 'scale(1) translateY(0)' : `scale(0.4) translate(${isMe ? 40 : -40}px, 20px)`,
            opacity: appeared ? 1 : 0,
            transition: 'transform 320ms cubic-bezier(0.22, 1.2, 0.36, 1), opacity 180ms ease-out',
            transformOrigin: isMe ? 'bottom right' : 'bottom left',
          }}
        >
          <img src={item.image} alt="" className="block w-[406px] h-auto object-cover" />
        </div>
      </div>
    );
  }

  if (item.link) {
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
        <a
          href={item.link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block max-w-[82%] rounded-[18px] overflow-hidden bg-[#E9E9EB] hover:bg-[#DDDDE0] transition-colors cursor-pointer"
          style={{
            transform: appeared ? 'scale(1) translateY(0)' : `scale(0.4) translate(${isMe ? 40 : -40}px, 20px)`,
            opacity: appeared ? 1 : 0,
            transition: 'transform 320ms cubic-bezier(0.22, 1.2, 0.36, 1), opacity 180ms ease-out',
            transformOrigin: isMe ? 'bottom right' : 'bottom left',
            textDecoration: 'none',
          }}
        >
          <img src={item.link.thumbnail} alt={item.link.title} className="block w-[300px] h-[168px] object-cover" />
          <div className="px-3 py-2">
            <p className="text-[15px] font-semibold text-black leading-tight">{item.link.title}</p>
            <p className="text-[13px] text-black/60">{item.link.subtitle}</p>
            <p className="text-[12px] text-black/40 mt-0.5">youtube.com</p>
          </div>
        </a>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
      <div
        className="max-w-[82%] px-3 py-2 rounded-[20px] relative text-[15px] sm:text-[17px] leading-[19px] sm:leading-[22px]"
        style={{
          background: isMe ? 'linear-gradient(180deg, #2B8AFA, #0A7CFF)' : '#E9E9EB',
          color: isMe ? '#fff' : '#000',
          transform: appeared ? 'scale(1) translateY(0)' : `scale(0.3) translate(${isMe ? 40 : -40}px, 30px)`,
          opacity: appeared ? 1 : 0,
          transition: 'transform 320ms cubic-bezier(0.22, 1.2, 0.36, 1), opacity 180ms ease-out',
          transformOrigin: isMe ? 'bottom right' : 'bottom left',
          letterSpacing: '-0.24px',
          whiteSpace: 'pre-line',
        }}
      >
        {item.html ? <span dangerouslySetInnerHTML={{ __html: item.html }} /> : item.text}
      </div>
    </div>
  );
}

// Animated messages container
function AnimatedMessages() {
  const [items, setItems] = useState<MessageItem[]>([]);
  const keyRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  const nextKey = () => ++keyRef.current;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [items]);

  const recomputeTails = (arr: MessageItem[]): MessageItem[] => arr;

  const runAllSequences = async () => {
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    await sleep(500);

    for (const SCRIPT of SCRIPTS) {
      for (const step of SCRIPT) {
        const side: 'left' | 'right' = step.side === 'me' ? 'right' : 'left';

        if (step.options) {
          const optionsKey = nextKey();
          const selectedOption = await new Promise<string>((resolve) => {
            setItems(prev => recomputeTails([
              ...prev,
              { _key: optionsKey, side: 'left', options: step.options, animateIn: true, onSelect: (option: string) => resolve(option) },
            ]));
          });

          setItems(prev => prev.map(item =>
            item._key === optionsKey ? { ...item, selectedOption, onSelect: undefined, animateIn: true } : item
          ));
          await sleep(PAUSE_AFTER_ME);

          const responseMessages = OPTION_RESPONSES[selectedOption];
          if (responseMessages) {
            for (const msg of responseMessages) {
              const typingKey = nextKey();
              setItems(prev => recomputeTails([...prev, { _key: typingKey, side: 'left', typing: true }]));
              await sleep(msg.image ? 800 : TYPING_BEFORE);

              const msgKey = nextKey();
              setItems(prev => {
                const withoutTyping = prev.filter(m => m._key !== typingKey);
                if (msg.image) {
                  return recomputeTails([...withoutTyping, { _key: msgKey, side: 'left', image: msg.image, animateIn: true }]);
                } else if (msg.link) {
                  return recomputeTails([...withoutTyping, { _key: msgKey, side: 'left', link: msg.link, animateIn: true }]);
                } else if (msg.html) {
                  return recomputeTails([...withoutTyping, { _key: msgKey, side: 'left', html: msg.html, animateIn: true }]);
                } else {
                  return recomputeTails([...withoutTyping, { _key: msgKey, side: 'left', text: msg.text, animateIn: true }]);
                }
              });
              await sleep(PAUSE_AFTER_THEM);
            }
          }
          continue;
        }

        const typingKey = nextKey();
        setItems(prev => recomputeTails([...prev, { _key: typingKey, side, typing: true }]));
        await sleep(TYPING_BEFORE);

        const bubbleKey = nextKey();
        setItems(prev => {
          const withoutTyping = prev.filter(m => m._key !== typingKey);
          const newItem: MessageItem = step.html
            ? { _key: bubbleKey, side, html: step.html, animateIn: true }
            : { _key: bubbleKey, side, text: step.text, animateIn: true };
          return recomputeTails([...withoutTyping, newItem]);
        });

        await sleep(step.side === 'me' ? PAUSE_AFTER_ME : PAUSE_AFTER_THEM);
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasStartedRef.current) {
            hasStartedRef.current = true;
            runAllSequences();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="flex flex-col h-[508px]">
      <div ref={containerRef} className="flex-1 flex flex-col py-4 overflow-y-auto scroll-smooth">
        <p className="text-center text-[11px] text-black/40 mb-2">iMessage - Today 10:24 AM</p>
        {items.map(item => <MessageBubble key={item._key} item={item} />)}
      </div>
    </div>
  );
}

export default function StrangerTextsPage() {
  const [howItWorksOpen, setHowItWorksOpen] = useState(true);
  const [whyOpen, setWhyOpen] = useState(true);
  const [faqsOpen, setFaqsOpen] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);

  const rotatingQuestions = [
    "...",
    "What's a random story from your life you like telling people?",
    "...",
    "What's the best compliment you've ever gotten?",
    "...",
    "Tell us one thing about you that sounds made up but is true."
  ];

  useEffect(() => {
    const isTypingDots = rotatingQuestions[questionIndex] === "...";
    const delay = isTypingDots ? 800 : 2500;
    const timeout = setTimeout(() => {
      setQuestionIndex((prev) => (prev + 1) % rotatingQuestions.length);
    }, delay);
    return () => clearTimeout(timeout);
  }, [questionIndex]);

  return (
    <>
      <style jsx global>{`
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
        @keyframes typingBubbleIn {
          from { transform: scale(0.7); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <main className="min-h-screen pt-[120px] md:pt-[140px]" style={{ backgroundColor: '#F2F2F2' }}>
        {/* Hero Section */}
        <div className="container mx-auto px-6 sm:px-8 md:px-12 py-12 md:py-16">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-[1400px] mx-auto items-center">
            {/* Left Column - Header */}
            <div className="flex flex-col items-start justify-center">
              <div className="mb-2">
                <p className="text-xl sm:text-2xl md:text-3xl font-[family-name:var(--font-instrument-serif)] text-black tracking-wide text-left ml-1">The</p>
                <h1 className="text-[3.6rem] sm:text-[4.1rem] md:text-[4.9rem] lg:text-[5.4rem] xl:text-[6.6rem] 2xl:text-[8.1rem] leading-[0.9] font-black sm:font-bold font-[family-name:var(--font-instrument-serif)] text-black tracking-wide -mt-2 text-left">Stranger Texts Club</h1>
              </div>
              <p className="text-base sm:text-xl text-black/70 italic font-[family-name:var(--font-inter)] mb-4 text-left">Try it for free · Cancel anytime</p>
              <p className="text-[18px] sm:text-[22px] md:text-[22px] lg:text-[27px] font-[family-name:var(--font-inter)] text-black/70 text-left mb-6" style={{ letterSpacing: '-0.5px' }}>
                Every week, you're <b>paired with a stranger to share art, stories, and meaningful moments</b> from your lives. <span className="bg-[#dcff73] px-1 rounded"><b>Text us to join the waitlist.</b></span>
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="sms:+13322604354?body=I%20want%20to%20meet%20new%20people"
                  className="inline-flex items-center justify-center px-8 py-4 text-[16px] sm:text-[20px] font-semibold rounded-full transition-all font-[family-name:var(--font-inter)] text-black bg-[#dcff73] hover:bg-black hover:text-white"
                >
                  📲 Text us +1 (332) 260-4354
                </a>
                <p className="text-[12px] leading-[16px] text-black/60 italic">
                  By texting, you agree to our <a href="/legal/mobile-terms" className="underline hover:text-black/80">Terms of Service</a> and <a href="/legal/privacy-policy" className="underline hover:text-black/80">Privacy Policy</a>.
                </p>
              </div>
            </div>

            {/* Right Column - Phone Mockup */}
            <div className="w-full flex flex-col items-center">
              <p className="text-xl font-[family-name:var(--font-inter)] text-black/50 mb-4">Give it a try ↓</p>
              <div className="flex justify-center w-full px-4 sm:px-0">
                <div className="rounded-[2.2rem] shadow-xl w-full max-w-[373px] sm:max-w-[418px] md:max-w-[495px] lg:max-w-[572px]">
                  <div className="bg-[#f5f5f5] rounded-[2rem] overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-3">
                      <div className="flex items-center gap-1">
                        <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                          <path d="M10 2L2 10L10 18" stroke="#0A7CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="bg-[#0A7CFF] text-white px-2 py-0.5 rounded-full text-[11px] font-semibold">24</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-[52px] h-[52px] rounded-full overflow-hidden border-2 border-[#F8330D]">
                          <img src="/assets/logo.png" alt="RIAF!" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
                        <rect x="1" y="2" width="18" height="16" rx="4" stroke="#0A7CFF" strokeWidth="2" fill="none"/>
                        <path d="M19 7L26 3V17L19 13" stroke="#0A7CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    </div>
                    <div className="text-center py-1 border-b border-black/10">
                      <div className="flex items-center justify-center gap-1">
                        <p className="font-semibold text-[13px] text-black">Rithika is a Fool!</p>
                        <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                          <path d="M2 2L6 6L2 10" stroke="#C7C7CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                    <AnimatedMessages />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How Does This Work Section */}
        <div className="pt-6 pb-12 md:py-16 px-6 sm:px-8 md:px-12">
          <button
            onClick={() => setHowItWorksOpen(!howItWorksOpen)}
            className="w-full flex items-center justify-center gap-4 mb-4 sm:mb-12 cursor-pointer"
          >
            <h2 className="text-[2.7rem] sm:text-[3.75rem] md:text-[4.5rem] font-bold font-[family-name:var(--font-instrument-serif)] text-black text-center">
              How does this thing work?
            </h2>
            <motion.span
              animate={{ rotate: howItWorksOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl text-[#F8330D]"
            >
              ▼
            </motion.span>
          </button>

          <motion.div
            initial={false}
            animate={{ height: howItWorksOpen ? "auto" : 0, opacity: howItWorksOpen ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="max-w-[1400px] mx-auto space-y-12">
              {/* Step 1 */}
              <div className="bg-white/20 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 items-start">
                  <div>
                    <p className="text-xl font-semibold text-black/50 mb-1 font-[family-name:var(--font-inter)]">Step 1</p>
                    <p className="text-base sm:text-xl font-[family-name:var(--font-inter)] text-black tracking-tight">
                      When you sign up, we first try to <span className="bg-[#dcff73] px-1 rounded"><b>get to know you</b></span>. This helps us create your profile and match you.
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-start mb-3">
                      <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                        <p className="text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                          We're pretty excited you're here and we want to get to know you.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-start mb-3">
                      <motion.div
                        key={questionIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`bg-[#E9E9EB] rounded-[24px] max-w-[90%] ${rotatingQuestions[questionIndex] === "..." ? "px-4 py-4" : "px-6 py-5"}`}
                      >
                        {rotatingQuestions[questionIndex] === "..." ? (
                          <div className="flex gap-1.5">
                            {[0, 1, 2].map(i => (
                              <span
                                key={i}
                                className="w-2.5 h-2.5 rounded-full bg-black/40"
                                style={{
                                  animation: 'typingDot 1.2s infinite ease-in-out',
                                  animationDelay: `${i * 0.18}s`,
                                }}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                            {rotatingQuestions[questionIndex]}
                          </p>
                        )}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-white/20 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 items-start">
                  <div>
                    <p className="text-xl font-semibold text-black/50 mb-1 font-[family-name:var(--font-inter)]">Step 2</p>
                    <p className="text-base sm:text-xl font-[family-name:var(--font-inter)] text-black tracking-tight">
                      Each week, you're <span className="bg-[#dcff73] px-1 rounded"><b>paired with a new stranger</b></span> and get a little glimpse of who they are.
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-start">
                      <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                        <p className="text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                          This week, you've been matched with someone who:
                        </p>
                        <p className="text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed mt-2 italic" style={{ letterSpacing: '-0.24px' }}>
                          - is 48 and an ER nurse in Philadelphia<br />
                          - once drove 6 hours for a sandwich<br />
                          - has married the same person twice
                        </p>
                        <p className="text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed mt-2" style={{ letterSpacing: '-0.24px' }}>
                          They'll be your partner for the week.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-white/20 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 items-start">
                  <div>
                    <p className="text-xl font-semibold text-black/50 mb-1 font-[family-name:var(--font-inter)]">Step 3</p>
                    <p className="text-base sm:text-xl font-[family-name:var(--font-inter)] text-black tracking-tight">
                      Through the week, we <span className="bg-[#dcff73] px-1 rounded"><b>guide you through three creative prompts</b></span>. For each one, you'll have 24 hours to reply.
                    </p>
                  </div>
                  <div>
                    <p className="text-center text-[13px] text-black/40 mb-2">Monday 9:00 AM</p>
                    <div className="flex justify-start">
                      <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                        <p className="text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed font-semibold" style={{ letterSpacing: '-0.24px' }}>
                          Today's Prompt:
                        </p>
                        <p className="text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed mt-2" style={{ letterSpacing: '-0.24px' }}>
                          Bob Marley once said <i>"One good thing about music, when it hits you, you feel no pain."</i> Tell us about a <b>song that's helped you process something hard</b> in your life.
                        </p>
                        <p className="text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed mt-3" style={{ letterSpacing: '-0.24px' }}>
                          Reply within 24 hours to receive a response.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-white/20 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 items-start">
                  <div>
                    <p className="text-xl font-semibold text-black/50 mb-1 font-[family-name:var(--font-inter)]">Step 4</p>
                    <p className="text-base sm:text-xl font-[family-name:var(--font-inter)] text-black tracking-tight">
                      We <span className="bg-[#dcff73] px-1 rounded"><b>review responses</b></span> to try to keep things thoughtful and safe from a quality perspective.
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-end mb-3">
                      <div className="rounded-[20px] px-5 py-2.5" style={{ background: 'linear-gradient(180deg, #2B8AFA, #0A7CFF)' }}>
                        <p className="text-[15px] sm:text-[19px] text-white leading-[19px] sm:leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                          Blah blah, just give me theirs.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                        <p className="text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                          Hmm, this doesn't seem like it answers the prompt. Can you try again?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="bg-white/20 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 items-start">
                  <div>
                    <p className="text-xl font-semibold text-black/50 mb-1 font-[family-name:var(--font-inter)]">Step 5</p>
                    <p className="text-base sm:text-xl font-[family-name:var(--font-inter)] text-black tracking-tight">
                      We <span className="bg-[#dcff73] px-1 rounded"><b>send you their response</b></span>. If your match didn't reply, we'll still send you something meaningful.
                    </p>
                  </div>
                  <div>
                    <p className="text-center text-[13px] text-black/40 mb-2">Tuesday 9:00 AM</p>
                    <div className="flex justify-start">
                      <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                        <p className="text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                          I was 21 the first time I saw a patient die on my shift. You could just tell that they were a good person. She kept thanking me for small things like bringing her water. I was numb and I kept listening to this song on repeat. It helped.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="bg-white/20 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 items-start">
                  <div>
                    <p className="text-xl font-semibold text-black/50 mb-1 font-[family-name:var(--font-inter)]">Step 6</p>
                    <p className="text-base sm:text-xl font-[family-name:var(--font-inter)] text-black tracking-tight">
                      At the end of the week, you can <span className="bg-[#dcff73] px-1 rounded"><b>choose to connect for real</b></span>. We'll only share contact information if you <b>both agree</b>.
                    </p>
                  </div>
                  <div>
                    <p className="text-center text-[13px] text-black/40 mb-2">Friday 9:00 AM</p>
                    <div className="flex justify-start mb-3">
                      <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                        <p className="text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                          That's it for this week. Want to share your contact if they feel the same?
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-[#E8E8ED] rounded-[18px] overflow-hidden">
                        <button className="w-full px-4 py-3 text-[17px] text-left text-[#007AFF] border-b border-black/10 hover:bg-[#D8D8DD] transition-colors cursor-pointer" style={{ letterSpacing: '-0.24px' }}>
                          Yes, they're cool
                        </button>
                        <button className="w-full px-4 py-3 text-[17px] text-left text-[#007AFF] hover:bg-[#D8D8DD] transition-colors cursor-pointer" style={{ letterSpacing: '-0.24px' }}>
                          Nah, not feeling it this week
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 7 */}
              <div className="bg-white/20 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 items-start">
                  <div>
                    <p className="text-xl font-semibold text-black/50 mb-1 font-[family-name:var(--font-inter)]">Step 7</p>
                    <p className="text-base sm:text-xl font-[family-name:var(--font-inter)] text-black tracking-tight">
                      Then we <b>do it again!</b>
                    </p>
                  </div>
                  <div>
                    <p className="text-center text-[13px] text-black/40 mb-2">Saturday 11:00 AM</p>
                    <div className="flex justify-start">
                      <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                        <p className="text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                          We'll be back tomorrow with next week's match.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Why Section */}
        <div className="pt-2 pb-12 md:pt-4 md:pb-16 px-6 sm:px-8 md:px-12">
          <button
            onClick={() => setWhyOpen(!whyOpen)}
            className="w-full flex items-center justify-center gap-4 mb-12 cursor-pointer"
          >
            <h2 className="text-[3rem] sm:text-[3.75rem] md:text-[4.5rem] font-bold font-[family-name:var(--font-instrument-serif)] text-black text-center">
              Why?
            </h2>
            <motion.span
              animate={{ rotate: whyOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl text-[#F8330D]"
            >
              ▼
            </motion.span>
          </button>
          <motion.div
            initial={false}
            animate={{ height: whyOpen ? "auto" : 0, opacity: whyOpen ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
              <img
                src="/assets/shakes.png"
                alt="Shakespeare"
                className="w-full max-w-[484px] h-auto rounded-2xl mx-auto"
              />
              <div className="space-y-3">
                <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5">
                  <p className="text-[17px] sm:text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                    Other people make us better.
                  </p>
                </div>
                <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5">
                  <p className="text-[17px] sm:text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                    And I wanted a <b>different way to meet and feel connected to them</b>. Social media can be overwhelming and addictive and demanding. This is my attempt at creating something that feels spontaneous and light but also impactful.
                  </p>
                </div>
                <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5">
                  <p className="text-[17px] sm:text-[15px] sm:text-[19px] text-black leading-[19px] sm:leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                    <span className="bg-[#dcff73] px-1 rounded"><b>If you have ideas</b></span> on how to make this better, please do <b>send me <a href="/connect" className="text-blue-600 hover:text-blue-800">feedback</a></b>. I would be grateful.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* FAQs Section */}
        <div className="pt-2 pb-12 md:pt-4 md:pb-16 px-6 sm:px-8 md:px-12">
          <button
            onClick={() => setFaqsOpen(!faqsOpen)}
            className="w-full flex items-center justify-center gap-4 mb-12 cursor-pointer"
          >
            <h2 className="text-[3rem] sm:text-[3.75rem] md:text-[4.5rem] font-bold font-[family-name:var(--font-instrument-serif)] text-black text-center">
              FAQs
            </h2>
            <motion.span
              animate={{ rotate: faqsOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl text-[#F8330D]"
            >
              ▼
            </motion.span>
          </button>
          <motion.div
            initial={false}
            animate={{ height: faqsOpen ? "auto" : 0, opacity: faqsOpen ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="max-w-[800px] mx-auto space-y-4">
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-bold font-[family-name:var(--font-inter)] text-black mb-2">How much does it cost?</h3>
                <p className="text-base font-[family-name:var(--font-inter)] text-black/70">There's a 14 day free trial to start. After that, you will be charged $5 a month and you can cancel anytime.</p>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-bold font-[family-name:var(--font-inter)] text-black mb-2">How do I get matched?</h3>
                <p className="text-base font-[family-name:var(--font-inter)] text-black/70">You are always matched with a real person who also signed up. We try to match you with someone who has different perspectives but shared interests. We also try to vary your match as often as possible.</p>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-bold font-[family-name:var(--font-inter)] text-black mb-2">What if my match doesn't reply?</h3>
                <p className="text-base font-[family-name:var(--font-inter)] text-black/70">We'll always be transparent if your match didn't reply but we'll still send you something meaningful. Often, it will be a thoughtful response from another member. You'll never be left hanging.</p>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-bold font-[family-name:var(--font-inter)] text-black mb-2">Is my information private?</h3>
                <p className="text-base font-[family-name:var(--font-inter)] text-black/70">Yes. Your personal details and phone number are stored securely and only used to run this experience. We never sell your data or share it without your explicit consent.</p>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-bold font-[family-name:var(--font-inter)] text-black mb-2">How do I cancel?</h3>
                <p className="text-base font-[family-name:var(--font-inter)] text-black/70">You can text STOP anytime to trigger the cancellation flow. Or you can email us at support@rithikaisafool.com requesting to cancel.</p>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <h3 className="text-lg font-bold font-[family-name:var(--font-inter)] text-black mb-2">I have more questions. What can I do?</h3>
                <p className="text-base font-[family-name:var(--font-inter)] text-black/70">Email support@rithikaisafool.com. We'll try to get back to you as soon as we can.</p>
              </div>
            </div>
          </motion.div>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10">
        <div className="px-6 py-6 md:py-8" style={{ backgroundColor: '#000000', letterSpacing: '-0.08em' }}>
          <FooterSignup />
          {/* Mobile: Stacked layout */}
          <div className="flex flex-col items-center gap-4 md:hidden">
            <div className="flex gap-6">
              <a href="https://www.instagram.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@rithikakorr" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a href="https://x.com/rithika24k" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://substack.com/@rithikakorrapolu" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                </svg>
              </a>
            </div>
            <div className="flex gap-6">
              <a href="/" className="text-white text-sm font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Home</a>
              <a href="/connect" className="text-white text-sm font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Contact</a>
              <a href="/legal" className="text-white text-sm font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Legal</a>
            </div>
            <p className="text-white text-sm font-normal font-[family-name:var(--font-inter)]">© Rithika is a Fool 2026</p>
          </div>
          {/* Desktop layout */}
          <div className="hidden md:block relative">
            <div className="container mx-auto flex justify-between items-center">
              <p className="text-white text-base font-normal font-[family-name:var(--font-inter)]">© Rithika is a Fool 2026</p>
              <div className="flex gap-12">
                <div className="flex flex-col">
                  <a href="/" className="text-white text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Home</a>
                </div>
                <div className="flex flex-col">
                  <a href="/connect" className="text-white text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Contact</a>
                  <a href="/legal" className="text-white text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Legal + FAQ</a>
                </div>
              </div>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-6">
              <a href="https://www.instagram.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@rithikakorr" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a href="https://x.com/rithika24k" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://substack.com/@rithikakorrapolu" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
