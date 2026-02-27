"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Import DailyOffering with no SSR to avoid hydration issues
const DailyOffering = dynamic(() => import("@/components/DailyOffering"), {
  ssr: false,
});

interface CalendarEvent {
  month: string;
  day: number;
  fullDate: string;
  time: string;
  title: string;
  link: string;
}

export default function Connect() {
  const [calendarEvent, setCalendarEvent] = useState<CalendarEvent | null>(null);
  const [eventLoading, setEventLoading] = useState(true);
  const [showCalendarDropdown, setShowCalendarDropdown] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribeStatus, setSubscribeStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const [blackLetterIndex, setBlackLetterIndex] = useState(-1);
  const [mounted, setMounted] = useState(false);

  // Set mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // "FEEL IT" traveling black letter animation
  useEffect(() => {
    const feelItStart = 7; // Index where "FEEL IT" starts in "DO YOU FEEL IT TOO?"
    const feelItEnd = 13; // Index where "FEEL IT" ends (excluding space)
    const interval = setInterval(() => {
      setBlackLetterIndex(prev => {
        if (prev < feelItStart || prev >= feelItEnd) return feelItStart;
        return prev + 1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom email validation
    if (!email) {
      setSubscribeStatus("error");
      setSubscribeMessage("Please enter your email");
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setSubscribeStatus("error");
      setSubscribeMessage("Please enter a valid email address");
      return;
    }

    setSubscribeStatus("loading");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubscribeStatus("success");
        setSubscribeMessage(data.message || "You're in!");
        setEmail("");
      } else {
        setSubscribeStatus("error");
        setSubscribeMessage(data.error || "Something went wrong");
      }
    } catch {
      setSubscribeStatus("error");
      setSubscribeMessage("Failed to subscribe. Please try again.");
    }
  };

  useEffect(() => {
    // Fetch the next calendar event
    fetch('/api/calendar/next-event')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setCalendarEvent(data);
        }
        setEventLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch calendar event:', err);
        setEventLoading(false);
      });
  }, []);

  return (
    <>
    <style dangerouslySetInnerHTML={{__html: `
      .ml-form-embedContainer .ml-form-embedWrapper.embedForm {
        max-width: 100%;
      }
      .ml-form-embedContainer .ml-form-embedBody .ml-form-formContent input {
        width: 100% !important;
        padding: 16px 20px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 1.125rem;
        font-family: 'Anek Bangla', sans-serif;
        background: #f9fafb;
        box-sizing: border-box;
        color: #000 !important;
      }
      .ml-form-embedContainer .ml-form-embedBody .ml-form-formContent input:focus {
        outline: none !important;
        border: 1px solid #d1d5db !important;
      }
      .ml-form-embedContainer .ml-form-embedBody .ml-form-formContent input::placeholder {
        color: #9ca3af;
      }
      .ml-form-embedContainer .ml-form-embedBody .ml-form-embedSubmit button.primary {
        background-color: #561DF1 !important;
        color: #fff !important;
        padding: 16px 24px;
        border-radius: 24px;
        font-weight: bold;
        font-size: 1.125rem;
        font-family: 'Anek Bangla', sans-serif;
        border: none;
        cursor: pointer;
        margin-top: 16px;
        width: 100%;
      }
      .ml-form-embedContainer .ml-form-embedBody .ml-form-embedSubmit button.primary:hover {
        background-color: #000 !important;
        color: #fff !important;
      }
      .ml-form-successBody h4 {
        font-size: 1.125rem;
        color: #000;
        font-family: 'Anek Bangla', sans-serif;
        margin: 0;
        padding: 16px;
        background: #dcfce7;
        border: 2px solid #16a34a;
        border-radius: 6px;
      }
      .calendar-button {
        background-color: #561DF1 !important;
      }
      .calendar-button:hover {
        background-color: #000 !important;
      }
      .email-link {
        color: #0077FF;
      }
      .email-link:hover {
        color: #000 !important;
      }
      @keyframes dance {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-4px) rotate(-5deg); }
        50% { transform: translateY(0) rotate(0deg); }
        75% { transform: translateY(-4px) rotate(5deg); }
      }
      .dancing-icon {
        animation: dance 1s ease-in-out infinite;
      }
      .dancing-icon:nth-child(1) { animation-delay: 0s; }
      .dancing-icon:nth-child(2) { animation-delay: 0.15s; }
      .dancing-icon:nth-child(3) { animation-delay: 0.3s; }
      .dancing-icon:nth-child(4) { animation-delay: 0.45s; }
      @keyframes pulse-size {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(0.7); }
      }
      .pulse-secret {
        display: inline-block;
        animation: pulse-size 1.5s ease-in-out infinite;
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .spin-penny {
        animation: spin 4s linear infinite;
      }
      @keyframes button-dance {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-2px) rotate(-1deg); }
        50% { transform: translateY(0) rotate(0deg); }
        75% { transform: translateY(-2px) rotate(1deg); }
      }
      .dancing-button:hover {
        animation: button-dance 0.5s ease-in-out infinite;
      }
    `}} />

    <main className="min-h-screen pt-[140px] md:pt-[145px] lg:pt-[155px] pb-16" style={{ backgroundColor: '#ffffff' }}>
      {/* Purple Hero Banner */}
      <div className="container mx-auto px-6 max-w-7xl mb-2 md:mb-6">
        <div className="w-full py-4 text-center" style={{ backgroundColor: '#561DF1' }}>
          <h1 className="text-white font-[family-name:var(--font-serif)]" style={{
            fontSize: 'clamp(2rem, 6.4vw, 4.4rem)',
            fontFamily: 'Georgia, serif',
            letterSpacing: '-0.02em',
            fontStretch: 'condensed',
            wordSpacing: '0.2em'
          }}>
            {'DO YOU FEEL IT '.split('').map((char, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-block',
                  transform: `translateY(${Math.sin(index * 0.5) * 8}px)`,
                  color: mounted && index === blackLetterIndex ? '#000000' : '#ffffff',
                  transition: 'color 0.1s ease-in-out',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </span>
            ))}
            <span className="whitespace-nowrap">
              {'TOO?'.split('').map((char, index) => (
                <span
                  key={index + 15}
                  style={{
                    display: 'inline-block',
                    transform: `translateY(${Math.sin((index + 15) * 0.5) * 8}px)`,
                    color: mounted && (index + 15) === blackLetterIndex ? '#000000' : '#ffffff',
                    transition: 'color 0.1s ease-in-out',
                  }}
                >
                  {char}
                </span>
              ))}
            </span>
          </h1>
        </div>
      </div>

      {/* Gray Divider Line */}
      <div className="container mx-auto px-6 max-w-7xl mb-4 md:mb-12">
        <div className="w-full h-1" style={{ backgroundColor: '#58585A' }}></div>
      </div>

      {/* Two Column Layout */}
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12">

          {/* Left Column - Reach Out */}
          <div className="flex flex-col order-2 lg:order-1">
            {/* Follow Us Around */}
            <div className="mb-6 flex items-center gap-2 md:gap-4">
              <h3 className="text-black font-semibold" style={{ fontFamily: 'Anek Bangla, sans-serif', fontSize: 'clamp(1rem, 3vw, 1.44rem)', lineHeight: '1.8' }}>
                FOLLOW US AROUND
              </h3>
              <div className="flex gap-2 md:gap-4">
                <a href="https://www.instagram.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity dancing-icon">
                  <svg className="w-7 h-7 md:w-8 md:h-8" fill="url(#instagram-gradient)" viewBox="0 0 24 24">
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

                <a href="https://www.tiktok.com/@rithikakorr?_r=1&_t=ZP-93jcyyF97Fv" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity dancing-icon">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                  </svg>
                </a>

                <a href="https://x.com/rithika24k" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity dancing-icon">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                <a href="https://substack.com/@rithikakorrapolu" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity dancing-icon">
                  <svg className="w-7 h-7 md:w-8 md:h-8 text-black" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* REACH OUT Header */}
            <div className="text-left py-3 mb-2">
              <h2 className="font-bold text-[#561DF1]" style={{ fontFamily: 'Anek Bangla, sans-serif', fontSize: '1.8rem', letterSpacing: '-0.05em', WebkitTextStroke: '0.1px black' }}>
                LET US SEND BEAUTIFUL EMAILS
              </h2>
            </div>

            {/* Contact Info */}
            <div className="mb-1">
              <span className="text-black text-[1.17rem] md:text-[1.3rem]" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                order support:{' '}
              </span>
              <a
                href="mailto:support@rithikaisafool.com"
                className="email-link transition-colors text-[1.17rem] md:text-[1.3rem]"
                style={{ fontFamily: 'Anek Bangla, sans-serif' }}
              >
                support@rithikaisafool.com
              </a>
            </div>

            <div className="mb-1">
              <span className="text-black text-[1.17rem] md:text-[1.3rem]" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                pitches and submissions:{' '}
              </span>
              <a
                href="mailto:submissions@rithikaisafool.com"
                className="email-link transition-colors text-[1.17rem] md:text-[1.3rem]"
                style={{ fontFamily: 'Anek Bangla, sans-serif' }}
              >
                submissions@rithikaisafool.com
              </a>
            </div>

            <div className="mb-8">
              <span className="text-black text-[1.17rem] md:text-[1.3rem]" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                everything else:{' '}
              </span>
              <a
                href="mailto:rithika@rithikaisafool.com"
                className="email-link transition-colors text-[1.17rem] md:text-[1.3rem]"
                style={{ fontFamily: 'Anek Bangla, sans-serif' }}
              >
                rithika@rithikaisafool.com
              </a>
            </div>

            {/* Subscribe Box */}
            <div>
              <h3 className="text-xl font-bold text-left mb-4 text-black" style={{ fontFamily: 'Anek Bangla, sans-serif', letterSpacing: '-0.05em' }}>
                For cool, <span className="pulse-secret">secret</span> things
              </h3>

              <form onSubmit={handleSubscribe} className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder="your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg text-black focus:outline-none focus:border-[#561DF1]"
                  style={{ fontFamily: 'Anek Bangla, sans-serif', background: '#f9fafb' }}
                />
                <button
                  type="submit"
                  disabled={subscribeStatus === "loading" || subscribeStatus === "success"}
                  className={`px-8 py-3 text-white font-bold rounded-full transition-colors w-full ${subscribeStatus === "success" ? 'bg-green-500' : 'calendar-button dancing-button'}`}
                  style={{ fontSize: '1rem', fontFamily: 'Anek Bangla, sans-serif' }}
                >
                  {subscribeStatus === "loading" ? "Subscribing..." : subscribeStatus === "success" ? "You're in baby!" : "Subscribe"}
                </button>
              </form>

              {subscribeStatus === "error" && (
                <p className="mt-4 text-center text-red-600 font-semibold" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                  {subscribeMessage}
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Penny For Your Thoughts */}
          <div className="order-1 lg:order-2">
            {/* Purple Dashed Border Box */}
            <div className="border-4 border-dashed px-4 md:px-8 pt-3 pb-4 mb-8" style={{ borderColor: '#561DF1' }}>
              <h2 className="text-center font-bold mb-1 text-black" style={{ fontSize: 'clamp(1.1rem, 4vw, 1.625rem)', fontFamily: 'Anek Bangla, sans-serif', letterSpacing: '-0.05em' }}>
                * A PENNY FOR YOUR THOUGHTS? *
              </h2>

              <p className="text-center mb-4 md:mb-6 text-black" style={{ fontSize: 'clamp(0.95rem, 3vw, 1.3rem)', fontFamily: 'Anek Bangla, sans-serif' }}>
                We host a <strong>virtual open mic</strong> to riff on new ideas and bits and art and such. A meeting of the minds. Everyone gets a penny. Come through.
              </p>

              {/* Mobile: Stacked layout */}
              <div className="flex flex-col items-center gap-4 md:hidden mb-4">
                {/* Penny Image - smaller on mobile */}
                <Image
                  src="/assets/penny2.png"
                  alt="Penny"
                  width={120}
                  height={120}
                  className="object-contain spin-penny"
                />

                {/* Event Info */}
                {!eventLoading && calendarEvent && (
                  <div className="text-center text-black" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                    <div className="text-base font-semibold mb-1">UPCOMING EVENT:</div>
                    <div className="text-base">{calendarEvent.fullDate}</div>
                    <div className="text-base">{calendarEvent.time}</div>
                  </div>
                )}

                {/* Calendar */}
                <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-black" style={{ width: '80px' }}>
                  <div className="bg-black text-center py-1.5">
                    <div className="text-xs font-semibold text-white" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                      {eventLoading ? '...' : (calendarEvent?.month || 'Dec')}
                    </div>
                  </div>
                  <div className="bg-white text-center py-2 border-t border-black">
                    <div className="text-2xl font-bold text-black" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                      {eventLoading ? '...' : (calendarEvent?.day || '26')}
                    </div>
                  </div>
                </div>

                {/* Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
                    className="calendar-button px-6 py-2 text-white font-bold rounded-full transition-colors text-sm"
                    style={{ fontFamily: 'Anek Bangla, sans-serif' }}
                  >
                    Add to calendar
                  </button>

                  {showCalendarDropdown && (
                    <div
                      className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg z-10"
                      style={{ minWidth: '240px', border: '2px solid #561DF1' }}
                    >
                      <a
                        href={calendarEvent?.link || "https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MWlnNm0xdG5kaHRhcnNsN29uaGNkbTU0c2JfMjAyNjAyMjBUMTcwMDAwWiByaXRoaWthQHJpdGhpa2Fpc2Fmb29sLmNvbQ&tmsrc=rithika%40rithikaisafool.com&scp=ALL"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-4 py-3 text-black hover:bg-gray-100 transition-colors text-sm"
                        style={{ fontFamily: 'Anek Bangla, sans-serif', borderBottom: '1px solid #d1d5db' }}
                        onClick={() => setShowCalendarDropdown(false)}
                      >
                        Add to Google Cal
                      </a>
                      <a
                        href="/api/calendar/download-ics"
                        className="block px-4 py-3 text-black hover:bg-gray-100 transition-colors rounded-b-lg text-sm"
                        style={{ fontFamily: 'Anek Bangla, sans-serif' }}
                        onClick={() => setShowCalendarDropdown(false)}
                      >
                        Download .ics (Apple, Outlook, etc.)
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop: Side by side layout */}
              <div className="hidden md:flex justify-center items-center gap-8 mb-6">
                {/* Penny Image */}
                <div className="flex-shrink-0">
                  <Image
                    src="/assets/penny2.png"
                    alt="Penny"
                    width={252}
                    height={252}
                    className="object-contain spin-penny"
                  />
                </div>

                {/* Calendar and Button */}
                <div className="flex flex-col items-center gap-4">
                  {!eventLoading && calendarEvent && (
                    <div className="text-center text-black" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                      <div className="text-base font-semibold mb-1">UPCOMING EVENT:</div>
                      <div className="text-base">{calendarEvent.fullDate}</div>
                      <div className="text-base">{calendarEvent.time}</div>
                    </div>
                  )}

                  <div className="bg-white rounded-lg overflow-hidden shadow-lg border border-black" style={{ width: '100px' }}>
                    <div className="bg-black text-center py-2">
                      <div className="text-sm font-semibold text-white" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                        {eventLoading ? '...' : (calendarEvent?.month || 'Dec')}
                      </div>
                    </div>
                    <div className="bg-white text-center py-3 border-t border-black">
                      <div className="text-4xl font-bold text-black" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
                        {eventLoading ? '...' : (calendarEvent?.day || '26')}
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button
                      onClick={() => setShowCalendarDropdown(!showCalendarDropdown)}
                      className="calendar-button px-8 py-3 text-white font-bold rounded-full transition-colors hover-wiggle"
                      style={{ fontSize: '1rem', fontFamily: 'Anek Bangla, sans-serif' }}
                    >
                      Add to calendar
                    </button>

                    {showCalendarDropdown && (
                      <div
                        className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg z-10"
                        style={{ minWidth: '280px', border: '2px solid #561DF1' }}
                      >
                        <a
                          href={calendarEvent?.link || "https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MWlnNm0xdG5kaHRhcnNsN29uaGNkbTU0c2JfMjAyNjAyMjBUMTcwMDAwWiByaXRoaWthQHJpdGhpa2Fpc2Fmb29sLmNvbQ&tmsrc=rithika%40rithikaisafool.com&scp=ALL"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-4 py-3 text-black hover:bg-gray-100 transition-colors"
                          style={{ fontFamily: 'Anek Bangla, sans-serif', fontSize: '1rem', borderBottom: '1px solid #d1d5db' }}
                          onClick={() => setShowCalendarDropdown(false)}
                        >
                          Add to Google Cal
                        </a>
                        <a
                          href="/api/calendar/download-ics"
                          className="block px-4 py-3 text-black hover:bg-gray-100 transition-colors rounded-b-lg"
                          style={{ fontFamily: 'Anek Bangla, sans-serif', fontSize: '1rem' }}
                          onClick={() => setShowCalendarDropdown(false)}
                        >
                          Download .ics (Apple, Outlook, etc.)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* A Daily Offering Section - temporarily hidden
      <div className="container mx-auto px-6 max-w-7xl mt-12 mb-8">
        <div className="w-full h-1 mb-8" style={{ backgroundColor: '#58585A' }}></div>
        <div className="text-center">
          <h2 className="font-bold text-[#561DF1] mb-2" style={{ fontFamily: 'Anek Bangla, sans-serif', fontSize: '1.8rem', letterSpacing: '-0.05em' }}>
            A DAILY OFFERING
          </h2>
          <p className="text-black mb-6" style={{ fontFamily: 'Anek Bangla, sans-serif', fontSize: '1.1rem' }}>
            Things we're fans of.
          </p>
          <DailyOffering />
        </div>
      </div>
      */}
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

        {/* Desktop: Original layout */}
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
    </>
  );
}
