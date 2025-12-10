"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen pt-[180px]" style={{ backgroundColor: '#F2F2F2' }}>
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative w-full max-w-6xl mx-auto"
        >
          {/* Video/Image Container */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border-8 border-gray-800">
            {/* Placeholder for video/image - you can replace with actual content */}
            <div className="w-full aspect-video bg-gray-600 flex items-center justify-center">
              <p className="text-white text-2xl">Video/Image Content Here</p>
            </div>

            {/* Breaking News Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8">
              <div className="bg-[#F44336] inline-block px-4 py-2 mb-4">
                <span className="text-white font-bold text-lg">BREAKING NEWS</span>
              </div>
              <h1 className="text-white text-3xl md:text-5xl font-bold mb-4">
                FOOTAGE: CRYSTAL DESAI IS LEARNING HOW TO JUGGLE AT 28 YEARS OLD
              </h1>
              <p className="text-white text-xl font-semibold">
                LIFE IS BETTER WHEN YOU PLAY THE FOOL
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
