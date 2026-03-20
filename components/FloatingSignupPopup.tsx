"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function FloatingSignupPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const pathname = usePathname();

  // Don't show on specific shop product pages (where add to cart buttons appear)
  const isProductPage = pathname?.startsWith('/shop/') && pathname !== '/shop';

  useEffect(() => {
    setMounted(true);

    // Check if mobile
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Don't show on product pages or mobile
    if (isProductPage) return;

    // Check if dismissed this session
    const dismissed = sessionStorage.getItem("signupPopupDismissed");
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 5000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', checkMobile);
      };
    }

    return () => window.removeEventListener('resize', checkMobile);
  }, [isProductPage]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("signupPopupDismissed", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email && !phone) {
      setError("Please enter an email or phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, email, phone }),
      });

      if (response.ok) {
        setSubmitted(true);
        setTimeout(() => {
          handleDismiss();
        }, 3000);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Popup disabled - using footer signup instead
  return null;

  return (
    <div
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] backdrop-blur-xl bg-white/70 rounded-2xl"
      style={{ fontFamily: 'Anek Bangla, sans-serif', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}
    >
      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-black/50 hover:text-black transition-colors"
        aria-label="Close popup"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="p-5">
        {submitted ? (
          <div className="text-center py-4">
            <p className="text-[#561DF1] font-bold text-lg">Thank you!</p>
            <p className="text-black/70 text-sm">You're now part of the world.</p>
          </div>
        ) : (
          <>
            {/* Signup Header */}
            <h3 className="text-3xl font-bold text-black mb-2">
              Stay with me
            </h3>
            <p className="text-base text-black/70 mb-4">
              And I'll send you cool projects and good surprises. No spam and no selling your data to weirdos.
            </p>

            {/* Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-2">
              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#561DF1] outline-none text-black placeholder:text-black/40 text-base rounded-full"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black/20 focus:border-[#561DF1] outline-none text-black placeholder:text-black/40 text-base rounded-full"
              />
              <div className="flex items-center w-full px-4 py-3 border-2 border-black/20 focus-within:border-[#561DF1] rounded-full">
                <span className="mr-1 text-base">🇺🇸</span>
                <span className="text-black text-base mr-1">+1</span>
                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 text-black placeholder:text-black/40 text-base focus:outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#561DF1] text-white font-extrabold hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base rounded-full"
              >
                {isSubmitting ? "Joining..." : "Join"}
              </button>
            </form>

            {/* Social Links */}
            <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-black/10">
              <a href="https://instagram.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="text-black/60 hover:text-[#561DF1] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a href="https://www.tiktok.com/@rithikakorr" target="_blank" rel="noopener noreferrer" className="text-black/60 hover:text-[#561DF1] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
              <a href="https://x.com/rithika24k" target="_blank" rel="noopener noreferrer" className="text-black/60 hover:text-[#561DF1] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://substack.com/@rithikakorrapolu" target="_blank" rel="noopener noreferrer" className="text-black/60 hover:text-[#561DF1] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                </svg>
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
