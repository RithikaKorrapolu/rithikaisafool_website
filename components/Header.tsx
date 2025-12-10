"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Menu Icon on the left */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="cursor-pointer"
        >
          <Image
            src="/menu.png"
            alt="Menu"
            width={200}
            height={80}
            priority
          />
        </motion.button>

        {/* Centered Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute left-1/2 -translate-x-1/2"
        >
          <Image
            src="/fulllogo_black.png"
            alt="Logo"
            width={200}
            height={80}
            priority
          />
        </motion.div>

        {/* Empty div for spacing balance */}
        <div className="w-[200px]"></div>
      </div>
    </header>
  );
}
