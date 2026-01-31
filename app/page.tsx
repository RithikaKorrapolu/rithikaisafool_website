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
  const [stwlEmail, setSTWLEmail] = useState('');
  const [stwlSubmitting, setSTWLSubmitting] = useState(false);
  const [stwlMessage, setSTWLMessage] = useState('');
  const [stwlTypingText, setStwlTypingText] = useState('');
  const [showStwlTyping, setShowStwlTyping] = useState(true);
  const [stwlTextIndex, setStwlTextIndex] = useState(0);
  const [clientQuoteIndex, setClientQuoteIndex] = useState(0);
  const [winkIndex, setWinkIndex] = useState(0);
  const [activePosterIds, setActivePosterIds] = useState<Set<number>>(new Set());
  const posterRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const clientQuotes = [
    "How can our features and notifications be beautiful and funny (along with being helpful)?",
    "What content can we make that is engaging but also deeeply reflects our values?",
    "How can we design this event to promote playfulness and vulnerability and real connection between our guests?"
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
    }, 4000);
    return () => clearInterval(interval);
  }, [showClientPopup, clientQuotes.length]);

  // Rotate wink images
  useEffect(() => {
    const interval = setInterval(() => {
      setWinkIndex((prev) => (prev + 1) % 2);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Lock body scroll when any popup is open to prevent mobile address bar jumping
  useEffect(() => {
    const isAnyPopupOpen = showPhonePopup || showClientPopup || showSTWLPopup || showComingSoonPopup;
    if (isAnyPopupOpen) {
      document.body.classList.add('popup-open');
    } else {
      document.body.classList.remove('popup-open');
    }
    return () => {
      document.body.classList.remove('popup-open');
    };
  }, [showPhonePopup, showClientPopup, showSTWLPopup, showComingSoonPopup]);

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

    // Custom email validation
    if (!stwlEmail) {
      setSTWLMessage('Please enter your email');
      return;
    }
    if (!stwlEmail.includes('@') || !stwlEmail.includes('.')) {
      setSTWLMessage('Please enter a valid email address');
      return;
    }

    setSTWLSubmitting(true);
    setSTWLMessage('');

    try {
      const response = await fetch('/api/stwl-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: stwlEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setSTWLMessage(data.message || "You're subscribed!");
        setSTWLEmail('');
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

  // For poster 8 (Client cover) - alternate between images every 0.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setClientImageIndex((prev) => (prev + 1) % 2);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Typing animation for poster 7
  useEffect(() => {
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
  }, [currentTextIndex]);

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
          animation: shake-bump 3s ease-in-out infinite;
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

        /* Mobile scroll-based hover effects */
        .poster-wrapper.mobile-active {
          animation-play-state: paused;
          z-index: 10;
          position: relative;
        }

        .poster-wrapper.mobile-active .poster-card {
          transform: scale(1.0);
        }

        .poster-wrapper.mobile-active .shop-sticker {
          transform: rotate(360deg);
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
              className="text-center mb-0 mt-3"
            >
              <h1 className="text-[26vw] sm:text-[11.7vw] font-bold leading-none tracking-tight font-[family-name:var(--font-abril-fatface)] text-left sm:text-center" style={{
                color: '#F8330D'
              }}>
                {/* Mobile layout */}
                <span className="sm:hidden block">
                  LET&apos;S<br/>BE<br/>
                  FOOLS!
                  <span className="block text-right -mt-16">
                    <span className="text-lg font-bold text-black font-[family-name:var(--font-abril-fatface)] tracking-wide italic">
                      please
                    </span>
                  </span>
                </span>
                {/* Desktop layout */}
                <span className="hidden sm:inline whitespace-nowrap">LET&apos;S BE FOOLS!</span>
              </h1>
            </motion.div>

            {/* Subtitles - Desktop only */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden sm:block text-center mb-12 mt-2"
            >
              <h2 className="text-3xl font-bold text-black font-[family-name:var(--font-abril-fatface)] italic">please</h2>
            </motion.div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="container mx-auto px-6 relative z-10">
          {/* Spacer to account for fixed header height */}
          <div className="h-[93vw] sm:h-[18vw] lg:h-[18vw]"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {reversedPosters.map((poster) => {
              const isActive = isTouchDevice && activePosterIds.has(poster.id);
              const PosterContent = (
                <div
                  className={`poster-wrapper ${isActive ? 'mobile-active' : ''}`}
                  ref={(el) => {
                    if (el) posterRefs.current.set(poster.id, el);
                  }}
                  data-poster-id={poster.id}
                >
                  <div
                    className="poster-card rounded-lg shadow-xl flex items-center justify-center overflow-hidden"
                    style={{
                      aspectRatio: '4/5',
                      width: '100%',
                      position: 'relative',
                      backgroundColor: '#F2F2F2',
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
                          src="/assets/COTM/cover.png"
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
                        {/* Base layer - Image 7 (always visible) */}
                        <Image
                          src="/assets/CCP/7.png"
                          alt="CCP"
                          width={500}
                          height={625}
                          className="w-full h-full object-contain"
                        />
                        {/* State 0: Images 8+9 */}
                        <AnimatePresence>
                          {ccpLayerIndex === 0 && (
                            <>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, transform: 'translateY(-25%)' }}
                              >
                                <Image src="/assets/CCP/8.png" alt="CCP" width={500} height={625} className="w-full h-full object-contain" />
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
                              >
                                <Image src="/assets/CCP/9.png" alt="CCP" width={500} height={625} className="w-full h-full object-contain" />
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                        {/* State 1: Images 11+12 */}
                        <AnimatePresence>
                          {ccpLayerIndex === 1 && (
                            <>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, transform: 'translateY(-10%)' }}
                              >
                                <Image src="/assets/CCP/11.png" alt="CCP" width={500} height={625} className="w-full h-full object-contain" />
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
                              >
                                <Image src="/assets/CCP/12.png" alt="CCP" width={500} height={625} className="w-full h-full object-contain" />
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                        {/* State 2: Images 15+16 */}
                        <AnimatePresence>
                          {ccpLayerIndex === 2 && (
                            <>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
                              >
                                <Image src="/assets/CCP/15.png" alt="CCP" width={500} height={625} className="w-full h-full object-contain" />
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
                              >
                                <Image src="/assets/CCP/16.png" alt="CCP" width={500} height={625} className="w-full h-full object-contain" />
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                        {/* State 3: Images 23+24 */}
                        <AnimatePresence>
                          {ccpLayerIndex === 3 && (
                            <>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
                              >
                                <Image src="/assets/CCP/23.png" alt="CCP" width={500} height={625} className="w-full h-full object-contain" />
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
                              >
                                <Image src="/assets/CCP/24.png" alt="CCP" width={500} height={625} className="w-full h-full object-contain" />
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                        {/* State 4: Images 27+28 */}
                        <AnimatePresence>
                          {ccpLayerIndex === 4 && (
                            <>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
                              >
                                <Image src="/assets/CCP/27.png" alt="CCP" width={500} height={625} className="w-full h-full object-contain" />
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
                              >
                                <Image src="/assets/CCP/28.png" alt="CCP" width={500} height={625} className="w-full h-full object-contain" />
                              </motion.div>
                            </>
                          )}
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
                return (
                  <Link
                    key={poster.id}
                    href={poster.link}
                    target={poster.link.startsWith('http') ? '_blank' : undefined}
                    rel={poster.link.startsWith('http') ? 'noopener noreferrer' : undefined}
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
            className="fixed bg-black/50 flex items-center justify-center z-50 popup-backdrop"
            style={{ top: '-200vh', bottom: '-200vh', left: 0, right: 0 }}
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
                className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors"
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
                Each month, we feature one person. Every day, they answer one new question. Call to hear today&apos;s answer. Call everyday and you get to know someone over the course of a month.
              </p>
              {/* CALL NOW button - mobile only, right after "course of a month" */}
              {isTouchDevice && (
                <a
                  href="tel:6097322482"
                  className="mt-4 px-6 py-2 bg-[#F8330D] hover:bg-black text-white rounded-full transition-colors font-[family-name:var(--font-inter)] font-bold inline-block hover-wiggle"
                >
                  CALL NOW
                </a>
              )}
              <p className="mt-4 text-black font-[family-name:var(--font-inter)] italic">
                Pitch us new questions / come on the show by emailing{' '}
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
                <a href="https://www.tiktok.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
                <a href="https://x.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://substack.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                  </svg>
                </a>
              </div>
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
            className="fixed bg-black/50 flex items-center justify-center z-50 popup-backdrop"
            style={{ top: '-200vh', bottom: '-200vh', left: 0, right: 0 }}
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
                className="absolute top-4 right-4 text-3xl leading-none hover:text-[#F8330D] text-gray-400"
              >
                &times;
              </button>

              {/* Custom Audio Player - at top */}
              <div className="mb-6 mt-6 md:mt-0 max-w-sm mx-auto">
                <audio
                  ref={audioRef}
                  onTimeUpdate={handleAudioTimeUpdate}
                  onLoadedMetadata={handleAudioLoadedMetadata}
                  onEnded={() => setIsAudioPlaying(false)}
                  className="hidden"
                >
                  <source src="/audio/dreams.mp3" type="audio/mpeg" />
                </audio>
                <div className="flex items-center gap-3 bg-white rounded-full px-4 py-3 shadow-lg">
                  {/* Play/Pause Button */}
                  <button
                    onClick={toggleAudio}
                    className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-black transition-colors"
                  >
                    {isAudioPlaying ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <polygon points="5,3 19,12 5,21" />
                      </svg>
                    )}
                  </button>

                  {/* Time */}
                  <span className="text-sm text-gray-600 min-w-[70px]">
                    {formatTime(audioCurrentTime)} / {formatTime(audioDuration || 0)}
                  </span>

                  {/* Progress Bar */}
                  <div
                    className="flex-1 h-1 bg-gray-300 rounded-full cursor-pointer"
                    onClick={handleAudioSeek}
                  >
                    <div
                      className="h-full bg-gray-600 rounded-full transition-all"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                </div>
              </div>

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

                <p
                  className="text-base md:text-lg text-black leading-relaxed mb-6 text-justify"
                  style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}
                >
                  If you&apos;re working on a new product, creating content, or hosting events and could use a little help with creative direction / strategy, we might make a good team.
                </p>

                <div className="text-center">
                  <Link
                    href="https://calendar.app.google/7Y2Mws8dAD7hSY1f8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#F8330D] text-white font-bold py-3 px-6 rounded-full hover:bg-black transition-colors text-sm shadow-lg font-[family-name:var(--font-inter)] hover-wiggle"
                  >
                    This is the best way to find out.
                  </Link>
                  <p className="text-gray-600 mt-2" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif', fontSize: '0.79rem' }}>
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
            className="fixed bg-black/50 flex items-center justify-center z-50 popup-backdrop"
            style={{ top: '-200vh', bottom: '-200vh', left: 0, right: 0 }}
            onClick={() => { setShowSTWLPopup(false); setSTWLEmail(''); setSTWLMessage(''); }}
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
                onClick={() => { setShowSTWLPopup(false); setSTWLEmail(''); setSTWLMessage(''); }}
                className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors"
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
                Once a week, we share three small things that brought someone joy.
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
              <form onSubmit={handleSTWLSubscribe} className="text-right">
                <input
                  type="text"
                  placeholder="Enter your email"
                  value={stwlEmail}
                  onChange={(e) => { setSTWLEmail(e.target.value); setSTWLMessage(''); }}
                  className="w-full px-4 py-3 rounded-full border border-black mb-3 font-[family-name:var(--font-inter)] text-right text-black focus:outline-none focus:border-[#F8330D] focus:ring-1 focus:ring-[#F8330D]"
                />
                <button
                  type="submit"
                  disabled={stwlSubmitting || stwlMessage.includes("You're")}
                  className={`inline-block text-white font-bold py-3 px-6 rounded-full transition-colors font-[family-name:var(--font-inter)] disabled:opacity-100 hover-wiggle ${stwlMessage.includes("You're") ? 'bg-black' : 'bg-[#F8330D] hover:bg-black'}`}
                >
                  {stwlSubmitting ? 'Subscribing...' : stwlMessage.includes("You're") ? "You're in!" : 'Subscribe'}
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
                <a href="https://www.tiktok.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
                <a href="https://x.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://substack.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
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
            className="fixed bg-black/50 flex items-center justify-center z-50 popup-backdrop"
            style={{ top: '-200vh', bottom: '-200vh', left: 0, right: 0 }}
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
                className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors"
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
                  const response = await fetch('/api/coming-soon-subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: comingSoonEmail }),
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
                  className={`w-full text-white font-bold py-3 px-6 rounded-full transition-colors font-[family-name:var(--font-inter)] hover-wiggle ${comingSoonMessage === "You're in!" ? 'bg-black' : 'bg-[#F8330D] hover:bg-black'}`}
                >
                  {comingSoonSubmitting ? 'Subscribing...' : comingSoonMessage === "You're in!" ? "You're in!" : 'Keep me posted'}
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
                <a href="https://www.tiktok.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>
                <a href="https://x.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                  <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
                <a href="https://substack.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
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
              <a href="https://www.tiktok.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a href="https://x.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://substack.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
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
              <a href="https://www.tiktok.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a href="https://x.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://substack.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
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
