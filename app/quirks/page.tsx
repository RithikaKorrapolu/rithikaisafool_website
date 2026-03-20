"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import FooterSignup from "@/components/FooterSignup";

export default function Quirks() {
  const [quirksTypedText, setQuirksTypedText] = useState("");
  const [quirkNumber, setQuirkNumber] = useState(1);
  const [quirkSubmission, setQuirkSubmission] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const placeholders = ["My friend...", "My grandpa...", "My neighbor...", "My cousin..."];

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async () => {
    if (!quirkSubmission.trim()) {
      setSubmitError("Please enter a quirk.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch('/api/quirks-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quirk: quirkSubmission,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setSubmitSuccess(true);
      setQuirkSubmission("");
    } catch (err) {
      setSubmitError('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quirks = [
    `My grandpa doesn't know\nhow to talk to tall people\nHe thinks\nthey can't hear him\nSo he screams\nthe whole time`,
    `My brother hums the song "Baby"\nby Justin Bieber\nwhen\nhe's nervous`,
    `My sister apologizes to\nfurniture\nand walls\nwhen she bumps into them.`
  ];

  // Quirks typing animation
  useEffect(() => {
    let currentQuirk = 0;
    let index = 0;
    let isPaused = false;

    const typeInterval = setInterval(() => {
      if (isPaused) return;

      const fullText = quirks[currentQuirk];

      if (index <= fullText.length) {
        setQuirksTypedText(fullText.slice(0, index));
        index++;
      } else {
        // Pause at end, then move to next quirk
        isPaused = true;
        setTimeout(() => {
          currentQuirk = (currentQuirk + 1) % quirks.length;
          setQuirkNumber(currentQuirk + 1);
          index = 0;
          setQuirksTypedText("");
          isPaused = false;
        }, 2000);
      }
    }, 50);
    return () => clearInterval(typeInterval);
  }, []);

  return (
    <>
      <main className="min-h-screen pb-16" style={{ backgroundColor: '#F2F2F2', paddingTop: 'calc(var(--header-h, 160px) + 20px)' }}>
        <div className="container mx-auto px-6">
          {/* Hero Section */}
          <div className="mb-6 mt-4 text-center max-w-[58rem] mx-auto">
            <h2 className="text-black text-[2.0625rem] lg:text-5xl tracking-tight font-[family-name:var(--font-instrument-serif)]">
              <span style={{ textDecoration: 'underline', textDecorationStyle: 'wavy', textDecorationColor: '#F8330D', fontStyle: 'italic' }}>Quirks</span> is a collection of funny, odd, sweet little <span className="font-bold">observations about people.</span>
            </h2>
            <p className="text-black text-xl lg:text-2xl mt-4 font-[family-name:var(--font-inter)] tracking-tight">
              <span className="bg-[#dcff73] px-1 font-bold">New quirk every week</span> <a href="https://www.instagram.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-[#F8330D] transition-colors font-bold">here</a>.
            </p>
          </div>

          {/* Submission Form - Centered */}
          <div className="mt-8 w-full lg:max-w-3xl lg:mx-auto">
            <div className="flex flex-col justify-center">
              <p className="text-black text-2xl lg:text-4xl font-[family-name:var(--font-instrument-serif)] tracking-tight mb-1">
                Who do you <span className="font-bold text-[#F8330D]">love</span>? What have you <span className="font-bold text-[#F8330D]">noticed</span>?
              </p>
              <textarea
                placeholder={quirksTypedText + "|"}
                value={quirkSubmission}
                onChange={(e) => setQuirkSubmission(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl font-[family-name:var(--font-inter)] text-black text-base lg:text-xl placeholder-gray-400 focus:outline-none bg-white resize-none shadow-lg"
                rows={8}
              />
              {submitError && (
                <p className="text-[#F8330D] text-sm font-[family-name:var(--font-inter)] mt-2 text-right">
                  {submitError}
                </p>
              )}
              <p className="text-black text-sm lg:text-lg font-[family-name:var(--font-inter)] tracking-tight mt-4 text-right italic">
                "People might call these things imperfections but they're not. Ah, that's the good stuff."
              </p>
              <motion.button
                onClick={handleSubmit}
                disabled={isSubmitting || submitSuccess}
                whileHover={!submitSuccess ? {
                  rotate: [0, -2, 2, -2, 2, 0],
                  transition: { duration: 0.4 }
                } : {}}
                className={`mt-4 px-8 py-3 font-bold font-[family-name:var(--font-inter)] rounded-full transition-colors w-fit self-end ${
                  submitSuccess
                    ? 'bg-[#dcff73] text-black cursor-default'
                    : 'bg-black text-white hover:bg-[#F8330D] disabled:opacity-50'
                }`}
              >
                {submitSuccess ? "Thank you!" : isSubmitting ? "Submitting..." : "Submit"}
              </motion.button>
            </div>
          </div>

          {/* Squiggly Line */}
          <div className="mt-16 -mx-[50vw] left-1/2 right-1/2 relative w-screen overflow-hidden">
            <svg width="100%" height="12" viewBox="0 0 1200 12" preserveAspectRatio="none">
              <path
                d="M0,6 Q15,0 30,6 T60,6 T90,6 T120,6 T150,6 T180,6 T210,6 T240,6 T270,6 T300,6 T330,6 T360,6 T390,6 T420,6 T450,6 T480,6 T510,6 T540,6 T570,6 T600,6 T630,6 T660,6 T690,6 T720,6 T750,6 T780,6 T810,6 T840,6 T870,6 T900,6 T930,6 T960,6 T990,6 T1020,6 T1050,6 T1080,6 T1110,6 T1140,6 T1170,6 T1200,6"
                fill="none"
                stroke="#000000"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* What was I thinking? Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="w-full max-w-[58rem] mx-auto mb-12 mt-8"
          >
            <div className="border-2 border-white rounded-xl p-10 md:p-12 bg-white shadow-lg">
              <p className="text-2xl lg:text-4xl text-black font-[family-name:var(--font-inter)] font-bold tracking-tight">
                What was I thinking?
              </p>
              <div className="pb-2">
                <p className="text-base lg:text-lg text-black font-[family-name:var(--font-inter)] tracking-tight mt-4 text-left italic leading-relaxed">
                  &ldquo;Those are the things I miss the most. The little idiosyncrasies that only I knew about. That&apos;s what made her my wife. Oh, and she had the goods on me, too, she knew all my little peccadillos. People call these things imperfections, but they&apos;re not, aw, that&apos;s the good stuff. And then we get to choose who we let in to our weird little worlds.&rdquo;
                </p>
                <p className="text-base lg:text-lg text-black font-[family-name:var(--font-inter)] tracking-tight mt-2 text-left italic">
                  - From Good Will Hunting
                </p>
                <p className="text-base lg:text-lg text-black font-[family-name:var(--font-inter)] tracking-tight mt-6 text-left">
                  &ldquo;There&apos;s <a href="https://www.youtube.com/watch?v=ltNhwj-F7c8" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-[#F8330D] transition-colors">this scene</a> in Good Will Hunting where Robin Williams&apos; character explains that the things he misses the most about his dead wife are these small, specific, random things. The things only he knew about because he spent so much time with her. I lost my dad and those are the things I remember too. He hated leaving voicemails. He was weirdly proud of the fact that he cut his own hair. He waited in his wheelchair near the door so that he could see me the moment I walked in. <span className="font-bold">I think that&apos;s what love is. It&apos;s just all these small things added up.</span> <span className="font-bold">I want people to notice them while they still can.</span>&rdquo;
                </p>
                <p className="text-base lg:text-lg text-black font-[family-name:var(--font-inter)] tracking-tight text-right mt-2">
                  — Rithika
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer>
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
              <a href="/shop" className="text-white text-sm font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Store</a>
              <a href="/connect" className="text-white text-sm font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Contact</a>
              <a href="/legal" className="text-white text-sm font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">Legal</a>
            </div>
            <p className="text-white text-sm font-normal font-[family-name:var(--font-inter)]">© Rithika is a Fool 2026</p>
          </div>
          {/* Desktop layout */}
          <div className="hidden md:block relative">
            <div className="container mx-auto flex justify-between items-center">
              <p className="text-white text-base font-normal font-[family-name:var(--font-inter)]">
                © Rithika is a Fool 2026
              </p>
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
    </>
  );
}
