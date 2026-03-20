"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const PASSWORD = "snowday";

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
    title: "Ice Watch",
    artist: "Olafur Eliasson",
    date: "2014",
    medium: "Sculpture",
    images: [
      "/assets/CCP/Sample_Month/March2026/icewatch3.webp",
      "/assets/CCP/Sample_Month/March2026/icewatch2.webp",
      "/assets/CCP/Sample_Month/March2026/icewatch4.webp",
      "/assets/CCP/Sample_Month/March2026/icewatch5.webp",
    ],
    curator: "",
    note: "I took the theme literally and thought of this art exhibit from Eliasson. He placed massive blocks of glacial ice in public spaces and let them melt in real time to show the effects of climate change. Looking at it reminds me that change is often not dramatic. It's a slow softening that you don't even realize is happening. We're all melting in ways that we don't even realize.",
    additionalInfo: [
      "Ice Watch was twelve large blocks of ice cast off from the Greenland ice sheet are harvested from a fjord outside Nuuk and presented in a clock formation in a prominent public place. It was installed in three locations. <a href=\"https://olafureliasson.net/artwork/ice-watch-2014/\" target=\"_blank\" class=\"text-white/60 hover:text-white\">(source)</a>",
      "The first installation was in Copenhagen, at City Hall Square, from 26 to 29 October 2014, to mark the publication of the UN IPCC's Fifth Assessment Report on Climate Change. <a href=\"https://olafureliasson.net/artwork/ice-watch-2014/\" target=\"_blank\" class=\"text-white/60 hover:text-white\">(source)</a>"
    ]
  },
  {
    id: 2,
    title: "My Parents",
    artist: "David Hockney",
    date: "1977",
    medium: "Oil on Canvas",
    image: "/assets/CCP/Sample_Month/March2026/parents_david.jpg",
    curator: "",
    note: "I've been thinking a lot about my parents dying. They're getting older and weaker and their memory is fading. They're melting away. I remember as a kid my parents throwing so many parties and being so alive and bright. Reminded me of this painting by Hockney. If I was to paint my parents now, it would be much less colorful, much more faded.",
    additionalInfo: [
      "The two figures in this piece are Hockney's parents, Kenneth and Laura, which he painted when he was visiting home.",
      "His parents were initially upset with him because he gave up on 2 previous versions, and they spent hours posing for him each time. <a href=\"https://www.tate.org.uk/art/artworks/hockney-my-parents-t03255\" target=\"_blank\" class=\"text-white/60 hover:text-white\">(source)</a>",
      "Kenneth, Hockney's dad, passed away just a year after this was painted."
    ]
  },
  {
    id: 3,
    title: "fall in love with you.",
    artist: "Montell Fish",
    date: "2022",
    medium: "Music",
    video: "DbxOmAsowd0",
    curator: "",
    note: "This feels more like a prayer than a song. So pure and raw and honest. I listened to this a lot after my break up and it helped me process and feel my emotions instead of avoiding them. It melted a lot of the hate I used to have for my ex. There's only gratitude now.",
    additionalInfo: [
      "Fish converted to Christianity in 2015, and it was a central theme in his early music. He's moved way from making Christian music but a lot of his songs still feel like a blend between the romantic and spiritual. <a href=\"https://en.wikipedia.org/wiki/Montell_Fish\" target=\"_blank\" class=\"text-white/60 hover:text-white\">(source)</a>"
    ]
  },
  {
    id: 4,
    title: "Spring",
    artist: "Inka Essenhigh",
    date: "",
    medium: "Oil on canvas",
    image: "/assets/CCP/Sample_Month/March2026/spring_inka.jpeg",
    curator: "",
    note: "I saw an interview with Inka where she described this painting as \"a depiction of Spring that has happened so suddenly, that it's happened instantaneously, that this person walking through the forest is still wearing his winter coat and whistling along.\" Starting to feel this way about all the seasons, about all of life. Where does the time go. This is how death happens, I suppose. One moment we are here and the other, in an instant, gone. Where do our souls go? Where does our energy go?",
    additionalInfo: [
      "Inka's work is almost always surrealist, an art style that merges fantasy and reality in order to \"unlock the power of the unconscious mind.\" When asked why, she said \"I can't help it! Even if I make a picture with nothing distorted it is read as surrealistic. It just oozes out of me.\" <a href=\"https://www.artsy.net/article/artsy-editorial-artists-putting-contemporary-spin-surrealism\" target=\"_blank\" class=\"text-white/60 hover:text-white\">(source)</a>",
      "Many of Inka's fans have commented how her work often feels like it is \"underwater and the world and people all look like they're flowing and it's all just a big ball of energy.\" Inka has said it's often because her paintings start that way with wide flowing brush strokes not knowing where it's going. <a href=\"https://www.youtube.com/watch?v=AV32FcHdjiE&t=57s\" target=\"_blank\" class=\"text-white/60 hover:text-white\">(source)</a>"
    ]
  },
  {
    id: 6,
    title: "Meguri",
    artist: "Ushio Amagatsu",
    date: "",
    medium: "Dance",
    video: "aTHTPBp842g",
    curator: "",
    note: "I discovered this after watching an interview with Jacob Elordi who said that he studied it for his role for Frankenstein. Oh man, is it haunting. They look like they've come back from the dead just to remind us that we're all going to end up like them. I wonder if this is how it feels to die when you're going to \"Hell\"",
    additionalInfo: [
      "Butoh is an avant-garde dance-theater form created in the late 1950s, often called the \"dance of darkness\". <a href=\"https://www.ssense.com/en-us/editorial/culture/inside-butoh-the-japanese-dance-of-darkness\" target=\"_blank\" class=\"text-white/60 hover:text-white\">(source)</a>",
      "The inspiration for this style was a reaction to post-war shock and trauma. It rejects traditional dance techniques for raw, surreal, and often grotesque movements. <a href=\"https://ums.org/2019/10/17/butoh-explained/\" target=\"_blank\" class=\"text-white/60 hover:text-white\">(source)</a>"
    ]
  },
  {
    id: 7,
    title: "The Persistence of Memory",
    artist: "Salvador Dalí",
    date: "1931",
    medium: "Oil on Canvas",
    image: "/assets/CCP/Sample_Month/March2026/persistencedali.webp",
    curator: "",
    note: "You can't tell me the theme is melting and not pull up the mustache man Dali. He is the king of melting. I remember my high school art teacher showing us this piece and asking us what it symbolized. Melting clocks, melting time, melting memories. Nothing persists. It's good to remember, to live your life in each and every moment because it's all melting.",
    additionalInfo: [
      "Dali was just 28 when he painted this historical piece and claimed that the melting clocks were inspired by watching Camembert cheese melt in the sun. <a href=\"https://www.moma.org/magazine/articles/1386\" target=\"_blank\" class=\"text-white/60 hover:text-white\">(source)</a>",
      "The sort of white face-like figure in the painting has been interpreted to be a self-portrait of the artist, who has been known for his unconventional self-portrayals. <a href=\"https://www.dalipaintings.com/persistence-of-memory.jsp\" target=\"_blank\" class=\"text-white/60 hover:text-white\">(source)</a>"
    ]
  },
  {
    id: 8,
    title: "Turandot",
    artist: "Giacomo Puccini",
    date: "",
    medium: "Opera",
    video: "p1e54SXY66E",
    curator: "",
    note: "This opera is about this ice Princess, Turandot, who is known for being unreasonable and cruel with potential suitors. Anyone who wants to marry her needs to solve three riddles or she executes them. My interpretation is she's afraid of love. In the opera, a man succeeds in winning the 3 challenges but against the agreement, she doesn't want to marry him. He tells her that if she can learn his name before dawn, he will die and she won't have to. She doesn't figure it out but he ends up willingly telling her his name (\"Calaf\") right before dawn. This video is from the final act where the princess takes him to her father, the emperor, to declare that she finally knows his name. But she ends up saying \"It is love\", signifying that she has fallen in love with him. To me, this play is literally about her icy heart melting. It shows how love from even one person can melt years of fear and pain and resentment in another.",
    additionalInfo: [
      "Puccini died before completing Turandot. He left behind more than 30 pages of sketches detailing his plans to complete the opera which specified his preference for Riccardo Zandonai to finish the opera. Puccini's son, Tonio, objected to his father's choice, and eventually Franco Alfano was chosen to complete the opera. <a href=\"https://www.kennedy-center.org/education/resources-for-educators/classroom-resources/media-and-interactives/media/opera/rep/20th-century/turandot/\" target=\"_blank\" class=\"text-white/60 hover:text-white\">(source)</a>",
      "Turandot was banned in China for decades until the late 1990s because the government viewed Puccini's portrayal of Chinese culture as problematic as it was enforcing racial stereotypes and misogyny. In 1998, they lifted the ban after reframing the opera by removing some of the problematic pieces and focusing on the spectacle. <a href=\"https://www.operaphila.org/backstage/opera-blog/2016/turandot-time-to-call-it-quits-on-orientalist-opera/\" target=\"_blank\" class=\"text-white/60 hover:text-white\">(source)</a>"
    ]
  },
  {
    id: 9,
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

export default function LMSYMarch2026Page() {
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [bgLoaded, setBgLoaded] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Preload background image
  useEffect(() => {
    const img = new window.Image();
    img.src = "/assets/CCP/Sample_Month/March2026/marchcover.jpg";
    img.onload = () => setBgLoaded(true);
  }, []);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check if already authenticated (stored in sessionStorage)
  useEffect(() => {
    const stored = sessionStorage.getItem("lmsy-march2026-auth");
    if (stored === "true") {
      setIsAuthenticated(true);
      setContentBlurred(false); // No blur animation for returning users
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === PASSWORD) {
      setIsTransitioning(true);
      sessionStorage.setItem("lmsy-march2026-auth", "true");
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
    setCurrentImageIndex(0); // Reset image index when artwork changes
  }, [selectedArtwork]);

  // Rotate through images for artworks with multiple images
  useEffect(() => {
    const artwork = selectedArtwork as any;
    if (artwork.images && artwork.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % artwork.images.length);
      }, 4000); // Change image every 4 seconds
      return () => clearInterval(interval);
    }
  }, [selectedArtwork]);

  // Password Gate
  if (!isAuthenticated) {
    return (
      <div
        className="h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          backgroundImage: bgLoaded ? `url("/assets/CCP/Sample_Month/March2026/marchcover.jpg")` : undefined,
          backgroundColor: "#1E3A5F",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Loading overlay */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-50 transition-opacity duration-1000"
          style={{
            background: "#000000",
            opacity: bgLoaded ? 0 : 1,
            pointerEvents: bgLoaded ? "none" : "auto",
          }}
        >
          <p
            className="text-white/40 text-sm tracking-[0.3em] uppercase mb-3 font-[family-name:var(--font-inter)]"
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          >
            Loading
          </p>
          <h1
            className="text-white text-2xl md:text-3xl font-[family-name:var(--font-abril-fatface)] tracking-wide"
            style={{ animation: "pulse 2s ease-in-out infinite" }}
          >
            LET ME SHOW YOU
          </h1>
          <div className="mt-6 flex gap-1">
            <div className="w-2 h-2 bg-white/60 rounded-full" style={{ animation: "bounce 1s ease-in-out infinite" }} />
            <div className="w-2 h-2 bg-white/60 rounded-full" style={{ animation: "bounce 1s ease-in-out infinite 0.2s" }} />
            <div className="w-2 h-2 bg-white/60 rounded-full" style={{ animation: "bounce 1s ease-in-out infinite 0.4s" }} />
          </div>
        </div>
        <style jsx>{`
          @keyframes bounce {
            0%, 100% { transform: translateY(0); opacity: 0.6; }
            50% { transform: translateY(-8px); opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.7; }
            50% { opacity: 1; }
          }
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
          <h1 className="text-2xl font-bold text-white mb-3 font-[family-name:var(--font-abril-fatface)] text-center">
            LET ME SHOW YOU
          </h1>
          <div
            className="relative mb-5 cursor-pointer group"
            onTouchStart={(e) => {
              const target = e.currentTarget;
              target.classList.add('revealed');
            }}
          >
            {/* Blurred version with pulse */}
            <p
              className="text-lg font-bold text-center font-[family-name:var(--font-inter)] select-none transition-opacity duration-300 opacity-100 group-hover:opacity-0 group-[.revealed]:opacity-0"
              style={{
                animation: "pulseBlur 2s ease-in-out infinite",
                color: "#1E3A5F",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              &ldquo;Beginning to Melt&rdquo;
            </p>
            {/* Clear version on hover */}
            <p
              className="text-lg font-bold text-center font-[family-name:var(--font-inter)] select-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 group-[.revealed]:opacity-100 absolute inset-0"
              style={{
                color: "#1E3A5F",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              &ldquo;Beginning to Melt&rdquo;
            </p>
          </div>
          <p className="text-white/70 text-center mb-6 font-[family-name:var(--font-inter)] font-medium text-sm">
            Enter the password to view this exhibit. If you're a subscriber, find the password in your email. If you're not, become one <a href="/shop/let-me-show-you" className="font-bold underline hover:text-white">here</a>.
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
              className="w-full px-4 py-3 border border-white/30 rounded-xl focus:border-white focus:outline-none font-[family-name:var(--font-inter)] mb-4 text-white placeholder-white/50 bg-white/10 text-sm"
            />
            {passwordError && (
              <p className="text-red-400 text-sm mb-3 font-[family-name:var(--font-inter)]">
                {passwordError}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-white/20 text-white font-bold py-3 rounded-xl hover:bg-white/30 transition-colors font-[family-name:var(--font-inter)] border border-white/30 text-sm"
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
        backgroundImage: `url("/assets/CCP/Sample_Month/March2026/marchcover.jpg")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        animation: "none",
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
                      <h1 className="text-white text-[20px] tracking-tight font-[family-name:var(--font-abril-fatface)]">LET ME SHOW YOU:</h1>
                      <p className="text-black text-[24px] font-bold mt-2 font-[family-name:var(--font-inter)]">&ldquo;Beginning to Melt&rdquo;</p>
                      <p className="text-gray-400 text-base font-medium mt-3 font-[family-name:var(--font-inter)]">March 2026 Theme</p>
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
                              {((artwork as any).image || (artwork as any).images) ? (
                                <Image
                                  src={(artwork as any).images ? (artwork as any).images[0] : (artwork as any).image}
                                  alt={artwork.title}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              ) : (artwork as any).video ? (
                                <>
                                  <Image
                                    src={`https://img.youtube.com/vi/${(artwork as any).video}/hqdefault.jpg`}
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
              <h1 className="text-white text-xl tracking-tight font-[family-name:var(--font-abril-fatface)]">LET ME SHOW YOU:</h1>
              <div className="relative">
                <p className="text-black text-3xl font-bold mt-2 font-[family-name:var(--font-inter)]">&ldquo;Beginning to Melt&rdquo;</p>
              </div>
              <p className="text-gray-800 text-base font-medium mt-3 font-[family-name:var(--font-inter)]">March 2026 Theme</p>
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
                      {((artwork as any).image || (artwork as any).images) ? (
                        <Image
                          src={(artwork as any).images ? (artwork as any).images[0] : (artwork as any).image}
                          alt={artwork.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (artwork as any).video ? (
                        <>
                          <Image
                            src={`https://img.youtube.com/vi/${(artwork as any).video}/hqdefault.jpg`}
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
              <p className="text-white text-[14px] font-[family-name:var(--font-abril-fatface)]">LET ME SHOW YOU:</p>
              <p className="text-black text-[18px] font-bold font-[family-name:var(--font-inter)]">&ldquo;Beginning to Melt&rdquo;</p>
              <p className="text-gray-800 text-xs font-medium mt-1">March 2026 Theme</p>
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
              {((selectedArtwork as any).image || (selectedArtwork as any).images) && !(selectedArtwork as any).quote ? (
                <div className="relative aspect-[4/3] lg:aspect-[16/10] cursor-pointer" onClick={() => setIsExpanded(true)}>
                  {(selectedArtwork as any).images ? (
                    (selectedArtwork as any).images.map((img: string, index: number) => (
                      <motion.div
                        key={img}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={img}
                          alt={selectedArtwork.title}
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </motion.div>
                    ))
                  ) : (
                    <Image
                      src={(selectedArtwork as any).image}
                      alt={selectedArtwork.title}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  )}
                  {/* Expand button */}
                  <button
                    onClick={() => setIsExpanded(true)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/30 backdrop-blur flex items-center justify-center text-white hover:bg-black/50 transition-colors z-10"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                    </svg>
                  </button>
                  {/* Image indicators */}
                  {(selectedArtwork as any).images && (selectedArtwork as any).images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {(selectedArtwork as any).images.map((_: any, index: number) => (
                        <button
                          key={index}
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? "bg-white" : "bg-white/40"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (selectedArtwork as any).video ? (
                <div className="relative aspect-video rounded-xl overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${(selectedArtwork as any).video}?modestbranding=1&rel=0`}
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
              {(selectedArtwork as any).video && (selectedArtwork as any).quote && (
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
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-2 font-semibold font-[family-name:var(--font-inter)]">Curator Notes</p>
                  <p className="text-white text-[15px] md:text-[18px] italic font-[family-name:var(--font-inter)]" dangerouslySetInnerHTML={{ __html: `&ldquo;${selectedArtwork.note}&rdquo;` }} />
                </div>
              )}

              {/* Additional Info */}
              {selectedArtwork.additionalInfo && Array.isArray(selectedArtwork.additionalInfo) && (
                <div
                  className="mt-4 p-3 rounded-xl"
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-2 font-semibold font-[family-name:var(--font-inter)]">Additional Info</p>
                  <ul className="text-white text-[15px] md:text-[18px] space-y-2 font-[family-name:var(--font-inter)]">
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

            <h2 className="text-xl text-white mb-4 font-[family-name:var(--font-abril-fatface)]">
              ABOUT THIS EXHIBIT
            </h2>

            <p className="text-white/90 font-[family-name:var(--font-inter)] text-sm">
              Let Me Show You is a monthly digital art exhibit from Rithika is a Fool! Each month, we pick a theme and invite guests to share art that they love. You can learn more <a href="/shop/let-me-show-you" className="font-bold underline hover:opacity-70">here</a>.
            </p>
            <p className="text-white/90 font-[family-name:var(--font-inter)] text-sm mt-3">
              Check out the full archive of exhibits <a href="/let-me-show-you-archive" className="font-bold underline hover:opacity-70">here</a>.
            </p>
          </div>
        </div>
      )}

      {/* Expanded Image Overlay */}
      <AnimatePresence>
        {isExpanded && ((selectedArtwork as any).image || (selectedArtwork as any).images) && (
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
                src={(selectedArtwork as any).images ? (selectedArtwork as any).images[currentImageIndex] : (selectedArtwork as any).image}
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
