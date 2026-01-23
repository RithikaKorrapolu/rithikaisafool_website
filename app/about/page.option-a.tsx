"use client";

import { motion } from "framer-motion";

export default function About() {
  return (
    <main className="min-h-screen pt-[100px] sm:pt-[130px] md:pt-[160px] lg:pt-[180px] pb-32" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Top Section - Music Player, What we're about, and Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Music Player and What we're about */}
          <div>
            {/* Music Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-2"
            >
              <div className="w-full">
                <iframe
                  style={{ borderRadius: '12px', boxShadow: '0px 4px 34px 0px rgba(0, 0, 0, 0.25)' }}
                  src="https://open.spotify.com/embed/track/44AyOl4qVkzS48vBsbNXaC?utm_source=generator"
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                ></iframe>
              </div>
            </motion.div>

            {/* What we're about Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="font-normal mb-1 flex items-baseline text-black" style={{ fontFamily: 'Times New Roman MT, Times New Roman, serif' }}>
                <span style={{ fontSize: '1.5rem' }}>W</span>
                <span style={{ fontSize: '1.7rem' }}>h</span>
                <span style={{ fontSize: '1.9rem' }}>a</span>
                <span style={{ fontSize: '2.1rem' }}>t</span>
                <span style={{ fontSize: '2.1rem' }}>&nbsp;</span>
                <span style={{ fontSize: '2.3rem' }}>w</span>
                <span style={{ fontSize: '2.5rem' }}>e</span>
                <span style={{ fontSize: '2.7rem' }}>'</span>
                <span style={{ fontSize: '2.9rem' }}>r</span>
                <span style={{ fontSize: '3.1rem' }}>e</span>
                <span style={{ fontSize: '3.1rem' }}>&nbsp;</span>
                <span style={{ fontSize: '3.3rem' }}>a</span>
                <span style={{ fontSize: '3.5rem' }}>b</span>
                <span style={{ fontSize: '3.7rem' }}>o</span>
                <span style={{ fontSize: '3.9rem' }}>u</span>
                <span style={{ fontSize: '4.1rem' }}>t</span>
              </h2>

              <div className="mb-6">
                <p className="text-base text-black font-[family-name:var(--font-inter)] leading-relaxed">
                  What up, we're a creative studio. We <span className="font-bold">try to make things that are disarming.</span> Things that get people to be free and warm and want to dance with each other. And we <span className="font-bold">don't stick to one medium.</span> We make all kinds of things - apps, pants, live shows, even mailboxes. Whatever serves the story best.
                </p>
              </div>

              <div className="flex justify-start mt-6">
                <a href="/studio">
                  <button
                    className="px-6 py-2 border-2 border-black rounded-full text-sm font-semibold text-black hover:bg-black hover:text-white transition-all font-[family-name:var(--font-inter)]"
                    style={{ boxShadow: '0px 4px 4px 0px #F8330D', transform: 'rotate(-8deg)' }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'inset 0px 0px 10px 2px rgba(0, 0, 0, 0.8)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0px 4px 4px 0px #F8330D'}
                  >
                    What we're up to →
                  </button>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full min-h-[360px] bg-gray-300 rounded-lg"
          ></motion.div>
        </div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="font-normal mb-3 flex flex-wrap items-baseline text-black" style={{ fontFamily: 'Times New Roman MT, Times New Roman, serif' }}>
            <span style={{ fontSize: '1.8rem' }}>W</span>
            <span style={{ fontSize: '1.87rem' }}>e</span>
            <span style={{ fontSize: '1.93rem' }}>&nbsp;</span>
            <span style={{ fontSize: '2.0rem' }}>a</span>
            <span style={{ fontSize: '2.07rem' }}>l</span>
            <span style={{ fontSize: '2.13rem' }}>s</span>
            <span style={{ fontSize: '2.2rem' }}>o</span>
            <span style={{ fontSize: '2.27rem' }}>&nbsp;</span>
            <span style={{ fontSize: '2.33rem' }}>l</span>
            <span style={{ fontSize: '2.4rem' }}>o</span>
            <span style={{ fontSize: '2.47rem' }}>v</span>
            <span style={{ fontSize: '2.53rem' }}>e</span>
            <span style={{ fontSize: '2.6rem' }}>&nbsp;</span>
            <span style={{ fontSize: '2.67rem' }}>b</span>
            <span style={{ fontSize: '2.73rem' }}>e</span>
            <span style={{ fontSize: '2.8rem' }}>i</span>
            <span style={{ fontSize: '2.87rem' }}>n</span>
            <span style={{ fontSize: '2.93rem' }}>g</span>
            <span style={{ fontSize: '3.0rem' }}>&nbsp;</span>
            <span style={{ fontSize: '3.07rem' }}>o</span>
            <span style={{ fontSize: '3.13rem' }}>n</span>
            <span style={{ fontSize: '3.2rem' }}>&nbsp;</span>
            <span style={{ fontSize: '3.27rem' }}>a</span>
            <span style={{ fontSize: '3.33rem' }}>&nbsp;</span>
            <span style={{ fontSize: '3.4rem' }}>t</span>
            <span style={{ fontSize: '3.47rem' }}>e</span>
            <span style={{ fontSize: '3.53rem' }}>a</span>
            <span style={{ fontSize: '3.6rem' }}>m</span>
            <span style={{ fontSize: '3.52rem' }}>.</span>
            <span style={{ fontSize: '3.43rem' }}>&nbsp;</span>
            <span style={{ fontSize: '3.35rem' }}>M</span>
            <span style={{ fontSize: '3.26rem' }}>o</span>
            <span style={{ fontSize: '3.17rem' }}>r</span>
            <span style={{ fontSize: '3.08rem' }}>e</span>
            <span style={{ fontSize: '3.0rem' }}>&nbsp;</span>
            <span style={{ fontSize: '2.91rem' }}>t</span>
            <span style={{ fontSize: '2.83rem' }}>h</span>
            <span style={{ fontSize: '2.74rem' }}>a</span>
            <span style={{ fontSize: '2.65rem' }}>n</span>
            <span style={{ fontSize: '2.57rem' }}>&nbsp;</span>
            <span style={{ fontSize: '2.48rem' }}>a</span>
            <span style={{ fontSize: '2.4rem' }}>n</span>
            <span style={{ fontSize: '2.31rem' }}>y</span>
            <span style={{ fontSize: '2.23rem' }}>t</span>
            <span style={{ fontSize: '2.14rem' }}>h</span>
            <span style={{ fontSize: '2.06rem' }}>i</span>
            <span style={{ fontSize: '1.97rem' }}>n</span>
            <span style={{ fontSize: '1.88rem' }}>g</span>
            <span style={{ fontSize: '1.8rem' }}>.</span>
          </h2>

          <div className="mb-4">
            <p className="text-base text-black font-[family-name:var(--font-inter)] leading-relaxed">
              <span className="font-bold">We don't really have a target client or partner.</span> We just love working with people with aligned values and big dreams. If that's you, we'd love to meet you.
            </p>
          </div>

          <div className="mb-4">
            <p className="text-base text-black font-[family-name:var(--font-inter)] leading-relaxed">
              <span className="font-bold">We like messing with formats</span> Like if you're launching something, maybe it's not just a video or blog announcement. Maybe you can tell the story better through a song? Or a scavenger hunt? Or a two-week live show? Worth thinking about, we think.
            </p>
          </div>

          <div className="mb-8">
            <p className="text-base text-black font-[family-name:var(--font-inter)] leading-relaxed mb-4">
              <span className="font-bold">We work on all sorts of creative projects</span> but it's often a combination of the following:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base text-black font-[family-name:var(--font-inter)] ml-4">
              <li>Creative / Art Direction</li>
              <li>UI / UX Design</li>
              <li>Software Engineering</li>
              <li>Product Strategy</li>
              <li>Copywriting</li>
              <li>Content</li>
              <li>Graphic Design</li>
              <li>IRL Experiences</li>
            </ul>
            <p className="text-base text-black font-[family-name:var(--font-inter)] mt-4 ml-4">
              + always willing to learn new skills.
            </p>
          </div>

          <div className="flex justify-start mb-6 mt-6">
            <a href="/connect">
              <button
                className="px-6 py-2 border-2 border-black rounded-full text-sm font-semibold text-black hover:bg-black hover:text-white transition-all font-[family-name:var(--font-inter)]"
                style={{ boxShadow: '0px 4px 4px 0px #F8330D', transform: 'rotate(4deg)' }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'inset 0px 0px 10px 2px rgba(0, 0, 0, 0.8)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0px 4px 4px 0px #F8330D'}
              >
                Tell us your dreams and stuff →
              </button>
            </a>
          </div>

          {/* Quote */}
          <div className="mt-0">
            <p className="text-sm italic text-black font-[family-name:var(--font-inter)] leading-relaxed">
              "I want to know your ideas,"
            </p>
            <p className="text-sm italic text-black font-[family-name:var(--font-inter)] leading-relaxed">
              "I really want to know them. I love hearing your ideas. That's my favorite thing in the world."
            </p>
            <p className="text-xs italic text-black font-[family-name:var(--font-inter)] mt-2">
              -Gabrielle Zevin
            </p>
          </div>
        </motion.div>
      </div>

      {/* Bottom Scrolling Text */}
      <div className="fixed bottom-0 left-0 w-full bg-white py-3 overflow-hidden z-40" style={{ boxShadow: '0px 4px 34px 0px rgba(0, 0, 0, 0.25)' }}>
        <div className="flex animate-marquee-seamless" style={{ letterSpacing: '-0.06em' }}>
          <div className="flex whitespace-nowrap">
            {Array(20).fill(0).map((_, i) => (
              <span key={i} className="text-base md:text-xl font-normal italic text-black font-[family-name:var(--font-inter)]">
                This is my dream. Thank you for being here.&nbsp;
              </span>
            ))}
          </div>
          <div className="flex whitespace-nowrap" aria-hidden="true">
            {Array(20).fill(0).map((_, i) => (
              <span key={i} className="text-base md:text-xl font-normal italic text-black font-[family-name:var(--font-inter)]">
                This is my dream. Thank you for being here.&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
