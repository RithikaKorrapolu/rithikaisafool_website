"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { BouncingBallPoster } from "@/components/BouncingBallPoster";
import { POSTERS } from "@/lib/posters";
import QuoteLinePoster from "@/components/QuoteLinePoster";

const COVER_IMAGES = [
  "/assets/STWL/covers/1.png",
  "/assets/STWL/covers/2.png",
  "/assets/STWL/covers/3.png",
  "/assets/CCP/ccpCover.mp4",
];

const GLORY_IMAGES = [
  "/assets/STIL Cards/14.png",
  "/assets/STIL Cards/15.png",
  "/assets/STIL Cards/16.png",
  "/assets/STIL Cards/17.png",
];

// Define which transitions to use
// 'fade' = slow fade IN, 'flip' = card flip
const GLORY_TRANSITIONS = [
  'flip', // Image 14 (coming from 17): flip
  'fade', // Image 15 (coming from 14): slow fade
  'flip', // Image 16 (coming from 15): flip
  'fade', // Image 17 (coming from 16): slow fade
] as const;

const TYPING_TEXTS = [
  "Seeing someone's handwriting for the first time",
  "When people go \"speech! speech! speech!\" and then somebody actually gives a speech",
  "First dates at furniture stores",
  "When dogs jump on you in the elevator",
  "really bad karaoke",
  "Finding out the meaning behind tattoos",
  "When parents carry kids on their shoulders"
];

