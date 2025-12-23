"use client";

import { motion } from "framer-motion";

export default function Connect() {
  return (
    <main className="min-h-screen pt-[100px] sm:pt-[130px] md:pt-[160px] lg:pt-[180px] pb-32" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mb-16">
          {/* Left Column - Contact Info */}
          <div className="md:pr-8 flex flex-col">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="font-light mb-4 flex items-baseline text-black -mt-8"
              style={{ fontFamily: 'Times New Roman MT, Times New Roman, serif' }}
            >
              <span style={{ fontSize: '2.25rem' }}>T</span>
              <span style={{ fontSize: '2.4rem' }}>e</span>
              <span style={{ fontSize: '2.55rem' }}>l</span>
              <span style={{ fontSize: '2.7rem' }}>l</span>
              <span style={{ fontSize: '2.85rem' }}>&nbsp;</span>
              <span style={{ fontSize: '3.0rem' }}>u</span>
              <span style={{ fontSize: '3.15rem' }}>s</span>
              <span style={{ fontSize: '3.3rem' }}>&nbsp;</span>
              <span style={{ fontSize: '3.45rem' }}>w</span>
              <span style={{ fontSize: '3.6rem' }}>h</span>
              <span style={{ fontSize: '3.75rem' }}>a</span>
              <span style={{ fontSize: '3.9rem' }}>t</span>
              <span style={{ fontSize: '4.05rem' }}>s</span>
              <span style={{ fontSize: '4.2rem' }}>&nbsp;</span>
              <span style={{ fontSize: '4.35rem' }}>u</span>
              <span style={{ fontSize: '4.5rem' }}>p</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8 mb-8 -mt-4"
            >
              {/* Everything Else */}
              <div>
                <p className="text-base text-black font-[family-name:var(--font-inter)] mb-2">
                  For everything other than order support:
                </p>
                <a
                  href="mailto:rithika@rithikaisafool.com"
                  className="text-xl font-[family-name:var(--font-inter)] hover:underline"
                  style={{ color: '#F8330D' }}
                >
                  rithika@rithikaisafool.com
                </a>
              </div>

              {/* Order Support */}
              <div>
                <p className="text-base text-black font-[family-name:var(--font-inter)] mb-2">
                  Order support:
                </p>
                <a
                  href="mailto:support@rithikaisafool.com"
                  className="text-xl font-[family-name:var(--font-inter)] hover:underline"
                  style={{ color: '#F8330D' }}
                >
                  support@rithikaisafool.com
                </a>
              </div>
            </motion.div>

            {/* Newsletter Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8 mt-8"
            >
              <h3 className="text-xl font-semibold text-black font-[family-name:var(--font-inter)] mb-2">
                Also sign up for our newsletter and
              </h3>
              <p className="text-base text-black font-[family-name:var(--font-inter)] mb-4">
                we'll send you cool, secret things.
              </p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="enter your email"
                  className="w-full border-b-2 border-black bg-transparent py-2 pr-12 text-base font-[family-name:var(--font-inter)] focus:outline-none placeholder:text-gray-500"
                />
                <button className="absolute right-0 bottom-2">
                  <svg width="30" height="12" viewBox="0 0 30 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 6H28M28 6L23 1M28 6L23 11" stroke="#F8330D" strokeWidth="2"/>
                  </svg>
                </button>
              </div>
            </motion.div>

            {/* Social Icons */}
            <div className="flex gap-4 mt-auto">
              <a href="#" className="hover:opacity-80 transition-opacity">
                <svg className="w-8 h-8" fill="url(#instagram-gradient)" viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id="instagram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#833AB4' }} />
                      <stop offset="50%" style={{ stopColor: '#E1306C' }} />
                      <stop offset="100%" style={{ stopColor: '#FD1D1D' }} />
                    </linearGradient>
                  </defs>
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              <a href="#" className="hover:opacity-80 transition-opacity">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>

              <a href="#" className="hover:opacity-80 transition-opacity">
                <svg className="w-8 h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Right Column - Spotify Player and Placeholder */}
          <div className="md:pl-8">
            {/* Music Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="w-full">
                <iframe
                  style={{ borderRadius: '12px', boxShadow: '0px 4px 34px 0px rgba(0, 0, 0, 0.25)' }}
                  src="https://open.spotify.com/embed/track/20I6sIOMTCkB6w7ryavxtO?utm_source=generator"
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                ></iframe>
              </div>
            </motion.div>

            {/* Gray Placeholder Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full h-[400px] bg-gray-300 rounded-lg"
            ></motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Scrolling Text */}
      <div className="fixed bottom-0 left-0 w-full bg-white py-3 overflow-hidden z-40" style={{ boxShadow: '0px 4px 34px 0px rgba(0, 0, 0, 0.25)' }}>
        <div className="flex animate-marquee-seamless" style={{ letterSpacing: '-0.06em' }}>
          <div className="flex whitespace-nowrap">
            {Array(20).fill(0).map((_, i) => (
              <span key={i} className="text-base md:text-xl font-normal italic text-black font-[family-name:var(--font-inter)]">
                Don't be a stranger.&nbsp;
              </span>
            ))}
          </div>
          <div className="flex whitespace-nowrap" aria-hidden="true">
            {Array(20).fill(0).map((_, i) => (
              <span key={i} className="text-base md:text-xl font-normal italic text-black font-[family-name:var(--font-inter)]">
                Don't be a stranger.&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
