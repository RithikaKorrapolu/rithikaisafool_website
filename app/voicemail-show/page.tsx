"use client";

import Image from "next/image";

export default function VoicemailShow() {
  const phoneNumber = "609-732-2482";

  return (
    <>
      <style jsx>{`
        @keyframes soundWave {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-8px) scaleY(1.5); }
        }
        @keyframes barWave1 {
          0%, 100% { height: 46px; }
          50% { height: 154px; }
        }
        @keyframes barWave2 {
          0%, 100% { height: 78px; }
          40% { height: 200px; }
        }
        @keyframes barWave3 {
          0%, 100% { height: 30px; }
          60% { height: 138px; }
        }
        @keyframes barWave4 {
          0%, 100% { height: 62px; }
          35% { height: 170px; }
        }
        @keyframes floatBlob1 {
          0% { transform: translate(-100vw, 0) scale(0.7); }
          25% { transform: translate(-25vw, -10vh) scale(1.4); }
          50% { transform: translate(25vw, -15vh) scale(0.8); }
          75% { transform: translate(60vw, -18vh) scale(1.3); }
          100% { transform: translate(100vw, -20vh) scale(0.7); }
        }
        @keyframes floatBlob2 {
          0% { transform: translate(100vw, 50vh) scale(1.3); }
          25% { transform: translate(50vw, 30vh) scale(0.6); }
          50% { transform: translate(0vw, 10vh) scale(1.5); }
          75% { transform: translate(-50vw, -10vh) scale(0.8); }
          100% { transform: translate(-100vw, -30vh) scale(1.3); }
        }
        @keyframes floatBlob3 {
          0% { transform: translate(-50vw, -50vh) scale(0.8); }
          33% { transform: translate(0vw, 0vh) scale(1.5); }
          66% { transform: translate(50vw, 25vh) scale(0.7); }
          100% { transform: translate(100vw, 50vh) scale(1.4); }
        }
        @keyframes floatBlob4 {
          0% { transform: translate(50vw, 100vh) scale(1.4); }
          25% { transform: translate(25vw, 50vh) scale(0.6); }
          50% { transform: translate(-25vw, 0vh) scale(1.3); }
          75% { transform: translate(-60vw, -25vh) scale(0.8); }
          100% { transform: translate(-100vw, -50vh) scale(1.4); }
        }
        @keyframes floatBlob5 {
          0% { transform: translate(-100vw, 30vh) scale(0.6); }
          33% { transform: translate(0vw, 0vh) scale(1.4); }
          66% { transform: translate(50vw, -20vh) scale(0.8); }
          100% { transform: translate(100vw, -40vh) scale(1.5); }
        }
        @keyframes floatBlob6 {
          0% { transform: translate(80vw, -30vh) scale(1.3); }
          25% { transform: translate(40vw, 0vh) scale(0.7); }
          50% { transform: translate(0vw, 20vh) scale(1.4); }
          75% { transform: translate(-50vw, 40vh) scale(0.6); }
          100% { transform: translate(-100vw, 60vh) scale(1.3); }
        }
        .blob1 { animation: floatBlob1 6s linear infinite; }
        .blob2 { animation: floatBlob2 7s linear infinite; }
        .blob3 { animation: floatBlob3 5s linear infinite; }
        .blob4 { animation: floatBlob4 6.5s linear infinite; }
        .blob5 { animation: floatBlob5 4.5s linear infinite; }
        .blob6 { animation: floatBlob6 5.5s linear infinite; }
      `}</style>

      <main
        className="min-h-[calc(100svh-80px)] pt-[140px] md:pt-[145px] lg:pt-[155px] relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 30%, #b8eafa 0%, transparent 50%),
            radial-gradient(ellipse 60% 70% at 80% 20%, #9fe2f9 0%, transparent 40%),
            radial-gradient(ellipse 70% 60% at 70% 80%, #89dcf8 0%, transparent 45%),
            radial-gradient(ellipse 90% 40% at 30% 70%, #b8eafa 0%, transparent 50%),
            radial-gradient(ellipse 50% 80% at 50% 50%, #9fe2f9 0%, transparent 60%),
            linear-gradient(180deg, #ebf8fd 0%, #b8eafa 50%, #89dcf8 100%)
          `
        }}
      >
        {/* White floating blobs */}
        <div className="absolute w-[400px] h-[400px] rounded-full bg-white/40 blur-3xl blob1" style={{ top: '5%', left: '5%' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-white/35 blur-3xl blob2" style={{ top: '40%', right: '0%' }} />
        <div className="absolute w-[350px] h-[350px] rounded-full bg-white/45 blur-3xl blob3" style={{ bottom: '10%', left: '20%' }} />
        <div className="absolute w-[450px] h-[450px] rounded-full bg-white/30 blur-3xl blob4" style={{ top: '20%', left: '40%' }} />
        <div className="absolute w-[380px] h-[380px] rounded-full bg-white/35 blur-3xl blob5" style={{ top: '60%', right: '20%' }} />
        <div className="absolute w-[320px] h-[320px] rounded-full bg-white/40 blur-3xl blob6" style={{ top: '10%', right: '30%' }} />

        {/* Hero wrapper - max-width container */}
        <div className="relative w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 overflow-visible">
          {/* Grid layout - phone on left, content on right */}
          <div className="grid grid-cols-[320px_1fr] sm:grid-cols-[400px_1fr] md:grid-cols-[480px_1fr] lg:grid-cols-[600px_1fr] gap-4 sm:gap-6 md:gap-8 items-start pt-2 sm:pt-4 md:pt-6 pb-4 sm:pb-8 md:pb-12">

            {/* Phone rail - left column */}
            <div className="relative overflow-visible ml-24 sm:ml-32 md:ml-40 lg:ml-48">
              {/* Phone container */}
              <div className="relative w-full aspect-[1/2.5] -mt-[55px] sm:-mt-[85px] md:-mt-[115px]">
                <Image
                  src="/assets/QuoteLine/phone.png"
                  alt="Phone"
                  fill
                  className="object-contain object-top"
                  priority
                />
              </div>
            </div>

            {/* Content column - right side */}
            <div className="flex flex-col items-start pt-24 sm:pt-28 md:pt-32 -ml-24 sm:-ml-32 md:-ml-40">
              {/* Subtitle */}
              <p className="text-sm sm:text-lg md:text-xl font-bold text-black/70 font-[family-name:var(--font-neuton)] mb-1 text-left -ml-4 sm:-ml-6 md:-ml-8">
                A tiny interview. New every day.
              </p>
              {/* Title */}
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-black/70 font-[family-name:var(--font-loubag)] mb-24 sm:mb-28 md:mb-32 text-left -ml-4 sm:-ml-6 md:-ml-8">
                The One Question Voicemail Show
              </p>

              {/* Phone number and visualizer wrapper */}
              <div className="relative">
                {/* Sound wave bars behind text */}
                <div className="absolute flex items-center gap-[2px] left-1/2 top-1/2" style={{ transform: 'translate(-50%, -50%)', zIndex: 0 }}>
                  {Array.from({ length: 87 }).map((_, index) => {
                    const animations = ['barWave1', 'barWave2', 'barWave3', 'barWave4'];
                    const durations = [0.5, 0.7, 0.6, 0.8, 0.55, 0.65];
                    const randomAnim = animations[index % animations.length];
                    const randomDuration = durations[index % durations.length];
                    return (
                      <div
                        key={index}
                        className="w-[3px] md:w-[4px] bg-black rounded-full border border-black"
                        style={{
                          height: '20px',
                          animation: `${randomAnim} ${randomDuration}s ease-in-out infinite`,
                          animationDelay: `${(index * 0.03) + (index % 3) * 0.1}s`
                        }}
                      />
                    );
                  })}
                </div>
                {/* Phone number text */}
                <a href="tel:6097322482" className="relative text-[1.8rem] sm:text-[2.2rem] md:text-[3rem] lg:text-[3.645rem] font-bold text-white font-[family-name:var(--font-loubag)] flex no-underline hover:opacity-80 transition-opacity cursor-pointer" style={{ zIndex: 1, textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5)' }}>
                  {phoneNumber.split('').map((char, index) => (
                    <span
                      key={index}
                      style={{
                        display: 'inline-block',
                        animation: `soundWave 0.6s ease-in-out infinite`,
                        animationDelay: `${index * 0.05}s`
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </a>
              </div>
            </div>
          </div>
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
              <p className="text-white text-base font-normal font-[family-name:var(--font-inter)]">
                © Rithika is a Fool 2026
              </p>
              <div className="flex gap-12">
                <div className="flex flex-col">
                  <a href="/" className="text-white text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">
                    Home
                  </a>
                  <a href="/shop" className="text-white text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">
                    Store
                  </a>
                </div>
                <div className="flex flex-col">
                  <a href="/connect" className="text-white text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">
                    Contact
                  </a>
                  <a href="/legal" className="text-white text-base font-semibold hover:text-[#F8330D] transition-colors font-[family-name:var(--font-inter)]">
                    Legal + FAQ
                  </a>
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
    </>
  );
}
