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
  const isVoicemailPage = pathname === '/voicemail-show';

  return (
    <header className={`fixed top-0 left-0 w-full z-50 ${isVoicemailPage ? 'bg-[#ebf8fd]' : 'bg-white'}`}>
      {/* Top Header with Menu, Logo, Cart */}
      <div className="flex items-center justify-between px-2 py-4 md:px-6 md:py-4 border-b border-gray-200">
        {/* Home Button - Left */}
        <a
          href="/"
          onClick={(e) => {
            if (pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="cursor-pointer ml-4 md:ml-8"
        >
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
              className="w-[41px] md:w-[58px] h-auto object-contain home-logo-shadow"
            />
          </motion.div>
        </a>

        {/* Logo - Center */}
        <a
          href="/"
          onClick={(e) => {
            if (pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="cursor-pointer"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            whileHover={{
              y: [0, -5, 2, -3, 6, -2, 4, -1, 0],
              rotate: [0, -12, 5, 8, -6, 10, -4, 7, -8, 3, 0],
              scale: [1, 1.08, 0.92, 1.05, 0.95, 1.1, 0.9, 1.03, 0.97, 1],
              transition: {
                y: {
                  duration: 2.3,
                  ease: "easeInOut",
                  repeat: Infinity,
                },
                rotate: {
                  duration: 2.7,
                  ease: "easeInOut",
                  repeat: Infinity,
                },
                scale: {
                  duration: 2.1,
                  ease: "easeInOut",
                  repeat: Infinity,
                },
              }
            }}
            transition={{
              opacity: { duration: 0.5 },
            }}
          >
            <Image
              src="/assets/home_logo.png"
              alt="Logo"
              width={240}
              height={96}
              priority
              className="w-[135px] md:w-48 h-auto"
            />
          </motion.div>
        </a>

        {/* Cart Icon - Right */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ rotate: -60 }}
          transition={{ duration: 0.3 }}
          onClick={openCart}
          className="cursor-pointer mr-4 md:mr-8 relative"
        >
          <Image
            src="/assets/cart_icon.png"
            alt="Cart"
            width={35}
            height={35}
            priority
            className="w-[22px] md:w-[31px] h-auto object-contain"
          />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#F8330D] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center font-[family-name:var(--font-inter)]">
              {cartCount}
            </span>
          )}
        </motion.button>
      </div>

      {/* Navigation Bar with Drop Shadow */}
      <div className={`${isVoicemailPage ? 'bg-[#d4f1fa]' : 'bg-[#F2F2F2]'} text-black px-2 py-4 md:px-6 md:py-3.5`} style={{ boxShadow: '0px 4px 34px 0px rgba(0, 0, 0, 0.25)' }}>
        <div className="flex gap-4 md:gap-12 justify-center">
          <Link href="/about" className="inline-block">
            <motion.div
              className="px-2 py-1"
              whileHover="hover"
              initial="rest"
              animate="rest"
            >
              <motion.span
                className={`text-[0.96rem] md:text-lg font-bold tracking-tighter inline-block ${pathname === '/about' ? 'text-[#F8330D]' : ''}`}
                variants={{
                  rest: { rotate: pathname === '/about' ? 180 : 0 },
                  hover: { rotate: 180 }
                }}
                transition={{ duration: 0.3 }}
              >
                About!
              </motion.span>
            </motion.div>
          </Link>
          <Link href="/" className="inline-block">
            <motion.div
              className="px-2 py-1"
              whileHover="hover"
              initial="rest"
              animate="rest"
            >
              <motion.span
                className={`text-[0.96rem] md:text-lg font-bold tracking-tighter inline-block ${pathname === '/' ? 'text-[#F8330D]' : ''}`}
                variants={{
                  rest: { rotate: pathname === '/' ? 180 : 0 },
                  hover: { rotate: 180 }
                }}
                transition={{ duration: 0.3 }}
              >
                Work!
              </motion.span>
            </motion.div>
          </Link>
          <Link href="/shop" className="inline-block">
            <motion.div
              className="px-2 py-1"
              whileHover="hover"
              initial="rest"
              animate="rest"
            >
              <motion.span
                className={`text-[0.96rem] md:text-lg font-bold tracking-tighter inline-block ${pathname === '/shop' ? 'text-[#F8330D]' : ''}`}
                variants={{
                  rest: { rotate: pathname === '/shop' ? 180 : 0 },
                  hover: { rotate: 180 }
                }}
                transition={{ duration: 0.3 }}
              >
                Shop!
              </motion.span>
            </motion.div>
          </Link>
          <Link href="/connect" className="inline-block">
            <motion.div
              className="px-2 py-1"
              whileHover="hover"
              initial="rest"
              animate="rest"
            >
              <motion.span
                className={`text-[0.96rem] md:text-lg font-bold tracking-tighter inline-block ${pathname === '/connect' ? 'text-[#F8330D]' : ''}`}
                variants={{
                  rest: { rotate: pathname === '/connect' ? 180 : 0 },
                  hover: { rotate: 180 }
                }}
                transition={{ duration: 0.3 }}
              >
                Connect!
              </motion.span>
            </motion.div>
          </Link>
        </div>
      </div>
    </header>
  );
}
