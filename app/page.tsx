"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import AnimatedGrid from "@/components/AnimatedGrid";
import { BouncingBallPoster } from "@/components/BouncingBallPoster";
import FooterSignup from "@/components/FooterSignup";

// Project titles for each grid cell
const projects = [
  { title: "Discover the memories people carry with songs.", link: "/songs-that-hold-memories", hasCover: "sthm", category: "digital" },
  { title: "Rep your conditions.", link: "/shop/condition-of-the-month-hat-1", hasCover: "hat", category: "physical" },
  { title: "Call if we're friends.", link: "/voicemail-show", hasCover: "phone", category: "digital" },
  { title: "Trust a stranger to design your sweatshirt.", link: "/shop/a-stranger-designed-my-sweatshirt", hasCover: true, category: "physical" },
  { title: "Experience art through someone else's eyes.", link: "/shop/let-me-show-you", hasCover: "lmsy", category: "digital" },
  { title: "Explore art by vibe.", link: "/museum", hasCover: "museum", category: "digital" },
  { title: "Get a weekly dose of someone else's joy.", link: "/stwl", hasCover: "stwl", category: "digital" },
  { title: "Remember that we're all a little odd.", link: "/quirks", hasCover: "quirks", category: "digital" },
];

// Animation scripts for the texting mockup (multiple sequences)
// Response content for each option - supports multiple messages including images
const OPTION_RESPONSES: Record<string, Array<{ text?: string; html?: string; image?: string; link?: { url: string; title: string; subtitle: string; thumbnail: string }; phoneInput?: boolean; sendButton?: boolean; orangeBubble?: string }>> = {
  'An artist\'s favorite painting': [
    { text: 'This is called "Kabuki II (the performance)" by Toni Hamel.' },
    { image: '/assets/kabuki.jpg' },
    { text: `"To me, this painting represents what it feels like to be an artist. That's why it's one of my favorites. When you're in it, trying to make something real and good and beautiful, it's just hard work and it feels impossible and you're putting things in places that don't make sense. Like fish hanging from the sky. You have to be okay with it not making sense while you're in the creative process. But you have to keep going. These guys can't see the full beauty of what they're putting together but we can. We can."

- BK, age 42` },
    { text: 'We send things like this a few times a week. Always from a real person.' }
  ],
  'A memory and song about freedom': [
    { link: { url: 'https://www.youtube.com/watch?v=cdxE4QtUz-8', title: 'Everyday Hustle', subtitle: 'Future', thumbnail: 'https://img.youtube.com/vi/cdxE4QtUz-8/hqdefault.jpg' } },
    { text: `"I majored in Finance and worked as an Investment Banker on Wall Street for 2 years. I thought that was the dream. My parents were so proud of me. It was hell. I was working 70 hours a week and having panic attacks every month. One day, I woke up and just decided I'm going to quit. I listened to this song on repeat and walked the 2 miles home. I felt so free."

- TA, aged 25` },
    { text: 'We send things like this a few times a week. Always from a real person.' }
  ],
  'A sweet poem from a kid': [
    { text: "This poem is from Jamie, 8 years old." },
    { html: `<b>A List of Endangered Animals and Their Needs</b>

Lost Panda – Bamboo
Bold Eagle – A Mountain
Blind Cat – Love
Grey Elephant – Security
Lonely Dog – Someone Nice
Striped Tiger – Food
Puzzled Penguin – Help
Terrified Seal – Peace
Long Giraffe – To be Shorter` },
    { text: 'We send things like this a few times a week. Always from a real person.' }
  ]
};

interface ScriptStep {
  side: 'them' | 'me';
  text?: string;
  html?: string;
  image?: string;
  imageAlt?: string;
  options?: string[];
  selectIndex?: number;
  link?: { url: string; title: string; subtitle: string; thumbnail: string };
  phoneInput?: boolean;
  sendButton?: boolean;
  orangeBubble?: string;
}

const SCRIPTS: ScriptStep[][] = [
  [
    { side: 'them', text: "Every week, we pair you up with a stranger" },
    { side: 'them', text: 'and guide you to share art, stories, and cool moments from your lives' },
    { side: 'them', text: "pick one and we'll show you" },
    { side: 'them', options: ['An artist\'s favorite painting', 'A memory and song about freedom', 'A sweet poem from a kid'], selectIndex: 1 },
    // Response will be dynamically inserted based on selection
  ],
];

const TYPING_BEFORE = 1400;
const PAUSE_AFTER_ME = 900;
const PAUSE_AFTER_THEM = 700;
const LOOP_RESET_DELAY = 4600;

interface MessageItem {
  _key: number;
  side: 'left' | 'right';
  text?: string;
  html?: string;
  image?: string;
  imageAlt?: string;
  link?: { url: string; title: string; subtitle: string; thumbnail: string };
  phoneInput?: boolean;
  sendButton?: boolean;
  orangeBubble?: string;
  typing?: boolean;
  animateIn?: boolean;
  tailed?: boolean;
  options?: string[];
  selectedOption?: string;
  onSelect?: (option: string) => void;
}

