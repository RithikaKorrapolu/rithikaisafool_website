"use client";

import { motion } from "framer-motion";
import CommunityCalendar from "@/components/CommunityCalendar";

export default function Community() {
  return (
    <main className="min-h-screen pt-[100px] sm:pt-[130px] md:pt-[160px] lg:pt-[180px] pb-32" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-base md:text-2xl font-bold text-black font-[family-name:var(--font-inter)] leading-tight">
            We wanna hang out and talk about cool ideas<br />and laugh and stuff.
          </h1>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
          {/* Left Column - Come Hang Out */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-lg md:text-xl font-bold mb-6 text-black font-[family-name:var(--font-inter)]">
              Come Hang Out
            </h2>

            <div className="mb-8">
              <p className="text-xl italic mb-2 text-black font-[family-name:var(--font-inter)]">
                "We were together. I forget the rest."
              </p>
              <p className="text-lg text-right text-black font-[family-name:var(--font-inter)]">
                -Walt Whitman
              </p>
            </div>

            {/* Calendar */}
            <CommunityCalendar />
          </motion.div>

          {/* Right Column - Talk Back to Us */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-lg md:text-xl font-bold mb-6 text-black font-[family-name:var(--font-inter)]">
              Talk back to us
            </h2>

            <div className="mb-8">
              <p className="text-lg mb-4 text-black font-[family-name:var(--font-inter)]">
                If you're into riffing on funny bits, analyzing art, brainstorming pranks and general stuff like that,{' '}
                <span className="underline decoration-2 underline-offset-2">ask us</span> about joining our Discord.
              </p>
            </div>

            <div className="mt-12">
              <p className="text-xl italic mb-2 text-black font-[family-name:var(--font-inter)]">
                "I want to know your ideas,"
              </p>
              <p className="text-xl italic mb-2 text-black font-[family-name:var(--font-inter)]">
                "I really want to know them. I love hearing your ideas.
              </p>
              <p className="text-xl italic mb-4 text-black font-[family-name:var(--font-inter)]">
                That's my favorite thing in the world."
              </p>
              <p className="text-lg text-right text-black font-[family-name:var(--font-inter)]">
                -Gabrielle Zevin
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Scrolling Text */}
      <div className="fixed bottom-0 left-0 w-full bg-white py-3 overflow-hidden z-40" style={{ boxShadow: '0px 4px 34px 0px rgba(0, 0, 0, 0.25)' }}>
        <div className="flex animate-marquee-seamless" style={{ letterSpacing: '-0.06em' }}>
          <div className="flex whitespace-nowrap">
            {Array(20).fill(0).map((_, i) => (
              <span key={i} className="text-base md:text-xl font-normal italic text-black font-[family-name:var(--font-inter)]">
                We are the future. Believe.&nbsp;
              </span>
            ))}
          </div>
          <div className="flex whitespace-nowrap" aria-hidden="true">
            {Array(20).fill(0).map((_, i) => (
              <span key={i} className="text-base md:text-xl font-normal italic text-black font-[family-name:var(--font-inter)]">
                We are the future. Believe.&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
