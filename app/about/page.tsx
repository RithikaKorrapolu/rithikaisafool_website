"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FooterSignup from "@/components/FooterSignup";

export default function About() {
  const [showDadTooltip, setShowDadTooltip] = useState(false);
  const [showPeopleTooltip, setShowPeopleTooltip] = useState(false);
  const [showFamilyTooltip, setShowFamilyTooltip] = useState(false);
  const [showDidThatTooltip, setShowDidThatTooltip] = useState(false);
  const [showBelieveTooltip, setShowBelieveTooltip] = useState(false);
  const [showArtProjectsTooltip, setShowArtProjectsTooltip] = useState(false);

  // Close tooltips on significant scroll
  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollDiff = Math.abs(window.scrollY - lastScrollY);
          if (scrollDiff > 50) {
            setShowDadTooltip(false);
            setShowPeopleTooltip(false);
            setShowFamilyTooltip(false);
            setShowDidThatTooltip(false);
            setShowBelieveTooltip(false);
            setShowArtProjectsTooltip(false);
            lastScrollY = window.scrollY;
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close tooltips when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
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

  const [isMobile, setIsMobile] = useState(false);
  const [slideDistance, setSlideDistance] = useState(0);
  const slideWrapperRef = useRef<HTMLDivElement>(null);
  const slideTextRef = useRef<HTMLParagraphElement>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    // Sections collapsed by default on both mobile and desktop
    setExpandedSections([]);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const calculateSlideDistance = () => {
      if (slideWrapperRef.current && slideTextRef.current) {
        const wrapperWidth = slideWrapperRef.current.offsetWidth;
        const textWidth = slideTextRef.current.offsetWidth;
        setSlideDistance(wrapperWidth - textWidth);
      }
    };
    calculateSlideDistance();
    window.addEventListener('resize', calculateSlideDistance);
    return () => window.removeEventListener('resize', calculateSlideDistance);
  }, []);

  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const Citation = ({ num, children, show, setShow, tooltip, isImage = false }: {
    num: number;
    children: React.ReactNode;
    show: boolean;
    setShow: (v: boolean) => void;
    tooltip: React.ReactNode;
    isImage?: boolean;
  }) => {
    const handleMouseEnter = () => {
      if (!isMobile) {
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
        setShow(true);
      }
    };

    const handleMouseLeave = () => {
      if (!isMobile) {
        closeTimeoutRef.current = setTimeout(() => {
          setShow(false);
        }, 150);
      }
    };

    return (
    <span data-tooltip-trigger className="inline">
      <span
        className="cursor-pointer"
        onClick={(e) => {
          if (isMobile) {
            e.stopPropagation();
            setShow(!show);
          }
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <strong>{children}</strong>
        <sup
          style={{
            backgroundColor: '#dcff73',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '0.6em',
            marginLeft: '2px',
          }}
        >
          {num}
        </sup>
      </span>
      <AnimatePresence>
        {show && (
          <motion.span
            data-tooltip-content
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`block overflow-hidden ${isImage ? '' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <span
              className={`inline-block my-2 bg-white rounded-lg shadow-lg ${isImage ? 'p-2' : 'p-3 text-sm font-normal'}`}
              style={isImage ? { width: '220px', maxWidth: '100%' } : {}}
            >
              {tooltip}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F2F2F2' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Indie+Flower&family=Shadows+Into+Light&family=Kalam:wght@400;700&family=Gloria+Hallelujah&family=Satisfy&family=Loved+by+the+King&display=swap');
                .drop-cap::first-letter {
          float: left;
          font-size: 5.5rem;
          line-height: 0.8;
          font-family: "Iowan Old Style", "Palatino Linotype", Georgia, serif;
          font-weight: 400;
          margin-right: 0.5rem;
          margin-top: 0.1rem;
          color: #000;
        }
        .columns-layout {
          column-count: 3;
          column-gap: 40px;
          font-size: 20px;
        }
        .section-1, .section-2 {
          break-after: column;
        }
        .mobile-line-break {
          display: none;
        }
        @media (min-width: 769px) {
          .main-headline {
            font-size: clamp(1.84rem, 5.5vw, 4.14rem) !important;
            max-width: 80%;
            margin-top: 0.5rem !important;
            margin-bottom: 1rem !important;
          }
          .in-ways-text {
            font-size: 0.57em !important;
          }
        }
        @media (max-width: 1024px) {
          .columns-layout {
            column-count: 2;
          }
        }
        @media (max-width: 768px) {
          .columns-layout {
            column-count: 1;
            font-size: 18px;
          }
          .columns-layout h2 {
            font-size: 0.9em;
          }
          .drop-cap::first-letter {
            font-size: 4rem;
          }
          .main-headline {
            line-height: 1.1 !important;
            margin-top: 0.5rem !important;
            font-size: clamp(1.76rem, 5.28vw, 3.96rem) !important;
          }
          .and-good-annotation {
            left: auto !important;
            right: -12em;
            transform: none !important;
            bottom: 0 !important;
          }
          .and-good-annotation::before {
            content: '';
            position: absolute;
            left: -2em;
            top: 50%;
            width: 2em;
            height: 2px;
            background: #F8330D;
            transform: rotate(-10deg);
          }
          .section-1, .section-2 {
            break-after: auto;
          }
          .art-tech-line {
            font-size: clamp(0.85rem, 1.89vw, 1.18rem) !important;
          }
          .world-better-line {
            margin-top: 1.5rem !important;
            font-size: clamp(1.14rem, 3.05vw, 1.91rem) !important;
          }
          .people-connect-text {
            font-size: 1.32em !important;
          }
          .mobile-line-break {
            display: block;
            width: 100%;
            height: 1px;
            background-color: #000;
            margin: 1rem 0;
          }
        }
        .section-header {
          break-after: avoid;
          margin-top: 1.5rem;
        }
        .section-header:first-of-type {
          margin-top: 0;
        }
        @keyframes highlight-sweep {
          0% { background-size: 0% 100%; }
          50% { background-size: 100% 100%; }
          100% { background-size: 0% 100%; }
        }
        .highlight-animate {
          background: linear-gradient(to right, #dcff73 100%, transparent 0%);
          background-repeat: no-repeat;
          background-position: left center;
          animation: highlight-sweep 3s ease-in-out infinite;
          padding: 2px 4px;
        }
        .highlight-squiggly {
          position: relative;
          display: inline;
          padding: 4px 0;
        }
        .highlight-squiggly::before {
          content: '';
          position: absolute;
          left: -6px;
          right: -6px;
          top: 0;
          bottom: 0;
          background-color: #dcff73;
          z-index: -1;
          transform: rotate(-1deg);
          clip-path: polygon(
            0% 20%, 4% 0%, 12% 18%, 20% 2%, 28% 15%, 36% 0%, 44% 12%, 52% 3%, 60% 18%, 68% 5%, 76% 15%, 84% 0%, 92% 12%, 100% 5%,
            100% 80%, 96% 100%, 88% 85%, 80% 98%, 72% 88%, 64% 100%, 56% 90%, 48% 100%, 40% 85%, 32% 95%, 24% 88%, 16% 100%, 8% 90%, 0% 100%
          );
        }
        @keyframes closer-spacing {
          0%, 100% { letter-spacing: 0.02em; }
          50% { letter-spacing: 0.15em; }
        }
        .closer-animate {
          display: inline-block;
          animation: closer-spacing 2s ease-in-out infinite;
        }
        @keyframes letter-flip-anim {
          0%, 85%, 100% { transform: rotateX(0deg); }
          90%, 95% { transform: rotateX(180deg); }
        }
        .letter-flip {
          display: inline-block;
          animation: letter-flip-anim 4s ease-in-out infinite;
        }
        .flip-letter {
          display: inline-block;
          perspective: 100px;
        }
        .flip-letter-inner {
          display: inline-block;
          transition: transform 0.4s ease-in-out;
          transform-style: preserve-3d;
        }
        .flip-letter-inner.flipping {
          animation: flip-roll 0.4s ease-in-out;
        }
        @keyframes flip-roll {
          0% { transform: rotateX(0deg); }
          50% { transform: rotateX(-90deg); }
          100% { transform: rotateX(0deg); }
        }
      `}</style>

      <main className="pt-[160px] md:pt-[160px] lg:pt-[180px] flex-grow" style={{ backgroundColor: '#F2F2F2' }}>
        <div className="mx-auto px-6 lg:px-12 xl:px-16" style={{ maxWidth: '95%' }}>
          {/* Headline */}
          <div className="text-left mb-8">
            <p
              className="mb-2 art-tech-line"
              style={{
                fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
                fontSize: 'clamp(0.9rem, 2vw, 1.25rem)',
                fontWeight: '400',
                color: '#000',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
              }}
            >
              AN ART AND TECH COMPANY HELPING
            </p>
            <h1
              className="main-headline"
              style={{
                fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
                fontSize: 'clamp(1.6rem, 4.8vw, 3.6rem)',
                fontWeight: '700',
                color: '#000',
                letterSpacing: '0.02em',
                lineHeight: '1.1',
                textTransform: 'uppercase',
              }}
            >
              <span className="people-connect-text" style={{ fontSize: '1.19em' }}>PEOPLE CONNECT*</span><span className="in-ways-text" style={{ display: 'block', fontSize: '0.63em', marginTop: '0.1em', fontStyle: 'italic', color: '#000', textTransform: 'none' }}>*in ways they normally wouldn&apos;t</span>
            </h1>
            <p
              className="mt-2 world-better-line"
              style={{
                fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
                fontSize: 'clamp(1.04rem, 2.77vw, 1.74rem)',
                fontWeight: '400',
                color: '#000',
                letterSpacing: '-0.02em',
              }}
            >
              The world gets better if we&apos;re more <span style={{ backgroundColor: '#dcff73', padding: '0 4px' }}>playful and open and free with each other</span>.<br/>We try to make things that bring that out in people.
            </p>

          </div>

          {/* Three-column layout */}
          <div
            className="columns-layout pb-16"
            style={{
              fontFamily: '"Georgia", "Times New Roman", serif',
              lineHeight: '1.7',
              color: '#000',
              letterSpacing: '-0.02em',
            }}
          >
            {/* Origin Story */}
            <div className="section-1" style={{ marginBottom: '1rem' }}>
              <h2
                className="section-header text-2xl font-bold mb-2 cursor-pointer flex items-center gap-2"
                style={{
                  color: '#000',
                  letterSpacing: '0.08em',
                  fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
                }}
                onClick={() => toggleSection('origin')}
              >
                <span style={{ transform: expandedSections.includes('origin') ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#000' }}>▶︎</span>
                ORIGIN STORY
              </h2>
              <AnimatePresence>
                {expandedSections.includes('origin') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className="mb-4 drop-cap">
                      When I was 12, I told{' '}
                      <Citation
                        num={1}
                        show={showDadTooltip}
                        setShow={setShowDadTooltip}
                        isImage
                        tooltip={<img src="/assets/dad.jpg" alt="Dad" className="rounded-lg w-full h-auto" />}
                      >
                        my dad
                      </Citation>{' '}
                      that we should find out how fireflies light up and put that in trees and then we&apos;d have glowing trees and people wouldn&apos;t have to pay for electricity. He seriously told me I was a &quot;genius&quot; and that I should look into it. I made a whole presentation that night. For months after, anytime{' '}
                      <Citation
                        num={2}
                        show={showPeopleTooltip}
                        setShow={setShowPeopleTooltip}
                        tooltip="Coworkers, neighbors, family friends, old bosses, etc."
                      >
                        people
                      </Citation>{' '}
                      came over, he made them watch it. He made them put their phones away and ask me at least 3 questions at the end. I was a kid talking about glowing trees.
                    </p>
                    <p className="mb-4">
                      I still remember the name of the specific molecule. Luciferin. It&apos;s what makes fireflies light up.
                    </p>
                    <p className="mb-4">
                      My dad{' '}
                      <Citation
                        num={3}
                        show={showDidThatTooltip}
                        setShow={setShowDidThatTooltip}
                        isImage
                        tooltip={<img src="/assets/about/dadandme.png" alt="Dad and me" className="rounded-lg w-full h-auto" />}
                      >
                        did that for me my whole life
                      </Citation>
                      . Took my foolish dreams seriously. Made other people too.
                    </p>
                    <p className="mb-4">This is his.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* People are awesome */}
            <div className="section-2" style={{ marginBottom: '1rem' }}>
              <h2
                className="section-header text-2xl font-bold mb-2 cursor-pointer flex items-center gap-2"
                style={{
                  color: '#000',
                  letterSpacing: '0.08em',
                  fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
                }}
                onClick={() => toggleSection('people')}
              >
                <span style={{ transform: expandedSections.includes('people') ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#000' }}>▶︎</span>
                PEOPLE ARE AWESOME
              </h2>
              <AnimatePresence>
                {expandedSections.includes('people') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className="mb-4 drop-cap">
                      I&apos;m lucky to have a really{' '}
                      <Citation
                        num={4}
                        show={showFamilyTooltip}
                        setShow={setShowFamilyTooltip}
                        tooltip="both given and chosen"
                      >
                        good family
                      </Citation>
                      . Because of them, I&apos;m pretty optimistic about people overall. I think they&apos;re mostly awesome and usually deserve forgiveness.
                    </p>
                    <p className="mb-4">
                      Awhile ago, I heard this song -
                    </p>
                    <div className="my-4" style={{ breakInside: 'avoid' }}>
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
                    <p className="mb-4">
                      The whole song is beautiful but there&apos;s one line I think about all the time.
                    </p>
                    <blockquote
                      className="mb-4 italic pl-4 py-2 font-bold"
                      style={{
                        borderLeft: '3px solid #000',
                        fontSize: '1.7rem',
                        lineHeight: '1.5',
                        color: '#000',
                      }}
                    >
                      <span className="highlight-animate">&quot;God exists between people, homie&quot;</span>
                    </blockquote>
                    <p className="mb-4">
                      People work three jobs so their kid can go to dance classes and then watch them forget the routine on stage. People risk their careers and reputations investing in someone else&apos;s dream. People practice for decades to make others laugh, only to get boo&apos;d off stage. People say &quot;I love you&quot; not knowing if it&apos;s going to be said back.
                    </p>
                    <p className="mb-4">People willing to be fools for each other. There&apos;s something holy in that.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* I want to make Art */}
            <div className="section-3" style={{ marginBottom: '1rem' }}>
              <h2
                className="section-header text-2xl font-bold mb-2 cursor-pointer flex items-center gap-2"
                style={{
                  color: '#000',
                  letterSpacing: '0.08em',
                  fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
                }}
                onClick={() => toggleSection('art')}
              >
                <span style={{ transform: expandedSections.includes('art') ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#000' }}>▶︎</span>
                THIS STUFF IS WEIRD
              </h2>
              <AnimatePresence>
                {expandedSections.includes('art') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="border-2 border-black p-4 mb-4 italic text-lg" style={{ breakInside: 'avoid' }}>
                      People are awesome when they&apos;re willing to be fools for each other. I want to make art that invites that and brings people together in unexpected ways.
                    </div>
                    <p className="mb-4 drop-cap">
                      I work on experimental and collaborative{' '}
                      <Citation
                        num={5}
                        show={showArtProjectsTooltip}
                        setShow={setShowArtProjectsTooltip}
                        tooltip="some I sell, others for the love of the game"
                      >
                        art projects
                      </Citation>
                      . Most of them are custom and handmade and done by a small team (mostly just me and my friends).
                    </p>
                    <p className="mb-4">
                      A lot of this stuff is weird and asks you to put in more effort, or wait a little longer or take a bigger risk than other things you may buy. I don&apos;t take that for granted. I know this sounds corny but I really do try to make everything with Love. When you open my stuff, I want it to feel like discovering treasure.
                    </p>
                    <p className="mb-4">If you decide to participate, thank you and welcome to the hoopla.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sometimes, dreams come true */}
            <div style={{ marginBottom: '1rem' }}>
              <h2
                className="section-header text-2xl font-bold mb-2 cursor-pointer flex items-center gap-2"
                style={{
                  color: '#000',
                  letterSpacing: '0.08em',
                  fontFamily: '"Iowan Old Style", "Palatino Linotype", Georgia, serif',
                }}
                onClick={() => toggleSection('dreams')}
              >
                <span style={{ transform: expandedSections.includes('dreams') ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: '#000' }}>▶︎</span>
                IT TOOK ME A LONG TIME
              </h2>
              <AnimatePresence>
                {expandedSections.includes('dreams') && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className="mb-4 drop-cap">
                      It took me a long time to realize that this is what I want to do. It took me even longer{' '}
                      <Citation
                        num={6}
                        show={showBelieveTooltip}
                        setShow={setShowBelieveTooltip}
                        tooltip="I still can't believe this is a real job. It sort of feels illegal. Thank you to my friends for showing me the way. I love you."
                      >
                        to believe
                      </Citation>{' '}
                      that I can do it. I feel so, so lucky and grateful that I get to do this right now. This is my dream. Thank you for being here.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
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
              <a href="https://www.tiktok.com/@rithikakorr" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
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
              <a href="https://www.tiktok.com/@rithikakorr" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
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
