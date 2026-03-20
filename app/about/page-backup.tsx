"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";

export default function About() {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

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
    <>
    <main className="min-h-screen pt-[90px] sm:pt-[115px] md:pt-[145px] lg:pt-[155px] pb-20" style={{ backgroundColor: '#F2F2F2' }}>
      {/* Top Caution Banner */}
      <div className="w-full overflow-hidden" style={{ backgroundColor: '#FEE705' }}>
        <div className="caution-tape-wrapper" style={{ paddingTop: '0.75rem', paddingBottom: '0.75rem' }}>
          <div className="caution-tape-scroll caution-tape-top">
            {[...Array(10)].map((_, i) => (
              <span key={`top-${i}`} className="caution-tape-text text-black text-xl md:text-2xl px-8" style={{ fontFamily: 'var(--font-inter)', fontStyle: 'italic' }}>
                <span className="font-bold">CAUTION: SOMEONE TALKING ABOUT THEIR "ART"</span>
              </span>
            ))}
            {[...Array(10)].map((_, i) => (
              <span key={`top2-${i}`} className="caution-tape-text text-black text-xl md:text-2xl px-8" style={{ fontFamily: 'var(--font-inter)', fontStyle: 'italic' }}>
                <span className="font-bold">CAUTION: SOMEONE TALKING ABOUT THEIR "ART"</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Black Scrolling Banner */}
      <div className="w-full overflow-hidden" style={{ backgroundColor: '#000000' }}>
        <div className="caution-tape-wrapper py-8">
          <div className="caution-tape-scroll caution-tape-bottom">
            {[...Array(15)].map((_, i) => (
              <span key={`banner-${i}`} className="text-yellow-400 text-xl md:text-2xl lg:text-[1.68rem] font-bold px-8 whitespace-nowrap" style={{ fontFamily: 'var(--font-inter)' }}>
                This is a creative studio/dream come true.
              </span>
            ))}
            {[...Array(15)].map((_, i) => (
              <span key={`banner2-${i}`} className="text-yellow-400 text-xl md:text-2xl lg:text-[1.68rem] font-bold px-8 whitespace-nowrap" style={{ fontFamily: 'var(--font-inter)' }}>
                This is a creative studio/dream come true.
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6">
        {/* About Letter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-6xl mx-auto mb-2"
        >
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes scrollCautionLeft {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            @keyframes scrollCautionRight {
              from { transform: translateX(-50%); }
              to { transform: translateX(0); }
            }
            .caution-tape-wrapper {
              display: flex;
            }
            .caution-tape-scroll {
              display: flex;
              white-space: nowrap;
            }
            .caution-tape-left {
              animation: scrollCautionLeft 23.76s linear infinite;
            }
            .caution-tape-right {
              animation: scrollCautionRight 23.76s linear infinite;
            }
            .caution-tape-top {
              animation: scrollCautionLeft 51.84s linear infinite;
            }
            .caution-tape-bottom {
              animation: scrollCautionRight 144s linear infinite;
            }
            @keyframes scrollBanner {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            .banner-scroll {
              display: flex;
              white-space: nowrap;
              animation: scrollBanner 12s linear infinite;
            }
            .caution-tape-text {
              font-stretch: condensed;
              letter-spacing: -0.05em;
              transform: scaleY(1.2);
            }
          `}} />
          <div id="about" className="flex flex-col items-center relative">
            {/* Caution tape container - 4 full-width banners */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0, left: '50%', right: '50%', marginLeft: '-50vw', marginRight: '-50vw', width: '100vw' }}>
              {/* Banner 1 */}
              <div className="absolute overflow-hidden" style={{
                backgroundColor: '#FEE705',
                width: '120%',
                top: '10%',
                left: '-10%',
                transform: 'rotate(-8deg)',
                transformOrigin: 'center'
              }}>
                <div className="caution-tape-wrapper" style={{ paddingTop: '0.517rem', paddingBottom: '0.517rem' }}>
                  <div className="caution-tape-scroll caution-tape-left">
                    {[...Array(15)].map((_, i) => (
                      <span key={`b1-${i}`} className="caution-tape-text text-black text-xl px-8" style={{ fontFamily: 'var(--font-inter)', fontStyle: 'italic' }}>
                        <span className="font-bold">CAUTION</span>
                      </span>
                    ))}
                    {[...Array(15)].map((_, i) => (
                      <span key={`b1b-${i}`} className="caution-tape-text text-black text-xl px-8" style={{ fontFamily: 'var(--font-inter)', fontStyle: 'italic' }}>
                        <span className="font-bold">CAUTION</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Banner 2 */}
              <div className="absolute overflow-hidden" style={{
                backgroundColor: '#FEE705',
                width: '120%',
                top: '35%',
                left: '-10%',
                transform: 'rotate(12deg)',
                transformOrigin: 'center'
              }}>
                <div className="caution-tape-wrapper" style={{ paddingTop: '0.517rem', paddingBottom: '0.517rem' }}>
                  <div className="caution-tape-scroll caution-tape-right">
                    {[...Array(15)].map((_, i) => (
                      <span key={`b2-${i}`} className="caution-tape-text text-black text-xl px-8" style={{ fontFamily: 'var(--font-inter)', fontStyle: 'italic' }}>
                        <span className="font-bold">CAUTION</span>
                      </span>
                    ))}
                    {[...Array(15)].map((_, i) => (
                      <span key={`b2b-${i}`} className="caution-tape-text text-black text-xl px-8" style={{ fontFamily: 'var(--font-inter)', fontStyle: 'italic' }}>
                        <span className="font-bold">CAUTION</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Banner 3 */}
              <div className="absolute overflow-hidden" style={{
                backgroundColor: '#FEE705',
                width: '120%',
                top: '60%',
                left: '-10%',
                transform: 'rotate(-5deg)',
                transformOrigin: 'center'
              }}>
                <div className="caution-tape-wrapper" style={{ paddingTop: '0.517rem', paddingBottom: '0.517rem' }}>
                  <div className="caution-tape-scroll caution-tape-left">
                    {[...Array(15)].map((_, i) => (
                      <span key={`b3-${i}`} className="caution-tape-text text-black text-xl px-8" style={{ fontFamily: 'var(--font-inter)', fontStyle: 'italic' }}>
                        <span className="font-bold">CAUTION</span>
                      </span>
                    ))}
                    {[...Array(15)].map((_, i) => (
                      <span key={`b3b-${i}`} className="caution-tape-text text-black text-xl px-8" style={{ fontFamily: 'var(--font-inter)', fontStyle: 'italic' }}>
                        <span className="font-bold">CAUTION</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Banner 4 */}
              <div className="absolute overflow-hidden" style={{
                backgroundColor: '#FEE705',
                width: '120%',
                top: '85%',
                left: '-10%',
                transform: 'rotate(10deg)',
                transformOrigin: 'center'
              }}>
                <div className="caution-tape-wrapper" style={{ paddingTop: '0.517rem', paddingBottom: '0.517rem' }}>
                  <div className="caution-tape-scroll caution-tape-right">
                    {[...Array(15)].map((_, i) => (
                      <span key={`b4-${i}`} className="caution-tape-text text-black text-xl px-8" style={{ fontFamily: 'var(--font-inter)', fontStyle: 'italic' }}>
                        <span className="font-bold">CAUTION</span>
                      </span>
                    ))}
                    {[...Array(15)].map((_, i) => (
                      <span key={`b4b-${i}`} className="caution-tape-text text-black text-xl px-8" style={{ fontFamily: 'var(--font-inter)', fontStyle: 'italic' }}>
                        <span className="font-bold">CAUTION</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* About letter image - on top of the banners */}
            <Image
              src="/assets/about letter.png"
              alt="About letter"
              width={800}
              height={1000}
              className="w-full max-w-4xl relative"
              style={{ objectFit: 'contain', zIndex: 1 }}
            />
            <Image
              src="/assets/about letter2.png"
              alt="About letter 2"
              width={800}
              height={1000}
              className="w-full max-w-4xl relative"
              style={{ objectFit: 'contain', zIndex: 1 }}
            />
          </div>
        </motion.div>

        {/* Stories Section */}
        <div className="max-w-2xl mx-auto px-8 py-12">
          {/* Story #1 */}
          <div className="mb-10">
            <h2 className="text-base md:text-lg font-bold text-black mb-3" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
              Story #1
            </h2>
            <p className="text-base md:text-lg text-black leading-relaxed mb-3 text-justify" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
              There's a research lab called Bell Labs that did a study awhile ago to figure out why certain employees were much more productive than others. <span className="italic">Was it that they had a similar work schedule? Or maybe all work on similar things?</span> Nope, neither. After looking at tons of data, they found out the only thing the super productive employees had in common was that they had lunch with the same guy - Harry Nyquist. It wasn't that Nyquist was some kind of genius and had all the answers but rather he had the right questions. One of his peers said, 'he drew people out, got them thinking.'
            </p>
            <p className="text-base md:text-lg text-black leading-relaxed italic text-justify" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
              What would it look like to have this level of caring curiosity about the people you work with?
            </p>
          </div>

          {/* Story #2 */}
          <div className="mb-10">
            <h2 className="text-base md:text-lg font-bold text-black mb-3" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
              Story #2
            </h2>
            <p className="text-base md:text-lg text-black leading-relaxed mb-3 text-justify" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
              Toni Morrison is a beautiful, prolific writer. When she was younger, she was an editor at Random House. She came across the writing of a young lady named Angela Davis, who just got out of prison. Morrison worked obsessively to get her writing published. She even pushed back against her superiors, risking her own job. It was not easy and it definitely wasn't smart but Morrison succeeded. When asked why she pushed so hard, she believed Davis's voice 'had to exist in the world.'
            </p>
            <p className="text-base md:text-lg text-black leading-relaxed italic text-justify" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
              What would it look like to be this big of a fan of the people you believe in?
            </p>
          </div>

          {/* Story #3 */}
          <div className="mb-10">
            <h2 className="text-base md:text-lg font-bold text-black mb-3" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
              Story #3
            </h2>
            <p className="text-base md:text-lg text-black leading-relaxed mb-3 text-justify" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
              Fred Rogers had a children's tv show called Mister Roger's Neighborhood. He had a pet fish that he would check in on and feed every episode. He got a letter once from a blind girl named Katie, who was worried about the fish. She wrote 'Dear Mister Rogers, Please say when you are feeding your fish, because I worry about them. I can't see if you are feeding them, so please say you are feeding them out loud. Katie, age 5. Everyday after that, Mr. Rogers made a point to always say out loud, 'I'm feeding the fish now,' so that his blind viewers would know and feel included.
            </p>
            <p className="text-base md:text-lg text-black leading-relaxed italic text-justify" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
              What would it look like to have this level of care in the service you provide?
            </p>
          </div>
        </div>

        </div>
    </main>

    {/* Sticky Audio Player */}
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 rounded-full border border-white/20 shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div className="max-w-md mx-auto px-6 py-3">
        <audio
          ref={audioRef}
          onTimeUpdate={handleAudioTimeUpdate}
          onLoadedMetadata={handleAudioLoadedMetadata}
          onEnded={() => setIsAudioPlaying(false)}
          className="hidden"
        >
          <source src="/audio/dreams.mp3" type="audio/mpeg" />
        </audio>
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={toggleAudio}
            className="w-10 h-10 flex items-center justify-center text-gray-700 hover:text-black transition-colors bg-gray-100 rounded-full"
          >
            {isAudioPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          {/* Title */}
          <span className="text-sm font-medium text-black" style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }}>
            People&apos;s Dreams
          </span>

          {/* Time */}
          <span className="text-xs text-gray-500 min-w-[60px]">
            {formatTime(audioCurrentTime)} / {formatTime(audioDuration || 0)}
          </span>

          {/* Progress Bar */}
          <div
            className="flex-1 h-1 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleAudioSeek}
          >
            <div
              className="h-full bg-[#F8330D] rounded-full transition-all"
              style={{ width: `${audioProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>

    {/* Footer */}
    <footer>
      {/* Footer Section - Black */}
      <div className="px-6 py-8 relative" style={{ backgroundColor: '#000000', letterSpacing: '-0.08em' }}>
        <div className="container mx-auto flex justify-between items-center">
          {/* Copyright - Left */}
          <p className="text-white text-sm md:text-base font-normal font-[family-name:var(--font-inter)]">
            © Rithika is a Fool 2026
          </p>

          {/* Navigation Links - Right */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-0">
            <a href="/" className="text-white text-sm md:text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">
              Home
            </a>
            <a href="/connect" className="text-white text-sm md:text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">
              Contact
            </a>
            <a href="/shop" className="text-white text-sm md:text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">
              Store
            </a>
            <a href="/legal" className="text-white text-sm md:text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">
              Legal + FAQ
            </a>
          </div>
        </div>

        {/* Social Media Icons - Absolutely Centered */}
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
    </footer>
    </>
  );
}
