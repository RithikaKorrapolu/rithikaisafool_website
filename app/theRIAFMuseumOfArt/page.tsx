"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// Artwork data - add paintings here
// Each artwork has colors extracted from the image for the background gradient
const ARTWORKS = [
  {
    id: 8,
    title: "Hushed Music",
    artist: "Alfredo Castañeda",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/8.png",
    feelings: ["contemplative", "quiet", "peaceful", "thoughtful"],
    colors: ["#0eb2d2", "#01292f"]
  },
  {
    id: 9,
    title: "La llamada (The Call)",
    artist: "Remedios Varo",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/9.png",
    feelings: ["serene", "mystical", "spiritual", "calm"],
    colors: ["#ccc15f", "#a64b00"]
  },
  {
    id: 10,
    title: "Men In The Cities",
    artist: "Robert Longo",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/10.png",
    feelings: ["intense", "dramatic", "bold", "powerful"],
    colors: ["#1a1a1a", "#000000"]
  },
  {
    id: 11,
    title: "I'm in the bush outside and I really love you",
    artist: "Babak Ganjei",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/11.png",
    feelings: ["playful", "love", "quirky", "romantic"],
    colors: ["#000000", "#ffffff"]
  },
  {
    id: 12,
    title: "The Lantern Bearers",
    artist: "Maxfield Parrish",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/12.png",
    feelings: ["mysterious", "magical", "dreamy", "wonder"],
    colors: ["#302f72", "#2f2518"]
  },
  {
    id: 13,
    title: "Papilla Estelar (Star Maker)",
    artist: "Remedios Varo",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/13.png",
    feelings: ["peaceful", "cosmic", "mystical", "serene"],
    colors: ["#19261e", "#000000"]
  },
  {
    id: 14,
    title: "Untitled",
    artist: "Alfredo Castañeda",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/14.png",
    feelings: ["dreamy", "surreal", "introspective", "ethereal"],
    colors: ["#7d563a", "#754e33"]
  },
  {
    id: 15,
    title: "Personaje (Character)",
    artist: "Remedios Varo",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/15.png",
    feelings: ["nostalgic", "warm", "contemplative", "curious"],
    colors: ["#b97439", "#4c3a25"]
  },
  {
    id: 16,
    title: "Encuentro",
    artist: "Remedios Varo",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/16.png",
    feelings: ["mysterious", "connection", "ethereal", "spiritual"],
    colors: ["#969d91", "#525347"]
  },
  {
    id: 17,
    title: "Les Feuilles Mortes (Dead Leaves)",
    artist: "Remedios Varo",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/17.png",
    feelings: ["introspective", "melancholy", "nostalgic", "poetic"],
    colors: ["#eadfcc", "#c6a075"]
  },
  {
    id: 18,
    title: "Untitled",
    artist: "Alfredo Castañeda",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/18.png",
    feelings: ["ethereal", "dreamy", "surreal", "mysterious"],
    colors: ["#696e45", "#503215"]
  },
  {
    id: 19,
    title: "Dúo de pez (Fish Duo)",
    artist: "Alfredo Castañeda",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/19.png",
    feelings: ["whimsical", "playful", "surreal", "imaginative"],
    colors: ["#d3cebc", "#cbc9b7"]
  },
  {
    id: 20,
    title: "Morning After The Wedding",
    artist: "Norman Rockwell",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/20.png",
    feelings: ["tender", "intimate", "love", "warm"],
    colors: ["#c47557", "#0b1014"]
  },
  {
    id: 21,
    title: "Anguish",
    artist: "August Friedrich Albrecht Schenck",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/21.png",
    feelings: ["sad", "grief", "melancholy", "emotional"],
    colors: ["#87725a", "#fcf3e1"]
  },
  {
    id: 22,
    title: "Isle of the Dead (Die Toteninsel)",
    artist: "Arnold Böcklin",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/22.png",
    feelings: ["haunting", "mysterious", "solemn", "contemplative"],
    colors: ["#c1ccee", "#162127"]
  },
  {
    id: 23,
    title: "Soir Bleu (Evening Blue)",
    artist: "Edward Hopper",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/23.png",
    feelings: ["lonely", "melancholy", "contemplative", "urban"],
    colors: ["#6b95b6", "#273657"]
  },
  {
    id: 24,
    title: "Vive la couleur (Long live color)",
    artist: "Chéri Samba",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/24.png",
    feelings: ["joyful", "vibrant", "hopeful", "energetic"],
    colors: ["#6394cd", "#79bbe5"]
  },
  {
    id: 25,
    title: "Birthday",
    artist: "Marc Chagall",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/25.png",
    feelings: ["joyful", "romantic", "whimsical", "love"],
    colors: ["#bcc1aa", "#a33b28"]
  },
  {
    id: 26,
    title: "Lovers (Self-Portrait with Wally)",
    artist: "Egon Schiele",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/26.png",
    feelings: ["intimate", "tender", "vulnerable", "love"],
    colors: ["#f1f1e7", "#cdccbf"]
  },
  {
    id: 27,
    title: "Carry You Home",
    artist: "Kelechi Nwaneri",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/27.png",
    feelings: ["protective", "warm", "nurturing", "connection"],
    colors: ["#8e8a8a", "#6b8367"]
  },
  {
    id: 28,
    title: "Blackbird",
    artist: "Kelechi Nwaneri",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/28.png",
    feelings: ["free", "hopeful", "uplifting", "peaceful"],
    colors: ["#65b8da", "#bb9c6b"]
  },
  {
    id: 29,
    title: "Retreat and Perseverance",
    artist: "Kelechi Nwaneri",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/29.png",
    feelings: ["determined", "strong", "resilient", "grounded"],
    colors: ["#4c4b49", "#045242"]
  },
  {
    id: 30,
    title: "Portrait of a Human Brain",
    artist: "Kelechi Nwaneri",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/30.png",
    feelings: ["curious", "complex", "introspective", "wonder"],
    colors: ["#1484da", "#eddac2"]
  },
  {
    id: 31,
    title: "Twilight",
    artist: "Gregory Crewdson",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/31.png",
    feelings: ["mysterious", "cinematic", "lonely", "contemplative"],
    colors: ["#1c3d6d", "#030e26"]
  },
  {
    id: 32,
    title: "Untitled",
    artist: "Gregory Crewdson",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/32.png",
    feelings: ["haunting", "atmospheric", "quiet", "surreal"],
    colors: ["#141013", "#030904"]
  },
  {
    id: 33,
    title: "The Green Bar",
    artist: "Salman Toor",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/33.png",
    feelings: ["intimate", "warm", "romantic", "connection"],
    colors: ["#535a26", "#4f5439"]
  },
  {
    id: 34,
    title: "Drowning Girl",
    artist: "Roy Lichtenstein",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/34.png",
    feelings: ["dramatic", "emotional", "bold", "intense"],
    colors: ["#e1e2d1", "#a39fac"]
  },
  {
    id: 35,
    title: "Oh, Jeff...I Love You, Too...But...",
    artist: "Roy Lichtenstein",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/35.png",
    feelings: ["romantic", "dramatic", "bold", "emotional"],
    colors: ["#fcd00f", "#fbd8c0"]
  },
  {
    id: 36,
    title: "The Lovers",
    artist: "René Magritte",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/36.png",
    feelings: ["mysterious", "romantic", "surreal", "intimate"],
    colors: ["#344750", "#4c7b81"]
  },
  {
    id: 37,
    title: "The Therapist",
    artist: "René Magritte",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/37.png",
    feelings: ["surreal", "mysterious", "contemplative", "enigmatic"],
    colors: ["#393e71", "#e4c690"]
  },
];

