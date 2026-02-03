"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const slides = [
  { id: 1, image: "/assets/about/18.png" },
  { id: 2, image: "/assets/about/19.png" },
  { id: 3, image: "/assets/about/20.png" },
  { id: 4, image: "/assets/about/21.png" },
];

export default function About() {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [showTooltip1, setShowTooltip1] = useState(false);
  const [showTooltip2, setShowTooltip2] = useState(false);
  const [showTooltip3, setShowTooltip3] = useState(false);
  const [originStoryOpen, setOriginStoryOpen] = useState(false);
  const [showDadTooltip, setShowDadTooltip] = useState(false);
  const [showPeopleTooltip, setShowPeopleTooltip] = useState(false);
  const [showFamilyTooltip, setShowFamilyTooltip] = useState(false);
  const [showDidThatTooltip, setShowDidThatTooltip] = useState(false);
  const [peopleAwesomeOpen, setPeopleAwesomeOpen] = useState(false);
  const [makeArtOpen, setMakeArtOpen] = useState(false);
  const [showBelieveTooltip, setShowBelieveTooltip] = useState(false);

  // Auto-advance slideshow
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsAudioPlaying(!isAudioPlaying);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress || 0);
      setAudioCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleAudioLoadedMetadata = () => {
    if (audioRef.current) {
      setAudioDuration(audioRef.current.duration);
    }
  };

  const handleAudioSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      audioRef.current.currentTime = percent * audioRef.current.duration;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col" style={{ backgroundColor: '#F2F2F2', minHeight: '100vh' }}>
      <style>{`
        @keyframes slowZoom {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.15);
          }
        }
        .zoom-active {
          animation: slowZoom 4s ease-out forwards;
        }
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
        .video-left-mobile {
          object-position: 35% center;
        }
        @media (min-width: 768px) {
          .video-left-mobile {
            object-position: center;
          }
        }
      `}</style>
      <main className="pt-[130px] md:pt-[130px] lg:pt-[140px] flex-grow" style={{ backgroundColor: '#F2F2F2' }}>
        {/* Dedication Text */}
        <div className="container mx-auto px-6 max-w-3xl mt-8 md:mt-16 mb-2 md:mb-6 text-left">
          <button
            onClick={() => setOriginStoryOpen(!originStoryOpen)}
            className="flex items-start gap-2 text-black font-bold font-[family-name:var(--font-inter)] mb-4 cursor-pointer hover:text-[#F8330D] transition-colors text-left"
            style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(1.4rem, 5vw, 2rem)' }}
          >
            <motion.span
              animate={{ rotate: originStoryOpen ? 90 : 0 }}
              className="mt-1 flex-shrink-0"
              transition={{ duration: 0.2 }}
              style={{ display: 'inline-block' }}
            >
              <svg className="w-6 h-6 md:w-5 md:h-5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 3l6 5-6 5V3z"/>
              </svg>
            </motion.span>
            Origin Story
          </button>
          <AnimatePresence>
            {originStoryOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-visible"
              >
                <div className="text-black font-medium font-[family-name:var(--font-inter)]" style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)' }}>
                  When I was 12, I told <span className="relative inline-block cursor-pointer" onMouseEnter={() => setShowDadTooltip(true)} onMouseLeave={() => setShowDadTooltip(false)}><strong>my dad</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>1</sup><AnimatePresence>{showDadTooltip && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-2 z-[100]" style={{ letterSpacing: 'normal', width: '150px' }}><img src="/assets/dad.jpg" alt="Dad" className="rounded-lg w-full h-auto" /></motion.div>)}</AnimatePresence></span> that we should find out how fireflies light up and put that in trees and then we&apos;d have glowing trees and people wouldn&apos;t have to pay for electricity. He looked at me genuinely and said &quot;it&apos;s a great idea&quot; and that I should &quot;do some research.&quot; I made a whole presentation that night. For months after, anytime <span className="relative inline-block cursor-pointer" onMouseEnter={() => setShowPeopleTooltip(true)} onMouseLeave={() => setShowPeopleTooltip(false)}><strong>people</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>2</sup><AnimatePresence>{showPeopleTooltip && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute -left-16 md:left-1/2 md:-translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-2.5 md:p-4 z-[100] w-[200px] md:w-80 text-sm md:text-base font-normal text-left" style={{ letterSpacing: 'normal' }}>These were adults. They were coworkers, neighbors, family friends, etc.</motion.div>)}</AnimatePresence></span> came over, he made them watch it. He made them put their phones away and ask me at least 3 questions. I was a kid talking about glowing trees.
                </div>
                <div className="text-black font-medium font-[family-name:var(--font-inter)]" style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)' }}>
                  I still remember the name of the specific molecule. Luciferin. It&apos;s what makes fireflies light up.
                </div>
                <div className="text-black font-medium font-[family-name:var(--font-inter)]" style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)' }}>
                  My dad <span className="relative inline-block cursor-pointer" onMouseEnter={() => setShowDidThatTooltip(true)} onMouseLeave={() => setShowDidThatTooltip(false)}><strong>did that for me my whole life</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>3</sup><AnimatePresence>{showDidThatTooltip && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-2.5 md:p-4 z-50 w-64 md:w-80 text-sm md:text-base font-normal text-left" style={{ letterSpacing: 'normal' }}>He&apos;s not here anymore but I can still hear his voice in my head. <em>&quot;That&apos;s great Rithu, go for it.&quot;</em></motion.div>)}</AnimatePresence></span>. Took my foolish dreams seriously. Made other people too.
                </div>
                <div className="text-black font-medium font-[family-name:var(--font-inter)]" style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)' }}>
                  This is his.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setPeopleAwesomeOpen(!peopleAwesomeOpen)}
            className="flex items-start gap-2 text-black font-bold font-[family-name:var(--font-inter)] mt-8 mb-4 cursor-pointer hover:text-[#F8330D] transition-colors text-left"
            style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(1.4rem, 5vw, 2rem)' }}
          >
            <motion.span
              animate={{ rotate: peopleAwesomeOpen ? 90 : 0 }}
              className="mt-1 flex-shrink-0"
              transition={{ duration: 0.2 }}
              style={{ display: 'inline-block' }}
            >
              <svg className="w-6 h-6 md:w-5 md:h-5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 3l6 5-6 5V3z"/>
              </svg>
            </motion.span>
            People are awesome.
          </button>
          <AnimatePresence>
            {peopleAwesomeOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-visible"
              >
                <div className="text-black font-medium font-[family-name:var(--font-inter)]" style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)' }}>
                  I&apos;m lucky because I have an insanely good <span className="relative inline-block cursor-pointer" onMouseEnter={() => setShowFamilyTooltip(true)} onMouseLeave={() => setShowFamilyTooltip(false)}><strong>family</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>4</sup><AnimatePresence>{showFamilyTooltip && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-2.5 md:p-4 z-50 whitespace-nowrap text-sm md:text-base font-normal text-left" style={{ letterSpacing: 'normal' }}>both given and chosen</motion.div>)}</AnimatePresence></span>. Because of that, I&apos;m pretty optimistic about people. I think they&apos;re mostly awesome and usually deserve forgiveness.
                </div>
                <div className="text-black font-medium font-[family-name:var(--font-inter)]" style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)' }}>
                  Awhile ago, I heard this song by Suki Waterhouse -
                </div>
                <div className="my-4">
                  <iframe
                    style={{ borderRadius: '12px' }}
                    src="https://open.spotify.com/embed/track/54rOvFIQHqhv0sf71A4NpJ?utm_source=generator"
                    width="70%"
                    height="80"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>
                <div className="text-black font-medium font-[family-name:var(--font-inter)]" style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)' }}>
                  The whole song is beautiful but there&apos;s one line I think about all the time.
                </div>
                <div className="text-black font-medium font-[family-name:var(--font-inter)]" style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)' }}>
                  <em>&quot;God exists between people, homie&quot;</em>
                </div>
                <div className="text-black font-medium font-[family-name:var(--font-inter)] mt-4" style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)' }}>
                  People work three jobs so their kid can go to dance classes and then watch them forget the routine on stage. People risk their careers and reputations investing in someone else&apos;s dream. People practice for decades to make others laugh, only to get boo&apos;d off stage. People run into burning buildings for people they&apos;ve never met. People say &quot;I love you&quot; not knowing if it&apos;s going to be said back.
                </div>
                <div className="text-black font-medium font-[family-name:var(--font-inter)] mt-4" style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)' }}>
                  People willing to be fools for each other. There&apos;s something holy in that.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setMakeArtOpen(!makeArtOpen)}
            className="flex items-start gap-2 text-black font-bold font-[family-name:var(--font-inter)] mt-8 mb-4 cursor-pointer hover:text-[#F8330D] transition-colors text-left"
            style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(1.4rem, 5vw, 2rem)' }}
          >
            <motion.span
              animate={{ rotate: makeArtOpen ? 90 : 0 }}
              className="mt-1 flex-shrink-0"
              transition={{ duration: 0.2 }}
              style={{ display: 'inline-block' }}
            >
              <svg className="w-6 h-6 md:w-5 md:h-5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 3l6 5-6 5V3z"/>
              </svg>
            </motion.span>
            I want to make Art.
          </button>
          <AnimatePresence>
            {makeArtOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-visible"
              >
                <div className="text-black font-bold font-[family-name:var(--font-inter)] text-center py-3 border-t-2 border-b-2 border-black my-3" style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(1.1rem, 3.2vw, 1.28rem)' }}>
                  People are awesome when they&apos;re willing to be fools for each other. I want to make art that invites that and brings people together in unexpected ways.
                </div>
                <div className="text-black font-medium font-[family-name:var(--font-inter)] mt-4" style={{ color: '#000000', letterSpacing: '-0.03em', fontSize: 'clamp(0.95rem, 3.5vw, 1.2rem)' }}>
                  It took me a long time to realize that this is what I want to do. It took me even longer <span className="relative inline-block cursor-pointer" onMouseEnter={() => setShowBelieveTooltip(true)} onMouseLeave={() => setShowBelieveTooltip(false)}><strong>to believe</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>5</sup><AnimatePresence>{showBelieveTooltip && (<motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute -left-32 md:left-1/2 md:-translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-2.5 md:p-4 z-[100] w-64 md:w-80 text-sm md:text-base font-normal text-left" style={{ letterSpacing: 'normal' }}>I still can&apos;t believe this is a real job. It sort of feels illegal. Thank you to my friends for showing me the way. I love you.</motion.div>)}</AnimatePresence></span> that I can do it. I feel so, so lucky and grateful that I get to do this right now. This is my dream. Thank you for being here.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* Footer */}
      <footer>
        <div className="px-6 py-6 md:py-8" style={{ backgroundColor: '#000000', letterSpacing: '-0.08em' }}>
          {/* Mobile: Stacked layout */}
          <div className="flex flex-col items-center gap-4 md:hidden">
            <div className="flex gap-6">
              <a href="https://www.instagram.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a href="https://x.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://substack.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
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
              <a href="https://www.tiktok.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a href="https://x.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://substack.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
