"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src="/fulllogo_black.png"
          alt="Logo"
          width={200}
          height={80}
          priority
        />
      </motion.div>
    </header>
  );
}
