"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const PASSWORD = "ilovemyself";

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
    title: "The Birthday",
    artist: "Marc Chagall",
    date: "1915",
    medium: "Oil in cardboard painting",
    image: "/assets/CCP/Sample_Month/Feb2026/birthday.jpg",
    curator: "Sam",
    note: "Now this is what I'm talking about. We're afraid to double text. Look at this guy - he's contorting his entire body, probably breaking his back just to give his lady a smooch on her birthday. Love requires sacrifice and humility. When you're willing to love like this, so shamelessly, you will get superpowers. You will fly.",
    additionalInfo: [
      "The Birthday was painted by Chagall in 1915 just a few weeks before he and Bella married.",
      "Marc Chagall called \"love\" the primary color of his paintings. The central source of the love in his life was his wife, Bella. They met when Bella was a teenager in their home town of Vitebsk, Belarus. In 1915, Chagall finally married Bella, despite the opposition of her parents, who wanted a better match for their daughter. <a href=\"https://www.marcchagall.net/the-birthday.jsp\" target=\"_blank\" class=\"underline text-white/60 hover:text-white\">(source)</a>"
    ]
  },
  {
    id: 2,
    title: "Love Takes Miles",
    artist: "Cameron Winter",
    date: "2024",
    medium: "Music",
    video: "U4UFAejSQFA",
    curator: "Rue",
    note: "When I was young, I used to have such a low bar for what being in love is. I would \"fall in love\" with every guy in school who smiled at me. I'd imagine us holding hands and going to the movies and getting married just because they were cute and nice to me once. As I've gotten older and had more serious friendships and relationships, I realized how much deeper love really is. Love takes miles! I've got to experience traveling and health issues and talking about major insecurities with people. When you go through that with someone, you realize your old definition of love was too small. I feel like this song captures that really well. Winter sings about how love will show up in your life at the weirdest time and will require you to work so hard. But it's always worth it.",
    additionalInfo: [
      "Cameron Winter cites Bob Dylan and Leonard Cohen as his main inspirations. In an interview he said \"Those were the two lyrical inspirations I was just obsessed with – unhealthily obsessed with – for the whole record... I would listen to his stuff and barely had any idea what he was talking about, but I felt it in my bones.\" <a href=\"https://www.thelineofbestfit.com/features/interviews/cameron-winter-not-kidding-this-time\" target=\"_blank\" class=\"underline text-white/60 hover:text-white\">(source)</a>",
      "When asked about creating this song and the album by himself, he said \"Having to play all the goddamn instruments myself. I mean, I was also going through what I now recognise as a major depressive episode during the main tracking of it, and that sucked. It all sort of coalesced with me having to do a lot of the stuff myself, and I would have this song where I had to just sit there and for every six-minute performance track the whole fucking shaker thing myself, or the xylophone I insisted on adding. In between takes, I'd just lie down and put my head between couch cushions.\" <a href=\"https://www.thelineofbestfit.com/features/interviews/cameron-winter-not-kidding-this-time\" target=\"_blank\" class=\"underline text-white/60 hover:text-white\">(source)</a>"
    ]
  },
  {
    id: 3,
    title: "Christina's World",
    artist: "Andrew Wyeth",
    date: "1948",
    medium: "Painting",
    image: "/assets/CCP/Sample_Month/Feb2026/christinaworld.jpg",
    curator: "Lucy",
    note: "I'm going through a break up so this is what love feels like to me now. I think about the home in the painting as the symbol for the relationship my partner and I built together. Like the home, the relationship was not even that shiny or special - it was pretty worn out by the end. But I still feel longing and grief thinking about it even though I don't really want to go back.",
    additionalInfo: [
      "The woman in the painting, Christina was a real person that Wyeth painted. Christina Olson lived in the farmhouse shown in the painting in Cushing, Maine. She had a degenerative muscular condition (likely polio, though never formally diagnosed) that left her unable to walk. She refused to use a wheelchair and got around by dragging herself which deeply affected Wyeth when he witnessed it.",
      "Wyeth didn't paint Christina's body directly from her — he used his wife Betsy as the model for the torso and Christina's likeness for the head and spirit.",
      "The Olson House is real and now a National Historic Landmark. Wyeth painted it dozens of times over his career, but Christina's World is by far the most famous."
    ]
  },
  {
    id: 4,
    title: "Any Love I Have Given You",
    artist: "Unknown",
    date: "",
    medium: "Quote",
    quote: "Any love I have given you is yours to keep.",
    emoji: "❤️",
    curator: "Shay",
    note: "I think this is the most loving, precious way to think about love. Pure love is selfless. Pure love is eternal. If somebody you loves passes away or they stop being in your life, it doesn&apos;t erase all the love you felt from them. That love is still there and can be accessed. A high school&apos;s teacher belief in you 10 years ago can still drive you now to go after your dreams. An ex-boyfriend&apos;s love of your dancing can still make you feel confident on the dance floor. It&apos;s an amazing thing. Everyone&apos;s love in you is always there, you just have to be able to receive and access it.",
    additionalInfo: [
      "I&apos;m not sure who to attribute this quote to because I&apos;ve seen it online in different versions many times. I try to come back to it often."
    ]
  },
  {
    id: 5,
    title: "Jazz for Cows",
    artist: "The New Hot 5",
    date: "2012",
    medium: "Music",
    video: "lXKDu6cdXLI",
    curator: "",
    note: "This video reminds me that love can come in any and all forms. The fact that these musicians thought to pause their work, lug all this equipment and travel to a field to serenade cows is so, so beautiful, honestly. It moved me deeply to think that these cows felt love like this, it may have been the best day in their lives. Everything alive deserves to feel love like this.",
    additionalInfo: [
      "The New Hot 5 are the American-based jazz band playing in this video. They&apos;re playing for a herd of cows in Autrans, France."
    ]
  },
  {
    id: 6,
    title: "The Old Guitarist",
    artist: "Pablo Picasso",
    date: "1903-1904",
    medium: "Oil painting",
    image: "/assets/CCP/Sample_Month/Feb2026/Old_guitarist.jpg",
    curator: "",
    note: "My interpretation of this theme was love as a devotion to a craft. This painting shows an old, impoverished man who is showing little signs of life. He looks so close to death that even moving seems painful and yet he continues to play his guitar. This expresses the loneliness and obsessiveness an artist can feel towards their craft. And the desperation to make something beautiful. This is true love of a craft.",
    additionalInfo: [
      "This painting was created during Picasso's Blue Period (1901–1904), a time marked by grief, poverty, and emotional isolation. After his close friend Carlos Casagemas died by suicide, Picasso became deeply depressed and began painting dark, blue-toned works focused on poverty and tragedy.",
      "The Old Guitarist became one of Picasso's most famous Blue Period paintings and has inspired many artists. Paul McCartney once saw a copy of the painting on a wall and was inspired to create a chord progression, which he later used in Kanye West's 2015 song \"All Day.\""
    ]
  },
  {
    id: 7,
    title: "Mountain Dew Commercial Disguised as a Love Poem",
    artist: "Matthew Olzmann",
    date: "2013",
    medium: "Poetry",
    image: "/assets/CCP/Sample_Month/Feb2026/mountaindew.jpg",
    curator: "",
    note: "People think love is this big, grand, ambiguous cloud of a thing. It is but at the end of the day, it's just made up of small, specific things. That's what this poem shows.",
    additionalInfo: [
      "Olzmann wrote this love poem about his wife, Vievee Francis who is also a poet. She also writes love poems about him."
    ]
  },
  {
    id: 8,
    title: "More Coming Soon",
    artist: "",
    date: "",
    medium: "",
    curator: "Rithika",
    note: "<strong>New pieces will be dropped throughout the month.</strong> Subscribers will get notified via email when they do. See you soon.",
    additionalInfo: [
      "<strong>Calling All Art Lovers!</strong> If you have a piece you want to submit for this theme, reach out to submissions@rithikaisafool.com"
    ]
  },
];

