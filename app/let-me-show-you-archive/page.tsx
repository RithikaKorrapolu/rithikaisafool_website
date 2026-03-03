"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const BACKGROUND_IMAGE = "/assets/CCP/Sample_Month/archive/lib2.avif";

// Archive of past exhibits (newest first)
const EXHIBITS = [
  {
    id: 2,
    title: "Beginning to Melt",
    month: "March 2026",
    description: "",
    path: "/let-me-show-you/march2026",
    image: "/assets/CCP/Sample_Month/archive/parents_david.jpg",
  },
  {
    id: 1,
    title: "What Love Feels Like",
    month: "February 2026",
    description: "",
    path: "/let-me-show-you/feb2026",
    image: "/assets/CCP/Sample_Month/archive/birthday.jpg",
  },
  {
    id: 0,
    title: "It Feels Too Late",
    month: "January 2026",
    description: "",
    path: "/shop/let-me-show-you-sample",
    image: "/assets/CCP/Sample_Month/archive/nycmovie.jpg",
  },
];

export default function LetMeShowYouArchive() {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [activeExhibit, setActiveExhibit] = useState(EXHIBITS[0]?.id || 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Track which exhibit is closest to center of viewport
  useEffect(() => {
    if (!contentVisible) return;

    const handleScroll = () => {
      const viewportCenter = window.innerHeight / 2;
      let closestId = EXHIBITS[0]?.id || 0;
      let closestDistance = Infinity;

      EXHIBITS.forEach((exhibit) => {
        const element = document.getElementById(`exhibit-${exhibit.id}`);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementCenter = rect.top + rect.height / 2;
          const distance = Math.abs(elementCenter - viewportCenter);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestId = exhibit.id;
          }
        }
      });

      setActiveExhibit(closestId);
    };

    // Initial check after a small delay
    const timeoutId = setTimeout(handleScroll, 200);

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [contentVisible]);

  // Preload background and show content when loaded
  useEffect(() => {
    const img = new window.Image();
    img.src = BACKGROUND_IMAGE;
    img.onload = () => {
      setBgLoaded(true);
      setTimeout(() => setContentVisible(true), 100);
    };
  }, []);

  return (
    <div className="min-h-screen w-full relative">
      {/* Fixed Background */}
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url("${BACKGROUND_IMAGE}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Dark overlay */}
      <div className="fixed inset-0 bg-black/50 z-0" />

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-6 right-6 z-30 lg:hidden p-2 rounded-lg"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div
          className="fixed top-16 right-6 z-30 lg:hidden p-4 rounded-xl"
          style={{
            background: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "0.5px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <nav className="space-y-4">
            {EXHIBITS.map((exhibit) => (
              <button
                key={exhibit.id}
                onClick={() => {
                  setActiveExhibit(exhibit.id);
                  setMobileMenuOpen(false);
                  const element = document.getElementById(`exhibit-${exhibit.id}`);
                  element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }}
                className={`block transition-all font-[family-name:var(--font-abril-fatface)] text-base leading-tight text-left ${
                  activeExhibit === exhibit.id ? 'text-white font-bold' : 'text-white/50'
                }`}
              >
                {exhibit.title}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Left Sidebar - Scrolling Menu */}
      <div
        className="w-80 fixed left-0 top-1/2 -translate-y-1/2 p-8 hidden lg:block z-20"
        style={{
          opacity: contentVisible ? 1 : 0,
          transition: "opacity 1s ease-out",
        }}
      >
        <nav className="space-y-3">
          {EXHIBITS.map((exhibit) => (
            <button
              key={exhibit.id}
              onClick={() => {
                setActiveExhibit(exhibit.id);
                const element = document.getElementById(`exhibit-${exhibit.id}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className={`block transition-all font-[family-name:var(--font-abril-fatface)] text-xl leading-tight text-left ${
                activeExhibit === exhibit.id ? 'text-white font-bold' : 'text-white/40 hover:text-white/70'
              }`}
            >
              {exhibit.title}
            </button>
          ))}
        </nav>
      </div>

      <div
        className="relative z-10 flex min-h-screen transition-all duration-1000 ease-out"
        style={{
          opacity: contentVisible ? 1 : 0,
          transform: contentVisible ? "translateY(0)" : "translateY(20px)",
        }}
      >
        {/* Main Content */}
        <div className="flex-1 p-8 flex flex-col justify-center items-center min-h-screen">
          {/* Header */}
          <div className="mb-8 w-full max-w-3xl text-center">
            <h1 className="text-2xl md:text-5xl font-bold text-white mb-2 font-[family-name:var(--font-abril-fatface)]">
              LET ME SHOW YOU
            </h1>
            <p className="text-white/60 text-base md:text-xl font-[family-name:var(--font-inter)]">
              Archive
            </p>
            <p className="text-white/70 text-sm md:text-base font-[family-name:var(--font-inter)] mt-4">
              a monthly digital art exhibit from Rithika is a Fool! Each month, we pick a theme and invite guests to share art that they love. This is an archive of all the exhibits. You can learn more <a href="/shop/let-me-show-you" className="font-bold underline hover:text-white">here</a>.
            </p>
          </div>

          {/* Exhibits Cards */}
          <div className="flex flex-col gap-8 w-full max-w-3xl">
            {EXHIBITS.map((exhibit) => {
              const CardContent = (
                <>
                  {exhibit.image && (
                    <div className="w-full h-72 rounded-lg mb-4 overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity relative">
                      <Image
                        src={exhibit.image}
                        alt={exhibit.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="text-white/40 text-sm uppercase tracking-wider mb-1 font-[family-name:var(--font-inter)]">
                    {exhibit.month}
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2 group-hover:text-white/90 font-[family-name:var(--font-abril-fatface)]">
                    {exhibit.title}
                  </h2>
                  {exhibit.description && (
                    <p className="text-white/60 text-sm font-[family-name:var(--font-inter)]">
                      {exhibit.description}
                    </p>
                  )}
                </>
              );

              const cardStyle = {
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "0.5px solid rgba(255, 255, 255, 0.2)",
              };

              if (!exhibit.path) {
                return (
                  <div
                    key={exhibit.id}
                    id={`exhibit-${exhibit.id}`}
                    className="group block p-8 rounded-2xl"
                    style={cardStyle}
                  >
                    {CardContent}
                  </div>
                );
              }

              return (
                <Link
                  key={exhibit.id}
                  id={`exhibit-${exhibit.id}`}
                  href={exhibit.path}
                  className="group block p-8 rounded-2xl transition-all hover:scale-[1.02]"
                  style={cardStyle}
                >
                  {CardContent}
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-8 w-full max-w-3xl">
            <p className="text-white/30 text-sm font-[family-name:var(--font-inter)]">
              Made by <Link href="/" className="hover:text-white/50 transition-colors underline">Rithika is a Fool!</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
