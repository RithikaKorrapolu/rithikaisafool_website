"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useState, useRef, useEffect } from "react";

const DAILY_OFFERINGS = [
  { title: "The Kaleidoscope", description: "A hypnotic journey through art history.", link: "https://www.arthistoryproject.com/kaleidoscope/", category: "Website" },
  { title: "Internet Sculptures", description: "Digital art exploring the boundaries of the web.", link: "https://internetsculptures.com/", category: "Website" },
  { title: "MSCHF", description: "Art collective making weird, wonderful things.", link: "https://mschf.com/", category: "Website" },
  { title: "Appstar", description: "A collection of the most beautiful apps.", link: "https://www.appstar.world/", category: "Website" },
  { title: "Read Something Wonderful", description: "A collection of the best writing on the internet.", link: "https://readsomethingwonderful.com/", category: "Website" },
  { title: "It's Nice That", description: "Championing creativity across art, illustration, and design.", link: "https://www.itsnicethat.com/", category: "Website" },
  { title: "Radiooooo", description: "A musical time machine. Pick a decade, pick a country, listen.", link: "https://app.radiooooo.com/", category: "Website" },
  { title: "Window Swap", description: "See the view from someone else's window, anywhere in the world.", link: "https://www.window-swap.com/", category: "Website" },
  { title: "Pointer Pointer", description: "A photo of someone pointing at your cursor. Every time.", link: "https://pointerpointer.com/", category: "Website" },
  { title: "The Pudding", description: "Visual essays that explain ideas debated in culture.", link: "https://pudding.cool/", category: "Website" },
  { title: "Wait But Why", description: "Long-form posts about science, society, and the human experience.", link: "https://waitbutwhy.com/", category: "Website" },
  { title: "FutureMe", description: "Write a letter to your future self. Receive it when the time comes.", link: "https://www.futureme.org/", category: "Website" },
  { title: "Neal.fun", description: "Delightful internet experiments and interactive experiences.", link: "https://neal.fun/", category: "Website" },
  { title: "Every Noise at Once", description: "A map of every music genre. Click to explore and listen.", link: "https://everynoise.com/", category: "Website" },
  { title: "Staggering Beauty", description: "Wiggle the worm. Warning: flashing lights.", link: "http://www.staggeringbeauty.com/", category: "Website" },
  { title: "SFPC", description: "School for Poetic Computation. Art, code, and critical theory.", link: "https://sfpc.study/", category: "Website" },
  { title: "Spotted in Prod", description: "Real products spotted in TV shows and movies.", link: "https://www.spottedinprod.com/", category: "Website" },
  { title: "Mauhan", description: "A creative portfolio and digital playground.", link: "https://mauhan.com/", category: "Website" },
  { title: "Steve Jobs Archive", description: "Letters, speeches, and interviews from Steve Jobs.", link: "https://letters.stevejobsarchive.com/", category: "Website" },
  { title: "Only Poems Daily", description: "Wake up to a poem every day.", link: "https://www.onlypoemsdaily.com/", category: "Website" },
  { title: "Dialectic", description: "Curated conversations and ideas worth exploring.", link: "https://www.dialectic.fm/", category: "Website" },
  { title: "Godly", description: "Curation of the best web design inspiration.", link: "https://godly.website/", category: "Website" },
  { title: "Oblique Strategies", description: "Creative prompts to break through blocks, inspired by Brian Eno.", link: "https://ob-strat.netlify.app/", category: "Website" },
  { title: "The Unsent Project", description: "Unsent text messages to first loves, shown by color.", link: "https://theunsentproject.com/", category: "Website" },
  { title: "Should I Take A Jacket", description: "The only weather question that matters, answered.", link: "https://www.shoulditakeajacket.com/", category: "Website" },
  { title: "People Look at Art", description: "Photos of people looking at art in museums around the world.", link: "https://space.repponen.com/peoplelookatart/", category: "Website" },
  { title: "CW&T", description: "Beautifully designed tools, time pieces, and objects.", link: "https://cwandt.com/", category: "Website" },
];

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
  const isMuseumPage = pathname === '/theRIAFMuseumOfArt';

  const [showVideoPopup, setShowVideoPopup] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentVideo = videos[currentVideoIndex];

  // Newsletter popup state
  const [showNewsletterPopup, setShowNewsletterPopup] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterCustomContent, setNewsletterCustomContent] = useState<{ title: string; description: string } | null>(null);
  const [dailyOffering, setDailyOffering] = useState<typeof DAILY_OFFERINGS[0] | null>(null);

  // Calculate daily offering on mount
  useEffect(() => {
    const now = new Date();
    const utcYear = now.getUTCFullYear();
    const utcMonth = now.getUTCMonth();
    const utcDay = now.getUTCDate();
    const startOfYear = Date.UTC(utcYear, 0, 1);
    const currentDate = Date.UTC(utcYear, utcMonth, utcDay);
    const dayOfYear = Math.floor((currentDate - startOfYear) / (1000 * 60 * 60 * 24));
    setDailyOffering(DAILY_OFFERINGS[dayOfYear % DAILY_OFFERINGS.length]);
  }, []);

  // Listen for custom event to open newsletter popup
  useEffect(() => {
    const handleOpenNewsletter = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setNewsletterCustomContent(customEvent.detail);
      } else {
        setNewsletterCustomContent(null);
      }
      setShowNewsletterPopup(true);
    };
    window.addEventListener('openNewsletterPopup', handleOpenNewsletter);
    return () => window.removeEventListener('openNewsletterPopup', handleOpenNewsletter);
  }, []);

  // Prevent background scroll when newsletter popup is open
  useEffect(() => {
    if (showNewsletterPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showNewsletterPopup]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setNewsletterStatus('loading');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      if (response.ok) {
        setNewsletterStatus('success');
        setNewsletterEmail('');
      } else {
        const data = await response.json();
        setNewsletterError(data.error || 'Something went wrong');
        setNewsletterStatus('error');
      }
    } catch {
      setNewsletterError('Something went wrong');
      setNewsletterStatus('error');
    }
  };

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
    <header className={`fixed top-0 left-0 w-full z-50 print:hidden ${isMuseumPage ? 'bg-transparent' : 'bg-white'}`}>
      {/* Top Header with Menu, Logo, Cart */}
      <div className={`flex items-center justify-between px-2 py-4 md:px-6 md:py-4 ${isMuseumPage ? 'border-b border-white/20' : 'border-b border-gray-200'}`}>
        {/* Logo Button - Left (Goes to Home) */}
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
      <div className={`${isMuseumPage ? 'bg-transparent text-white' : 'bg-[#F2F2F2] text-black'} px-2 py-4 md:px-6 md:py-3.5`} style={{ boxShadow: isMuseumPage ? 'none' : '0px 4px 34px 0px rgba(0, 0, 0, 0.25)' }}>
        <div className="flex gap-4 md:gap-12 justify-center">
          <Link href="/about" className="inline-block">
            <motion.div
              className="px-2 py-1"
              whileHover="hover"
              initial="rest"
              animate="rest"
            >
              <motion.span
                className={`text-[0.96rem] md:text-lg font-bold tracking-tighter inline-block ${pathname === '/about' ? 'text-[#F8330D]' : isMuseumPage ? 'text-white' : ''}`}
                variants={{
                  rest: { rotate: pathname === '/about' ? 180 : 0 },
                  hover: { rotate: 180 }
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
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
                className={`text-[0.96rem] md:text-lg font-bold tracking-tighter inline-block ${pathname === '/' ? 'text-[#F8330D]' : isMuseumPage ? 'text-white' : ''}`}
                variants={{
                  rest: { rotate: pathname === '/' ? 180 : 0 },
                  hover: { rotate: 180 }
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                Things!
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
                className={`text-[0.96rem] md:text-lg font-bold tracking-tighter inline-block ${pathname === '/connect' ? 'text-[#F8330D]' : isMuseumPage ? 'text-white' : ''}`}
                variants={{
                  rest: { rotate: pathname === '/connect' ? 180 : 0 },
                  hover: { rotate: 180 }
                }}
                transition={{ duration: 0.15, ease: "easeOut" }}
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

    {/* Newsletter Popup */}
    <AnimatePresence>
      {showNewsletterPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
          onClick={() => {
            setShowNewsletterPopup(false);
            setNewsletterStatus('idle');
            setNewsletterError('');
            setNewsletterCustomContent(null);
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md backdrop-blur-xl bg-white/80 rounded-2xl p-8 border border-white/30"
            style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.5)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setShowNewsletterPopup(false);
                setNewsletterStatus('idle');
                setNewsletterError('');
                setNewsletterCustomContent(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl transition-colors"
            >
              ×
            </button>

            {/* Daily Offering */}
            {dailyOffering && (
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-black mb-1" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                  A Daily Offering
                </h2>
                <p className="text-black text-lg mb-4" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                  Something we're a fan of.<br className="md:hidden" /> Updated daily.
                </p>
                <a
                  href={dailyOffering.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block border-2 border-solid border-blue-600 p-5 rounded-xl hover:bg-blue-600/10 transition-colors group shadow-lg"
                >
                  <p className="text-xl font-bold text-blue-600 group-hover:text-black transition-colors mb-1" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                    {dailyOffering.title}
                  </p>
                  <p className="text-base text-black mb-2" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                    {dailyOffering.description}
                  </p>
                  <p className="text-sm font-bold text-blue-600 group-hover:text-black transition-colors" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                    Take the offering →
                  </p>
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

        </>
  );
}