export default function LMSYFeb2026Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentBlurred, setContentBlurred] = useState(true);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [selectedArtwork, setSelectedArtwork] = useState(ARTWORKS[0]);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [themeRevealed, setThemeRevealed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    const stored = sessionStorage.getItem("lmsy-feb2026-auth");
    if (stored === "true") {
      setIsAuthenticated(true);
      setContentBlurred(false); // No blur animation for returning users
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === PASSWORD) {
      setIsTransitioning(true);
      sessionStorage.setItem("lmsy-feb2026-auth", "true");
      setPasswordError("");
      // After popup fades, show main content blurred
      setTimeout(() => {
        setIsAuthenticated(true);
        // Then unblur the content
        setTimeout(() => {
          setContentBlurred(false);
        }, 100);
      }, 1000);
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  // Capture scroll events on the page and redirect to main content (except when over sidebar or mobile menu)
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleWheel = (e: WheelEvent) => {
      // Don't capture when mobile menu is open
      if (mobileMenuOpen) {
        return;
      }
      // Check if scrolling over sidebar
      if (sidebarRef.current && sidebarRef.current.contains(e.target as Node)) {
        return; // Let sidebar scroll naturally
      }
      if (mainContentRef.current) {
        mainContentRef.current.scrollTop += e.deltaY;
        e.preventDefault();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [mobileMenuOpen, isAuthenticated]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Scroll to top when artwork changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [selectedArtwork]);

  // Password Gate
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen w-full flex items-center justify-center p-4"
        style={{
          backgroundImage: `url("/assets/CCP/Sample_Month/Feb2026/cover.jpg")`,
          backgroundSize: "cover",
          backgroundPosition: isMobile ? "center" : undefined,
          backgroundRepeat: "no-repeat",
          animation: isMobile ? "none" : "floatBackground 120s linear infinite",
        }}
      >
        <style jsx>{`
          @keyframes pulseBlur {
            0%, 100% { filter: blur(3px); }
            50% { filter: blur(10px); }
          }
          @keyframes floatBackground {
            0% { background-position: 20% 30%; }
            8% { background-position: 80% 10%; }
            17% { background-position: 95% 60%; }
            26% { background-position: 50% 90%; }
            35% { background-position: 5% 70%; }
            44% { background-position: 30% 15%; }
            53% { background-position: 70% 45%; }
            62% { background-position: 90% 85%; }
            71% { background-position: 15% 55%; }
            80% { background-position: 60% 5%; }
            89% { background-position: 85% 40%; }
            100% { background-position: 20% 30%; }
          }
        `}</style>
        <div
          className="max-w-lg w-full rounded-3xl p-10"
          style={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "0.5px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            opacity: isTransitioning ? 0 : 1,
            transform: isTransitioning ? "scale(1.1)" : "scale(1)",
            transition: "opacity 1s ease-out, transform 1s ease-out",
          }}
        >
          <h1 className="text-3xl font-bold text-white mb-3 font-[family-name:var(--font-abril-fatface)] text-center">
            LET ME SHOW YOU
          </h1>
          <div
            className="relative mb-5 cursor-pointer group"
            onTouchStart={(e) => {
              const target = e.currentTarget;
              target.classList.add('revealed');
            }}
          >
            {/* Blurred pink version with pulse */}
            <p
              className="text-2xl font-bold text-center font-[family-name:var(--font-inter)] select-none transition-opacity duration-300 opacity-100 group-hover:opacity-0 group-[.revealed]:opacity-0"
              style={{
                animation: "pulseBlur 2s ease-in-out infinite",
                color: "#ff69b4",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              &ldquo;What Love Feels Like&rdquo;
            </p>
            {/* Clear version on hover */}
            <p
              className="text-2xl font-bold text-center font-[family-name:var(--font-inter)] select-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 group-[.revealed]:opacity-100 absolute inset-0"
              style={{
                color: "#ff69b4",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              &ldquo;What Love Feels Like&rdquo;
            </p>
          </div>
          <p className="text-white/70 text-center mb-7 font-[family-name:var(--font-inter)] font-medium text-lg">
            Enter the password to view this exhibit
          </p>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError("");
              }}
              placeholder="Password"
              className="w-full px-5 py-4 border border-white/30 rounded-xl focus:border-white focus:outline-none font-[family-name:var(--font-inter)] mb-5 text-white placeholder-white/50 bg-white/10 text-lg"
            />
            {passwordError && (
              <p className="text-red-400 text-base mb-4 font-[family-name:var(--font-inter)]">
                {passwordError}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-white/20 text-white font-bold py-4 rounded-xl hover:bg-white/30 transition-colors font-[family-name:var(--font-inter)] border border-white/30 text-lg"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[100dvh] w-full flex items-center justify-center p-2 md:p-8 overflow-hidden fixed inset-0"
      style={{
        backgroundImage: `url("/assets/CCP/Sample_Month/Feb2026/cover.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: isMobile ? "center" : undefined,
        backgroundRepeat: "no-repeat",
        animation: isMobile ? "none" : "floatBackground 120s linear infinite",
      }}
    >
      <style jsx global>{`
        @keyframes floatBackground {
          0% { background-position: 20% 30%; }
          8% { background-position: 80% 10%; }
          17% { background-position: 95% 60%; }
          26% { background-position: 50% 90%; }
          35% { background-position: 5% 70%; }
          44% { background-position: 30% 15%; }
          53% { background-position: 70% 45%; }
          62% { background-position: 90% 85%; }
          71% { background-position: 15% 55%; }
          80% { background-position: 60% 5%; }
          89% { background-position: 85% 40%; }
          100% { background-position: 20% 30%; }
        }
      `}</style>
      {/* Main Glass Container */}
      <div
        className="w-full max-w-6xl h-[calc(100dvh-1rem)] md:h-[80vh] lg:h-[85vh] rounded-3xl overflow-hidden relative lg:mt-0"
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "0.5px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          filter: contentBlurred ? "blur(20px)" : "blur(0px)",
          opacity: contentBlurred ? 0 : 1,
          transform: contentBlurred ? "scale(0.95)" : "scale(1)",
          transition: "filter 2s ease-out, opacity 2s ease-out, transform 2s ease-out",
        }}
      >
        <div className="flex flex-col lg:flex-row h-full">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-full text-white flex items-center justify-center"
            style={{
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(10px)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-50 flex"
                onWheel={(e) => {
                  const menuContent = e.currentTarget.querySelector('[data-menu-content]') as HTMLElement;
                  if (menuContent) menuContent.scrollTop += e.deltaY;
                }}
              >
                {/* Dark overlay - click to close */}
                <div
                  className="absolute inset-0 bg-black/50"
                  onClick={() => setMobileMenuOpen(false)}
                />
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  data-menu-content
                  className="relative w-[85%] max-w-md h-full overflow-y-auto"
                  style={{
                    background: "rgba(50, 50, 50, 0.7)",
                    backdropFilter: "blur(20px)",
                    WebkitOverflowScrolling: 'touch',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="p-6"
                  >
                    {/* Close button */}
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>

                    {/* Logo */}
                    <div className="mb-8">
                      <h1 className="text-white/60 text-[20px] tracking-tight font-[family-name:var(--font-abril-fatface)]">LET ME SHOW YOU:</h1>
                      <p className="text-white text-[24px] font-bold mt-2 font-[family-name:var(--font-inter)]">&ldquo;What Love Feels Like&rdquo;</p>
                      <p className="text-gray-400 text-base font-medium mt-3 font-[family-name:var(--font-inter)]">Feb 2026 Theme</p>
                    </div>

                    {/* Artwork List */}
                    <div className="border-t border-white/20 pt-4">
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-3 font-[family-name:var(--font-inter)]">Artworks</p>
                      <div className="space-y-2">
                        {ARTWORKS.map((artwork) => (
                          <button
                            key={artwork.id}
                            onClick={() => {
                              setSelectedArtwork(artwork);
                              setMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                              selectedArtwork.id === artwork.id
                                ? "bg-white/20"
                                : "hover:bg-white/10"
                            }`}
                          >
                            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                              {artwork.image ? (
                                <Image
                                  src={artwork.image}
                                  alt={artwork.title}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : artwork.video ? (
                                <>
                                  <Image
                                    src={`https://img.youtube.com/vi/${artwork.video}/hqdefault.jpg`}
                                    alt={artwork.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                                      <path d="M8 5v14l11-7z"/>
                                    </svg>
                                  </div>
                                </>
                              ) : (artwork as any).emoji ? (
                                <div className="w-full h-full bg-white/20 flex items-center justify-center text-2xl">
                                  {(artwork as any).emoji}
                                </div>
                              ) : (
                                <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-lg">
                                  &ldquo;
                                </div>
                              )}
                            </div>
                            <span className={`text-sm truncate font-[family-name:var(--font-inter)] ${
                              selectedArtwork.id === artwork.id ? "text-white font-medium" : "text-white/70"
                            }`}>
                              {artwork.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Left Sidebar - Desktop only */}
          <div
            ref={sidebarRef}
            className="hidden lg:block w-72 p-6 flex-shrink-0 overflow-y-auto glass-scrollbar"
            style={{
              background: "rgba(50, 50, 50, 0.4)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Logo */}
            <div className="mb-8">
              <h1 className="text-white/60 text-xl tracking-tight font-[family-name:var(--font-abril-fatface)]">LET ME SHOW YOU:</h1>
              <div className="relative">
                <p className="text-white text-3xl font-bold mt-2 font-[family-name:var(--font-inter)]">&ldquo;What Love Feels Like&rdquo;</p>
              </div>
              <p className="text-gray-800 text-base font-medium mt-3 font-[family-name:var(--font-inter)]">Feb 2026 Theme</p>
            </div>

            {/* Table of Contents */}
            <div className="border-t border-white/20 pt-4">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-3 font-[family-name:var(--font-inter)]">Artworks</p>
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
                      {artwork.image ? (
                        <Image
                          src={artwork.image}
                          alt={artwork.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : artwork.video ? (
                        <>
                          <Image
                            src={`https://img.youtube.com/vi/${artwork.video}/hqdefault.jpg`}
                            alt={artwork.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            {(artwork as any).quote ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                              </svg>
                            )}
                          </div>
                        </>
                      ) : (artwork as any).emoji ? (
                        <div className="w-full h-full bg-white/20 flex items-center justify-center text-2xl">
                          {(artwork as any).emoji}
                        </div>
                      ) : (
                        <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-lg">
                          &ldquo;
                        </div>
                      )}
                    </div>
                    <span className={`text-sm truncate font-[family-name:var(--font-inter)] ${
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
          <div ref={mainContentRef} className="flex-1 p-4 pt-2 lg:p-8 overflow-y-auto glass-scrollbar">
            {/* Mobile Header */}
            <div className="lg:hidden mb-4 pb-3 border-b border-white/20 text-center">
              <p className="text-white/60 text-[14px] font-[family-name:var(--font-abril-fatface)]">LET ME SHOW YOU:</p>
              <p className="text-white text-[18px] font-bold font-[family-name:var(--font-inter)]">&ldquo;What Love Feels Like&rdquo;</p>
              <p className="text-gray-800 text-xs font-medium mt-1">Feb 2026 Theme</p>
            </div>
            {/* Featured Artwork */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedArtwork.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative mb-6"
              >
              {selectedArtwork.image && !(selectedArtwork as any).quote ? (
                <div className="relative aspect-[4/3] lg:aspect-[16/10] cursor-pointer" onClick={() => setIsExpanded(true)}>
                  <Image
                    src={selectedArtwork.image}
                    alt={selectedArtwork.title}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                  {/* Expand button */}
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/30 backdrop-blur flex items-center justify-center text-white hover:bg-black/50 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                  </button>
                </div>
              ) : selectedArtwork.video ? (
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedArtwork.video}?modestbranding=1&rel=0`}
                    title={selectedArtwork.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              ) : (selectedArtwork as any).quote ? (
                <div
                  className="relative min-h-[150px] lg:min-h-[200px] flex flex-col items-center justify-center p-8 rounded-xl"
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <p className="text-white/60 text-sm uppercase tracking-wider mb-4 font-semibold font-[family-name:var(--font-inter)]">QUOTE</p>
                  <p className="text-white text-2xl lg:text-3xl leading-relaxed italic text-center max-w-2xl font-[family-name:var(--font-inter)]" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>
                    &ldquo;{(selectedArtwork as any).quote}&rdquo;
                  </p>
                  <p className="text-white/70 mt-4 text-base font-[family-name:var(--font-inter)]">— {(selectedArtwork as any).quoteAttribution || selectedArtwork.artist}</p>
                </div>
              ) : null}

              {/* Artwork Info */}
              <div className="mt-4">
                <h2 className="text-2xl lg:text-3xl font-semibold text-white font-[family-name:var(--font-inter)]">{selectedArtwork.title}</h2>
                {selectedArtwork.artist && (
                  <p className="text-black/80 text-base mt-1 font-[family-name:var(--font-inter)]">
                    Artist: <span className="font-medium">{selectedArtwork.artist}</span>
                  </p>
                )}
                {selectedArtwork.date && (
                  <p className="text-black/80 text-base mt-1 font-[family-name:var(--font-inter)]">
                    Date: <span className="font-medium">{selectedArtwork.date}</span>
                  </p>
                )}
                {selectedArtwork.medium && (
                  <p className="text-black/80 text-base mt-1 font-[family-name:var(--font-inter)]">
                    Medium: <span className="font-medium">{selectedArtwork.medium}</span>
                  </p>
                )}
              </div>


              {/* Quote below video if both exist */}
              {selectedArtwork.video && (selectedArtwork as any).quote && (
                <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(255, 255, 255, 0.1)" }}>
                  <p className="text-black/60 text-sm uppercase tracking-wider mb-3 text-center font-semibold font-[family-name:var(--font-inter)]">Transcript From Video</p>
                  <p className="text-black text-base leading-relaxed italic text-center font-medium font-[family-name:var(--font-inter)]">
                    &ldquo;{(selectedArtwork as any).quote}&rdquo;
                  </p>
                  <p className="text-black/70 mt-3 text-sm text-center font-medium font-[family-name:var(--font-inter)]">— {(selectedArtwork as any).quoteAttribution || selectedArtwork.artist}</p>
                </div>
              )}

              {/* Curator Note */}
              {selectedArtwork.note && (
                <div
                  className="mt-4 p-4 rounded-xl"
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <p className="text-white/60 text-sm uppercase tracking-wider mb-2 font-semibold font-[family-name:var(--font-inter)]">Curator Notes</p>
                  <p className="text-white text-lg md:text-xl italic font-[family-name:var(--font-inter)]" dangerouslySetInnerHTML={{ __html: `&ldquo;${selectedArtwork.note}&rdquo;` }} />
                </div>
              )}

              {/* Additional Info */}
              {selectedArtwork.additionalInfo && Array.isArray(selectedArtwork.additionalInfo) && (
                <div
                  className="mt-4 p-4 rounded-xl"
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <p className="text-white/60 text-sm uppercase tracking-wider mb-2 font-semibold font-[family-name:var(--font-inter)]">Additional Info</p>
                  <ul className="text-white text-base md:text-lg space-y-2 font-[family-name:var(--font-inter)]">
                    {selectedArtwork.additionalInfo.map((info: string, index: number) => (
                      <li key={index} className="flex">
                        <span className="mr-2">•</span>
                        <span dangerouslySetInnerHTML={{ __html: info }} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
            </AnimatePresence>

          </div>
        </div>

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
            className="max-w-2xl w-full rounded-2xl p-10 relative"
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowInfoPopup(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <h2 className="text-3xl text-white mb-5 font-[family-name:var(--font-abril-fatface)]">
              ABOUT THIS EXHIBIT
            </h2>

            <p className="text-white/90 font-[family-name:var(--font-inter)] text-lg">
              Let Me Show You is a monthly digital art exhibit from Rithika is a Fool! Each month, we pick a theme and invite guests to share art that they love. You can learn more <a href="/shop/let-me-show-you" className="font-bold underline hover:opacity-70">here</a>.
            </p>
          </div>
        </div>
      )}

      {/* Expanded Image Overlay */}
      <AnimatePresence>
        {isExpanded && selectedArtwork.image && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
            onClick={() => setIsExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center"
            >
              <Image
                src={selectedArtwork.image}
                alt={selectedArtwork.title}
                width={1200}
                height={900}
                className="object-contain max-w-full max-h-[95vh]"
                unoptimized
                onClick={(e) => e.stopPropagation()}
              />
              {/* Close button */}
              <button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/40 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
