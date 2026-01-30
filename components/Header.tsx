"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useState, useRef, useEffect } from "react";

// Video data - same as about page
const videos = [
  { id: 1, videoUrl: "/videos/video1.mp4", headline: "FOOTAGE: ROHAN ATTEMPTS TO CONNECT WITH ANOTHER MAN IN ELEVATOR" },
  { id: 3, videoUrl: "/videos/video3.mp4", headline: "FOOTAGE: GLORY SETS OFF MINI DANCE PARTY DURING LUNCH" },
  { id: 5, videoUrl: "/videos/video5.mp4", headline: "FOOTAGE: JORDAN WEARS FUNNY HAT WHILE CATCHING UP WITH FRIEND" },
  { id: 4, videoUrl: "/videos/video4.mp4", headline: "FOOTAGE: IDIL AND FRIEND ONLY ONES DANCING AT LOCAL CONCERT" },
];

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { openCart, cartCount } = useCart();
  const isVoicemailPage = pathname === '/voicemail-show';

  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentVideo = videos[currentVideoIndex];

  // Handle video end - move to next video
  const handleVideoEnd = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length);
  };

  // Force video to reload when source changes
  useEffect(() => {
    if (videoRef.current && showVideoPopup) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [currentVideo, showVideoPopup]);

  // Reset video index when popup closes
  useEffect(() => {
    if (!showVideoPopup) {
      setCurrentVideoIndex(0);
    }
  }, [showVideoPopup]);

  return (
    <>
    <header className={`fixed top-0 left-0 w-full z-50 ${isVoicemailPage ? 'bg-[#ebf8fd]' : 'bg-white'}`}>
      {/* Top Header with Menu, Logo, Cart */}
      <div className="flex items-center justify-between px-2 py-4 md:px-6 md:py-4 border-b border-gray-200">
        {/* Home Button - Left */}
        <Link
          href="/"
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
        </Link>

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

    {/* Video Popup */}
    <AnimatePresence>
      {showVideoPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
          onClick={() => setShowVideoPopup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-4xl md:max-w-5xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowVideoPopup(false)}
              className="absolute -top-10 right-0 text-white text-3xl hover:text-[#F8330D] transition-colors z-10"
            >
              ×
            </button>

            {/* Video Container */}
            <div className="relative rounded-2xl overflow-hidden">
              <video
                ref={videoRef}
                key={currentVideo?.id}
                autoPlay
                muted={isMuted}
                playsInline
                className="w-full h-auto max-h-[70vh] object-cover bg-black"
                onEnded={handleVideoEnd}
              >
                <source src={currentVideo?.videoUrl} type="video/mp4" />
              </video>

              {/* Volume Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-4 left-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all z-30"
              >
                {isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>

              {/* Breaking News Overlay */}
              <div className="absolute bottom-4 md:bottom-6 left-0 right-0 px-2 md:px-6 flex justify-center">
                <div className="relative inline-block w-[90%] md:w-[80%] max-w-5xl">
                  <div className="relative z-10 w-full">
                    {/* Red BREAKING NEWS box */}
                    <div className="absolute -top-[1.1rem] sm:-top-5 md:-top-8 left-0 bottom-[0.9rem] sm:bottom-[1.2rem] md:bottom-[2rem] pl-[2%] sm:pl-[1%] pr-1 sm:pr-2 md:pr-4 z-0 inline-block" style={{ backgroundColor: 'rgba(255, 0, 0, 0.6)' }}>
                      <div className="relative -top-[0.25rem] sm:top-0 md:top-0">
                        <span className="text-white font-bold text-[0.68rem] sm:text-sm md:text-lg lg:text-xl tracking-tight font-[family-name:var(--font-jaldi)]">BREAKING NEWS</span>
                      </div>
                    </div>

                    {/* Gray headline box */}
                    <div className="px-2 md:px-6 py-0.5 md:py-2 ml-[2%] sm:ml-[1%] w-[98%] sm:w-[99%] relative z-10" style={{ backgroundColor: 'rgba(217, 217, 217, 0.9)' }}>
                      <AnimatePresence mode="wait">
                        <motion.h1
                          key={currentVideo?.id + '-headline'}
                          initial={{ opacity: 0, rotateX: -90 }}
                          animate={{ opacity: 1, rotateX: 0 }}
                          exit={{ opacity: 0, rotateX: 90 }}
                          transition={{ duration: 0.5 }}
                          className="text-black text-[0.6rem] md:text-xl lg:text-2xl font-bold leading-tight uppercase font-[family-name:var(--font-inter)] max-w-[85%] md:max-w-full"
                        >
                          {currentVideo?.headline}
                        </motion.h1>
                      </AnimatePresence>
                    </div>

                    {/* Black tagline box */}
                    <div className="px-2 md:px-6 py-0.5 w-full relative z-10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                      <p className="text-white text-[0.6rem] md:text-base lg:text-lg font-bold uppercase tracking-wide font-[family-name:var(--font-inter)]">
                        LIFE IS BETTER WHEN YOU PLAY THE FOOL
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video indicators */}
              <div className="absolute top-4 right-4 flex gap-2">
                {videos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentVideoIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentVideoIndex ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
