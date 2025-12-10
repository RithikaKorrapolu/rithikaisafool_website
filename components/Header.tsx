"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white">
      {/* Top Header with Menu, Logo, Cart */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        {/* Menu Icon - Left */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="10" r="3" fill="black"/>
            <circle cx="20" cy="25" r="3" fill="black"/>
            <path d="M15 35 L20 30 L25 35" stroke="black" strokeWidth="2" fill="none"/>
          </svg>
          <span className="text-lg font-semibold">Menu</span>
        </motion.button>

        {/* Logo - Center */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/fulllogo_black.png"
            alt="Logo"
            width={240}
            height={96}
            priority
          />
        </motion.div>

        {/* Cart Icon - Right */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="cursor-pointer"
        >
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 10 L10 10 L15 30 L35 30 L38 15 L12 15" stroke="black" strokeWidth="2" fill="none"/>
            <circle cx="18" cy="35" r="2" fill="black"/>
            <circle cx="32" cy="35" r="2" fill="black"/>
          </svg>
        </motion.button>
      </div>

      {/* Orange Navigation Bar */}
      <div className="bg-[#F44336] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex gap-8">
          <button className="text-lg font-bold hover:underline">Shop!</button>
          <button className="text-lg font-bold hover:underline">Studio!</button>
          <button className="text-lg font-bold hover:underline">Idea Open Mic!</button>
        </div>
        <div className="bg-white text-black px-4 py-1 rounded">
          <div className="text-sm font-semibold">New York City</div>
          <div className="text-xs">11:48 AM ET</div>
        </div>
      </div>
    </header>
  );
}
