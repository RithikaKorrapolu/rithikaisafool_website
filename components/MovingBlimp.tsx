"use client";

import { motion } from "framer-motion";

export default function MovingBlimp() {
  return (
    <div className="relative w-full h-64 overflow-hidden z-50">
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 z-50"
        animate={{
          x: ["100vw", "-400px"],
          y: [0, -30, 20, -15, 30, -10, 0, 25, -20, 15, -5, 0],
          rotate: [0, -2, 1, -1.5, 2, -0.5, 0, 1.5, -1, 0.5, -2, 0],
        }}
        transition={{
          x: {
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            repeatType: "loop",
          },
          y: {
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "loop",
          },
          rotate: {
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            repeatType: "loop",
          },
        }}
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-96 h-auto"
        >
          <source src="/assets/yellow blimp.mp4" type="video/mp4" />
        </video>
      </motion.div>
    </div>
  );
}
