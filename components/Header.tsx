"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { openCart, cartCount } = useCart();

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white">
      {/* Top Header with Menu, Logo, Cart */}
      <div className="flex items-center justify-between px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 border-b border-gray-200">
        {/* Menu Icon - Left (Mobile Only) */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={onMenuClick}
          className="cursor-pointer ml-2 sm:ml-4 md:ml-8 lg:hidden"
        >
          <Image
            src="/assets/menu_logo.png"
            alt="Menu"
            width={72}
            height={72}
            priority
            className="w-8 h-auto sm:w-11 sm:h-auto object-contain"
          />
        </motion.button>

        {/* Home Button - Left (Desktop Only) */}
        <Link href="/" className="hidden lg:block cursor-pointer ml-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/assets/shorthome_logo.png"
              alt="Home"
              width={72}
              height={72}
              priority
              className="w-[58px] h-auto object-contain home-logo-shadow"
            />
          </motion.div>
        </Link>

        {/* Logo - Center */}
        <Link href="/" className="cursor-pointer">
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
              className="w-[102px] h-auto sm:w-[154px] sm:h-auto md:w-48 md:h-auto"
            />
          </motion.div>
        </Link>

        {/* Cart Icon - Right */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={openCart}
          className="cursor-pointer mr-2 sm:mr-4 md:mr-8 relative"
        >
          <Image
            src="/assets/cart_icon.png"
            alt="Cart"
            width={35}
            height={35}
            priority
            className="w-[22px] h-auto sm:w-[26px] sm:h-auto md:w-7 md:h-auto object-contain"
          />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#F8330D] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-[family-name:var(--font-inter)]">
              {cartCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Navigation Bar with Drop Shadow - Desktop Only */}
      <div className="hidden lg:block bg-[#F2F2F2] text-black px-6 py-3.5" style={{ boxShadow: '0px 4px 34px 0px rgba(0, 0, 0, 0.25)' }}>
        <div className="flex gap-12 justify-center">
          <Link href="/about" className={`text-base font-bold hover:text-[#F8330D] transition-all duration-150 tracking-tighter inline-block hover:-translate-y-1 ${pathname === '/about' ? 'text-[#F8330D]' : ''}`}>About!</Link>
          <Link href="/studio" className={`text-base font-bold hover:text-[#F8330D] transition-all duration-150 tracking-tighter inline-block hover:-translate-y-1 ${pathname === '/studio' ? 'text-[#F8330D]' : ''}`}>Studio!</Link>
          <Link href="/shop" className={`text-base font-bold hover:text-[#F8330D] transition-all duration-150 tracking-tighter inline-block hover:-translate-y-1 ${pathname === '/shop' ? 'text-[#F8330D]' : ''}`}>Shop!</Link>
          <Link href="/connect" className={`text-base font-bold hover:text-[#F8330D] transition-all duration-150 tracking-tighter inline-block hover:-translate-y-1 ${pathname === '/connect' ? 'text-[#F8330D]' : ''}`}>Connect!</Link>
        </div>
      </div>
    </header>
  );
}
