"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

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
    headline: "FOOTAGE: GLORY ACCIDENTALLY SETS OFF DANCE PARTY DURING LUNCH",
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
    headline: "FOOTAGE: IDIL AND RAUL  SEEN EMBRACING THE MUSIC AT LOCAL ROCK CONCERT",
    tagline: "LIFE IS BETTER WHEN YOU PLAY THE FOOL",
    placeholder: "Video 4 - Rock Concert"
  },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const currentVideo = videos[currentIndex];
  const nextVideoIndex = (currentIndex + 1) % videos.length;

  // Advance to next video when current video ends
  const handleVideoEnd = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  // Preload next video
  useEffect(() => {
    const nextVideo = document.createElement('video');
    nextVideo.src = videos[nextVideoIndex].videoUrl;
    nextVideo.preload = 'auto';
  }, [nextVideoIndex]);

  return (
    <main className="min-h-screen pt-[90px] sm:pt-[115px] md:pt-[145px] lg:pt-[155px] pb-20" style={{ backgroundColor: '#F2F2F2' }}>
      {/* Hero Section */}
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-6xl mx-auto -mt-2"
        >
          {/* Video/Image Container */}
          <div className="relative w-full rounded-3xl overflow-hidden" style={{ boxShadow: '0px 4px 36px 0px rgba(0, 0, 0, 0.41)' }}>
            {/* Video Player */}
            <AnimatePresence mode="wait">
              <motion.video
                key={currentVideo?.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full aspect-video"
                autoPlay
                muted={isMuted}
                playsInline
                preload="auto"
                onEnded={handleVideoEnd}
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

        {/* New Section - We're an independent studio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="max-w-6xl mx-auto mt-16 mb-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left Column - Heading and Placeholder Box */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="mb-6 text-center"
              >
                <h2 className="text-lg font-bold mb-2 font-[family-name:var(--font-inter)] animate-glimmer">
                  We're an independent, female owned creative studio.
                </h2>
                <p className="text-sm text-black font-[family-name:var(--font-inter)] italic">
                  (One of the best things in the world to be.)
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="w-full h-[400px] bg-gray-300 rounded-lg"
              ></motion.div>
            </div>

            {/* Right Column - Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="flex flex-col justify-between"
            >
              <div className="mt-24">
                <h3 className="text-4xl font-normal text-black mb-6" style={{ fontFamily: 'Gill Sans Nova, Gill Sans MT, Gill Sans, sans-serif' }}>
                  People are awesome when they're willing to be fools for each other.
                </h3>
                <p className="text-lg text-black leading-relaxed mb-6" style={{ fontFamily: 'Gill Sans Nova, Gill Sans MT, Gill Sans, sans-serif' }}>
                  Dancing with strangers. Trying new bits. Betting on someone new. That's how love starts. When people take risks to be playful and open and soft with each other.
                </p>
                <p className="text-2xl font-normal text-black mb-8" style={{ fontFamily: 'Gill Sans Nova, Gill Sans MT, Gill Sans, sans-serif' }}>
                  We make art that encourages that.
                </p>
              </div>

              <div className="flex justify-end">
                <a href="/about">
                  <button
                    className="px-6 py-2 border-2 border-black rounded-full text-sm font-semibold text-black hover:bg-black hover:text-white transition-all font-[family-name:var(--font-inter)]"
                    style={{ boxShadow: '0px 4px 4px 0px #F8330D', transform: 'rotate(-6deg)' }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'inset 0px 0px 10px 2px rgba(0, 0, 0, 0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0px 4px 4px 0px #F8330D'}
                  >
                    "wtf are you on about?"
                  </button>
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="max-w-6xl mx-auto mb-16"
        >
          <h2 className="text-2xl font-bold text-black font-[family-name:var(--font-inter)] mb-8 text-center">
            Recent social media
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Instagram */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="bg-white rounded-lg p-4"
              style={{ boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6" fill="url(#instagram-gradient)" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="instagram-gradient-feed" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#833AB4' }} />
                      <stop offset="50%" style={{ stopColor: '#E1306C' }} />
                      <stop offset="100%" style={{ stopColor: '#FD1D1D' }} />
                    </linearGradient>
                  </defs>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="font-semibold text-black font-[family-name:var(--font-inter)]">Instagram</span>
              </div>
              <div className="w-full h-64 bg-gray-300 rounded-lg mb-2"></div>
              <p className="text-sm text-black font-[family-name:var(--font-inter)]">Latest post</p>
            </motion.div>

            {/* Twitter/X */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="bg-white rounded-lg p-4"
              style={{ boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="font-semibold text-black font-[family-name:var(--font-inter)]">X (Twitter)</span>
              </div>
              <div className="w-full h-64 bg-gray-300 rounded-lg mb-2"></div>
              <p className="text-sm text-black font-[family-name:var(--font-inter)]">Latest post</p>
            </motion.div>

            {/* TikTok */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="bg-white rounded-lg p-4"
              style={{ boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.1)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
                <span className="font-semibold text-black font-[family-name:var(--font-inter)]">TikTok</span>
              </div>
              <div className="w-full h-64 bg-gray-300 rounded-lg mb-2"></div>
              <p className="text-sm text-black font-[family-name:var(--font-inter)]">Latest post</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scrolling Text Marquee */}
      <div className="fixed bottom-0 left-0 w-full bg-white py-3 overflow-hidden z-40" style={{ boxShadow: '0px 4px 34px 0px rgba(0, 0, 0, 0.25)' }}>
        <div className="flex animate-marquee-seamless" style={{ letterSpacing: '-0.06em' }}>
          <div className="flex whitespace-nowrap">
            {Array(20).fill(0).map((_, i) => (
              <span key={i} className="text-base md:text-xl font-normal italic text-black font-[family-name:var(--font-inter)]">
                You made it! Wahoo and welcome!&nbsp;
              </span>
            ))}
          </div>
          <div className="flex whitespace-nowrap" aria-hidden="true">
            {Array(20).fill(0).map((_, i) => (
              <span key={i} className="text-base md:text-xl font-normal italic text-black font-[family-name:var(--font-inter)]">
                You made it! Wahoo and welcome!&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
