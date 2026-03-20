"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FooterSignup from "@/components/FooterSignup";

const sections = [
  { id: "origin-story", title: "Origin Story" },
  { id: "people-awesome", title: "People are awesome." },
  { id: "make-art", title: "I want to make Art" },
  { id: "dont-sue-me", title: "Sometimes, dreams come true" },
];

export default function About() {
  const [activeSection, setActiveSection] = useState("origin-story");
  const [showDadTooltip, setShowDadTooltip] = useState(false);
  const [showPeopleTooltip, setShowPeopleTooltip] = useState(false);
  const [showFamilyTooltip, setShowFamilyTooltip] = useState(false);
  const [showDidThatTooltip, setShowDidThatTooltip] = useState(false);
  const [showBelieveTooltip, setShowBelieveTooltip] = useState(false);
  const [showArtProjectsTooltip, setShowArtProjectsTooltip] = useState(false);

  // Close all tooltips on scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowDadTooltip(false);
      setShowPeopleTooltip(false);
      setShowFamilyTooltip(false);
      setShowDidThatTooltip(false);
      setShowBelieveTooltip(false);
      setShowArtProjectsTooltip(false);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close tooltips when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Check if click is outside tooltip triggers and tooltip content
      if (!target.closest('[data-tooltip-trigger]') && !target.closest('[data-tooltip-content]')) {
        setShowDadTooltip(false);
        setShowPeopleTooltip(false);
        setShowFamilyTooltip(false);
        setShowDidThatTooltip(false);
        setShowBelieveTooltip(false);
        setShowArtProjectsTooltip(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Track active section based on scroll position (switches at midpoint of each section)
  useEffect(() => {
    const handleScrollTracking = () => {
      const scrollPosition = window.scrollY + 300;

      // Calculate midpoints for each section
      const sectionData = sections.map(({ id }) => {
        const element = document.getElementById(id);
        if (!element) return null;
        const top = element.offsetTop;
        const height = element.offsetHeight;
        return { id, top, midpoint: top + height / 2 };
      }).filter(Boolean) as { id: string; top: number; midpoint: number }[];

      // Default to first section
      let active = sectionData[0]?.id || 'origin-story';

      // Check each section's midpoint
      for (let i = 0; i < sectionData.length; i++) {
        const section = sectionData[i];
        if (scrollPosition >= section.top) {
          active = section.id;
        }
        // Switch to next section when past midpoint
        if (i < sectionData.length - 1 && scrollPosition > section.midpoint) {
          active = sectionData[i + 1].id;
        }
      }

      setActiveSection(active);
    };

    window.addEventListener('scroll', handleScrollTracking);
    handleScrollTracking();

    return () => window.removeEventListener('scroll', handleScrollTracking);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="flex flex-col" style={{ backgroundColor: '#F2F2F2', minHeight: '100vh' }}>
      <style>{`
        @media (max-width: 767px) {
          .mobile-tooltip-text {
            left: 0 !important;
            right: auto !important;
            transform: none !important;
            max-width: calc(100vw - 48px) !important;
          }
          .mobile-tooltip-image {
            left: 0 !important;
            transform: none !important;
          }
        }
      `}</style>

      <main className="pt-[160px] md:pt-[160px] lg:pt-[180px] flex-grow" style={{ backgroundColor: '#F2F2F2' }}>
        <div className="container mx-auto px-6 max-w-6xl">
          {/* Mobile: Stacked layout */}
          <div className="md:hidden pb-16">
            {/* Mobile content */}
            <div className="space-y-16">
              {/* Origin Story */}
              <section className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 text-black font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em' }}>
                  Origin Story
                </h2>
                <div className="space-y-4 text-black font-medium font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em', fontSize: 'clamp(1.05rem, 3.5vw, 1.2rem)' }}>
                  <p>
                    When I was 12, I told <span data-tooltip-trigger className="relative inline-block cursor-pointer" onClick={() => setShowDadTooltip(!showDadTooltip)}><strong>my dad</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>1</sup><AnimatePresence>{showDadTooltip && (<motion.span data-tooltip-content initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mobile-tooltip-image absolute left-0 top-full mt-2 bg-white rounded-lg shadow-xl p-2 z-[100] block" style={{ width: '180px' }}><img src="/assets/dad.jpg" alt="Dad" className="rounded-lg w-full h-auto" /></motion.span>)}</AnimatePresence></span> that we should find out how fireflies light up and put that in trees and then we&apos;d have glowing trees and people wouldn&apos;t have to pay for electricity. He seriously told me I was a &quot;genius&quot; and that I should look into it. I made a whole presentation that night. For months after, anytime <span data-tooltip-trigger className="relative inline-block cursor-pointer" onClick={() => setShowPeopleTooltip(!showPeopleTooltip)}><strong>people</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>2</sup><AnimatePresence>{showPeopleTooltip && (<motion.span data-tooltip-content initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mobile-tooltip-text absolute left-0 top-full mt-2 bg-white rounded-lg shadow-xl p-2.5 z-[100] w-[200px] text-sm font-normal text-left block">Coworkers, neighbors, family friends, old bosses, etc.</motion.span>)}</AnimatePresence></span> came over, he made them watch it. He made them put their phones away and ask me at least 3 questions at the end. I was a kid talking about glowing trees.
                  </p>
                  <p>
                    I still remember the name of the specific molecule. Luciferin. It&apos;s what makes fireflies light up.
                  </p>
                  <p>
                    My dad <span data-tooltip-trigger className="relative inline-block cursor-pointer" onClick={() => setShowDidThatTooltip(!showDidThatTooltip)}><strong>did that for me my whole life</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>3</sup><AnimatePresence>{showDidThatTooltip && (<motion.span data-tooltip-content initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mobile-tooltip-image absolute left-0 top-full mt-2 bg-white rounded-lg shadow-xl p-2 z-[100] block" style={{ width: '200px' }}><img src="/assets/about/dadandme.png" alt="Dad and me" className="rounded-lg w-full h-auto" /></motion.span>)}</AnimatePresence></span>. Took my foolish dreams seriously. Made other people too.
                  </p>
                  <p>
                    This is his.
                  </p>
                </div>
              </section>

              {/* People are awesome */}
              <section className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 text-black font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em' }}>
                  People are awesome.
                </h2>
                <div className="space-y-4 text-black font-medium font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em', fontSize: 'clamp(1.05rem, 3.5vw, 1.2rem)' }}>
                  <p>
                    I&apos;m lucky to have a really <span data-tooltip-trigger className="relative inline-block cursor-pointer" onClick={() => setShowFamilyTooltip(!showFamilyTooltip)}><strong>good family</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>4</sup><AnimatePresence>{showFamilyTooltip && (<motion.span data-tooltip-content initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mobile-tooltip-text absolute left-0 top-full mt-2 bg-white rounded-lg shadow-xl p-2.5 z-[100] whitespace-nowrap text-sm font-normal text-left block">both given and chosen</motion.span>)}</AnimatePresence></span>. Because of them, I&apos;m pretty optimistic about people overall. I think they&apos;re mostly awesome and usually deserve forgiveness.
                  </p>
                  <p>
                    Awhile ago, I heard this song by Suki Waterhouse -
                  </p>
                  <div className="my-4">
                    <iframe
                      style={{ borderRadius: '12px' }}
                      src="https://open.spotify.com/embed/track/54rOvFIQHqhv0sf71A4NpJ?utm_source=generator"
                      className="w-full"
                      height="80"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                  <p>
                    The whole song is beautiful but there&apos;s one line I think about all the time.
                  </p>
                  <p>
                    <em>&quot;God exists between people, homie&quot;</em>
                  </p>
                  <p className="mt-4">
                    People work three jobs so their kid can go to dance classes and then watch them forget the routine on stage. People risk their careers and reputations investing in someone else&apos;s dream. People practice for decades to make others laugh, only to get boo&apos;d off stage. People say &quot;I love you&quot; not knowing if it&apos;s going to be said back.
                  </p>
                  <p>
                    People willing to be fools for each other. There&apos;s something holy in that.
                  </p>
                </div>
              </section>

              {/* I want to make Art */}
              <section className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 text-black font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em' }}>
                  I want to make Art
                </h2>
                <div className="space-y-4 text-black font-medium font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em', fontSize: 'clamp(1.05rem, 3.5vw, 1.2rem)' }}>
                  <div className="border-2 border-black p-4 my-4">
                    <p className="text-[1.1rem] md:text-[1.25rem] italic">
                      People are awesome when they&apos;re willing to be fools for each other. I want to make art that invites that and brings people together in unexpected ways.
                    </p>
                  </div>
                  <p>
                    I work on experimental and collaborative <span data-tooltip-trigger className="relative inline-block cursor-pointer" onClick={() => setShowArtProjectsTooltip(!showArtProjectsTooltip)}><strong>art projects</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>5</sup><AnimatePresence>{showArtProjectsTooltip && (<motion.span data-tooltip-content initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mobile-tooltip-text absolute left-0 top-full mt-2 bg-white rounded-lg shadow-xl p-2.5 z-[100] w-[250px] text-sm font-normal text-left block">some I sell, others for the love of the game</motion.span>)}</AnimatePresence></span>. Most of them are custom and handmade and done by a small team (mostly just me and my friends).
                  </p>
                  <p>
                    A lot of this stuff is weird and asks you to put in more effort, or wait a little longer or take a bigger risk than other things you may buy. I don&apos;t take that for granted. I know this sounds corny but I really do try to make everything with Love. When you open my stuff, I want it to feel like discovering treasure.
                  </p>
                  <p>
                    If you decide to participate, thank you and welcome to the hooha.
                  </p>
                </div>
              </section>

              {/* Dream come true / Please don't sue me */}
              <section className="scroll-mt-32">
                <h2 className="text-2xl font-bold mb-6 text-black font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em' }}>
                  Sometimes, dreams come true
                </h2>
                <div className="space-y-4 text-black font-medium font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em', fontSize: 'clamp(1.05rem, 3.5vw, 1.2rem)' }}>
                  <p>
                    It took me a long time to realize that this is what I want to do. It took me even longer <span data-tooltip-trigger className="relative inline-block cursor-pointer" onClick={() => setShowBelieveTooltip(!showBelieveTooltip)}><strong>to believe</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>6</sup><AnimatePresence>{showBelieveTooltip && (<motion.span data-tooltip-content initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="mobile-tooltip-text absolute left-0 top-full mt-2 bg-white rounded-lg shadow-xl p-2.5 z-[100] w-[250px] text-sm font-normal text-left block">I still can&apos;t believe this is a real job. It sort of feels illegal. Thank you to my friends for showing me the way. I love you.</motion.span>)}</AnimatePresence></span> that I can do it. I feel so, so lucky and grateful that I get to do this right now. This is my dream. Thank you for being here.
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* Desktop: Two-column layout */}
          <div className="hidden md:flex gap-16 lg:gap-24">
            {/* Left: Sticky navigation */}
            <div className="w-64 flex-shrink-0">
              <div className="sticky top-48">
                <nav className="space-y-4">
                  {sections.map(({ id, title }) => (
                    <button
                      key={id}
                      onClick={() => scrollToSection(id)}
                      className={`block text-left text-lg font-bold font-[family-name:var(--font-inter)] transition-colors ${
                        activeSection === id ? "text-[#F8330D]" : "text-black/40 hover:text-black"
                      }`}
                      style={{ letterSpacing: '-0.03em' }}
                    >
                      {title}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Right: Scrollable content with all sections */}
            <div className="flex-1 max-w-2xl space-y-20 pb-48">
              {/* Origin Story */}
              <section id="origin-story" className="scroll-mt-48">
                <h2 className="text-2xl font-bold mb-6 text-black font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em' }}>
                  Origin Story
                </h2>
                <div className="space-y-4 text-black font-medium font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em', fontSize: '1.2rem' }}>
                  <p>
                    When I was 12, I told <span className="relative inline-block cursor-pointer" onMouseEnter={() => setShowDadTooltip(true)} onMouseLeave={() => setShowDadTooltip(false)}><strong>my dad</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>1</sup><AnimatePresence>{showDadTooltip && (<motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-2 z-[100] block" style={{ width: '180px' }}><img src="/assets/dad.jpg" alt="Dad" className="rounded-lg w-full h-auto" /></motion.span>)}</AnimatePresence></span> that we should find out how fireflies light up and put that in trees and then we&apos;d have glowing trees and people wouldn&apos;t have to pay for electricity. He seriously told me I was a &quot;genius&quot; and that I should look into it. I made a whole presentation that night. For months after, anytime <span className="relative inline-block cursor-pointer" onMouseEnter={() => setShowPeopleTooltip(true)} onMouseLeave={() => setShowPeopleTooltip(false)}><strong>people</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>2</sup><AnimatePresence>{showPeopleTooltip && (<motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-4 z-[100] w-80 text-base font-normal text-left block">Coworkers, neighbors, family friends, old bosses, etc.</motion.span>)}</AnimatePresence></span> came over, he made them watch it. He made them put their phones away and ask me at least 3 questions at the end. I was a kid talking about glowing trees.
                  </p>
                  <p>
                    I still remember the name of the specific molecule. Luciferin. It&apos;s what makes fireflies light up.
                  </p>
                  <p>
                    My dad <span className="relative inline-block cursor-pointer" onMouseEnter={() => setShowDidThatTooltip(true)} onMouseLeave={() => setShowDidThatTooltip(false)}><strong>did that for me my whole life</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>3</sup><AnimatePresence>{showDidThatTooltip && (<motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-2 z-[100] block" style={{ width: '200px' }}><img src="/assets/about/dadandme.png" alt="Dad and me" className="rounded-lg w-full h-auto" /></motion.span>)}</AnimatePresence></span>. Took my foolish dreams seriously. Made other people too.
                  </p>
                  <p>
                    This is his.
                  </p>
                </div>
              </section>

              {/* People are awesome */}
              <section id="people-awesome" className="scroll-mt-48">
                <h2 className="text-2xl font-bold mb-6 text-black font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em' }}>
                  People are awesome.
                </h2>
                <div className="space-y-4 text-black font-medium font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em', fontSize: '1.2rem' }}>
                  <p>
                    I&apos;m lucky to have a really <span className="relative inline-block cursor-pointer" onMouseEnter={() => setShowFamilyTooltip(true)} onMouseLeave={() => setShowFamilyTooltip(false)}><strong>good family</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>4</sup><AnimatePresence>{showFamilyTooltip && (<motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-4 z-[100] whitespace-nowrap text-base font-normal text-left block">both given and chosen</motion.span>)}</AnimatePresence></span>. Because of them, I&apos;m pretty optimistic about people overall. I think they&apos;re mostly awesome and usually deserve forgiveness.
                  </p>
                  <p>
                    Awhile ago, I heard this song by Suki Waterhouse -
                  </p>
                  <div className="my-4">
                    <iframe
                      style={{ borderRadius: '12px' }}
                      src="https://open.spotify.com/embed/track/54rOvFIQHqhv0sf71A4NpJ?utm_source=generator"
                      className="w-full md:w-[80%]"
                      height="80"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                  <p>
                    The whole song is beautiful but there&apos;s one line I think about all the time.
                  </p>
                  <p>
                    <em>&quot;God exists between people, homie&quot;</em>
                  </p>
                  <p className="mt-4">
                    People work three jobs so their kid can go to dance classes and then watch them forget the routine on stage. People risk their careers and reputations investing in someone else&apos;s dream. People practice for decades to make others laugh, only to get boo&apos;d off stage. People say &quot;I love you&quot; not knowing if it&apos;s going to be said back.
                  </p>
                  <p>
                    People willing to be fools for each other. There&apos;s something holy in that.
                  </p>
                </div>
              </section>

              {/* I want to make Art */}
              <section id="make-art" className="scroll-mt-48">
                <h2 className="text-2xl font-bold mb-6 text-black font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em' }}>
                  I want to make Art
                </h2>
                <div className="space-y-4 text-black font-medium font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em', fontSize: '1.2rem' }}>
                  <div className="border-2 border-black p-4 my-4">
                    <p className="text-[1.1rem] md:text-[1.25rem] italic">
                      People are awesome when they&apos;re willing to be fools for each other. I want to make art that invites that and brings people together in unexpected ways.
                    </p>
                  </div>
                  <p>
                    I work on experimental and collaborative <span className="relative inline-block cursor-pointer" onMouseEnter={() => setShowArtProjectsTooltip(true)} onMouseLeave={() => setShowArtProjectsTooltip(false)}><strong>art projects</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>5</sup><AnimatePresence>{showArtProjectsTooltip && (<motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-4 z-[100] w-80 text-base font-normal text-left block">some I sell, others for the love of the game</motion.span>)}</AnimatePresence></span>. Most of them are custom and handmade and done by a small team (mostly just me and my friends).
                  </p>
                  <p>
                    A lot of this stuff is weird and asks you to put in more effort, or wait a little longer or take a bigger risk than other things you may buy. I don&apos;t take that for granted. I know this sounds corny but I really do try to make everything with Love. When you open my stuff, I want it to feel like discovering treasure.
                  </p>
                  <p>
                    If you decide to participate, thank you and welcome to the hooha.
                  </p>
                </div>
              </section>

              {/* Dream come true / Please don't sue me */}
              <section id="dont-sue-me" className="scroll-mt-48">
                <h2 className="text-2xl font-bold mb-6 text-black font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em' }}>
                  Sometimes, dreams come true
                </h2>
                <div className="space-y-4 text-black font-medium font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.03em', fontSize: '1.2rem' }}>
                  <p>
                    It took me a long time to realize that this is what I want to do. It took me even longer <span className="relative inline-block cursor-pointer" onMouseEnter={() => setShowBelieveTooltip(true)} onMouseLeave={() => setShowBelieveTooltip(false)}><strong>to believe</strong><sup style={{ backgroundColor: '#dcff73', borderRadius: '50%', padding: '2px 6px', fontSize: '0.6em', marginLeft: '2px' }}>6</sup><AnimatePresence>{showBelieveTooltip && (<motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-white rounded-lg shadow-xl p-4 z-[100] w-80 text-base font-normal text-left block">I still can&apos;t believe this is a real job. It sort of feels illegal. Thank you to my friends for showing me the way. I love you.</motion.span>)}</AnimatePresence></span> that I can do it. I feel so, so lucky and grateful that I get to do this right now. This is my dream. Thank you for being here.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto">
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
    </div>
  );
}