// Triple the artworks for seamless looping
const LOOPED_ARTWORKS = [...ARTWORKS, ...ARTWORKS, ...ARTWORKS];

export default function TheRIAFMuseumOfArt() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [showInfoForId, setShowInfoForId] = useState<number | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showWarningForId, setShowWarningForId] = useState<number | null>(null);
  const [isHoveringArt, setIsHoveringArt] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof ARTWORKS>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Helper function to determine if background is light or dark
  const isLightBackground = (hexColor: string): boolean => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.7;
  };

  // Check if current artwork has light background (use first color of gradient)
  const currentArtwork = ARTWORKS[currentIndex];
  const useDarkText = isLightBackground(currentArtwork?.colors[0] || '#000000');

  // Preload ALL images before showing content
  useEffect(() => {
    const imagesToPreload = ARTWORKS.map(art => art.image);
    let loadedCount = 0;
    const totalImages = imagesToPreload.length;

    const preloadImages = () => {
      imagesToPreload.forEach(src => {
        const img = new window.Image();
        img.onload = () => {
          loadedCount++;
          setLoadingProgress(Math.round((loadedCount / totalImages) * 100));
          if (loadedCount >= totalImages) {
            setIsLoading(false);
          }
        };
        img.onerror = () => {
          loadedCount++;
          setLoadingProgress(Math.round((loadedCount / totalImages) * 100));
          if (loadedCount >= totalImages) {
            setIsLoading(false);
          }
        };
        img.src = src;
      });
    };

    // Start preloading after a brief delay to show loading screen
    const timer = setTimeout(preloadImages, 100);

    // Fallback: hide loading screen after 8 seconds max (longer since we're loading all images)
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Auto-hide info box after 3 seconds with fade out
  useEffect(() => {
    if (showInfoForId !== null) {
      setIsFadingOut(false);
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 2000); // Start fade at 2 seconds
      const hideTimer = setTimeout(() => {
        setShowInfoForId(null);
        setIsFadingOut(false);
      }, 3000); // Hide at 3 seconds
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showInfoForId]);

  // Auto-hide "Do Not Touch" warning after 1 second on mobile
  useEffect(() => {
    if (showWarningForId !== null) {
      const hideTimer = setTimeout(() => {
        setShowWarningForId(null);
      }, 1000);
      return () => clearTimeout(hideTimer);
    }
  }, [showWarningForId]);

  // Focus search input when search opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Emotion synonyms/related words mapping for better search
  const emotionMap: { [key: string]: string[] } = {
    happy: ['joyful', 'vibrant', 'energetic', 'playful', 'whimsical', 'hopeful', 'uplifting'],
    sad: ['melancholy', 'grief', 'lonely', 'nostalgic', 'solemn', 'quiet'],
    calm: ['peaceful', 'serene', 'tranquil', 'quiet', 'contemplative', 'grounded'],
    love: ['romantic', 'intimate', 'tender', 'warm', 'connection', 'love'],
    angry: ['intense', 'bold', 'powerful', 'dramatic', 'strong'],
    scared: ['haunting', 'mysterious', 'dark', 'intense'],
    curious: ['wonder', 'curious', 'imaginative', 'complex', 'introspective'],
    inspired: ['hopeful', 'uplifting', 'energetic', 'powerful', 'bold', 'determined'],
    lonely: ['lonely', 'melancholy', 'quiet', 'contemplative', 'introspective'],
    peaceful: ['peaceful', 'serene', 'calm', 'tranquil', 'quiet', 'contemplative'],
    nostalgic: ['nostalgic', 'warm', 'tender', 'dreamy', 'poetic'],
    dreamy: ['dreamy', 'ethereal', 'surreal', 'mystical', 'magical', 'whimsical'],
    mysterious: ['mysterious', 'haunting', 'magical', 'mystical', 'ethereal'],
    romantic: ['romantic', 'love', 'intimate', 'tender', 'warm'],
    energetic: ['energetic', 'vibrant', 'bold', 'powerful', 'intense'],
    anxious: ['intense', 'dramatic', 'complex', 'emotional'],
    hopeful: ['hopeful', 'uplifting', 'warm', 'peaceful', 'free'],
    free: ['free', 'uplifting', 'energetic', 'vibrant', 'playful'],
    vulnerable: ['vulnerable', 'tender', 'intimate', 'emotional', 'quiet'],
    strong: ['strong', 'powerful', 'bold', 'determined', 'resilient'],
  };

  // Filter artworks based on search query with fuzzy matching
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase().trim();

    // Get related feelings from emotion map
    const relatedFeelings = emotionMap[query] || [];

    // Score each artwork based on how well it matches
    const scoredArtworks = ARTWORKS.map(artwork => {
      let score = 0;

      // Direct match in feelings (highest priority)
      artwork.feelings.forEach(feeling => {
        if (feeling.toLowerCase() === query) score += 10;
        else if (feeling.toLowerCase().includes(query)) score += 5;
        else if (query.includes(feeling.toLowerCase())) score += 3;
      });

      // Match via emotion map
      artwork.feelings.forEach(feeling => {
        if (relatedFeelings.includes(feeling.toLowerCase())) score += 4;
      });

      // Partial match on any feeling
      artwork.feelings.forEach(feeling => {
        const feelingLower = feeling.toLowerCase();
        if (feelingLower.startsWith(query.slice(0, 3)) || query.startsWith(feelingLower.slice(0, 3))) {
          score += 2;
        }
      });

      return { artwork, score };
    });

    // Sort by score and filter out zero scores, or return top matches
    const results = scoredArtworks
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.artwork);

    // If no matches found, return a random artwork as a suggestion
    if (results.length === 0 && query.length > 0) {
      const randomArtwork = ARTWORKS[Math.floor(Math.random() * ARTWORKS.length)];
      setSearchResults([randomArtwork]);
    } else {
      setSearchResults(results);
    }
  }, [searchQuery]);

  const navigateToArtwork = (artworkId: number) => {
    const container = scrollContainerRef.current;
    if (container) {
      const artworkIndex = ARTWORKS.findIndex(a => a.id === artworkId);
      if (artworkIndex !== -1) {
        const targetScroll = (ARTWORKS.length + artworkIndex) * window.innerHeight;
        container.scrollTo({ top: targetScroll, behavior: 'smooth' });
        setShowSearch(false);
        setSearchQuery("");
      }
    }
  };

  const isScrollingRef = useRef(false);

  // Handle scroll to detect which artwork is in view
  useEffect(() => {
    if (isLoading) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollTop = container.scrollTop;
      const itemHeight = window.innerHeight;
      const index = Math.round(scrollTop / itemHeight);
      // Ensure positive modulo result
      const actualIndex = ((index % ARTWORKS.length) + ARTWORKS.length) % ARTWORKS.length;
      setCurrentIndex(actualIndex);

      // Loop back when reaching the end or beginning of the tripled list
      const totalHeight = LOOPED_ARTWORKS.length * itemHeight;
      const oneSetHeight = ARTWORKS.length * itemHeight;

      if (scrollTop >= totalHeight - itemHeight) {
        isScrollingRef.current = true;
        container.scrollTop = oneSetHeight;
        setTimeout(() => { isScrollingRef.current = false; }, 50);
      } else if (scrollTop <= 0) {
        isScrollingRef.current = true;
        container.scrollTop = oneSetHeight;
        setTimeout(() => { isScrollingRef.current = false; }, 50);
      }
    };

    container.addEventListener('scroll', handleScroll);

    // Start in the middle set and trigger initial index calculation
    const initialScrollTop = ARTWORKS.length * window.innerHeight;
    container.scrollTop = initialScrollTop;

    // Set initial index
    const initialIndex = Math.round(initialScrollTop / window.innerHeight) % ARTWORKS.length;
    setCurrentIndex(initialIndex);

    return () => container.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen h-screen flex flex-col items-center justify-center bg-black overflow-hidden relative"
      >
        <style jsx>{`
          @keyframes warpTunnel {
            0% {
              transform: scale(0) rotate(0deg);
              opacity: 0;
            }
            20% {
              opacity: 0.6;
            }
            100% {
              transform: scale(15) rotate(180deg);
              opacity: 0;
            }
          }
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.1);
              opacity: 1;
            }
          }
          @keyframes fadeInUp {
            0% {
              transform: translateY(20px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .warp-ring {
            animation: warpTunnel 2s ease-in infinite;
          }
          .warp-ring-1 { animation-delay: 0s; }
          .warp-ring-2 { animation-delay: 0.3s; }
          .warp-ring-3 { animation-delay: 0.6s; }
          .warp-ring-4 { animation-delay: 0.9s; }
          .warp-ring-5 { animation-delay: 1.2s; }
          .warp-ring-6 { animation-delay: 1.5s; }
          .center-pulse {
            animation: pulse 1.5s ease-in-out infinite;
          }
          .fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
            animation-delay: 0.5s;
            opacity: 0;
          }
          .fade-in-up-delayed {
            animation: fadeInUp 0.8s ease-out forwards;
            animation-delay: 0.8s;
            opacity: 0;
          }
        `}</style>

        {/* Warp tunnel rings */}
        <div className="relative flex items-center justify-center" style={{ perspective: '500px' }}>
          <div className="absolute w-40 h-40 rounded-full border border-white/20 warp-ring warp-ring-1" />
          <div className="absolute w-40 h-40 rounded-full border border-white/25 warp-ring warp-ring-2" />
          <div className="absolute w-40 h-40 rounded-full border border-white/30 warp-ring warp-ring-3" />
          <div className="absolute w-40 h-40 rounded-full border border-white/25 warp-ring warp-ring-4" />
          <div className="absolute w-40 h-40 rounded-full border border-white/20 warp-ring warp-ring-5" />
          <div className="absolute w-40 h-40 rounded-full border border-white/15 warp-ring warp-ring-6" />

          {/* Center focal point */}
          <div className="w-4 h-4 rounded-full bg-white/80 center-pulse shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
        </div>

        <p
          className="text-white/60 text-sm tracking-[0.3em] uppercase mt-12 fade-in-up z-10"
          style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
        >
          Entering Museum
        </p>
        {/* Progress indicator */}
        <div className="mt-4 w-32 h-1 bg-white/10 rounded-full overflow-hidden fade-in-up-delayed z-10">
          <div
            className="h-full bg-white/40 transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        <p
          className="text-white/40 text-xs tracking-wider mt-2 fade-in-up-delayed z-10"
          style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
        >
          {loadingProgress}%
        </p>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen h-screen overflow-hidden transition-[background] duration-300 ease-out"
      style={{
        background: (isHoveringArt || showWarningForId !== null)
          ? 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)'
          : `linear-gradient(180deg, ${ARTWORKS[currentIndex].colors[0]} 0%, ${ARTWORKS[currentIndex].colors[1]} 100%)`
      }}
      onClick={() => setShowWarningForId(null)}
    >
      {/* Logo - Top Left */}
      <a
        href="https://rithikaisafool.com/"
        className="fixed top-6 left-6 z-50 opacity-40 hover:opacity-80 transition-opacity"
      >
        <Image
          src="/assets/museum/artgallery/logo.png"
          alt="Logo"
          width={50}
          height={50}
          className="w-10 md:w-14 h-auto"
          unoptimized
        />
      </a>

      {/* Info Button - Top Right */}
      <button
        className={`fixed top-6 right-6 z-50 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md border ${useDarkText ? 'bg-black/10 border-black/20 hover:bg-black/20' : 'bg-white/20 border-white/30 hover:bg-white/40'}`}
        style={{ boxShadow: useDarkText ? '0 2px 10px rgba(0, 0, 0, 0.1)' : '0 2px 10px rgba(0, 0, 0, 0.3)' }}
        onClick={() => setShowInfoPopup(true)}
      >
        <span
          className={`${useDarkText ? 'text-black' : 'text-white'} text-base md:text-lg font-medium transition-colors`}
          style={{ fontFamily: 'var(--font-inter), sans-serif' }}
        >
          ?
        </span>
      </button>

      {/* Info Popup - Always rendered for smooth transitions */}
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-200 ease-out ${showInfoPopup ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ backgroundColor: 'rgba(0,0,0,0.8)', willChange: 'opacity' }}
        onClick={() => setShowInfoPopup(false)}
      >
        <div
          className={`bg-white/70 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-4 relative transition-all duration-200 ease-out ${showInfoPopup ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          style={{ willChange: 'transform, opacity' }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-gray-700 hover:text-black text-2xl"
            onClick={() => setShowInfoPopup(false)}
          >
            &times;
          </button>
          <h2
            className="text-2xl font-bold text-black mb-4"
            style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
          >
            The RIAF! Museum of Art
          </h2>
          <p
            className="text-gray-800 mb-4"
            style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
          >
            <em className="font-bold" style={{ color: '#000000' }}>"Art is not what you see, but what you make others see." — Edgar Degas</em>
            <br /><br />
            If I had a dream museum, it would look like this. All of these pieces moved me in some way. I hope they move you too. The collection grows as I grow.
          </p>
          <p
            className="text-gray-800 mb-4"
            style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
          >
            I also think every museum should let you search by how you're feeling. That's what art is for. To help you feel. Try our search bar.
          </p>
          <p
            className="text-gray-800 mb-4"
            style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
          >
            <em className="font-bold" style={{ color: '#000000' }}>"The role of the artist is exactly the same as the role of the lover. If I love you, I have to make you conscious of the things you don't see." — James Baldwin</em>
          </p>
          <p
            className="text-gray-700 text-sm mt-4 text-right"
            style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
          >
            <em>made by <a href="https://rithikaisafool.com/" className="underline hover:text-gray-700">Rithika is a Fool!</a></em>
          </p>
          <p
            className="text-gray-700 text-sm mt-2 text-right"
            style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
          >
            <em>P.S. If you liked this, you might want to try <a href="/shop/let-me-show-you" className="underline hover:text-gray-700">this</a></em>
          </p>
        </div>
      </div>

      {/* Expandable Search - Top Right (next to ?) */}
      <div className="fixed top-6 right-16 md:right-20 z-50 flex items-center">
        <div className={`flex items-center transition-all duration-300 ${showSearch ? 'w-64 md:w-80' : 'w-8 md:w-10'}`}>
          {/* Expanded Search Input */}
          {showSearch && (
            <div className="relative flex-1 mr-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What are you feeling?"
                className={`w-full px-4 py-2 rounded-full backdrop-blur-md border text-sm focus:outline-none transition-colors ${useDarkText ? 'bg-black/10 border-black/20 text-black placeholder-black/50 focus:bg-black/20' : 'bg-white/20 border-white/30 text-white placeholder-white/60 focus:bg-white/30'}`}
                style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif', boxShadow: useDarkText ? '0 2px 10px rgba(0, 0, 0, 0.1)' : '0 2px 10px rgba(0, 0, 0, 0.3)' }}
                onBlur={() => {
                  if (!searchQuery) {
                    setTimeout(() => setShowSearch(false), 200);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchResults.length > 0) {
                    navigateToArtwork(searchResults[0].id);
                    setShowSearch(false);
                    setSearchQuery("");
                  }
                }}
              />
            </div>
          )}
          {/* Search Icon Button */}
          <button
            className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md border flex-shrink-0 ${useDarkText ? 'bg-black/10 border-black/20 hover:bg-black/20' : 'bg-white/20 border-white/30 hover:bg-white/40'}`}
            style={{ boxShadow: useDarkText ? '0 2px 10px rgba(0, 0, 0, 0.1)' : '0 2px 10px rgba(0, 0, 0, 0.3)' }}
            onClick={() => {
              if (showSearch) {
                setShowSearch(false);
                setSearchQuery("");
              } else {
                setShowSearch(true);
              }
            }}
          >
            <svg
              className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${useDarkText ? 'text-black' : 'text-white'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {showSearch ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className="h-full">
        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          className="w-full h-screen overflow-y-scroll overflow-x-hidden snap-y snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {LOOPED_ARTWORKS.map((artwork, idx) => (
            <div
              key={`${artwork.id}-${idx}`}
              className="h-screen snap-start flex flex-col md:flex-row items-center justify-center py-8 md:py-0"
            >
              {/* Clickable Artwork Image with Spotlight */}
              <div
                className="flex-shrink-0 hover:scale-[1.02] transition-transform relative"
              >
                {/* Spotlight glow behind artwork */}
                <div
                  className="absolute -inset-20 blur-3xl opacity-50 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)'
                  }}
                />
                {/* Image wrapper for hover detection */}
                <div
                  className="relative z-10 group cursor-pointer"
                  onMouseEnter={() => {
                    // Only set hover state on devices with hover capability
                    if (window.matchMedia('(hover: hover)').matches) {
                      setIsHoveringArt(true);
                    }
                  }}
                  onMouseLeave={() => setIsHoveringArt(false)}
                >
                  {/* Image with touch handlers - only triggers on the actual image */}
                  <div
                    className="relative"
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      // Only trigger warning if it was a tap (not a scroll)
                      if (touchStartRef.current) {
                        const touch = e.changedTouches[0];
                        const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
                        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
                        const deltaTime = Date.now() - touchStartRef.current.time;
                        // If touch moved less than 10px and lasted less than 300ms, it's a tap
                        if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
                          setShowWarningForId(artwork.id);
                        }
                      }
                      touchStartRef.current = null;
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Image
                      src={artwork.image}
                      alt={artwork.title}
                      width={600}
                      height={750}
                      className="max-w-[265px] md:max-w-[500px] lg:max-w-[600px] h-auto"
                      style={{ display: 'block' }}
                      priority={idx < 6}
                      unoptimized
                    />
                    {/* "Please Do Not Touch" Warning - Desktop hover, Mobile click */}
                    <div
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none
                        transition-all duration-150 ease-out
                        ${showWarningForId === artwork.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90 md:group-hover:opacity-100 md:group-hover:scale-100'}`}
                      style={{ willChange: 'transform, opacity' }}
                    >
                      <div
                        className="bg-red-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-lg text-center"
                        style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
                      >
                        <p className="text-xs md:text-sm font-bold tracking-wider">PLEASE DO NOT TOUCH</p>
                      </div>
                    </div>
                  </div>
                  {/* Desktop Info Box - Bottom Right Corner */}
                  <div
                    className="hidden md:block absolute bottom-4 right-4 bg-white/70 backdrop-blur-sm rounded-lg p-4 max-w-[250px] z-20 shadow-lg"
                    style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
                  >
                    <h3 className="text-lg font-bold text-black mb-0">
                      {artwork.title}
                    </h3>
                    {artwork.artist && (
                      <p className="text-gray-600 text-sm mb-1">
                        {artwork.artist}
                      </p>
                    )}
                    {artwork.year && (
                      <p className="text-gray-500 text-xs mb-2">
                        {artwork.year}
                      </p>
                    )}
                    {artwork.medium && (
                      <p className="text-gray-400 text-xs italic">
                        {artwork.medium}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* Mobile Info Box - Below Image */}
              <div
                className="md:hidden mt-4 bg-white/70 backdrop-blur-sm rounded-lg p-3 max-w-[260px] z-20 shadow-lg"
                style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
              >
                <h3 className="text-sm font-bold text-black mb-0">
                  {artwork.title}
                </h3>
                {artwork.artist && (
                  <p className="text-gray-600 text-xs">
                    {artwork.artist}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
