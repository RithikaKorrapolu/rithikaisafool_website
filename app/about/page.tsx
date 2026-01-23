"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Video data with headlines
const videos = [
  {
    id: 1,
    videoUrl: "/videos/video1.mp4",
    headline: "FOOTAGE: ROHAN ATTEMPTS TO CONNECT WITH ANOTHER MAN IN ELEVATOR",
    tagline: "LIFE IS BETTER WHEN YOU PLAY THE FOOL",
    placeholder: "Video 1 - Juggling Tutorial"
  },
  {
    id: 3,
    videoUrl: "/videos/video3.mp4",
    headline: "FOOTAGE: GLORY SETS OFF MINI DANCE PARTY DURING LUNCH",
    tagline: "LIFE IS BETTER WHEN YOU PLAY THE FOOL",
    placeholder: "Video 3 - Dance Party"
  },
  {
    id: 5,
    videoUrl: "/videos/video5.mp4",
    headline: "FOOTAGE: JORDAN WEARS FUNNY HAT WHILE CATCHING UP WITH FRIEND",
    tagline: "LIFE IS BETTER WHEN YOU PLAY THE FOOL",
    placeholder: "Video 5 - Funny Hat"
  },
  {
    id: 4,
    videoUrl: "/videos/video4.mp4",
    headline: "FOOTAGE: IDIL AND FRIEND ONLY ONES DANCING AT LOCAL CONCERT",
    tagline: "LIFE IS BETTER WHEN YOU PLAY THE FOOL",
    placeholder: "Video 4 - Rock Concert"
  },
];

const slides = [
  { id: 1, image: "/assets/about/18.png" },
  { id: 2, image: "/assets/about/19.png" },
  { id: 3, image: "/assets/about/20.png" },
  { id: 4, image: "/assets/about/21.png" },
];

