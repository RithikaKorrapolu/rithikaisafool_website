"use client";

import { motion } from "framer-motion";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
          Rithika is a fool!
        </h1>
      </motion.div>
    </header>
  );
}