const STWL_POPUP_TEXTS = [
  "When people say bada bing bada boom",
  "Tucking friends and family into bed",
  "When animals from different species become friends",
  "Kids in fancy clothes"
];

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [gloryImageIndex, setGloryImageIndex] = useState(0);
  const [clientImageIndex, setClientImageIndex] = useState(0);
  const [museumImageIndex, setMuseumImageIndex] = useState(0);
  const [ccpLayerIndex, setCcpLayerIndex] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [titleTop, setTitleTop] = useState(200);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [showTyping, setShowTyping] = useState(true);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showClientPopup, setShowClientPopup] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showSTWLPopup, setShowSTWLPopup] = useState(false);
  const [showComingSoonPopup, setShowComingSoonPopup] = useState(false);
  const [comingSoonEmail, setComingSoonEmail] = useState('');
  const [comingSoonSubmitting, setComingSoonSubmitting] = useState(false);
  const [comingSoonMessage, setComingSoonMessage] = useState('');
  const [stwlName, setSTWLName] = useState('');
  const [stwlPhone, setSTWLPhone] = useState('');
  const [stwlSubmitting, setSTWLSubmitting] = useState(false);
  const [stwlMessage, setSTWLMessage] = useState('');
  const [stwlTypingText, setStwlTypingText] = useState('');
  const [showStwlTyping, setShowStwlTyping] = useState(true);
  const [stwlTextIndex, setStwlTextIndex] = useState(0);
  const [clientQuoteIndex, setClientQuoteIndex] = useState(0);
  const [winkIndex, setWinkIndex] = useState(0);
  const [activePosterIds, setActivePosterIds] = useState<Set<number>>(new Set());
  const posterRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const [amwyOverlayIndex, setAmwyOverlayIndex] = useState<number | null>(null);
  const [showAMWYPopup, setShowAMWYPopup] = useState(false);
  const [showQuirksPopup, setShowQuirksPopup] = useState(false);
  const [quirksVideoVisible, setQuirksVideoVisible] = useState(false);
  const quirksVideoRef = useRef<HTMLDivElement>(null);
  const quirksVideoElementRef = useRef<HTMLVideoElement>(null);

  // Visibility states for pausing animations when off-screen
  const [winkVisible, setWinkVisible] = useState(false);
  const [clientPosterVisible, setClientPosterVisible] = useState(false);
  const [typingPosterVisible, setTypingPosterVisible] = useState(false);
  const [amwyPosterVisible, setAmwyPosterVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const winkRef = useRef<HTMLDivElement>(null);
  const clientPosterRef = useRef<HTMLDivElement>(null);
  const typingPosterRef = useRef<HTMLDivElement>(null);
  const amwyPosterRef = useRef<HTMLDivElement>(null);

  const clientQuotes = [
    "How can we design an event to unlock the conversations we care about?",
    "How can we design features and notifications that make people feel giddy and excited to share?",
    "How do we make content that is aligned with our humor and brand?"
  ];
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress || 0);
      setAudioCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleAudioSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * audioRef.current.duration;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Rotate client quotes
  useEffect(() => {
    if (!showClientPopup) {
      setClientQuoteIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setClientQuoteIndex((prev) => (prev + 1) % clientQuotes.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [showClientPopup, clientQuotes.length]);

  // Pause all animations when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      setPageVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Rotate wink images (only when visible)
  useEffect(() => {
    if (!winkVisible || !pageVisible) return;
    const interval = setInterval(() => {
      setWinkIndex((prev) => (prev + 1) % 2);
    }, 400);
    return () => clearInterval(interval);
  }, [winkVisible, pageVisible]);

  // Lazy load Quirks video when it enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setQuirksVideoVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' }
    );

    if (quirksVideoRef.current) {
      observer.observe(quirksVideoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Track visibility of animated elements to pause animations when off-screen
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map());

  useEffect(() => {
    const observerOptions = { rootMargin: '100px' };

    const setupObserver = (key: string, element: HTMLElement | null, setVisible: (visible: boolean) => void) => {
      if (!element) return;
      // Don't re-observe if already observing
      if (observersRef.current.has(key)) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => setVisible(entry.isIntersecting));
      }, observerOptions);

      observer.observe(element);
      observersRef.current.set(key, observer);
    };

    // Use a small delay to ensure refs are populated after render
    const timeoutId = setTimeout(() => {
      setupObserver('client', clientPosterRef.current, setClientPosterVisible);
      setupObserver('typing', typingPosterRef.current, setTypingPosterVisible);
      setupObserver('amwy', amwyPosterRef.current, setAmwyPosterVisible);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      observersRef.current.forEach((observer) => observer.disconnect());
      observersRef.current.clear();
    };
  }, []);

  // Lock body scroll when any popup is open to prevent mobile address bar jumping
  const scrollPositionRef = useRef(0);

  useEffect(() => {
    const isAnyPopupOpen = showPhonePopup || showClientPopup || showSTWLPopup || showComingSoonPopup || showAMWYPopup || showQuirksPopup;
    if (isAnyPopupOpen) {
      // Save current scroll position
      scrollPositionRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
    } else {
      // Restore scroll position
      const savedPosition = scrollPositionRef.current;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (savedPosition > 0) {
        window.scrollTo(0, savedPosition);
      }
    }
    return () => {
      // Always clean up body styles when component unmounts (navigation)
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [showPhonePopup, showClientPopup, showSTWLPopup, showComingSoonPopup, showAMWYPopup, showQuirksPopup]);

  // Intersection Observer for mobile scroll hover effects
  useEffect(() => {
    if (!isTouchDevice) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const posterId = parseInt(entry.target.getAttribute('data-poster-id') || '0');
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            setActivePosterIds((prev) => new Set(prev).add(posterId));
          } else {
            setActivePosterIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(posterId);
              return newSet;
            });
          }
        });
      },
      {
        threshold: [0, 0.6, 1],
        rootMargin: '-10% 0px -10% 0px'
      }
    );

    posterRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [isTouchDevice]);

  
  const handleSTWLSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stwlSubmitting) return;

    // Name validation
    if (!stwlName.trim()) {
      setSTWLMessage('Please enter your first name');
      return;
    }

    // Phone validation
    if (!stwlPhone) {
      setSTWLMessage('Please enter your phone number');
      return;
    }
    // Basic phone validation - at least 10 digits
    const phoneDigits = stwlPhone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setSTWLMessage('Please enter a valid phone number');
      return;
    }

    setSTWLSubmitting(true);
    setSTWLMessage('');

    try {
      const response = await fetch('/api/stwl-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: stwlName.trim(), phone: stwlPhone }),
      });

      const data = await response.json();

      if (response.ok) {
        setSTWLMessage(data.message || "You're subscribed!");
        setSTWLName('');
        setSTWLPhone('');
      } else {
        setSTWLMessage(data.error || 'Something went wrong');
      }
    } catch {
      setSTWLMessage('Something went wrong');
    } finally {
      setSTWLSubmitting(false);
    }
  };

  // Reverse the array to show in descending order (10, 9, 8, ...)
  const reversedPosters = [...POSTERS].reverse();

  // For poster 8 (Client cover) - alternate between images every 0.5 seconds (only when visible)
  useEffect(() => {
    if (!clientPosterVisible || !pageVisible) return;
    const interval = setInterval(() => {
      setClientImageIndex((prev) => (prev + 1) % 2);
    }, 500);

    return () => clearInterval(interval);
  }, [clientPosterVisible, pageVisible]);

  // Typing animation for poster 7 (only when visible)
  useEffect(() => {
    if (!typingPosterVisible || !pageVisible) return;

    const fullText = TYPING_TEXTS[currentTextIndex];
    let currentChar = 0;
    setShowTyping(true);
    setTypingText('');

    const typeInterval = setInterval(() => {
      if (currentChar <= fullText.length) {
        setTypingText(fullText.slice(0, currentChar));
        currentChar++;
      } else {
        clearInterval(typeInterval);
        // Wait 1 second then fade out
        setTimeout(() => {
          setShowTyping(false);
          // Wait for fade out, then move to next text
          setTimeout(() => {
            setCurrentTextIndex((prev) => (prev + 1) % TYPING_TEXTS.length);
          }, 500);
        }, 1000);
      }
    }, 80); // Type a character every 80ms

    return () => clearInterval(typeInterval);
  }, [currentTextIndex, typingPosterVisible, pageVisible]);

  // Typing animation for STWL popup
  useEffect(() => {
    if (!showSTWLPopup) return;

    const fullText = STWL_POPUP_TEXTS[stwlTextIndex];
    let currentChar = 0;
    setShowStwlTyping(true);
    setStwlTypingText('');

    const typeInterval = setInterval(() => {
      if (currentChar <= fullText.length) {
        setStwlTypingText(fullText.slice(0, currentChar));
        currentChar++;
      } else {
        clearInterval(typeInterval);
        // Wait 1 second then fade out
        setTimeout(() => {
          setShowStwlTyping(false);
          // Wait for fade out, then move to next text
          setTimeout(() => {
            setStwlTextIndex((prev) => (prev + 1) % STWL_POPUP_TEXTS.length);
          }, 500);
        }, 1000);
      }
    }, 80); // Type a character every 80ms

    return () => clearInterval(typeInterval);
  }, [showSTWLPopup, stwlTextIndex]);

  useEffect(() => {
    // Image 15 (index 1) shows for 4 seconds, Image 17 (index 3) shows for 6 seconds, others show for 2 seconds
    const delay = gloryImageIndex === 3 ? 2500 : gloryImageIndex === 1 ? 1500 : 1000;

    const timeoutId = setTimeout(() => {
      setGloryImageIndex((prev) => (prev + 1) % GLORY_IMAGES.length);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [gloryImageIndex]);

  // For poster 4 (CCP) - simple 5 states
  // State 0: 8+9, State 1: 11+12, State 2: 15+16, State 3: 23+24, State 4: 27+28
  useEffect(() => {
    const delay = 2000; // 2 seconds per state
    const timeoutId = setTimeout(() => {
      setCcpLayerIndex((prev) => (prev + 1) % 5);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [ccpLayerIndex]);

  // For poster 11 (A Month With You) - cycle through overlay images 4,5,6,7 in order (only when visible)
  const amwyImages = [4, 5, 6, 7];
  useEffect(() => {
    if (!amwyPosterVisible || !pageVisible) return;

    // Start with image 4
    setAmwyOverlayIndex(4);

    // Cycle through 4,5,6,7 every 0.3 seconds
    const interval = setInterval(() => {
      setAmwyOverlayIndex((prev) => {
        const currentIdx = amwyImages.indexOf(prev as number);
        const nextIdx = (currentIdx + 1) % amwyImages.length;
        return amwyImages[nextIdx];
      });
    }, 300);

    return () => clearInterval(interval);
  }, [amwyPosterVisible, pageVisible]);

  // Rotate museum images
  useEffect(() => {
    const interval = setInterval(() => {
      setMuseumImageIndex((prev) => (prev + 1) % 5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Set initial position to center of screen
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
    setMousePosition({ x: centerX, y: centerY });

    // Only track mouse on non-touch devices
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);

    if (!isTouch) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = scrollTop / docHeight;
      setScrollProgress(scrollPercent);

      // Calculate title position based on scroll
      const newTop = 140 + scrollPercent * (window.innerHeight - 470);
      setTitleTop(newTop);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Spotlight effect overlay - desktop only */}
      {!isTouchDevice && (
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={{
            background: `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, rgba(0, 0, 0, 0.20) 100%)`
          }}
        />
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake-bump {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          10% {
            transform: translate(-6px, -4px) rotate(-0.7deg);
          }
          20% {
            transform: translate(7px, 5px) rotate(0.8deg);
          }
          30% {
            transform: translate(-4px, 6px) rotate(-0.6deg);
          }
          40% {
            transform: translate(6px, -6px) rotate(0.7deg);
          }
          50% {
            transform: translate(-7px, 4px) rotate(-0.8deg);
          }
          60% {
            transform: translate(6px, -5px) rotate(0.6deg);
          }
          70% {
            transform: translate(-5px, -6px) rotate(-0.7deg);
          }
          80% {
            transform: translate(4px, 7px) rotate(0.6deg);
          }
          90% {
            transform: translate(-6px, -4px) rotate(-0.6deg);
          }
        }

        .poster-wrapper {
          cursor: pointer;
        }

        @media (min-width: 768px) {
          .poster-wrapper {
            animation: shake-bump 3s ease-in-out infinite;
          }
        }

        .poster-wrapper:nth-child(1) { animation-delay: 0s; animation-duration: 3.2s; }
        .poster-wrapper:nth-child(2) { animation-delay: 0.3s; animation-duration: 2.8s; }
        .poster-wrapper:nth-child(3) { animation-delay: 0.6s; animation-duration: 3.5s; }
        .poster-wrapper:nth-child(4) { animation-delay: 0.9s; animation-duration: 3.1s; }
        .poster-wrapper:nth-child(5) { animation-delay: 1.2s; animation-duration: 2.9s; }
        .poster-wrapper:nth-child(6) { animation-delay: 1.5s; animation-duration: 3.3s; }
        .poster-wrapper:nth-child(7) { animation-delay: 0.2s; animation-duration: 3.4s; }
        .poster-wrapper:nth-child(8) { animation-delay: 0.5s; animation-duration: 3.0s; }
        .poster-wrapper:nth-child(9) { animation-delay: 0.8s; animation-duration: 2.7s; }
        .poster-wrapper:nth-child(10) { animation-delay: 1.1s; animation-duration: 3.6s; }

        .poster-wrapper:hover {
          animation-play-state: paused;
        }

        .poster-card {
          transition: transform 0.2s ease;
        }

        @media (max-width: 768px) {
          .poster-card {
            transform: scale(0.9);
          }
        }

        /* Only apply hover effects on devices that support hover */
        @media (hover: hover) {
          .poster-wrapper:hover .poster-card {
            transform: scale(1.1);
          }

          .poster-wrapper:hover {
            z-index: 10;
            position: relative;
          }

          .shop-sticker {
            transition: transform 0.6s ease-in-out;
          }

          .poster-wrapper:hover .shop-sticker {
            transform: rotate(360deg);
          }
        }

      `}} />
      <main className="min-h-screen pt-[140px] md:pt-[145px] lg:pt-[155px] pb-20" style={{ backgroundColor: '#F2F2F2' }}>
        {/* Fixed Background Title and Subtitle */}
        <div
          className="fixed left-0 right-0 z-0 pointer-events-none top-[140px] md:top-[140px]"
          style={{
            willChange: 'transform'
          }}
        >
          <div className="container mx-auto px-6">
            {/* Large Title Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-0 mt-3 flex justify-start sm:justify-center"
            >
              <h1 className="text-[36vw] sm:text-[19vw] font-bold leading-[0.85] sm:leading-none tracking-tight font-[family-name:var(--font-abril-fatface)] text-left sm:text-center" style={{
                color: '#F8330D'
              }}>
                {/* Mobile layout */}
                <span className="sm:hidden block">
                  THIS<br/>IS<br/>
                  IT!
                </span>
                {/* Desktop layout */}
                <span className="hidden sm:inline whitespace-nowrap">THIS IS IT!</span>
              </h1>
            </motion.div>

            {/* Subtitles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-left sm:text-center mb-12 mt-2"
            >
              <h2 className="text-[22px] sm:text-3xl lg:text-[33px] font-bold text-black font-[family-name:var(--font-abril-fatface)]">a chance to be fools</h2>
            </motion.div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="container mx-auto px-6 relative z-10">
          {/* Spacer to account for fixed header height */}
          <div className="h-[130vw] sm:h-[50vw] md:h-[26vw]"></div>

          <div className="
            flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3
            gap-0 md:gap-12
            px-0 md:px-[2.5%]
          ">
            {reversedPosters.map((poster, posterIndex) => {
              const isActive = isTouchDevice && activePosterIds.has(poster.id);
              const isPriorityPoster = posterIndex < 3; // First 3 posters load with priority
              const PosterContent = (
                <div
                  className="poster-wrapper h-[108vw] md:h-auto md:min-h-0 flex items-center justify-center"
                  ref={(el) => {
                    if (el) {
                      posterRefs.current.set(poster.id, el);
                      // Set visibility tracking refs for animated posters
                      if (poster.id === 8 && clientPosterRef.current !== el) {
                        (clientPosterRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                      }
                      if (poster.id === 9 && typingPosterRef.current !== el) {
                        (typingPosterRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                      }
                      if (poster.id === 11 && amwyPosterRef.current !== el) {
                        (amwyPosterRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                      }
                    }
                  }}
                  data-poster-id={poster.id}
                >
                  <div
                    className="poster-card rounded-lg shadow-xl flex items-center justify-center overflow-hidden w-[80vw] md:w-full"
                    style={{
                      aspectRatio: '4/5',
                      position: 'relative',
                      backgroundColor: '#F2F2F2',
                      touchAction: 'manipulation',
                    }}
                  >
                    {poster.id === 9 ? (
                      <>
                        <Image
                          src="/assets/STWL/covers/STWL3.png"
                          alt="STWL"
                          width={500}
                          height={625}
                          className="w-full h-full object-contain"
                          priority={isPriorityPoster}
                        />
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: showTyping ? 1 : 0 }}
                          transition={{ duration: 0.5 }}
                          style={{
                            position: 'absolute',
                            top: '50%',
                            left: '20px',
                            transform: 'translateY(-50%)',
                            zIndex: 20,
                            textAlign: 'left',
                            padding: '20px',
                            fontFamily: 'Times New Roman, serif',
                          }}
                        >
                          <span className="text-lg md:text-xl font-normal text-white">
                            {typingText}
                            <span className="animate-pulse">|</span>
                          </span>
                        </motion.div>
                      </>
                    ) : poster.id === 10 ? (
                      <BouncingBallPoster showLogo={true} />
                    ) : poster.id === 8 ? (
                      <>
                        {/* Base layer - always visible */}
                        <Image
                          src="/assets/Client/1.png"
                          alt="Client Work"
                          width={500}
                          height={625}
                          className="w-full h-full object-contain"
                          style={{ transform: 'scale(1.16)' }}
                          priority={isPriorityPoster}
                        />
                        {/* Client cover no call fades in/out on top */}
                        <AnimatePresence>
                          {clientImageIndex === 1 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            >
                              <Image
                                src="/assets/Client/2.png"
                                alt="Client Work No Call"
                                width={500}
                                height={625}
                                className="w-full h-full object-contain"
                                style={{ transform: 'scale(1.16)' }}
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    ) : poster.id === 7 ? (
                      <>
                        {GLORY_TRANSITIONS[gloryImageIndex] === 'fade' ? (
                          // Fade transition
                          <>
                            {/* Base layer - show previous image */}
                            <Image
                              src={GLORY_IMAGES[gloryImageIndex === 1 ? 0 : 2]}
                              alt="Specific Things We Like"
                              width={500}
                              height={625}
                              className="w-full h-full object-contain"
                            />
                            {/* Fade layer on top */}
                            <AnimatePresence>
                              <motion.div
                                key={gloryImageIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 2 }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                              >
                                <Image
                                  src={GLORY_IMAGES[gloryImageIndex]}
                                  alt="Specific Things We Like"
                                  width={500}
                                  height={625}
                                  className="w-full h-full object-contain"
                                />
                              </motion.div>
                            </AnimatePresence>
                          </>
                        ) : (
                          // Flip transition
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={gloryImageIndex}
                              initial={{ rotateY: -90, opacity: 0 }}
                              animate={{ rotateY: 0, opacity: 1 }}
                              exit={{ rotateY: 90, opacity: 0 }}
                              transition={{ duration: 0.6 }}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                transformStyle: 'preserve-3d'
                              }}
                            >
                              <Image
                                src={GLORY_IMAGES[gloryImageIndex]}
                                alt="Specific Things We Like"
                                width={500}
                                height={625}
                                className="w-full h-full object-contain"
                              />
                            </motion.div>
                          </AnimatePresence>
                        )}
                        <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 20 }}>
                          <Image
                            src="/assets/shop/Shop Logo.png"
                            alt="Shop"
                            width={88}
                            height={88}
                            className="w-18 h-18 md:w-22 md:h-22 shop-sticker"
                          />
                        </div>
                      </>
                    ) : poster.id === 6 ? (
                      <QuoteLinePoster />
                    ) : poster.id === 5 ? (
                      <>
                        <Image
                          src="/assets/COTM/coverreal.png"
                          alt="COTM"
                          width={500}
                          height={625}
                          className="w-full h-full object-contain"
                          style={{ transform: 'scale(0.8)' }}
                        />
                        <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 20 }}>
                          <Image
                            src="/assets/shop/Shop Logo.png"
                            alt="Shop"
                            width={88}
                            height={88}
                            className="w-18 h-18 md:w-22 md:h-22 shop-sticker"
                          />
                        </div>
                      </>
                    ) : poster.id === 4 ? (
                      <>
                        {/* Base layer - Image 30 (always visible) */}
                        <Image
                          src="/assets/CCP/30.png"
                          alt="Let Me Show You"
                          width={500}
                          height={625}
                          className="w-full h-full object-contain"
                        />
                        {/* Rotating images 33-37 with crossfade */}
                        <AnimatePresence>
                          <motion.div
                            key={ccpLayerIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                          >
                            <Image
                              src={`/assets/CCP/${33 + ccpLayerIndex}.png`}
                              alt="Let Me Show You"
                              width={500}
                              height={625}
                              className="w-full h-full object-contain"
                            />
                          </motion.div>
                        </AnimatePresence>
                        {/* Shop sticker */}
                        <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 20 }}>
                          <Image
                            src="/assets/shop/Shop Logo.png"
                            alt="Shop"
                            width={88}
                            height={88}
                            className="w-18 h-18 md:w-22 md:h-22 shop-sticker"
                          />
                        </div>
                      </>
                    ) : poster.id === 11 ? (
                      <>
                        {/* Base image - always visible */}
                        <Image
                          src="/assets/A Month With you/A Month With You.png"
                          alt="A Month With You"
                          width={500}
                          height={625}
                          className="w-full h-full object-contain"
                          priority={isPriorityPoster}
                        />
                        {/* Overlay images 4-7 with crossfade */}
                        {amwyImages.map((imgNum) => (
                          <motion.div
                            key={imgNum}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: amwyOverlayIndex === imgNum ? 1 : 0 }}
                            transition={{ duration: 0.12 }}
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                          >
                            <Image
                              src={`/assets/A Month With you/${imgNum}.png`}
                              alt="A Month With You"
                              width={500}
                              height={625}
                              className="w-full h-full object-contain"
                            />
                          </motion.div>
                        ))}
                      </>
                    ) : poster.id === 12 ? (
                      <div ref={quirksVideoRef} className="w-full h-full">
                        {quirksVideoVisible ? (
                          <video
                            ref={quirksVideoElementRef}
                            src="/assets/quirks/bluecover.mp4"
                            autoPlay
                            loop
                            muted
                            playsInline
                            webkit-playsinline="true"
                            className="w-full h-full object-cover"
                            onLoadedData={(e) => {
                              const video = e.currentTarget;
                              video.play().catch(() => {});
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800" />
                        )}
                      </div>
                    ) : poster.id === 13 ? (
                      <>
                        {/* Spinning portal animation */}
                        <div className="absolute inset-0 overflow-hidden flex items-start justify-center pt-2" style={{ backgroundColor: '#000000' }}>
                          {/* Spinning outer ring */}
                          <motion.div
                            animate={{
                              rotate: [0, 360],
                            }}
                            transition={{
                              duration: 8,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            style={{
                              position: 'absolute',
                              width: '400px',
                              height: '400px',
                              borderRadius: '50%',
                              background: 'conic-gradient(from 0deg, #000000, #aa3023, #7a2018, #000000, #aa3023, #000000)',
                              filter: 'blur(30px)',
                            }}
                          />
                          {/* Counter-spinning middle ring */}
                          <motion.div
                            animate={{
                              rotate: [360, 0],
                            }}
                            transition={{
                              duration: 6,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            style={{
                              position: 'absolute',
                              width: '280px',
                              height: '280px',
                              borderRadius: '50%',
                              background: 'conic-gradient(from 180deg, #aa3023, #000000, #7a2018, #aa3023, #000000, #aa3023)',
                              filter: 'blur(20px)',
                            }}
                          />
                          {/* Spinning inner ring */}
                          <motion.div
                            animate={{
                              rotate: [0, 360],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            style={{
                              position: 'absolute',
                              width: '160px',
                              height: '160px',
                              borderRadius: '50%',
                              background: 'conic-gradient(from 90deg, #aa3023, #2a0a06, #aa3023, #2a0a06, #aa3023)',
                              filter: 'blur(10px)',
                            }}
                          />
                        </div>
                        {/* Base image on top */}
                        <Image
                          src="/assets/museum/base11.png"
                          alt="The RIAF Museum of Art"
                          width={500}
                          height={625}
                          className="w-full h-full object-cover relative z-10"
                          priority={isPriorityPoster}
                          unoptimized
                        />
                      </>
                    ) : (
                      <>
                        <span
                          className="font-bold"
                          style={{
                            fontSize: '55vh',
                            lineHeight: 0.8,
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.6) 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            filter: 'drop-shadow(4px 8px 16px rgba(0,0,0,0.3))',
                            textShadow: '0 0 40px rgba(255,255,255,0.5)'
                          }}
                        >{[1, 2, 3].includes(poster.id) ? '?' : poster.id}</span>
                        {poster.id === 3 && (
                          <svg
                            className="absolute inset-0 w-full h-full"
                            viewBox="0 0 200 250"
                            style={{ pointerEvents: 'none', zIndex: 10 }}
                          >
                            <defs>
                              <path
                                id="textLine1"
                                d="M 0 115 L 200 115"
                                fill="none"
                              />
                              <path
                                id="textLine2"
                                d="M 0 135 L 200 135"
                                fill="none"
                              />
                            </defs>
                            <text
                              fill="black"
                              fontSize="10"
                              fontWeight="bold"
                              fontFamily="var(--font-inter), sans-serif"
                              textAnchor="middle"
                            >
                              <textPath href="#textLine1" startOffset="50%">
                                Do you have a
                              </textPath>
                            </text>
                            <text
                              fill="black"
                              fontSize="10"
                              fontWeight="bold"
                              fontFamily="var(--font-inter), sans-serif"
                              textAnchor="middle"
                            >
                              <textPath href="#textLine2" startOffset="50%">
                                good story to tell?
                              </textPath>
                            </text>
                          </svg>
                        )}
                        {poster.id === 3 && (
                          <div className="absolute top-4 left-4">
                            <span className="text-sm font-bold font-[family-name:var(--font-inter)]">
                              <span
                                className="px-3 py-1 rounded-full"
                                style={{
                                  background: '#dcff73',
                                  color: 'black'
                                }}
                              >
                                Coming Soon:
                              </span>
                              <span className="ml-2" style={{ color: 'black' }}>TGS Streaming Service</span>
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );

              // For poster 8 (Client cover) - show popup
              if (poster.id === 8) {
                return (
                  <div
                    key={poster.id}
                    onClick={() => setShowClientPopup(true)}
                    className="cursor-pointer"
                  >
                    {PosterContent}
                  </div>
                );
              }

              // For poster 9 (STWL) - show popup
              if (poster.id === 9) {
                return (
                  <div
                    key={poster.id}
                    onClick={() => setShowSTWLPopup(true)}
                    className="cursor-pointer"
                  >
                    {PosterContent}
                  </div>
                );
              }

              // For poster 3 (Coming Soon) - show popup
              if (poster.id === 3) {
                return (
                  <div
                    key={poster.id}
                    onClick={() => setShowComingSoonPopup(true)}
                    className="cursor-pointer"
                  >
                    {PosterContent}
                  </div>
                );
              }

              if (poster.link) {
                // For poster 6 (Voicemail Show) - show popup on both desktop and mobile
                if (poster.id === 6) {
                  return (
                    <div
                      key={poster.id}
                      onClick={() => setShowPhonePopup(true)}
                      className="cursor-pointer"
                    >
                      {PosterContent}
                    </div>
                  );
                }
                // For poster 11 (A Month With You) - show popup
                if (poster.id === 11) {
                  return (
                    <div
                      key={poster.id}
                      onClick={() => setShowAMWYPopup(true)}
                      className="cursor-pointer"
                    >
                      {PosterContent}
                    </div>
                  );
                }
                // For poster 12 (Quirks) - show popup
                if (poster.id === 12) {
                  return (
                    <div
                      key={poster.id}
                      onClick={() => setShowQuirksPopup(true)}
                      className="cursor-pointer"
                    >
                      {PosterContent}
                    </div>
                  );
                }
                return (
                  <Link
                    key={poster.id}
                    href={poster.link}
                    target={poster.link.startsWith('http') || poster.id === 13 ? '_blank' : undefined}
                    rel={poster.link.startsWith('http') || poster.id === 13 ? 'noopener noreferrer' : undefined}
                  >
                    {PosterContent}
                  </Link>
                );
              }

              return <div key={poster.id}>{PosterContent}</div>;
            })}
          </div>
        </div>
      </main>

      {/* Phone Number Popup */}
      <AnimatePresence>
        {showPhonePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowPhonePopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl p-6 md:p-8 max-w-md mx-4 text-center shadow-2xl relative border border-white/20 max-h-[60vh] md:max-h-none overflow-y-auto"
              style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* X close button */}
              <button
                onClick={() => setShowPhonePopup(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-black font-[family-name:var(--font-loubag)]">
                Call Anytime!
              </h2>
              <a
                href="tel:6097322482"
                className="text-3xl md:text-4xl font-bold text-[#F8330D] hover:text-[#d42a0a] transition-colors font-[family-name:var(--font-loubag)]"
                style={{ animation: 'flash 0.5s ease-in-out infinite' }}
              >
                609-732-2482
              </a>
              <style>{`
                @keyframes flash {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.3; }
                }
              `}</style>
              <p className="mt-4 text-black font-[family-name:var(--font-inter)]">
                They say if you want to win, study the winners. Every day, I share something a "successful" person once said. It's daily advice. And it ranges from Steve Jobs to Rihanna to Nathan Fielder to my friend who grew her first tomato. Dial in.
              </p>
              {/* CALL NOW button - mobile only */}
              {isTouchDevice && (
                <a
                  href="tel:6097322482"
                  className="mt-4 px-6 py-2 bg-[#F8330D] hover:bg-black text-white rounded-full transition-colors font-[family-name:var(--font-inter)] font-bold inline-block hover-wiggle"
                >
                  CALL NOW
                </a>
              )}
              <p className="mt-4 text-black font-[family-name:var(--font-inter)] italic">
                Got advice? Email us at{' '}
                <a href="mailto:submissions@rithikaisafool.com" className="underline hover:text-gray-700">
                  submissions@rithikaisafool.com
                </a>
              </p>
              <div className="flex justify-center gap-6 mt-4">
                <a href="https://www.instagram.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://www.tiktok.com/@rithikakorr?_r=1&_t=ZP-93jcyyF97Fv" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
                <a href="https://x.com/rithika24k" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://substack.com/@rithikakorrapolu" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* A Month With You Popup */}
      <AnimatePresence>
        {showAMWYPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowAMWYPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl p-6 md:p-8 max-w-md mx-4 text-center shadow-2xl relative border border-white/20 max-h-[60vh] md:max-h-none overflow-y-auto"
              style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* X close button */}
              <button
                onClick={() => setShowAMWYPopup(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl md:text-2xl font-bold mb-1 text-black font-[family-name:var(--font-loubag)]">
                A Month With You
              </h2>
              <p className="text-sm text-black/70 mb-4 font-[family-name:var(--font-inter)]">
                a short-form video series
              </p>
              <p className="text-black font-[family-name:var(--font-inter)]">
                Every month, we pick a new person.<br />
                Every day, you help choose the next question.<br />
                By the end of the month, we all get to know someone new.
              </p>
              <p className="mt-4 text-black font-[family-name:var(--font-inter)] italic">
                Launching 4/1/2026 on our instagram
              </p>
              <a
                href="https://www.instagram.com/rithikaisafool/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 px-6 py-2 bg-[#F8330D] hover:bg-black text-white rounded-full transition-colors font-[family-name:var(--font-inter)] font-bold inline-block"
              >
                Join in
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quirks Popup */}
      <AnimatePresence>
        {showQuirksPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowQuirksPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl p-6 md:p-8 max-w-md mx-4 text-left shadow-2xl relative border border-white/20 max-h-[60vh] md:max-h-none overflow-y-auto"
              style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* X close button */}
              <button
                onClick={() => setShowQuirksPopup(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-black transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2
                className="text-4xl md:text-5xl font-bold mb-1"
                style={{
                  fontFamily: 'Futura, "Futura PT", "Century Gothic", sans-serif',
                  color: 'transparent',
                  WebkitTextStroke: '1.5px black'
                }}
              >
                QUIRKS
              </h2>
              <p className="text-sm text-black/70 mb-4 font-[family-name:var(--font-inter)]">
                a weekly series
              </p>
              <p className="text-black font-[family-name:var(--font-inter)]">
                <a href="https://www.youtube.com/watch?v=ltNhwj-F7c8" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors"><span className="text-[#F8330D] font-bold hover:text-black">This scene</span> in Good Will Hunting</a> inspired this project.
              </p>
              <p className="text-black font-[family-name:var(--font-inter)] mt-2">
                This is a collection of funny, odd, sweet little quirks that people have. The things that make us human.
              </p>
              <p className="mt-4 text-black font-[family-name:var(--font-inter)] italic">
                New every Tuesday on our instagram
              </p>
              <a
                href="https://www.instagram.com/rithikaisafool"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 px-6 py-2 bg-[#F8330D] hover:bg-black text-white rounded-full transition-colors font-[family-name:var(--font-inter)] font-bold inline-block"
              >
                Follow to see
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Client Work Popup */}
      <AnimatePresence>
        {showClientPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowClientPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-3xl p-6 md:p-12 max-w-2xl mx-4 relative border border-white/20 max-h-[60vh] md:max-h-none overflow-y-auto"
              style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowClientPopup(false)}
                className="absolute top-3 right-3 text-3xl leading-none hover:text-[#F8330D] text-gray-400 p-2"
              >
                &times;
              </button>

              {/* All text content - fades in together */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1.5 }}
              >
                <p
                  className="text-base md:text-lg text-black leading-relaxed mb-6 text-justify pr-8 md:pr-0"
                  style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
                >
                  Hearing people talk about their dreams, like really talk about them, is one of the best things in life! Getting to work with them on it is an honor!!
                </p>

                <p
                  className="text-base md:text-lg text-black leading-relaxed mb-6 text-justify"
                  style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
                >
                  If you&apos;re working on a new product, creating content, or hosting events and could use a little help with creative direction / strategy, we might make a good team.
                </p>

                <AnimatePresence mode="wait">
                  <motion.p
                    key={clientQuoteIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-base md:text-lg text-black leading-relaxed mb-6 italic text-center"
                    style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
                  >
                    &quot;{clientQuotes[clientQuoteIndex]}&quot;
                  </motion.p>
                </AnimatePresence>

                <div className="text-center">
                  <Link
                    href="https://calendar.app.google/7Y2Mws8dAD7hSY1f8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#F8330D] text-white font-bold py-3 px-6 rounded-full hover:bg-black transition-colors text-sm shadow-lg font-[family-name:var(--font-inter)] hover-wiggle"
                  >
                    This is the best way to find out.
                  </Link>
                  <p className="text-gray-600 mt-2" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif', fontSize: '0.87rem' }}>
                    Set up a free consult
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STWL Popup */}
      <AnimatePresence>
        {showSTWLPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => { setShowSTWLPopup(false); setSTWLName(''); setSTWLPhone(''); setSTWLMessage(''); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl p-6 md:p-8 max-w-md mx-4 text-center shadow-2xl relative border border-white/20 max-h-[60vh] md:max-h-none overflow-y-auto"
              style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { setShowSTWLPopup(false); setSTWLName(''); setSTWLPhone(''); setSTWLMessage(''); }}
                className="absolute top-3 right-3 text-gray-500 hover:text-black transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="text-black font-[family-name:var(--font-inter)] mb-4 italic text-left" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                <span className="font-bold">&quot;Instructions for living a life:</span><br />
                Pay attention.<br />
                Be astonished.<br />
                Tell about it.&quot;<br />
                - Mary Oliver
              </p>
              <p className="text-black font-[family-name:var(--font-inter)] mb-6 text-right">
                Once a week, we share three small things that brought someone joy. And that&apos;s it.
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: showStwlTyping ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="mb-4 text-center min-h-[3rem] flex items-center justify-center"
              >
                <span className="text-black italic" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
                  &quot;{stwlTypingText}<span className="animate-pulse">|</span>&quot;
                </span>
              </motion.div>
              <form onSubmit={handleSTWLSubscribe} className="text-center">
                <input
                  type="text"
                  placeholder="First name"
                  value={stwlName}
                  onChange={(e) => {
                    setSTWLName(e.target.value);
                    setSTWLMessage('');
                  }}
                  className="w-full px-4 py-3 rounded-full border border-black mb-3 bg-transparent font-[family-name:var(--font-inter)] text-black focus:outline-none"
                />
                <div className="flex items-center w-full px-4 py-3 rounded-full border border-black mb-3 bg-transparent">
                  <span className="text-xl mr-2">🇺🇸</span>
                  <span className="text-black font-[family-name:var(--font-inter)] mr-2">+1</span>
                  <input
                    type="tel"
                    placeholder="(555) 555-5555"
                    value={stwlPhone}
                    onChange={(e) => {
                      // Format as (XXX) XXX-XXXX
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      let formatted = '';
                      if (digits.length > 0) {
                        formatted = '(' + digits.slice(0, 3);
                        if (digits.length > 3) {
                          formatted += ') ' + digits.slice(3, 6);
                          if (digits.length > 6) {
                            formatted += '-' + digits.slice(6, 10);
                          }
                        }
                      }
                      setSTWLPhone(formatted);
                      setSTWLMessage('');
                    }}
                    className="flex-1 font-[family-name:var(--font-inter)] text-black focus:outline-none bg-transparent"
                  />
                </div>
                <p className="text-xs text-gray-600 font-[family-name:var(--font-inter)] mb-3 text-center italic">
                  By submitting this form, you consent to receive informational and/or marketing texts from Rithika is a Fool! Msg &amp; data rates may apply. Msg frequency varies. Unsubscribe at any time by replying STOP. View <a href="/legal" className="underline hover:text-black">Privacy Policy &amp; Terms</a> here.
                </p>
                <button
                  type="submit"
                  disabled={stwlSubmitting || stwlMessage.includes("You're")}
                  className={`inline-block text-white font-bold py-3 px-6 rounded-full transition-colors font-[family-name:var(--font-inter)] disabled:opacity-100 hover-wiggle ${stwlMessage.includes("You're") ? 'bg-green-500' : 'bg-[#F8330D] hover:bg-black'}`}
                >
                  {stwlSubmitting ? 'Subscribing...' : stwlMessage.includes("You're") ? "You're in baby!" : 'Subscribe'}
                </button>
                {stwlMessage && !stwlMessage.includes("You're") && (
                  <p className="mt-3 text-sm font-[family-name:var(--font-inter)] text-red-500">{stwlMessage}</p>
                )}
              </form>

              <p className="mt-6 text-black font-[family-name:var(--font-inter)] italic text-center">
                Pitch us something you like and get featured by emailing{' '}
                <a href="mailto:submissions@rithikaisafool.com" className="underline hover:text-gray-700">
                  submissions@rithikaisafool.com
                </a>
              </p>
              <div className="flex justify-center gap-6 mt-4">
                <a href="https://www.instagram.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://www.tiktok.com/@rithikakorr?_r=1&_t=ZP-93jcyyF97Fv" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
                <a href="https://x.com/rithika24k" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://substack.com/@rithikakorrapolu" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coming Soon Popup */}
      <AnimatePresence>
        {showComingSoonPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => { setShowComingSoonPopup(false); setComingSoonEmail(''); setComingSoonMessage(''); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="rounded-2xl p-6 md:p-8 max-w-md mx-4 text-center shadow-2xl relative border border-white/20 max-h-[60vh] md:max-h-none overflow-y-auto"
              style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => { setShowComingSoonPopup(false); setComingSoonEmail(''); setComingSoonMessage(''); }}
                className="absolute top-3 right-3 text-gray-500 hover:text-black transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-black font-[family-name:var(--font-loubag)] pr-8 md:pr-0">
                We&apos;re Collecting Good Stories
              </h2>
              <p className="text-black font-[family-name:var(--font-inter)] mb-6 text-left">
                Do you have a story that you get really excited to tell? Send us a voice memo at{' '}
                <a href="mailto:submissions@rithikaisafool.com" className="underline hover:text-gray-700">
                  submissions@rithikaisafool.com
                </a>
                {' '}and you might get paid and featured on this next project!
              </p>
              <p className="text-black font-[family-name:var(--font-inter)] mb-6 text-left">
                Want to check this out when it goes live? Sign up below!
              </p>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (comingSoonSubmitting) return;
                if (!comingSoonEmail) {
                  setComingSoonMessage('Please enter your email');
                  return;
                }
                if (!comingSoonEmail.includes('@') || !comingSoonEmail.includes('.')) {
                  setComingSoonMessage('Please enter a valid email address');
                  return;
                }
                setComingSoonSubmitting(true);
                setComingSoonMessage('');
                try {
                  const response = await fetch('/api/klaviyo/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      email: comingSoonEmail,
                      productName: 'Good Stories Project',
                      productHandle: 'good-stories'
                    }),
                  });
                  const data = await response.json();
                  if (response.ok) {
                    setComingSoonMessage("You're in!");
                    setComingSoonEmail('');
                  } else {
                    setComingSoonMessage(data.error || 'Something went wrong');
                  }
                } catch {
                  setComingSoonMessage('Something went wrong');
                } finally {
                  setComingSoonSubmitting(false);
                }
              }} className="mb-6">
                <input
                  type="text"
                  placeholder="Enter your email"
                  value={comingSoonEmail}
                  onChange={(e) => { setComingSoonEmail(e.target.value); setComingSoonMessage(''); }}
                  className="w-full px-4 py-3 rounded-full border border-black mb-3 font-[family-name:var(--font-inter)] text-black focus:outline-none focus:border-[#F8330D] focus:ring-1 focus:ring-[#F8330D]"
                />
                <button
                  type="submit"
                  disabled={comingSoonSubmitting || comingSoonMessage === "You're in!"}
                  className={`w-full text-white font-bold py-3 px-6 rounded-full transition-colors font-[family-name:var(--font-inter)] hover-wiggle ${comingSoonMessage === "You're in!" ? 'bg-green-500' : 'bg-[#F8330D] hover:bg-black'}`}
                >
                  {comingSoonSubmitting ? 'Subscribing...' : comingSoonMessage === "You're in!" ? "You're in baby!" : 'Keep me posted'}
                </button>
                {comingSoonMessage && comingSoonMessage !== "You're in!" && (
                  <p className="mt-3 text-sm font-[family-name:var(--font-inter)] text-red-500 text-center">{comingSoonMessage}</p>
                )}
              </form>
              <div className="flex justify-center gap-6 mt-4">
                <a href="https://www.instagram.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a href="https://www.tiktok.com/@rithikakorr?_r=1&_t=ZP-93jcyyF97Fv" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
                <a href="https://x.com/rithika24k" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://substack.com/@rithikakorrapolu" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                  </svg>
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer>
        <div className="px-6 py-6 md:py-8" style={{ backgroundColor: '#000000', letterSpacing: '-0.08em' }}>
          {/* Mobile: Stacked layout */}
          <div className="flex flex-col items-center gap-4 md:hidden">
            <div className="flex gap-6">
              <a href="https://www.instagram.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@rithikakorr?_r=1&_t=ZP-93jcyyF97Fv" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
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
              <a href="/shop" className="text-white text-sm font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Store</a>
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
                  <a href="/shop" className="text-white text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Store</a>
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
              <a href="https://www.tiktok.com/@rithikakorr?_r=1&_t=ZP-93jcyyF97Fv" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
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
