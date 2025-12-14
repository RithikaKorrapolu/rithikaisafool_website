"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Video data with headlines
const videos = [
  {
    id: 1,
    videoUrl: "/videos/video1.mp4",
    headline: "FOOTAGE: ROHAN PALLA ATTEMPTS TO CONNECT WITH ANOTHER MAN IN ELEVATOR",
    tagline: "LIFE IS BETTER WHEN YOU PLAY THE FOOL",
    placeholder: "Video 1 - Juggling Tutorial"
  },
  {
    id: 2,
    videoUrl: "/videos/video2.mp4",
    headline: "FOOTAGE: SHLOK CAUGHT WORKING ON NEW ALBUM IN BETWEEN CUSTOMERS",
    tagline: "LIFE IS BETTER WHEN YOU PLAY THE FOOL",
    placeholder: "Video 2 - Comedy Sketch"
  },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const currentVideo = videos[currentIndex];

  // Advance to next video when current video ends
  const handleVideoEnd = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

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
                        key={currentVideo.id + '-headline'}
                        initial={{ opacity: 0, rotateX: -90 }}
                        animate={{ opacity: 1, rotateX: 0 }}
                        exit={{ opacity: 0, rotateX: 90 }}
                        transition={{ duration: 0.5 }}
                        className="text-black text-xs md:text-xl lg:text-2xl font-bold leading-none md:leading-tight uppercase font-[family-name:var(--font-inter)] max-w-[90%] md:max-w-full"
                      >
                        {currentVideo.headline}
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

      {/* Scrolling Text Marquee */}
      <div className="fixed bottom-0 left-0 w-full bg-white py-3 overflow-hidden z-40" style={{ boxShadow: '0px 4px 34px 0px rgba(0, 0, 0, 0.25)' }}>
        <div className="flex animate-marquee-seamless" style={{ letterSpacing: '-0.06em' }}>
          <div className="flex whitespace-nowrap">
            <span className="text-sm md:text-lg font-normal italic text-black font-[family-name:var(--font-inter)]">
              Thank you for being here. This is my dream.&nbsp;
            </span>
            <span className="text-sm md:text-lg font-normal italic text-black font-[family-name:var(--font-inter)]">
              Thank you for being here. This is my dream.&nbsp;
            </span>
            <span className="text-sm md:text-lg font-normal italic text-black font-[family-name:var(--font-inter)]">
              Thank you for being here. This is my dream.&nbsp;
            </span>
            <span className="text-sm md:text-lg font-normal italic text-black font-[family-name:var(--font-inter)]">
              Thank you for being here. This is my dream.&nbsp;
            </span>
          </div>
          <div className="flex whitespace-nowrap" aria-hidden="true">
            <span className="text-sm md:text-lg font-normal italic text-black font-[family-name:var(--font-inter)]">
              Thank you for being here. This is my dream.&nbsp;
            </span>
            <span className="text-sm md:text-lg font-normal italic text-black font-[family-name:var(--font-inter)]">
              Thank you for being here. This is my dream.&nbsp;
            </span>
            <span className="text-sm md:text-lg font-normal italic text-black font-[family-name:var(--font-inter)]">
              Thank you for being here. This is my dream.&nbsp;
            </span>
            <span className="text-sm md:text-lg font-normal italic text-black font-[family-name:var(--font-inter)]">
              Thank you for being here. This is my dream.&nbsp;
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
