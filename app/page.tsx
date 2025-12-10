"use client";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F2F2F2' }}>
      {/* Speech Bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.6,
          type: "spring" as const,
          stiffness: 200,
          damping: 15
        }}
        className="relative"
      >
        {/* Main speech bubble */}
        <div className="bg-white rounded-3xl px-12 py-8 md:px-16 md:py-12 shadow-2xl relative">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-center"
            style={{ color: '#ff4825' }}
          >
            Rithika is a Fool!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-2xl md:text-3xl text-center mt-4 text-gray-700 font-semibold"
          >
            Coming Soon
          </motion.p>

          {/* Speech bubble tail */}
          <div
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '30px solid transparent',
              borderRight: '30px solid transparent',
              borderTop: '40px solid white',
            }}
          />
        </div>

        {/* Floating animation */}
        <motion.div
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 -z-10"
        />
      </motion.div>

      {/* Floating dots for decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-gray-400 opacity-30"
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </main>
  );
}
