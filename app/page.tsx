"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import AnimatedGrid from "@/components/AnimatedGrid";
import { BouncingBallPoster } from "@/components/BouncingBallPoster";
import FooterSignup from "@/components/FooterSignup";

// Project titles for each grid cell
const projects = [
  { title: "Discover the memories people carry with songs.", link: "/songs-that-hold-memories", hasCover: "sthm" },
  { title: "Rep your conditions.", link: "/shop/condition-of-the-month-hat-1", hasCover: "hat" },
  { title: "Call if we're friends.", link: "/voicemail-show", hasCover: "phone" },
  { title: "Trust a stranger to design your sweatshirt.", link: "/shop/a-stranger-designed-my-sweatshirt", hasCover: true },
  { title: "Experience art through someone else's eyes.", link: "/shop/let-me-show-you", hasCover: "lmsy" },
  { title: "Explore art by vibe.", link: "/museum", hasCover: "museum" },
  { title: "Get a weekly dose of someone else's joy.", link: "/stwl", hasCover: "stwl" },
  { title: "Help us get to know someone new.", link: "/a-month-with-you", hasCover: "amwy" },
  { title: "Remember that we're all a little odd.", link: "/quirks", hasCover: "quirks" },
  { title: "Fly with me.", link: "/studio", hasCover: "client" },
];

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [visibleCell, setVisibleCell] = useState<number | null>(null);
  const [clientImageIndex, setClientImageIndex] = useState(0);
  const [voicemailImageIndex, setVoicemailImageIndex] = useState(11);
  const [stwlImageIndex, setStwlImageIndex] = useState(0);
  const [quirksTypedText, setQuirksTypedText] = useState("");
  const [lmsyImageIndex, setLmsyImageIndex] = useState(0);
  const [visibleTiles, setVisibleTiles] = useState<Set<number>>(new Set());
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Mouse tracking for spotlight effect
  useEffect(() => {
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 0;
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 0;
    setMousePosition({ x: centerX, y: centerY });

    // Only track mouse on non-touch devices
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);

    if (!isTouch) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);


  // Intersection observer for mobile dance animation (only on touch devices)
  useEffect(() => {
    if (typeof window === 'undefined' || !isTouchDevice) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = cellRefs.current.findIndex(ref => ref === entry.target);
            if (index !== -1) setVisibleCell(index);
          }
        });
      },
      { threshold: 0.6, rootMargin: '0px' }
    );

    const refs = cellRefs.current.filter(Boolean);
    refs.forEach((ref) => observer.observe(ref!));

    return () => observer.disconnect();
  }, [isTouchDevice]);

  // Intersection observer for lazy loading videos (all devices)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = cellRefs.current.findIndex(ref => ref === entry.target);
            if (index !== -1) {
              setVisibleTiles(prev => new Set(prev).add(index));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    const refs = cellRefs.current.filter(Boolean);
    refs.forEach((ref) => observer.observe(ref!));

    return () => observer.disconnect();
  }, []);

  // Client work image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setClientImageIndex((prev) => (prev + 1) % 2);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // STWL cover image rotation (38, 39, 40)
  useEffect(() => {
    const interval = setInterval(() => {
      setStwlImageIndex((prev) => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // LMSY cover image rotation (68-72)
  useEffect(() => {
    const interval = setInterval(() => {
      setLmsyImageIndex((prev) => (prev + 1) % 5);
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  // Quirks typing animation
  useEffect(() => {
    const fullText = `My grandpa doesn't know\nhow to talk to tall people\nHe thinks\nthey can't hear him\nSo he screams\nthe whole time`;
    let index = 0;
    const typeInterval = setInterval(() => {
      if (index <= fullText.length) {
        setQuirksTypedText(fullText.slice(0, index));
        index++;
      } else {
        // Pause at end, then restart
        setTimeout(() => {
          index = 0;
          setQuirksTypedText("");
        }, 2000);
      }
    }, 50);
    return () => clearInterval(typeInterval);
  }, []);

  // Voicemail cover image rotation (11 -> 10 -> ... -> 1 -> 11)
  useEffect(() => {
    const delay = voicemailImageIndex >= 9 ? 135 : voicemailImageIndex === 8 ? 900 : voicemailImageIndex >= 6 ? 180 : voicemailImageIndex === 5 ? 900 : voicemailImageIndex >= 3 ? 270 : voicemailImageIndex === 2 ? 900 : voicemailImageIndex === 1 ? 1800 : 450; // 10% faster
    const timeoutId = setTimeout(() => {
      setVoicemailImageIndex((prev) => (prev === 1 ? 11 : prev - 1));
    }, delay);
    return () => clearTimeout(timeoutId);
  }, [voicemailImageIndex]);

  return (
    <>
      {/* Spotlight effect */}
      {!isTouchDevice && (
        <div
          className="fixed inset-0 pointer-events-none z-50"
          style={{
            background: `radial-gradient(circle 300px at ${mousePosition.x}px ${mousePosition.y}px, transparent 0%, rgba(0, 0, 0, 0.16) 100%)`
          }}
        />
      )}
      <main className="min-h-screen pt-[140px] md:pt-[145px] lg:pt-[155px] pb-0 lg:pb-8" style={{ backgroundColor: '#F2F2F2' }}>
        {/* Fixed Background Title and Subtitle */}
        <div
          className="fixed left-0 right-0 z-0 pointer-events-none top-[140px] md:top-[140px]"
          style={{ willChange: 'transform' }}
        >
          <div className="container mx-auto px-6">
            {/* Large Title Section */}
            <div className="text-center mb-0 mt-3 flex justify-start sm:justify-center">
              <h1 className="text-[36vw] sm:text-[19vw] font-bold leading-[0.85] sm:leading-none tracking-tight font-[family-name:var(--font-abril-fatface)] text-left sm:text-center" style={{ color: '#F8330D' }}>
                {/* Mobile layout */}
                <span className="sm:hidden block">
                  THIS<br/>IS<br/>
                  IT!
                </span>
                {/* Desktop layout */}
                <span className="hidden sm:inline whitespace-nowrap">THIS IS IT!</span>
              </h1>
            </div>

            {/* Subtitles */}
            <div className="text-left sm:text-center mb-20 sm:mb-12 mt-2">
              <h2 className="text-[22px] sm:text-3xl lg:text-[33px] font-bold text-black font-[family-name:var(--font-abril-fatface)]">go for it</h2>
            </div>
          </div>
        </div>

        {/* Spacer to account for fixed header height */}
        <div className="container mx-auto px-6 relative z-10 pointer-events-none">
          <div className="h-[110vw] sm:h-[32vw] md:h-[32vw] lg:h-[26vw]"></div>
        </div>

        {/* Grid Section */}
        <div className="relative" style={{ backgroundColor: '#F2F2F2' }}>
          {/* Animated grid lines background - mobile (1 column) */}
          <div className="lg:hidden absolute inset-0 pointer-events-none z-20">
            <AnimatedGrid columns={1} rows={10} strokeColor="rgba(255, 255, 255, 0.9)" strokeWidth={2} hoveredCell={null} />
          </div>
          {/* Animated grid lines background - desktop (3 columns) */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none z-20">
            <AnimatedGrid columns={3} rows={4} strokeColor="rgba(255, 255, 255, 0.9)" strokeWidth={2} hoveredCell={hoveredCell} />
          </div>
          {/* Grid cells */}
          <div className="grid grid-cols-1 lg:grid-cols-3 relative z-10">
            {projects.map((project, index) => (
              <Link
                key={index}
                href={project.link}
                target={project.link.startsWith('http') ? '_blank' : undefined}
                rel={project.link.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                <motion.div
                  ref={(el) => { cellRefs.current[index] = el; }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`group aspect-[4/5] border-transparent flex items-center justify-center p-6 cursor-pointer bg-[#F2F2F2] hover:bg-white transition-colors duration-150 ease-out relative overflow-hidden ${visibleCell === index && isTouchDevice ? 'mobile-in-view' : ''}`}
                  style={{
                    filter: !isTouchDevice && hoveredCell && (hoveredCell.row !== Math.floor(index / 3) || hoveredCell.col !== index % 3) ? 'brightness(0.7)' : 'brightness(1)',
                    transition: 'filter 0.15s ease-out'
                  }}
                  onMouseEnter={() => setHoveredCell({ row: Math.floor(index / 3), col: index % 3 })}
                  onMouseLeave={() => setHoveredCell(null)}
                >
                  {project.hasCover === true ? (
                    <div className="absolute inset-0">
                      <BouncingBallPoster imageScale={85} showLogo={true} />
                      <div className="absolute inset-x-0 top-0 flex justify-start pointer-events-none pt-8 px-6">
                        <span className="text-[1rem] sm:text-[1.3rem] md:text-[1.5rem] lg:text-[1.1rem] xl:text-[1.1rem] font-normal group-hover:font-bold text-black text-left max-w-[70%] font-[family-name:var(--font-inter)] tracking-tighter bg-white px-3 py-2 rounded-lg leading-tight shadow-md transition-[font-weight] duration-100 ease-out group-hover-dance" style={{ fontStretch: 'condensed' }}>
                          {project.title}
                        </span>
                      </div>
                    </div>
                  ) : project.hasCover === "hat" ? (
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 flex items-end justify-center">
                        <div className="relative" style={{ width: '85%', height: '85%' }}>
                          <img
                            src="/assets/COTM/coverreal.webp"
                            alt="Condition of the Month Hat"
                            loading={index < 3 ? "eager" : "lazy"}
                            fetchPriority={index < 3 ? "high" : "auto"}
                            className="absolute inset-0 w-full h-full object-contain"
                          />
                        </div>
                      </div>
                      <img
                        src="/assets/shop/Shop Logo.png"
                        alt="Shop Logo"
                        className="absolute top-4 right-4 w-18 h-18 md:w-22 md:h-22 object-contain"
                      />
                      <div className="absolute inset-x-0 top-0 flex justify-start pointer-events-none pt-8 px-6">
                        <span className="text-[1rem] sm:text-[1.3rem] md:text-[1.5rem] lg:text-[1.1rem] xl:text-[1.1rem] font-normal group-hover:font-bold text-black text-left max-w-[70%] font-[family-name:var(--font-inter)] tracking-tighter bg-white px-3 py-2 rounded-lg leading-tight shadow-md transition-[font-weight] duration-100 ease-out group-hover-dance" style={{ fontStretch: 'condensed' }}>
                          {project.title}
                        </span>
                      </div>
                    </div>
                  ) : project.hasCover === "phone" ? (
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 flex items-end justify-center">
                        <div className="relative" style={{ width: '85%', height: '85%' }}>
                          <img
                            src={`/assets/QuoteLine/voicemailcover/${voicemailImageIndex}.webp`}
                            alt="Voicemail Show Phone"
                            className="w-full h-full object-contain object-bottom"
                          />
                        </div>
                      </div>
                      <div className="absolute inset-x-0 top-0 flex justify-start pointer-events-none pt-8 px-6">
                        <span className="text-[1rem] sm:text-[1.3rem] md:text-[1.5rem] lg:text-[1.1rem] xl:text-[1.1rem] font-normal group-hover:font-bold text-black text-left max-w-[70%] font-[family-name:var(--font-inter)] tracking-tighter bg-white px-3 py-2 rounded-lg leading-tight shadow-md transition-[font-weight] duration-100 ease-out group-hover-dance" style={{ fontStretch: 'condensed' }}>
                          {project.title}
                        </span>
                      </div>
                    </div>
                  ) : project.hasCover === "lmsy" ? (
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 flex items-end justify-center px-6 pt-6 pb-0">
                        <AnimatePresence mode="sync">
                          <motion.img
                            key={lmsyImageIndex}
                            src={`/assets/CCP/${lmsyImageIndex + 68}.webp`}
                            alt="Let Me Show You"
                            className="absolute w-[80%] h-[80%] object-contain object-bottom"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                          />
                        </AnimatePresence>
                      </div>
                      <img
                        src="/assets/shop/Shop Logo.png"
                        alt="Shop Logo"
                        className="absolute top-4 right-4 w-18 h-18 md:w-22 md:h-22 object-contain"
                      />
                      <div className="absolute inset-x-0 top-0 flex justify-start pointer-events-none pt-8 px-6">
                        <span className="text-[1rem] sm:text-[1.3rem] md:text-[1.5rem] lg:text-[1.1rem] xl:text-[1.1rem] font-normal group-hover:font-bold text-black text-left max-w-[70%] font-[family-name:var(--font-inter)] tracking-tighter bg-white px-3 py-2 rounded-lg leading-tight shadow-md transition-[font-weight] duration-100 ease-out group-hover-dance" style={{ fontStretch: 'condensed' }}>
                          {project.title}
                        </span>
                      </div>
                    </div>
                  ) : project.hasCover === "client" ? (
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative" style={{ width: '85%', height: '85%' }}>
                          <img
                            src="/assets/Client/1.webp"
                            alt="Client Work"
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{ transform: 'scale(1.16)' }}
                          />
                          <AnimatePresence>
                            {clientImageIndex === 1 && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.5 }}
                                className="absolute inset-0"
                              >
                                <img
                                  src="/assets/Client/2.webp"
                                  alt="Client Work"
                                  className="w-full h-full object-contain"
                                  style={{ transform: 'scale(1.16)' }}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      <div className="absolute inset-x-0 top-0 flex justify-start pointer-events-none pt-8 px-6">
                        <span className="text-[1rem] sm:text-[1.3rem] md:text-[1.5rem] lg:text-[1.1rem] xl:text-[1.1rem] font-normal group-hover:font-bold text-black text-left max-w-[70%] font-[family-name:var(--font-inter)] tracking-tighter bg-white px-3 py-2 rounded-lg leading-tight shadow-md transition-[font-weight] duration-100 ease-out group-hover-dance" style={{ fontStretch: 'condensed' }}>
                          {project.title}
                        </span>
                      </div>
                    </div>
                  ) : project.hasCover === "quirks" ? (
                    <div className="absolute inset-0 flex flex-col justify-center items-center p-8">
                      <img
                        src="/assets/quirks/base.webp"
                        alt="Quirks Background"
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="relative z-10 flex flex-col items-center">
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-1 font-[family-name:var(--font-abril-fatface)]">QUIRKS</h2>
                        <p className="text-sm sm:text-base text-white mb-4 font-[family-name:var(--font-inter)]">No.1</p>
                        <pre className="text-white text-xs sm:text-sm md:text-base whitespace-pre-wrap text-left leading-relaxed font-[family-name:var(--font-noto-serif-ethiopic)]" style={{ fontStretch: 'condensed' }}>
                          {quirksTypedText}
                          <span className="animate-pulse">|</span>
                        </pre>
                      </div>
                      <div className="absolute inset-x-0 top-0 flex justify-start pointer-events-none pt-8 px-6 z-10">
                        <span className="text-[1rem] sm:text-[1.3rem] md:text-[1.5rem] lg:text-[1.1rem] xl:text-[1.1rem] font-normal group-hover:font-bold text-black text-left max-w-[70%] font-[family-name:var(--font-inter)] tracking-tighter bg-white px-3 py-2 rounded-lg leading-tight shadow-md transition-[font-weight] duration-100 ease-out group-hover-dance" style={{ fontStretch: 'condensed' }}>
                          {project.title}
                        </span>
                      </div>
                    </div>
                  ) : project.hasCover === "museum" ? (
                    <div className="absolute inset-0">
                      {visibleTiles.has(index) ? (
                        <video
                          src="/assets/museum/museumRec.mp4"
                          poster="/assets/museum/museumRec-poster.webp"
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src="/assets/museum/museumRec-poster.webp"
                          alt="Museum"
                          loading={index < 6 ? "eager" : "lazy"}
                          fetchPriority={index < 6 ? "high" : "auto"}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-x-0 top-0 flex justify-start pointer-events-none pt-8 px-6">
                        <span className="text-[1rem] sm:text-[1.3rem] md:text-[1.5rem] lg:text-[1.1rem] xl:text-[1.1rem] font-normal group-hover:font-bold text-black text-left max-w-[70%] font-[family-name:var(--font-inter)] tracking-tighter bg-white px-3 py-2 rounded-lg leading-tight shadow-md transition-[font-weight] duration-100 ease-out group-hover-dance" style={{ fontStretch: 'condensed' }}>
                          {project.title}
                        </span>
                      </div>
                    </div>
                  ) : project.hasCover === "sthm" ? (
                    <div className="absolute inset-0">
                      {visibleTiles.has(index) ? (
                        <video
                          src="/assets/SongsThatHoldMemories/democover_compressed.mp4"
                          poster="/assets/SongsThatHoldMemories/democover-poster.webp"
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src="/assets/SongsThatHoldMemories/democover-poster.webp"
                          alt="Songs That Hold Memories"
                          loading="eager"
                          fetchPriority="high"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-x-0 top-0 flex justify-start pointer-events-none pt-8 px-6">
                        <span className="text-[1rem] sm:text-[1.3rem] md:text-[1.5rem] lg:text-[1.1rem] xl:text-[1.1rem] font-normal group-hover:font-bold text-black text-left max-w-[70%] font-[family-name:var(--font-inter)] tracking-tighter bg-white px-3 py-2 rounded-lg leading-tight shadow-md transition-[font-weight] duration-100 ease-out group-hover-dance" style={{ fontStretch: 'condensed' }}>
                          {project.title}
                        </span>
                      </div>
                    </div>
                  ) : project.hasCover === "stwl" ? (
                    <div className="absolute inset-0">
                      <div className="absolute inset-0">
                        <img
                          src={`/assets/STWL/covers/${stwlImageIndex + 38}.webp`}
                          alt="Specific Things We Like"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-x-0 top-0 flex justify-start pointer-events-none pt-8 px-6">
                        <span className="text-[1rem] sm:text-[1.3rem] md:text-[1.5rem] lg:text-[1.1rem] xl:text-[1.1rem] font-normal group-hover:font-bold text-black text-left max-w-[70%] font-[family-name:var(--font-inter)] tracking-tighter bg-white px-3 py-2 rounded-lg leading-tight shadow-md transition-[font-weight] duration-100 ease-out group-hover-dance" style={{ fontStretch: 'condensed' }}>
                          {project.title}
                        </span>
                      </div>
                    </div>
                  ) : project.hasCover === "amwy" ? (
                    <div className="absolute inset-0 overflow-hidden">
                      <div className="absolute inset-0">
                        <img
                          src="/assets/A Month With you/coverV2_3.webp"
                          alt="A Month With You"
                          loading="lazy"
                          className="w-full h-full object-cover animate-zoom-out"
                        />
                      </div>
                      <div className="absolute inset-x-0 top-0 flex justify-start pointer-events-none pt-8 px-6">
                        <span className="text-[1rem] sm:text-[1.3rem] md:text-[1.5rem] lg:text-[1.1rem] xl:text-[1.1rem] font-normal group-hover:font-bold text-black text-left max-w-[70%] font-[family-name:var(--font-inter)] tracking-tighter bg-white px-3 py-2 rounded-lg leading-tight shadow-md transition-[font-weight] duration-100 ease-out group-hover-dance" style={{ fontStretch: 'condensed' }}>
                          {project.title}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[1rem] sm:text-[1.3rem] md:text-[1.5rem] lg:text-[1.1rem] xl:text-[1.1rem] font-normal group-hover:font-bold text-black text-left max-w-[70%] font-[family-name:var(--font-inter)] tracking-tighter transition-[font-weight] duration-100 ease-out group-hover-dance" style={{ fontStretch: 'condensed' }}>
                      {project.title}
                    </span>
                  )}
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10">
        <div className="px-6 py-6 md:py-8" style={{ backgroundColor: '#000000', letterSpacing: '-0.08em' }}>
          <FooterSignup />
          {/* Mobile: Stacked layout */}
          <div className="flex flex-col items-center gap-4 md:hidden">
            <div className="flex gap-6">
              <a href="https://www.instagram.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@rithikakorr?_r=1&_t=ZP-93jcyyF97Fv" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a href="https://x.com/rithika24k" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://substack.com/@rithikakorrapolu" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                </svg>
              </a>
            </div>
            <div className="flex gap-6">
              <a href="/" className="text-white text-sm font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Home</a>
              <a href="/shop" className="text-white text-sm font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Store</a>
              <a href="/connect" className="text-white text-sm font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Contact</a>
              <a href="/legal" className="text-white text-sm font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Legal</a>
            </div>
            <p className="text-white text-sm font-normal font-[family-name:var(--font-inter)]">© Rithika is a Fool 2026</p>
          </div>
          {/* Desktop layout */}
          <div className="hidden md:block relative">
            <div className="container mx-auto flex justify-between items-center">
              <p className="text-white text-base font-normal font-[family-name:var(--font-inter)]">© Rithika is a Fool 2026</p>
              <div className="flex gap-12">
                <div className="flex flex-col">
                  <a href="/" className="text-white text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Home</a>
                  <a href="/shop" className="text-white text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Store</a>
                </div>
                <div className="flex flex-col">
                  <a href="/connect" className="text-white text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Contact</a>
                  <a href="/legal" className="text-white text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Legal + FAQ</a>
                </div>
              </div>
            </div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-6">
              <a href="https://www.instagram.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@rithikakorr?_r=1&_t=ZP-93jcyyF97Fv" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a href="https://x.com/rithika24k" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://substack.com/@rithikakorrapolu" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

    </>
  );
}