// Options bubble component (iMessage-style quick replies)
function OptionsBubble({ options, selectedOption, animateIn, onSelect }: { options: string[]; selectedOption?: string; animateIn?: boolean; onSelect?: (option: string) => void }) {
  const [appeared, setAppeared] = useState(!animateIn);

  useEffect(() => {
    if (animateIn) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAppeared(true);
        });
      });
    }
  }, [animateIn]);

  // If an option is selected, show confirmation style
  if (selectedOption) {
    return (
      <div className="px-3 py-1">
        {/* Options presented indicator */}
        <div className="flex items-center gap-1.5 mb-1.5 text-[13px] text-black/40">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M5 8L7 10L11 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <span>{options.length} options presented</span>
        </div>
        {/* Selected option bubble */}
        <div
          className="inline-block px-4 py-2.5 rounded-[18px] bg-[#E9E9EB]"
          style={{
            transform: appeared ? 'scale(1) translateY(0)' : 'scale(0.3) translate(-40px, 30px)',
            opacity: appeared ? 1 : 0,
            transition: 'transform 320ms cubic-bezier(0.22, 1.2, 0.36, 1), opacity 180ms ease-out',
            transformOrigin: 'bottom left',
          }}
        >
          <div className="text-[17px] leading-[22px] text-black font-medium" style={{ letterSpacing: '-0.24px' }}>
            {selectedOption}
          </div>
          <div className="text-[13px] text-black/50 mt-0.5">
            Selected Option
          </div>
        </div>
      </div>
    );
  }

  // Show options as selectable list (iMessage style)
  return (
    <div
      className="px-3 py-2"
      style={{
        opacity: appeared ? 1 : 0,
        transform: appeared ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 320ms cubic-bezier(0.22, 1.2, 0.36, 1)',
      }}
    >
      <div className="bg-[#E8E8ED] rounded-[18px] overflow-hidden">
        {options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => onSelect?.(option)}
            className="w-full px-4 py-3 text-[17px] leading-[22px] text-left text-[#007AFF] hover:bg-[#D8D8DD] transition-colors cursor-pointer"
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

// Phone input bubble with auto-formatting
function PhoneInputBubble({ appeared }: { appeared: boolean }) {
  const [phone, setPhone] = useState('');

  const formatPhone = (value: string, isDeleting: boolean) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as XXX-XXX-XXXX
    if (digits.length < 3) {
      return digits;
    } else if (digits.length === 3) {
      // Only add dash if not deleting
      return isDeleting ? digits : `${digits}-`;
    } else if (digits.length < 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length === 6) {
      // Only add dash if not deleting
      return isDeleting ? `${digits.slice(0, 3)}-${digits.slice(3)}` : `${digits.slice(0, 3)}-${digits.slice(3)}-`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const isDeleting = newValue.length < phone.length;
    const formatted = formatPhone(newValue, isDeleting);
    setPhone(formatted);
  };

  return (
    <div
      className="px-3 py-2 relative z-10"
      style={{
        opacity: appeared ? 1 : 0,
        transform: appeared ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 320ms cubic-bezier(0.22, 1.2, 0.36, 1)',
      }}
    >
      <div className="inline-flex items-center bg-white rounded-[22px] shadow-sm border border-black/10 overflow-hidden">
        <div className="flex items-center px-4 py-2.5">
          <span className="mr-1.5 text-[20px]">🇺🇸</span>
          <span className="text-black text-[20px] leading-[25px] font-medium mr-2">+1</span>
          <input
            type="tel"
            value={phone}
            onChange={handleChange}
            onClick={(e) => e.stopPropagation()}
            placeholder="drop your number"
            maxLength={12}
            className="w-[269px] text-black placeholder:text-black/40 text-[20px] leading-[25px] focus:outline-none bg-transparent cursor-text"
            style={{ letterSpacing: '-0.24px' }}
          />
        </div>
      </div>
    </div>
  );
}

// Typing indicator component
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

// Scroll-triggered typing animation wrapper
function ScrollTypingReveal({ children, isMe = false, delay = 0 }: { children: React.ReactNode; isMe?: boolean; delay?: number }) {
  const [phase, setPhase] = useState<'hidden' | 'typing' | 'revealed'>('hidden');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && phase === 'hidden') {
            setTimeout(() => {
              setPhase('typing');
              setTimeout(() => {
                setPhase('revealed');
              }, 800);
            }, delay);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [phase, delay]);

  return (
    <div ref={ref}>
      {phase === 'hidden' && <div style={{ opacity: 0 }}>{children}</div>}
      {phase === 'typing' && (
        <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`${isMe ? 'bg-[#0A7CFF]' : 'bg-[#E9E9EB]'} px-3.5 py-2.5 rounded-[20px] flex gap-1.5`}
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
      )}
      {phase === 'revealed' && (
        <div style={{ animation: 'fadeIn 0.3s ease-out forwards' }}>
          {children}
        </div>
      )}
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
        requestAnimationFrame(() => {
          setAppeared(true);
        });
      });
    }
  }, [item.animateIn]);

  if (item.typing) {
    return <TypingBubble isMe={isMe} />;
  }

  if (item.options) {
    return <OptionsBubble options={item.options} selectedOption={item.selectedOption} animateIn={item.animateIn} onSelect={item.onSelect} />;
  }

  if (item.image) {
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
        <div
          className="max-w-[82%] rounded-[18px] overflow-hidden bg-[#E9E9EB]"
          style={{
            transform: appeared
              ? 'scale(1) translateY(0)'
              : `scale(0.4) translate(${isMe ? 40 : -40}px, 20px)`,
            opacity: appeared ? 1 : 0,
            transition: 'transform 320ms cubic-bezier(0.22, 1.2, 0.36, 1), opacity 180ms ease-out',
            transformOrigin: isMe ? 'bottom right' : 'bottom left',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <img
            src={item.image}
            alt={item.imageAlt || ''}
            className="block w-[406px] h-auto object-cover"
          />
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
            transform: appeared
              ? 'scale(1) translateY(0)'
              : `scale(0.4) translate(${isMe ? 40 : -40}px, 20px)`,
            opacity: appeared ? 1 : 0,
            transition: 'transform 320ms cubic-bezier(0.22, 1.2, 0.36, 1), opacity 180ms ease-out',
            transformOrigin: isMe ? 'bottom right' : 'bottom left',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            textDecoration: 'none',
          }}
        >
          <img
            src={item.link.thumbnail}
            alt={item.link.title}
            className="block w-[300px] h-[168px] object-cover"
          />
          <div className="px-3 py-2">
            <p className="text-[15px] font-semibold text-black leading-tight">{item.link.title}</p>
            <p className="text-[13px] text-black/60">{item.link.subtitle}</p>
            <p className="text-[12px] text-black/40 mt-0.5">youtube.com</p>
          </div>
        </a>
      </div>
    );
  }

  if (item.phoneInput) {
    return <PhoneInputBubble appeared={appeared} />;
  }

  if (item.sendButton) {
    return (
      <div
        className="px-3 py-2"
        style={{
          opacity: appeared ? 1 : 0,
          transform: appeared ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all 320ms cubic-bezier(0.22, 1.2, 0.36, 1)',
        }}
      >
        <div className="bg-[#007AFF] rounded-[22px] overflow-hidden inline-block hover:bg-black transition-colors group">
          <button
            className="w-full px-4 py-2.5 text-[20px] leading-[25px] text-left text-white cursor-pointer"
            style={{ letterSpacing: '-0.24px' }}
          >
            Send me one
          </button>
        </div>
        <div className="mt-2 max-w-[82%] px-4 py-2.5 rounded-[22px] bg-[#E9E9EB]">
          <p className="text-[12px] leading-[16px] text-black/60 italic">By continuing, you agree to our <a href="/legal/mobile-terms" className="underline hover:text-black/80">Terms of Service</a> and <a href="/legal/privacy-policy" className="underline hover:text-black/80">Privacy Policy</a>.</p>
        </div>
      </div>
    );
  }

  if (item.orangeBubble) {
    return (
      <div className={`flex justify-start px-3 py-0.5`}>
        <div
          className="max-w-[82%] px-4 py-2.5 rounded-[22px] relative"
          style={{
            background: '#000',
            color: '#fff',
            transform: appeared
              ? 'scale(1) translateY(0)'
              : 'scale(0.3) translate(-40px, 30px)',
            opacity: appeared ? 1 : 0,
            transition: 'transform 320ms cubic-bezier(0.22, 1.2, 0.36, 1), opacity 180ms ease-out',
            transformOrigin: 'bottom left',
            letterSpacing: '-0.24px',
            whiteSpace: 'pre-line',
          }}
        >
          <p className="text-[20px] leading-[25px]">{item.orangeBubble}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} px-3 py-0.5`}>
      <div
        className="max-w-[82%] px-4 py-2.5 rounded-[22px] relative text-[20px] leading-[25px]"
        style={{
          background: isMe
            ? 'linear-gradient(180deg, #2B8AFA, #0A7CFF)'
            : '#E9E9EB',
          color: isMe ? '#fff' : '#000',
          transform: appeared
            ? 'scale(1) translateY(0)'
            : `scale(0.3) translate(${isMe ? 40 : -40}px, 30px)`,
          opacity: appeared ? 1 : 0,
          transition: 'transform 320ms cubic-bezier(0.22, 1.2, 0.36, 1), opacity 180ms ease-out',
          transformOrigin: isMe ? 'bottom right' : 'bottom left',
          boxShadow: isMe ? '0 1px 1px rgba(10,124,255,0.15)' : 'none',
          letterSpacing: '-0.24px',
          whiteSpace: 'pre-line',
        }}
      >
        {item.html ? (
          <span dangerouslySetInnerHTML={{ __html: item.html }} />
        ) : (
          item.text
        )}
      </div>
    </div>
  );
}

// Animated messages container
function AnimatedMessages() {
  const [items, setItems] = useState<MessageItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [userInput, setUserInput] = useState('');
  const keyRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const hasStartedRef = useRef(false);
  const nextKey = () => ++keyRef.current;

  // Auto-scroll to bottom when items change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [items]);

  const recomputeTails = (arr: MessageItem[]): MessageItem[] => {
    return arr.map((cur, i) => {
      if (cur.typing) return { ...cur };
      const next = arr.slice(i + 1).find(x => !x.typing);
      const tailed = !next || next.side !== cur.side;
      return { ...cur, tailed };
    });
  };

  const runAllSequences = async () => {
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

    setIsRunning(true);
    await sleep(500);

    for (let seqIdx = 0; seqIdx < SCRIPTS.length; seqIdx++) {
      const SCRIPT = SCRIPTS[seqIdx];

      for (let stepIdx = 0; stepIdx < SCRIPT.length; stepIdx++) {
        const step = SCRIPT[stepIdx];
        const side: 'left' | 'right' = step.side === 'me' ? 'right' : 'left';

        // Handle options specially
        if (step.options) {
          // First show the options and wait for user selection
          const optionsKey = nextKey();
          const selectedOption = await new Promise<string>((resolve) => {
            setItems(prev => recomputeTails([
              ...prev,
              {
                _key: optionsKey,
                side: 'left',
                options: step.options,
                animateIn: true,
                onSelect: (option: string) => resolve(option)
              },
            ]));
          });

          // Show the selected option
          setItems(prev => {
            return prev.map(item =>
              item._key === optionsKey
                ? { ...item, selectedOption, onSelect: undefined, animateIn: true }
                : item
            );
          });
          await sleep(PAUSE_AFTER_ME);

          // Show response based on selected option
          const responseMessages = OPTION_RESPONSES[selectedOption];
          if (responseMessages) {
            for (const msg of responseMessages) {
              // Skip sendButton - it's handled together with phoneInput
              if (msg.sendButton) {
                continue;
              }

              const typingKey = nextKey();
              setItems(prev => recomputeTails([
                ...prev,
                { _key: typingKey, side: 'left', typing: true },
              ]));
              await sleep(msg.image ? 800 : TYPING_BEFORE);

              const msgKey = nextKey();
              setItems(prev => {
                const withoutTyping = prev.filter(m => m._key !== typingKey);
                if (msg.image) {
                  return recomputeTails([...withoutTyping, { _key: msgKey, side: 'left', image: msg.image, animateIn: true }]);
                } else if (msg.link) {
                  return recomputeTails([...withoutTyping, { _key: msgKey, side: 'left', link: msg.link, animateIn: true }]);
                } else if (msg.orangeBubble) {
                  return recomputeTails([...withoutTyping, { _key: msgKey, side: 'left', orangeBubble: msg.orangeBubble, animateIn: true }]);
                } else if (msg.phoneInput) {
                  // Show phoneInput and sendButton together
                  const sendButtonKey = nextKey();
                  return recomputeTails([
                    ...withoutTyping,
                    { _key: msgKey, side: 'left', phoneInput: true, animateIn: true },
                    { _key: sendButtonKey, side: 'left', sendButton: true, animateIn: true }
                  ]);
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
        setItems(prev => recomputeTails([
          ...prev,
          { _key: typingKey, side, typing: true },
        ]));
        await sleep(TYPING_BEFORE);

        const bubbleKey = nextKey();
        setItems(prev => {
          const withoutTyping = prev.filter(m => m._key !== typingKey);
          let newItem: MessageItem;
          if (step.image) {
            newItem = { _key: bubbleKey, side, image: step.image, imageAlt: step.imageAlt, animateIn: true };
          } else if (step.html) {
            newItem = { _key: bubbleKey, side, html: step.html, animateIn: true };
          } else {
            newItem = { _key: bubbleKey, side, text: step.text, animateIn: true };
          }
          return recomputeTails([...withoutTyping, newItem]);
        });

        const pause = step.side === 'me' ? PAUSE_AFTER_ME : PAUSE_AFTER_THEM;
        await sleep(pause);
      }

      // Pause between sequences
      if (seqIdx < SCRIPTS.length - 1) {
        await sleep(2000);
      }
    }

    setIsRunning(false);
  };

  // Start all sequences on mount (with guard to prevent double execution in Strict Mode)
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

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapperRef} className="flex flex-col h-[508px]">
      <div ref={containerRef} className="flex-1 flex flex-col py-4 overflow-y-auto scroll-smooth">
        {/* iMessage indicator */}
        <p className="text-center text-[11px] text-black/40 mb-2">iMessage · Today 10:24 AM</p>

        {items.map(item => (
          <MessageBubble key={item._key} item={item} />
        ))}
      </div>

    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'digital' | 'physical'>('digital');
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [visibleCell, setVisibleCell] = useState<number | null>(null);
  const [clientImageIndex, setClientImageIndex] = useState(0);
  const [voicemailImageIndex, setVoicemailImageIndex] = useState(11);
  const [stwlImageIndex, setStwlImageIndex] = useState(0);
  const [quirksTypedText, setQuirksTypedText] = useState("");
  const [lmsyImageIndex, setLmsyImageIndex] = useState(0);
  const [physicalPreviewIndex, setPhysicalPreviewIndex] = useState(0);
  const [visibleTiles, setVisibleTiles] = useState<Set<number>>(new Set());
  const [heroHeight, setHeroHeight] = useState(0);
  const [showFixedButtons, setShowFixedButtons] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [howItWorksOpen, setHowItWorksOpen] = useState(true);
  const [whyOpen, setWhyOpen] = useState(true);
  const [faqsOpen, setFaqsOpen] = useState(true);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  const rotatingQuestions = [
    "...",
    "What's a random story from your life you like telling people?",
    "...",
    "What's the best compliment you've ever gotten?",
    "...",
    "Tell us one thing about you that sounds made up but is true."
  ];
  const heroRef = useRef<HTMLDivElement>(null);
  const hotlineSectionRef = useRef<HTMLDivElement>(null);

  // Detect touch device
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);
  }, []);

  // Rotate through onboarding questions
  useEffect(() => {
    const questions = [
      "...",
      "What's a random story from your life you like telling people?",
      "...",
      "What's the best compliment you've ever gotten?",
      "...",
      "Tell us one thing about you that sounds made up but is true."
    ];
    const isTypingDots = questions[questionIndex] === "...";
    const delay = isTypingDots ? 800 : 2500;
    const timeout = setTimeout(() => {
      setQuestionIndex((prev) => (prev + 1) % questions.length);
    }, delay);
    return () => clearTimeout(timeout);
  }, [questionIndex]);


  // Measure hero height for container positioning
  useEffect(() => {
    const measureHero = () => {
      if (heroRef.current) {
        setHeroHeight(heroRef.current.offsetHeight);
      }
    };
    measureHero();
    window.addEventListener('resize', measureHero);
    return () => window.removeEventListener('resize', measureHero);
  }, []);

  // Track hotline section visibility for fixed buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activeTab !== 'digital') {
      setShowFixedButtons(false);
      return;
    }

    let observer: IntersectionObserver | null = null;

    // Small delay to ensure ref is attached
    const timer = setTimeout(() => {
      if (!hotlineSectionRef.current) return;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Show buttons when section is at least 50% visible
            setShowFixedButtons(entry.isIntersecting && entry.intersectionRatio >= 0.3);
          });
        },
        { threshold: [0, 0.3, 0.5, 0.7, 1] }
      );

      observer.observe(hotlineSectionRef.current);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, [activeTab]);

  // Intersection observer for mobile dance animation
  useEffect(() => {
    if (typeof window === 'undefined' || !isTouchDevice) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = cellRefs.current.findIndex(ref => ref === entry.target);
            if (index !== -1) setVisibleCell(index);
          }
        });
      },
      { threshold: 0.6, rootMargin: '0px' }
    );

    const refs = cellRefs.current.filter(Boolean);
    refs.forEach((ref) => observer.observe(ref!));

    return () => observer.disconnect();
  }, [isTouchDevice]);

  // Intersection observer for lazy loading videos
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cellRefs.current.findIndex(ref => ref === entry.target);
            if (index !== -1) {
              setVisibleTiles(prev => new Set(prev).add(index));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const refs = cellRefs.current.filter(Boolean);
    refs.forEach((ref) => observer.observe(ref!));

    return () => observer.disconnect();
  }, []);

  // Client work image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setClientImageIndex((prev) => (prev + 1) % 2);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // STWL cover image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setStwlImageIndex((prev) => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // LMSY cover image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setLmsyImageIndex((prev) => (prev + 1) % 5);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  // Physical preview rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setPhysicalPreviewIndex((prev) => (prev + 1) % 2);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Quirks typing animation
  useEffect(() => {
    const fullText = `My grandpa doesn't know\nhow to talk to tall people\nHe thinks\nthey can't hear him\nSo he screams\nthe whole time`;
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index <= fullText.length) {
        setQuirksTypedText(fullText.slice(0, index));
        index++;
      } else {
        setTimeout(() => {
          index = 0;
          setQuirksTypedText("");
        }, 2000);
      }
    }, 50);
    return () => clearInterval(typeInterval);
  }, []);

  // Voicemail cover image rotation
  useEffect(() => {
    const delay = voicemailImageIndex >= 9 ? 135 : voicemailImageIndex === 8 ? 900 : voicemailImageIndex >= 6 ? 180 : voicemailImageIndex === 5 ? 900 : voicemailImageIndex >= 3 ? 270 : voicemailImageIndex === 2 ? 900 : voicemailImageIndex === 1 ? 1800 : 450;
    const timeoutId = setTimeout(() => {
      setVoicemailImageIndex((prev) => (prev === 1 ? 11 : prev - 1));
    }, delay);
    return () => clearTimeout(timeoutId);
  }, [voicemailImageIndex]);

  
  return (
    <>
      <main className="min-h-screen" style={{ backgroundColor: '#F2F2F2' }}>
        {/* Hero Section - THIS IS IT! (Fixed Background) */}
        <div
          className="fixed top-0 left-0 right-0 w-full h-screen pt-[130px] md:pt-[135px] lg:pt-[145px] pb-12"
          style={{
            backgroundColor: '#F2F2F2',
            zIndex: 0,
          }}
        >
          <div ref={heroRef} className="container mx-auto px-6">
            {/* Large Title Section */}
            <div className="text-center mb-0 mt-3 flex justify-start sm:justify-center">
              <h1 className="text-[36vw] sm:text-[19vw] font-bold leading-[0.85] sm:leading-none tracking-tight font-[family-name:var(--font-abril-fatface)] text-left sm:text-center" style={{ color: '#F8330D' }}>
                {/* Mobile layout */}
                <span className="sm:hidden block">
                  THIS<br/>IS<br/>
                  IT!
                </span>
                {/* Desktop layout */}
                <span className="hidden sm:inline whitespace-nowrap">THIS IS IT!</span>
              </h1>
            </div>

            {/* Subtitle */}
            <div className="text-left sm:text-center mb-4 sm:mb-3 -mt-2 py-2">
              <h2 className="text-[22px] sm:text-3xl lg:text-[33px] font-bold text-black font-[family-name:var(--font-abril-fatface)]">a sort of art company</h2>
            </div>

          </div>
        </div>

        {/* Navigation Header - Fixed on hero level */}
        <div
          className="fixed left-0 right-0 px-6 sm:px-12 z-0"
          style={{
            top: heroHeight > 0 ? `${heroHeight + 180}px` : '45vh',
          }}
        >
          <div className="flex justify-center items-center pb-4">
            {/* Tab buttons - centered */}
            <div className="flex gap-3 sm:gap-4 items-center">
              <button
                onClick={() => setActiveTab('digital')}
                className={`px-5 py-2.5 sm:px-6 sm:py-3 text-[14px] sm:text-[15px] font-semibold transition-colors font-[family-name:var(--font-inter)] rounded-full ${activeTab === 'digital' ? 'bg-black text-white' : 'bg-[#E9E9EB] text-black hover:bg-[#DDDDE0]'}`}
              >
                Digital Things
              </button>
              <button
                onClick={() => setActiveTab('physical')}
                className={`px-5 py-2.5 sm:px-6 sm:py-3 text-[14px] sm:text-[15px] font-semibold transition-colors font-[family-name:var(--font-inter)] rounded-full ${activeTab === 'physical' ? 'bg-black text-white' : 'bg-[#E9E9EB] text-black hover:bg-[#DDDDE0]'}`}
              >
                Physical Things
              </button>
            </div>
          </div>
        </div>

        {/* Scrolling Content Container */}
        <div
          className="relative pt-6"
          style={{
            backgroundColor: '#F2F2F2',
            zIndex: 1,
            minHeight: '100vh',
            marginTop: heroHeight > 0 ? `${heroHeight + 260}px` : '53vh',
          }}
        >
          {/* Squiggly line at top of container */}
          <svg
            className="absolute -top-2 left-0 w-full h-6 overflow-visible z-10"
            preserveAspectRatio="none"
            viewBox="0 0 1920 20"
          >
            <path
              d="M0,10 C15,6 25,14 45,9 C65,4 80,15 105,11 C130,7 145,13 170,8 C195,3 215,16 240,10 C265,4 285,14 310,9 C335,4 360,15 385,11 C410,7 430,12 455,8 C480,4 505,16 530,10 C555,4 575,13 600,9 C625,5 650,15 675,11 C700,7 720,13 745,8 C770,3 795,16 820,10 C845,4 870,14 895,9 C920,4 940,15 965,11 C990,7 1015,12 1040,8 C1065,4 1085,16 1110,10 C1135,4 1160,13 1185,9 C1210,5 1230,15 1255,11 C1280,7 1305,13 1330,8 C1355,3 1375,16 1400,10 C1425,4 1450,14 1475,9 C1500,4 1520,15 1545,11 C1570,7 1595,12 1620,8 C1645,4 1665,16 1690,10 C1715,4 1740,13 1765,9 C1790,5 1810,15 1835,11 C1860,7 1885,13 1910,9 L1920,10"
              stroke="white"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

        {/* Tab Content Container */}
        {activeTab === 'digital' && (
          <div ref={hotlineSectionRef} className="container mx-auto px-6 sm:px-8 md:px-12 py-6 md:py-8" style={{ backgroundColor: '#F2F2F2' }}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-[1400px] mx-auto items-center">

              {/* Left Column - Header */}
              <div className="flex flex-col items-center xl:items-start justify-center">
                <div className="mb-2">
                  <p className="text-xl sm:text-2xl md:text-3xl font-[family-name:var(--font-instrument-serif)] text-black tracking-wide text-left ml-1">The</p>
                  <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-[6.6rem] 2xl:text-9xl font-bold font-[family-name:var(--font-instrument-serif)] text-black tracking-wide -mt-2 text-left">Stranger Texts Club</h2>
                </div>
                <p className="text-xl text-black/70 italic font-[family-name:var(--font-inter)] mb-4 text-center xl:text-left">Try it for free • Cancel anytime</p>
                <p className="text-[18px] sm:text-[22px] md:text-[22px] lg:text-[27px] font-[family-name:var(--font-inter)] text-black/70 text-center xl:text-left mb-6" style={{ letterSpacing: '-0.5px' }}>
                  The best things in life come from other people. <b>You get inspired, you feel seen, you fall in love.</b> Try us and we'll show you.
                </p>
                <div className="flex flex-col gap-3">
                  <div className="inline-block">
                    {/* Waitlist Form */}
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const form = e.target as HTMLFormElement;
                        const phoneInput = form.querySelector('input[name="phone"]') as HTMLInputElement;
                        const button = form.querySelector('button') as HTMLButtonElement;
                        const messageEl = form.querySelector('.waitlist-message') as HTMLParagraphElement;

                        if (!phoneInput.value) return;

                        button.disabled = true;
                        button.textContent = '...';

                        try {
                          const res = await fetch('/api/linq/onboard', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ phoneNumber: phoneInput.value }),
                          });
                          const data = await res.json();

                          if (data.success) {
                            phoneInput.value = '';
                            button.textContent = "You're in!";
                            button.className = button.className.replace('bg-[#dcff73]', 'bg-green-400');
                            if (messageEl) messageEl.textContent = data.message;
                          } else {
                            button.textContent = 'Join Waitlist';
                            button.disabled = false;
                            if (messageEl) messageEl.textContent = data.error || 'Something went wrong';
                          }
                        } catch {
                          button.textContent = 'Join Waitlist';
                          button.disabled = false;
                          if (messageEl) messageEl.textContent = 'Something went wrong';
                        }
                      }}
                      className="flex flex-wrap items-center gap-3"
                    >
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[17px]">🇺🇸</span>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="(000) 000-0000"
                          maxLength={14}
                          onKeyDown={(e) => {
                            const input = e.target as HTMLInputElement;
                            if (e.key === 'Backspace') {
                              const pos = input.selectionStart || 0;
                              // If cursor is right after a formatting character, move it back
                              if (pos > 0 && [') ', ' ', '-', '('].includes(input.value.substring(pos - 1, pos + 1).trim() ? input.value[pos - 1] : '')) {
                                // Let default backspace handle it
                              }
                            }
                          }}
                          onChange={(e) => {
                            const input = e.target;
                            const cursorPos = input.selectionStart || 0;
                            const prevLen = input.value.length;

                            let value = input.value.replace(/\D/g, '');
                            if (value.length > 10) value = value.slice(0, 10);

                            let formatted = '';
                            if (value.length >= 6) {
                              formatted = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
                            } else if (value.length >= 3) {
                              formatted = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                            } else if (value.length > 0) {
                              formatted = `(${value}`;
                            }

                            input.value = formatted;

                            // Adjust cursor position
                            const newLen = formatted.length;
                            const diff = newLen - prevLen;
                            const newPos = Math.max(0, cursorPos + diff);
                            input.setSelectionRange(newPos, newPos);
                          }}
                          className="pl-12 pr-5 py-3 text-[17px] text-black rounded-full border-2 border-black/20 focus:border-black focus:outline-none font-[family-name:var(--font-inter)] w-[220px]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center px-7 py-3 text-[17px] font-semibold rounded-full transition-all font-[family-name:var(--font-inter)] text-black bg-[#dcff73] hover:bg-black hover:text-white"
                      >
                        Join Waitlist
                      </button>
                    </form>
                    <p className="waitlist-message text-[14px] text-black/70 mt-2 font-[family-name:var(--font-inter)]"></p>
                    <p className="text-[12px] leading-[16px] text-black/60 italic mt-3">
                      By continuing, you agree to our <a href="/legal/mobile-terms" className="underline hover:text-black/80">Terms of Service</a> and <a href="/legal/privacy-policy" className="underline hover:text-black/80">Privacy Policy</a>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Phone Mockup */}
              <div className="w-full flex flex-col items-center">
                <p className="text-xl font-[family-name:var(--font-inter)] text-black/50 mb-4">Give it a try ↓</p>
                <div className="flex justify-center">
                {/* iPhone Frame */}
                <div className="rounded-[2.2rem] shadow-xl w-[436px] sm:w-[508px] md:w-[581px]">
                  {/* iPhone Notch Area */}
                  <div className="bg-[#f5f5f5] rounded-[2rem] overflow-hidden">
                    {/* Header with back, avatar, facetime */}
                    <div className="flex justify-between items-center px-4 py-3">
                      {/* Left: Blue chevron + 24 badge */}
                      <div className="flex items-center gap-1">
                        <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
                          <path d="M10 2L2 10L10 18" stroke="#0A7CFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="bg-[#0A7CFF] text-white px-2 py-0.5 rounded-full text-[11px] font-semibold">24</span>
                      </div>
                      {/* Center: Logo */}
                      <div className="flex items-center gap-2">
                        <div className="w-[52px] h-[52px] rounded-full overflow-hidden border-2 border-[#F8330D]">
                          <img src="/assets/logo.png" alt="RIAF!" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      {/* Right: FaceTime icon */}
                      <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
                        <rect x="1" y="2" width="18" height="16" rx="4" stroke="#0A7CFF" strokeWidth="2" fill="none"/>
                        <path d="M19 7L26 3V17L19 13" stroke="#0A7CFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    </div>

                    {/* Contact Name */}
                    <div className="text-center py-1 border-b border-black/10">
                      <div className="flex items-center justify-center gap-1">
                        <p className="font-semibold text-[13px] text-black">Rithika is a Fool!</p>
                        <svg width="8" height="12" viewBox="0 0 8 12" fill="none">
                          <path d="M2 2L6 6L2 10" stroke="#C7C7CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>

                    {/* Animated Messages Area */}
                    <AnimatedMessages />
                  </div>
                </div>
                </div>
              </div>


          </div>

          {/* How Does This Work Section */}
          <div className="py-12 md:py-16 px-6 sm:px-8 md:px-12" style={{ backgroundColor: '#F2F2F2' }}>
            <button
              onClick={() => setHowItWorksOpen(!howItWorksOpen)}
              className="w-full flex items-center justify-center gap-4 mb-12 cursor-pointer"
            >
              <h2 className="text-[3rem] sm:text-[3.75rem] md:text-[4.5rem] font-bold font-[family-name:var(--font-instrument-serif)] text-black text-center">
                <i>Woah</i>, how does this work?
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
              {/* Row 1: Step 1 + Welcome message */}
              <div className="bg-white/20 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 items-start">
                <div>
                  <p className="text-xl font-semibold text-black/50 mb-1 font-[family-name:var(--font-inter)]">Step 1</p>
                  <p className="text-base sm:text-xl font-[family-name:var(--font-inter)] text-black tracking-tight">
                  When you sign up, we first try to <span className="bg-[#dcff73] px-1 rounded"><b>get to know you</b></span>. This helps us create your profile and match you.
                </p>
                </div>
                <div>
                  <motion.div
                    className="flex justify-start mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                      <p className="text-[19px] text-black leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                        We're pretty excited you're here and we want to get to know you.
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex justify-start mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <motion.div
                      key={questionIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
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
                        <p className="text-[19px] text-black leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                          {rotatingQuestions[questionIndex]}
                        </p>
                      )}
                    </motion.div>
                  </motion.div>
                </div>
              </div>
              </div>

              {/* Row 2: Step 2 + Sunday matching message */}
              <div className="bg-white/20 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 items-start">
                <div>
                  <p className="text-xl font-semibold text-black/50 mb-1 font-[family-name:var(--font-inter)]">Step 2</p>
                  <p className="text-base sm:text-xl font-[family-name:var(--font-inter)] text-black tracking-tight">
                  Each week, you're <span className="bg-[#dcff73] px-1 rounded"><b>paired with a new stranger</b></span> and get a little glimpse of who they are.
                </p>
                </div>
                <div>
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                      <p className="text-[19px] text-black leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                        This week, you've been matched with someone who:
                      </p>
                      <p className="text-[19px] text-black leading-relaxed mt-2 italic" style={{ letterSpacing: '-0.24px' }}>
                        - is 48 and an ER nurse in Philadelphia<br />
                        - once drove 6 hours for a sandwich<br />
                        - has married the same person twice
                      </p>
                      <p className="text-[19px] text-black leading-relaxed mt-2" style={{ letterSpacing: '-0.24px' }}>
                        They'll be your partner for the week.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
              </div>

              {/* Row 3: Step 3 + Monday prompt */}
              <div className="bg-white/20 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 items-start">
                <div>
                  <p className="text-xl font-semibold text-black/50 mb-1 font-[family-name:var(--font-inter)]">Step 3</p>
                  <p className="text-base sm:text-xl font-[family-name:var(--font-inter)] text-black tracking-tight">
                  Through the week, we <span className="bg-[#dcff73] px-1 rounded"><b>guide you through three creative prompts</b></span>. For each one, you'll have 24 hours to reply.
                </p>
                </div>
                <div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-center text-[13px] text-black/40 mb-2">Monday 9:00 AM</p>
                  </motion.div>
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                      <p className="text-[19px] text-black leading-relaxed font-semibold" style={{ letterSpacing: '-0.24px' }}>
                        Today's Prompt:
                      </p>
                      <p className="text-[19px] text-black leading-relaxed mt-2" style={{ letterSpacing: '-0.24px' }}>
                        Bob Marley once said <i>"One good thing about music, when it hits you, you feel no pain."</i> Tell us about a <b>song that's helped you process something hard</b> in your life.
                      </p>
                      <p className="text-[19px] text-black leading-relaxed mt-3" style={{ letterSpacing: '-0.24px' }}>
                        Reply within 24 hours to receive a response.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
              </div>

              {/* Row 4: Step 4 + Review messages */}
              <div className="bg-white/20 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 items-start">
                <div>
                  <p className="text-xl font-semibold text-black/50 mb-1 font-[family-name:var(--font-inter)]">Step 4</p>
                  <p className="text-base sm:text-xl font-[family-name:var(--font-inter)] text-black tracking-tight">
                  We <span className="bg-[#dcff73] px-1 rounded"><b>review responses</b></span> to try to keep things thoughtful and safe from a quality perspective.
                </p>
                </div>
                <div>
                  <motion.div
                    className="flex justify-end mb-3"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="rounded-[20px] px-5 py-2.5" style={{ background: 'linear-gradient(180deg, #2B8AFA, #0A7CFF)' }}>
                      <p className="text-[19px] text-white" style={{ letterSpacing: '-0.24px' }}>
                        Blah blah, just give me theirs.
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                      <p className="text-[19px] text-black leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                        Hmm, this doesn't seem like it answers the prompt. Can you try again?
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
              </div>

              {/* Row 5: Step 5 + Their response */}
              <div className="bg-white/20 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 items-start">
                <div>
                  <p className="text-xl font-semibold text-black/50 mb-1 font-[family-name:var(--font-inter)]">Step 5</p>
                  <p className="text-base sm:text-xl font-[family-name:var(--font-inter)] text-black tracking-tight">
                  We <span className="bg-[#dcff73] px-1 rounded"><b>send you their response</b></span>. If your match didn't reply, we'll still send you something meaningful.
                </p>
                </div>
                <div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-center text-[13px] text-black/40 mb-2">Tuesday 9:00 AM</p>
                  </motion.div>
                  <motion.div
                    className="flex justify-start mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                      <p className="text-[19px] text-black leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                        Here's your match's response:
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex justify-start mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <a
                      href="https://www.youtube.com/watch?v=8xinW_OKLeY"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-[18px] overflow-hidden bg-[#E9E9EB] hover:bg-[#DDDDE0] transition-colors cursor-pointer"
                      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                    >
                      <img
                        src="https://img.youtube.com/vi/8xinW_OKLeY/hqdefault.jpg"
                        alt="Where Are You Now"
                        className="block w-[300px] h-[168px] object-cover"
                      />
                      <div className="px-3 py-2">
                        <p className="text-[15px] font-semibold text-black leading-tight">Where Are You Now</p>
                        <p className="text-[13px] text-black/60">Mumford & Sons</p>
                        <p className="text-[12px] text-black/40 mt-0.5">youtube.com</p>
                      </div>
                    </a>
                  </motion.div>
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                  >
                    <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                      <p className="text-[19px] text-black leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                        I was 21 the first time I saw a patient die on my shift. You could just tell that they were a good person. She kept thanking me for small things like bringing her water. I was numb and I kept listening to this song on repeat. It helped.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
              </div>

              {/* Row 6: Step 6 + Friday poll */}
              <div className="bg-white/20 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 items-start">
                <div>
                  <p className="text-xl font-semibold text-black/50 mb-1 font-[family-name:var(--font-inter)]">Step 6</p>
                  <p className="text-base sm:text-xl font-[family-name:var(--font-inter)] text-black tracking-tight">
                  At the end of the week, you can <span className="bg-[#dcff73] px-1 rounded"><b>choose to connect for real</b></span>. We'll only share contact information if you <b>both agree</b>.
                </p>
                </div>
                <div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-center text-[13px] text-black/40 mb-2">Friday 9:00 AM</p>
                  </motion.div>
                  <motion.div
                    className="flex justify-start mb-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                      <p className="text-[19px] text-black leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                        That's it for this week. Want to share your contact if they feel the same?
                      </p>
                    </div>
                  </motion.div>
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    <div className="bg-[#E8E8ED] rounded-[18px] overflow-hidden">
                      <button className="w-full px-4 py-3 text-[17px] text-left text-[#007AFF] border-b border-black/10 hover:bg-[#D8D8DD] transition-colors cursor-pointer" style={{ letterSpacing: '-0.24px' }}>
                        Yes, they're cool
                      </button>
                      <button className="w-full px-4 py-3 text-[17px] text-left text-[#007AFF] hover:bg-[#D8D8DD] transition-colors cursor-pointer" style={{ letterSpacing: '-0.24px' }}>
                        Nah, not feeling it this week
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>
              </div>

              {/* Row 7: Step 7 + Next week message */}
              <div className="bg-white/20 rounded-2xl p-6 md:p-8 shadow-sm">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 xl:gap-16 items-start">
                <div>
                  <p className="text-xl font-semibold text-black/50 mb-1 font-[family-name:var(--font-inter)]">Step 7</p>
                  <p className="text-base sm:text-xl font-[family-name:var(--font-inter)] text-black tracking-tight">
                  Then we <b>do it again!</b>
                </p>
                </div>
                <div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-center text-[13px] text-black/40 mb-2">Saturday 11:00 AM</p>
                  </motion.div>
                  <motion.div
                    className="flex justify-start"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5 max-w-[90%]">
                      <p className="text-[19px] text-black leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                        We'll be back tomorrow with next week's match.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
              </div>
            </div>
            </motion.div>
          </div>

          {/* Why Section */}
          <div className="pt-2 pb-12 md:pt-4 md:pb-16 px-6 sm:px-8 md:px-12" style={{ backgroundColor: '#F2F2F2' }}>
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
                  <p className="text-[17px] sm:text-[19px] text-black leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                    Other people make us better.
                  </p>
                </div>
                <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5">
                  <p className="text-[17px] sm:text-[19px] text-black leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                    And I wanted a <b>different way to meet and feel connected to them</b>. Social media can be overwhelming and addictive and demanding. This is my attempt at creating something that feels spontaneous and light but also impactful.
                  </p>
                </div>
                <div className="bg-[#E9E9EB] rounded-[24px] px-6 py-5">
                  <p className="text-[17px] sm:text-[19px] text-black leading-relaxed" style={{ letterSpacing: '-0.24px' }}>
                    <span className="bg-[#dcff73] px-1 rounded"><b>If you have ideas</b></span> on how to make this better, please do <b>send me <a href="/connect" className="text-blue-600 hover:text-blue-800">feedback</a></b>. I would be grateful.
                  </p>
                </div>
              </div>
            </div>
            </motion.div>
          </div>

          {/* FAQs Section */}
          <div className="pt-2 pb-12 md:pt-4 md:pb-16 px-6 sm:px-8 md:px-12" style={{ backgroundColor: '#F2F2F2' }}>
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

          {/* Squiggly line divider */}
          <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen py-8">
            <svg width="100%" height="20" viewBox="0 0 1200 20" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 10 Q 15 0, 30 10 T 60 10 T 90 10 T 120 10 T 150 10 T 180 10 T 210 10 T 240 10 T 270 10 T 300 10 T 330 10 T 360 10 T 390 10 T 420 10 T 450 10 T 480 10 T 510 10 T 540 10 T 570 10 T 600 10 T 630 10 T 660 10 T 690 10 T 720 10 T 750 10 T 780 10 T 810 10 T 840 10 T 870 10 T 900 10 T 930 10 T 960 10 T 990 10 T 1020 10 T 1050 10 T 1080 10 T 1110 10 T 1140 10 T 1170 10 T 1200 10" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Physical Things CTA */}
          <div className="pt-6 md:pt-8 pb-16 md:pb-24 px-6 text-center" style={{ backgroundColor: '#F2F2F2' }}>
            <div className="flex flex-col items-center">
              <p className="text-xl sm:text-2xl font-[family-name:var(--font-inter)] text-black/80 mb-8 max-w-[600px] mx-auto italic">
                <span className="bg-[#dcff73] px-1 rounded"><b>Pretty sweet of you</b></span> to look through our digital things. If you're feeling extra sweet, check out our <b>physical products</b> too.
              </p>
              <button
                onClick={() => { setActiveTab('physical'); window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); }}
                className="px-10 py-4 text-[17px] font-semibold rounded-full transition-all font-[family-name:var(--font-inter)] text-black bg-[#dcff73] hover:bg-black hover:text-white"
              >
                Check them out
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Physical Things Tab Content */}
        {activeTab === 'physical' && (
          <div className="relative" style={{ backgroundColor: '#F2F2F2' }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 relative z-10">
              {projects.filter(p => p.category === 'physical').map((project, index) => (
                <Link
                  key={index}
                  href={project.link}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group aspect-[4/5] flex items-center justify-center p-6 cursor-pointer bg-[#F2F2F2] hover:bg-white transition-colors duration-150 ease-out relative overflow-hidden"
                  >
                    {project.hasCover === "hat" && (
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 flex items-end justify-center">
                          <div className="relative" style={{ width: '85%', height: '85%' }}>
                            <img src="/assets/COTM/coverreal.webp" alt="Condition of the Month Hat" className="absolute inset-0 w-full h-full object-contain" />
                          </div>
                        </div>
                        <img src="/assets/shop/Shop Logo.png" alt="Shop Logo" className="absolute top-4 right-4 w-18 h-18 md:w-22 md:h-22 object-contain" />
                      </div>
                    )}
                    {project.hasCover === true && (
                      <div className="absolute inset-0">
                        <BouncingBallPoster imageScale={85} showLogo={true} />
                      </div>
                    )}
                    {project.hasCover === "lmsy" && (
                      <div className="absolute inset-0">
                        <div className="absolute inset-0 flex items-end justify-center px-6 pt-6 pb-0">
                          <img src="/assets/CCP/68.webp" alt="Let Me Show You" className="absolute w-[80%] h-[80%] object-contain object-bottom" />
                        </div>
                        <img src="/assets/shop/Shop Logo.png" alt="Shop Logo" className="absolute top-4 right-4 w-18 h-18 md:w-22 md:h-22 object-contain" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 top-0 flex justify-start pointer-events-none pt-8 px-6">
                      <span className="text-[1rem] sm:text-[1.3rem] md:text-[1.5rem] lg:text-[1.1rem] xl:text-[1.1rem] font-normal group-hover:font-bold text-black text-left max-w-[70%] font-[family-name:var(--font-inter)] tracking-tighter bg-white px-3 py-2 rounded-lg leading-tight shadow-md transition-[font-weight] duration-100 ease-out group-hover-dance" style={{ fontStretch: 'condensed' }}>
                        {project.title}
                      </span>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            {/* Squiggly line divider */}
            <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen py-8">
              <svg width="100%" height="20" viewBox="0 0 1200 20" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 10 Q 15 0, 30 10 T 60 10 T 90 10 T 120 10 T 150 10 T 180 10 T 210 10 T 240 10 T 270 10 T 300 10 T 330 10 T 360 10 T 390 10 T 420 10 T 450 10 T 480 10 T 510 10 T 540 10 T 570 10 T 600 10 T 630 10 T 660 10 T 690 10 T 720 10 T 750 10 T 780 10 T 810 10 T 840 10 T 870 10 T 900 10 T 930 10 T 960 10 T 990 10 T 1020 10 T 1050 10 T 1080 10 T 1110 10 T 1140 10 T 1170 10 T 1200 10" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Digital Things CTA */}
            <div className="pt-6 md:pt-8 pb-16 md:pb-24 px-6 text-center">
              <div className="flex flex-col items-center">
                <p className="text-xl sm:text-2xl font-[family-name:var(--font-inter)] text-black/80 mb-8 max-w-[600px] mx-auto italic">
                  Woo! Look at you browsing all our physical products. We've got <b>digital stuff</b> too, <span className="bg-[#dcff73] px-1 rounded"><b>if you're curious</b></span>.
                </p>
                <button
                  onClick={() => { setActiveTab('digital'); window.scrollTo({ top: 0, left: 0, behavior: 'smooth' }); }}
                  className="px-10 py-4 text-[17px] font-semibold rounded-full transition-all font-[family-name:var(--font-inter)] text-black bg-[#dcff73] hover:bg-black hover:text-white"
                >
                  I'm curious
                </button>
              </div>
            </div>
          </div>
        )}

        </div>{/* End Scrolling Content Container */}

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

      {/* Marquee Animation + Typing Animation */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 15s linear infinite;
        }
        @keyframes typingDot {
          0%, 60%, 100% { opacity: 0.35; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
        @keyframes typingBubbleIn {
          from { transform: scale(0.5) translateY(10px); opacity: 0; }
          to { transform: scale(1) translate(0,0); opacity: 1; }
        }
        @keyframes dance {
          0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
          20% { transform: translateY(-3px) rotate(-1.5deg) scale(1.02); }
          40% { transform: translateY(0) rotate(1.5deg) scale(1); }
          60% { transform: translateY(-2px) rotate(-1deg) scale(1.01); }
          80% { transform: translateY(0) rotate(1deg) scale(1); }
        }
        .sample-button:hover {
          background-color: #000 !important;
          color: #fff;
          animation: dance 0.6s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
}
