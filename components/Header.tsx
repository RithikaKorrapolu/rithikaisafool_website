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
          className="cursor-pointer"
        >
          <Image
            src="/menu_icon.png"
            alt="Menu"
            width={43}
            height={43}
            priority
          />
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
          <Image
            src="/cart_icon.png"
            alt="Cart"
            width={43}
            height={43}
            priority
          />
        </motion.button>
      </div>

      {/* Orange Navigation Bar */}
      <div className="bg-[#F8330D] text-white px-6 py-3 flex items-center justify-between border-t-2 border-b-2 border-black">
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
