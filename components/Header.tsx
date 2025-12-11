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
          className="cursor-pointer ml-8"
        >
          <Image
            src="/assets/menu_logo.png"
            alt="Menu"
            width={72}
            height={72}
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
            src="/assets/home_logo.png"
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
          className="cursor-pointer mr-8"
        >
          <Image
            src="/assets/cart_icon.png"
            alt="Cart"
            width={35}
            height={35}
            priority
          />
        </motion.button>
      </div>

      {/* Orange Navigation Bar */}
      <div className="bg-[#F8330D] text-white px-6 py-3 border-t-4 border-b-4 border-black">
        <div className="flex gap-8">
          <button className="text-lg font-bold hover:underline">Shop!</button>
          <button className="text-lg font-bold hover:underline">Studio!</button>
          <button className="text-lg font-bold hover:underline">Idea Open Mic!</button>
        </div>
      </div>
    </header>
  );
}
