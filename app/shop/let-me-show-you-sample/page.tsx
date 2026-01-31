"use client";

import { useState } from "react";
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
  const [carouselStart, setCarouselStart] = useState(0);

  const visibleArtworks = ARTWORKS.slice(carouselStart, carouselStart + 4);

  return (
    <div
      className="h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden"
      style={{
        backgroundImage: `url("/assets/CCP/Sample_Month/plains.avif")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Main Glass Container */}
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden relative"
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div className="flex flex-col lg:flex-row">
          {/* Left Sidebar */}
          <div
            className="w-full lg:w-72 p-6 flex-shrink-0"
            style={{
              background: "rgba(50, 50, 50, 0.4)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Logo */}
            <div className="mb-8">
              <h1 className="text-white text-2xl font-bold tracking-tight">LET ME</h1>
              <h1 className="text-white text-2xl font-bold tracking-tight">SHOW YOU</h1>
              <p className="text-white/60 text-sm mt-1">A Digital Art Exhibit</p>
            </div>

            {/* Selected Curator */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg bg-gray-600 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-orange-400 to-pink-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Rithika K.</h3>
                  <p className="text-white/60 text-sm">Curator</p>
                </div>
              </div>
              <p className="text-white/50 text-xs">Brooklyn, NY</p>
            </div>

            {/* Other Curators */}
            <div className="space-y-2">
              {CURATORS.slice(1).map((curator) => (
                <div
                  key={curator.id}
                  className="px-4 py-3 rounded-lg text-white/80 text-sm hover:bg-white/10 cursor-pointer transition-colors"
                  style={{ borderLeft: "2px solid transparent" }}
                >
                  {curator.name}
                </div>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 lg:p-8">
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
                    background: "rgba(255, 255, 255, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.6)",
                  }}
                >
                  <p className="text-gray-700 text-sm italic">&ldquo;{selectedArtwork.note}&rdquo;</p>
                  <p className="text-gray-500 text-xs mt-2">— {selectedArtwork.curator}</p>
                </div>
              )}
            </div>

            {/* Carousel */}
            <div
              className="rounded-full px-4 py-3 flex items-center gap-3"
              style={{
                background: "rgba(128, 128, 128, 0.3)",
                backdropFilter: "blur(10px)",
              }}
            >
              {/* Left Arrow */}
              <button
                onClick={() => setCarouselStart(Math.max(0, carouselStart - 1))}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-gray-700 hover:bg-white/40 transition-colors flex-shrink-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>

              {/* Thumbnails */}
              <div className="flex-1 flex gap-3 overflow-hidden">
                {visibleArtworks.map((artwork) => (
                  <button
                    key={artwork.id}
                    onClick={() => setSelectedArtwork(artwork)}
                    className={`relative w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 transition-all ${
                      selectedArtwork.id === artwork.id ? "ring-2 ring-white" : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={artwork.image}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                      <p className="text-white text-xs font-medium truncate">{artwork.title}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Right Arrow */}
              <button
                onClick={() => setCarouselStart(Math.min(ARTWORKS.length - 4, carouselStart + 1))}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-gray-700 hover:bg-white/40 transition-colors flex-shrink-0"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-4">
              <div className="w-2 h-2 rounded-full bg-gray-400" />
              <div className="w-8 h-2 rounded-full bg-gray-300" />
            </div>
          </div>
        </div>

        {/* Side Icons */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-4">
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-gray-700 hover:bg-white/40 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
          </button>
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-gray-700 hover:bg-white/40 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
          <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-gray-700 hover:bg-white/40 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Sample Banner */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-2 rounded-full text-sm font-medium z-50">
        This is a sample preview
      </div>
    </div>
  );
}