export default function About() {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Video state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [showTooltip1, setShowTooltip1] = useState(false);
  const [showTooltip2, setShowTooltip2] = useState(false);
  const [showTooltip3, setShowTooltip3] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentVideo = videos[currentIndex];
  const nextVideoIndex = (currentIndex + 1) % videos.length;

  // Video handlers
  const handleVideoEnd = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  // Force video to reload when source changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(err => console.error('Video play error:', err));
    }
  }, [currentVideo]);

  // Preload next video
  useEffect(() => {
    const nextVideo = document.createElement('video');
    nextVideo.src = videos[nextVideoIndex].videoUrl;
    nextVideo.preload = 'auto';
  }, [nextVideoIndex]);

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

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

  return (
    <div style={{ backgroundColor: '#F2F2F2', minHeight: '100vh' }}>
      <style>{`
        @keyframes slowZoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.15);
          }
        }
        .zoom-active {
          animation: slowZoom 4s ease-out forwards;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        .video-left-mobile {
          object-position: 35% center;
        }
        @media (min-width: 768px) {
          .video-left-mobile {
            object-position: center;
          }
        }
      `}</style>
      <main className="pt-[130px] md:pt-[130px] lg:pt-[140px]" style={{ backgroundColor: '#F2F2F2' }}>
        {/* Dedication Text */}
        <div className="container mx-auto px-6 max-w-3xl mt-2 md:mt-8 mb-2 md:mb-6 text-center">
          <p className="text-black font-medium font-[family-name:var(--font-inter)]" style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(1rem, 4vw, 1.375rem)' }}>
            My name is Rithika and this is my <span className="relative inline-block cursor-pointer" onMouseEnter={() => setShowTooltip1(true)} onMouseLeave={() => setShowTooltip1(false)}><strong>creative studio</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>1</sup><AnimatePresence>{showTooltip1 && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-4 z-50 w-96 text-sm font-normal text-left" style={{ letterSpacing: 'normal' }}><p>I want to make art that brings people together in sweet, stupid, surprising ways.<br/>I want to unlock unexpected moments of love.</p></motion.div>)}</AnimatePresence></span>. I&apos;m very lucky because I have many <span className="relative inline-block cursor-pointer" onMouseEnter={() => setShowTooltip2(true)} onMouseLeave={() => setShowTooltip2(false)}><strong>fools</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>2</sup><AnimatePresence>{showTooltip2 && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-4 z-50 whitespace-nowrap text-sm font-normal text-left" style={{ letterSpacing: 'normal' }}><p>see a few below</p></motion.div>)}</AnimatePresence></span> in my life. They taught me how to live well. This is dedicated to <span className="relative inline-block cursor-pointer" onMouseEnter={() => setShowTooltip3(true)} onMouseLeave={() => setShowTooltip3(false)}><strong>them</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>3</sup><AnimatePresence>{showTooltip3 && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-4 z-50 whitespace-nowrap text-sm font-normal text-left" style={{ letterSpacing: 'normal' }}><p>I love you.</p></motion.div>)}</AnimatePresence></span>.
          </p>
        </div>

        {/* Video Section */}
        <div className="w-full px-0 md:px-4 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full mx-auto"
          >
            {/* Video/Image Container */}
            <div className="relative w-full rounded-3xl overflow-hidden" style={{
              boxShadow: '0px 0px 120px 40px rgba(255, 255, 255, 0.6), 0px 4px 36px 0px rgba(0, 0, 0, 0.41)'
            }}>
              {/* Video Player */}
              <AnimatePresence mode="wait">
                <motion.video
                  ref={videoRef}
                  key={currentVideo?.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`w-full h-[60vh] md:h-[75vh] object-cover ${(currentIndex === 0 || currentIndex === 2) ? 'video-left-mobile' : ''}`}
                  autoPlay
                  muted={isMuted}
                  playsInline
                  preload="auto"
                  onEnded={handleVideoEnd}
                  onError={(e) => console.error('Video error:', e)}
                >
                  <source src={currentVideo?.videoUrl} type="video/mp4" />
                </motion.video>
              </AnimatePresence>

              {/* Volume Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-30"
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>

              {/* Breaking News Overlay */}
              <div className="absolute bottom-0 left-0 right-0 pt-8 md:pt-20 pb-2 md:pb-6 px-2 md:px-6 flex justify-center">
                <div className="relative inline-block w-[95%] md:w-[80%] max-w-5xl">
                  {/* Gray and Black boxes - stay in place */}
                  <div className="relative z-10 w-full">
                    {/* Red box positioned to the left, extends to top of black box */}
                    <div className="absolute -top-[1.1rem] sm:-top-5 md:-top-8 left-0 bottom-[0.9rem] sm:bottom-[1.2rem] md:bottom-[2rem] pl-[2%] sm:pl-[1%] pr-1 sm:pr-2 md:pr-4 z-0 inline-block" style={{ backgroundColor: 'rgba(255, 0, 0, 0.6)' }}>
                      <div className="relative -top-[0.25rem] sm:top-0 md:top-0">
                        <span className="text-white font-bold text-[0.7rem] sm:text-xs md:text-lg lg:text-xl tracking-tight font-[family-name:var(--font-jaldi)]">BREAKING NEWS</span>
                      </div>
                    </div>

                    <div className="px-2 md:px-6 py-0.5 md:py-2 ml-[2%] sm:ml-[1%] w-[98%] sm:w-[99%] relative z-10" style={{ backgroundColor: 'rgba(217, 217, 217, 0.9)' }}>
                      <AnimatePresence mode="wait">
                        <motion.h1
                          key={currentVideo?.id + '-headline'}
                          initial={{ opacity: 0, rotateX: -90 }}
                          animate={{ opacity: 1, rotateX: 0 }}
                          exit={{ opacity: 0, rotateX: 90 }}
                          transition={{ duration: 0.5 }}
                          className="text-black text-xs md:text-xl lg:text-2xl font-bold leading-none md:leading-tight uppercase font-[family-name:var(--font-inter)] max-w-[90%] md:max-w-full"
                        >
                          {currentVideo?.headline}
                        </motion.h1>
                      </AnimatePresence>
                    </div>
                    <div className="px-2 md:px-6 py-0.5 w-full relative z-10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                      <p className="text-white text-[0.5rem] md:text-base lg:text-lg font-bold uppercase tracking-wide font-[family-name:var(--font-inter)]">
                        LIFE IS BETTER WHEN YOU PLAY THE FOOL
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video indicators */}
              <div className="absolute top-4 right-4 flex gap-2">
                {videos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

      </main>

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
    </div>
  );
}
