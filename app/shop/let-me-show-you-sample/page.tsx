"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Sample data for the exhibit
const CURATORS = [
  {
    id: 1,
    name: "Rithika K.",
    avatar: "/assets/CCP/curator1.png",
    years: "Curator",
    location: "Brooklyn, NY",
    selected: true
  },
  { id: 2, name: "Glory M.", selected: false },
  { id: 3, name: "Rohan K.", selected: false },
  { id: 4, name: "Guest Curator", selected: false },
];

const ARTWORKS = [
  {
    id: 1,
    title: "The Starry Night",
    artist: "Vincent van Gogh",
    date: "June 1889",
    medium: "Oil on canvas",
    dimensions: "29 × 36 1/4 in.",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg",
    curator: "Rithika K.",
    note: "When I first saw this painting in person at MoMA, I cried. There's something about the movement in the sky that makes you feel like everything is alive and connected."
  },
  {
    id: 2,
    title: "A Walk at Twilight",
    artist: "Vincent van Gogh",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Van_Gogh_-_Landscape_with_Couple_Walking_and_Crescent_Moon.jpg/800px-Van_Gogh_-_Landscape_with_Couple_Walking_and_Crescent_Moon.jpg",
  },
  {
    id: 3,
    title: "Garden at Arles",
    artist: "Vincent van Gogh",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Van_Gogh_-_Flowering_Garden_with_Path.jpg/800px-Van_Gogh_-_Flowering_Garden_with_Path.jpg",
  },
  {
    id: 4,
    title: "The Bedroom",
    artist: "Vincent van Gogh",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Vincent_van_Gogh_-_De_slaapkamer_-_Google_Art_Project.jpg/1280px-Vincent_van_Gogh_-_De_slaapkamer_-_Google_Art_Project.jpg",
  },
  {
    id: 5,
    title: "Almond Blossoms",
    artist: "Vincent van Gogh",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Vincent_van_Gogh_-_Almond_blossom_-_Google_Art_Project.jpg/1280px-Vincent_van_Gogh_-_Almond_blossom_-_Google_Art_Project.jpg",
  },
];

export default function LMSYSamplePage() {
  const [selectedArtwork, setSelectedArtwork] = useState(ARTWORKS[0]);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Capture scroll events on the page and redirect to main content
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop += e.deltaY;
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <div
      className="h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden fixed inset-0"
      style={{
        backgroundImage: `url("/assets/CCP/Sample_Month/plains.avif")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Main Glass Container */}
      <div
        className="w-full max-w-6xl h-[85vh] rounded-3xl overflow-hidden relative"
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div className="flex flex-col lg:flex-row h-full">
          {/* Left Sidebar */}
          <div
            className="w-full lg:w-72 p-6 flex-shrink-0 overflow-y-auto glass-scrollbar"
            style={{
              background: "rgba(50, 50, 50, 0.4)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Logo */}
            <div className="mb-8">
              <h1 className="text-white text-3xl tracking-tight font-[family-name:var(--font-abril-fatface)]">LET ME</h1>
              <h1 className="text-white text-3xl tracking-tight font-[family-name:var(--font-abril-fatface)]">SHOW YOU</h1>
              <p className="text-white/60 text-sm mt-1">A Digital Art Exhibit</p>
            </div>

            {/* Table of Contents */}
            <div className="border-t border-white/20 pt-4">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Artworks</p>
              <div className="space-y-2">
                {ARTWORKS.map((artwork) => (
                  <button
                    key={artwork.id}
                    onClick={() => setSelectedArtwork(artwork)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                      selectedArtwork.id === artwork.id
                        ? "bg-white/20"
                        : "hover:bg-white/10"
                    }`}
                  >
                    <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={artwork.image}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <span className={`text-sm truncate ${
                      selectedArtwork.id === artwork.id ? "text-white font-medium" : "text-white/70"
                    }`}>
                      {artwork.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div ref={mainContentRef} className="flex-1 p-6 lg:p-8 overflow-y-auto glass-scrollbar">
            {/* Featured Artwork */}
            <div className="relative mb-6">
              <div
                className="relative aspect-[4/3] lg:aspect-[16/10] rounded-xl overflow-hidden"
                style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}
              >
                <Image
                  src={selectedArtwork.image}
                  alt={selectedArtwork.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* Expand button */}
                <button className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/30 backdrop-blur flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                </button>
              </div>

              {/* Artwork Info */}
              <div className="mt-4 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl lg:text-3xl font-light text-gray-800">{selectedArtwork.title}</h2>
                  {selectedArtwork.medium && (
                    <p className="text-gray-600 text-sm mt-1">
                      Medium: <span className="font-medium">{selectedArtwork.medium}</span>
                    </p>
                  )}
                  {selectedArtwork.dimensions && (
                    <p className="text-gray-600 text-sm">
                      Dimensions: <span className="font-medium">{selectedArtwork.dimensions}</span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-gray-700 font-medium">{selectedArtwork.date}</p>
                </div>
              </div>

              {/* Curator Note */}
              {selectedArtwork.note && (
                <div
                  className="mt-4 p-4 rounded-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.25)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)",
                  }}
                >
                  <p className="text-gray-700 text-sm italic">&ldquo;{selectedArtwork.note}&rdquo;</p>
                  <p className="text-gray-500 text-xs mt-2">— {selectedArtwork.curator}</p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Sample Banner */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full text-sm font-medium z-50">
        This is a sample preview
      </div>

      {/* Info Button */}
      <button
        onClick={() => setShowInfoPopup(true)}
        className="fixed top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/40 transition-colors z-50"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <circle cx="12" cy="8" r="0.5" fill="currentColor"/>
        </svg>
      </button>

      {/* Info Popup */}
      {showInfoPopup && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowInfoPopup(false)}
        >
          <div
            className="max-w-md w-full rounded-2xl p-6 relative"
            style={{
              background: "rgba(255, 255, 255, 0.9)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInfoPopup(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-[family-name:var(--font-abril-fatface)]">
              About This Exhibit
            </h2>

            <p className="text-gray-700 mb-4">
              <strong>Let Me Show You</strong> is a monthly digital art exhibit. Each month, we pick a theme and invite different curators to share art that resonates with them.
            </p>

            <p className="text-gray-700 mb-4">
              New pieces are added throughout the month. Subscribers receive email notifications when new art appears.
            </p>

            <p className="text-gray-600 text-sm italic">
              This is a sample preview of what subscribers see.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
