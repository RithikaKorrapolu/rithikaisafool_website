"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

// Video data with headlines
const videos = [
  {
    id: 1,
    videoUrl: "/videos/video1.mp4", // You can replace with actual video URLs
    headline: "FOOTAGE: CRYSTAL DESAI IS LEARNING HOW TO JUGGLE AT 28 YEARS OLD",
    tagline: "LIFE IS BETTER WHEN YOU PLAY THE FOOL",
    placeholder: "Video 1 - Juggling Tutorial"
  },
  {
    id: 2,
    videoUrl: "/videos/video2.mp4",
    headline: "FOOTAGE: CRYSTAL DESAI IS LEARNING HOW TO JUGGLE AT 28 YEARS OLD",
    tagline: "LIFE IS BETTER WHEN YOU PLAY THE FOOL",
    placeholder: "Video 2 - Comedy Sketch"
  },
  {
    id: 3,
    videoUrl: "/videos/video3.mp4",
    headline: "FOOTAGE: CRYSTAL DESAI IS LEARNING HOW TO JUGGLE AT 28 YEARS OLD",
    tagline: "LIFE IS BETTER WHEN YOU PLAY THE FOOL",
    placeholder: "Video 3 - Studio Session"
  },
];

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance videos every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % videos.length);
    }, 10000); // Change video every 10 seconds

    return () => clearInterval(timer);
  }, []);

  const currentVideo = videos[currentIndex];

  return (
    <main className="min-h-screen pt-[160px]" style={{ backgroundColor: '#F2F2F2' }}>
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-6xl mx-auto"
        >
          {/* Video/Image Container */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-black">
            {/* Video Placeholder - Replace with actual video player */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentVideo.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full aspect-video bg-gray-600 flex items-center justify-center"
              >
                <p className="text-white text-2xl">{currentVideo.placeholder}</p>
              </motion.div>
            </AnimatePresence>

            {/* Breaking News Overlay */}
            <div className="absolute bottom-0 left-0 right-0 pt-20 pb-6 px-6 flex justify-center">
              <div className="relative inline-block w-[80%] max-w-5xl">
                {/* Gray and Black boxes - stay in place */}
                <div className="relative z-10 w-full">
                  {/* Red box positioned to the left, extends to top of black box */}
                  <div className="bg-[#AC0C0E] absolute -top-12 left-0 bottom-[2.25rem] pl-[1%] pr-8 pt-3 z-0">
                    <span className="text-white font-bold text-2xl md:text-3xl tracking-wider font-[family-name:var(--font-jaldi)]">BREAKING NEWS</span>
                  </div>

                  <div className="bg-[#D9D9D9] px-6 py-4 ml-[1%] w-[99%] relative z-20">
                    <AnimatePresence mode="wait">
                      <motion.h1
                        key={currentVideo.id + '-headline'}
                        initial={{ opacity: 0, rotateX: -90 }}
                        animate={{ opacity: 1, rotateX: 0 }}
                        exit={{ opacity: 0, rotateX: 90 }}
                        transition={{ duration: 0.5 }}
                        className="text-black text-xl md:text-xl lg:text-2xl font-bold leading-tight uppercase font-[family-name:var(--font-inter)]"
                      >
                        {currentVideo.headline}
                      </motion.h1>
                    </AnimatePresence>
                  </div>
                  <div className="bg-black px-6 py-1 w-full">
                    <p className="text-white text-lg md:text-xl font-bold uppercase tracking-wide font-[family-name:var(--font-inter)]">
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
  );
}
