"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const PASSWORD = "Hit-Enter";

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
    title: "Encuentro (Encounter)",
    artist: "Remedios Varo",
    date: "1959",
    medium: "Oil-on-canvas painting",
    image: "/assets/CCP/Sample_Month/Meeting_Varo.jpg",
    curator: "Nina",
    note: "I always get a feeling of loneliness when looking at this piece. To me, it looks like a woman keeping some parts of herself locked up because maybe she's ashamed or afraid to embody them fully. It feels like she's been hiding some parts of herself for a long, long time and has given up on the chance to be fully seen by others and the world.",
    additionalInfo: [
      "Remedios Varo was a Spanish-born surrealist painter who spent a lot of her life in exile because of her political ties. Her experience as a refugee informed a lot of her perspective as an artist.",
      "Varo was an exceptionally well-read researcher, and her scientific knowledge often fed into her work. She would mix science and reality with spirituality and fantasy. <a href=\"https://www.christies.com/en/stories/ten-things-to-know-about-remedios-varo-1bd7c9dd53c74b0a88f1c820a74fbfaf\" target=\"_blank\" class=\"underline text-white/60 hover:text-white\">(source)</a>",
      "Her paintings often depict solitary women in enclosed, interior spaces that suggest the mind or inner life more than the physical world."
    ]
  },
  {
    id: 2,
    title: "Runaway",
    artist: "Kanye West",
    date: "2010",
    medium: "Music",
    video: "dLMFlph54-g",
    curator: "Jin",
    note: "I think this is Kanye's best song of all time. It's so vunerable and self-aware and shameless in a way. He admits that he's an asshole and treats women badly and is begging them to runaway from him. Even though he's mature enough to be self aware, he's not mature enough to change yet. He's being honest about where he is and what he thinks he's capable of and that maybe it's too late for him to change and deserve better.",
    additionalInfo: [
      "The song famously opens with a single repeated piano note. Some think Kanye wanted it to feel simple and vulnerable, almost like someone hesitantly starting a confession.",
      "The song this album is on, My Beautiful Dark Twisted Fantasy, is widely considered one of the best albums of the 2010s and of hip-hop history. It won Best Rap Album of the year at the Grammy's.",
      "The distorted, wordless vocals at the end are Kanye's voice with heavy effects. Some fans think that they're meant to sound emotional but purposely unclear, showing he's in pain and struggling to express it in words."
    ]
  },
  {
    id: 3,
    title: "Right to be here",
    artist: "James Baldwin",
    date: "Around the 1960s",
    medium: "Quote",
    image: "/assets/CCP/Sample_Month/jamesbaldwin.webp",
    quote: "It took many years of vomiting up all the filth I'd been taught about myself, and half-believed, before I was able to walk on the earth as though I had a right to be here.",
    curator: "Lily",
    note: "Oh God, Baldwin is so good. He cuts straight to the bone. This is about shame to me, the painful process of unlearning shame. You have to fight for it, you have to fight to unlearn the bad things that your parents, your teachers, society may have taught you about yourself. I spent so much of my life listening to other people and their opinions of me than myself and what I wanted and what I thought I could be good at. It might feel too late to change but it never is. I urge you to trust yourself.",
    additionalInfo: [
      "Baldwin was a black, queer man who grew up in deep poverty in mid-20th-century America. He grew up surrounded by people telling him he was dangerous and sinful and worthless. This quote reflects him overcoming all the filthy things people made him believe about himself.",
      "During the civil rights movement, Baldwin often helped activists by connecting them with celebrities to give them a platform.",
      "Baldwin was also famous for his laugh. His friends described it as huge and booming."
    ]
  },
  {
    id: 4,
    title: "Glioblastoma (brain cancer)",
    artist: "",
    date: "2025",
    medium: "Medical imaging",
    image: "/assets/CCP/Sample_Month/glioblastoma.webp",
    curator: "Ander",
    note: "I'm 47 and terrified. I just got diagnosed with brain cancer. I have a wife and 3 kids - 2 in middle school and one in elementary school. I just want to live a few more years. I want to see my kids graduate.",
    additionalInfo: [
      `Glioblastoma is the most aggressive type of brain cancer, with a median survival of only 14-16 months after diagnosis. <a href="https://www.gbmresearch.org/blog/glioblastoma-survival-rate" target="_blank" class="underline text-white/60 hover:text-white">(source)</a>`
    ]
  },
  {
    id: 5,
    title: "Twilight",
    artist: "Gregory Crewdson",
    date: "2002",
    medium: "Photography",
    image: "/assets/CCP/Sample_Month/twilight_gregory.webp",
    curator: "Sam",
    note: "This image feels like the exact moment in a sci-fi story where everything changes. Like the main character didn't mean to get chosen, but it's happening anyway. What I like is how normal everything else is - suburban houses, parked cars, power lines. I like the idea that this can happen to anybody. At any moment, your life can completely change. And there could be nothing you can do to stop it.",
    additionalInfo: [
      "Gregory Crewdson is an American photographer known for elaborately staged, cinematic images of American suburban life.",
      "He treats his photographs like film sets. He'll involve crews of dozens, complex lighting rigs, and months of preparation for a single shot.",
      "Even though a lot of his images resemble alien encounters or supernatural events, Crewdson has said they are meant to represent emotional or psychological states, not literal narratives."
    ]
  },
  {
    id: 6,
    title: "Loving",
    artist: "Jane Stembridge",
    date: "1966",
    medium: "Poetry",
    image: "/assets/CCP/Sample_Month/loving_jane.jpg",
    curator: "Cal",
    note: "This reminds me of my first relationship. Everything felt so serious and intense and heavy. I was always doubting whether my partner liked me and replaying conversations to actually enjoy it. I was exhausted all the time. I wish I could go back and be a lot more light in it. I wish I knew that it was going to end and that I would be fine and that I should let myself be free.",
    additionalInfo: [
      "Jane Stembridge was not only a poet but also a civil rights activist and flutist. <a href=\"https://www.womeninpeace.org/s-names/2019/5/13/jane-stembridge\" target=\"_blank\" class=\"underline text-white/60 hover:text-white\">(source)</a>",
      "Jane is remembered for \"spreading poetry as a way to understand and survive the movement's emotional and political challenges.\" <a href=\"https://alicewalkersgarden.com/2021/10/jane-stembrige-sister-southerner-from-georgia-presente/\" target=\"_blank\" class=\"underline text-white/60 hover:text-white\">(source)</a>"
    ]
  },
    {
    id: 7,
    title: "New York Movie",
    artist: "Edward Hopper",
    date: "1939",
    medium: "Oil-on-canvas painting",
    image: "/assets/CCP/Sample_Month/nycmovie.jpg",
    curator: "Robert",
    note: "If I had to guess the story behind this painting, I'd say that the usher, the woman is an aspiring actress who is starting to give up on her dreams. I get the sense she initially got this job for her love of movies, but overtime, she got jaded after getting many rejections. Now, she stands off the side in the same spot night after night. She doesn't watch anymore. The magic is gone.",
    additionalInfo: [
      "Edward Hopper was an American realist painter known for capturing isolation and loneliness in modern American life.",
      "His wife Jo posed for nearly all the female figures in his paintings, including this one.",
      "Hopper often painted figures in windows or doorways, caught between interior and exterior worlds, private and public space."
    ]
  },
  {
    id: 8,
    title: "For what it's worth, it's not too late",
    artist: "David Fincher",
    date: "2008",
    medium: "Film",
    video: "RQUdyJAJoAU",
    quote: "For what it's worth: it's never too late or, in my case, too early to be whoever you want to be. There's no time limit, stop whenever you want. You can change or stay the same, there are no rules to this thing. We can make the best or the worst of it. I hope you make the best of it. And I hope you see things that startle you. I hope you feel things you never felt before. I hope you meet people with a different point of view. I hope you live a life you're proud of. If you find that you're not, I hope you have the courage to start all over again.",
    quoteAttribution: "From Benjamin Button",
    curator: "Cliff",
    note: "I had an optimistic take on the theme. That something can feel too late but it never is. This scene is from the end of the movie where Button is writing a letter to his daughter. It's about holding on to hope that you can always change, no matter how many mistakes you've made. There's something about having kids that makes you want to be so much better. To start all over so that you can give them so much more.",
    additionalInfo: [
      "The movie is based on a 1922 short story by F. Scott Fitzgerald about a man who is born physically old and ages backward.",
      "The film actually had to invent new aging and de-aging visual effects to make it look good. The VFX team developed custom software to realistically map the actor's expressions onto different ages and body types."
    ]
  },
        {
    id: 9,
    title: "Heavyweight: Deborah",
    artist: "Jonathan Goldstein",
    date: "2025",
    medium: "Podcast",
    video: "0omhW3ivKsQ",
    curator: "Sherry",
    note: "This podcast is about a funny, rad 101-year-old woman named Deborah who starts feeling these crazy, intense, romantic feelings for an old boyfriend after finding his photographs. But she can't tell him becauase he died decades ago. It sounds like a wild story, but I found it weirdly relatable. Don't we all get those moments of intensely missing someone from the past sometimes? It's hard to control when or who you feel love towards sometimes. In the podcast, Deborah finds a way to honor him in a very sweet way. Made me think about how I can still honor the people I've loved in my life who aren't in it anymore.",
    additionalInfo: [
      "Heavyweight is a podcast hosted by Jonathan Goldstein that helps people resolve old fights and regrets and feelings that they might have. It's like a mix between investigative journalism and therapy."
    ]
  },
  {
    id: 10,
    title: "Late Fragment",
    artist: "Raymond Carver",
    date: "1989",
    medium: "Poem",
    image: "/assets/CCP/Sample_Month/latefragment_raymond.jpeg",
    curator: "Rithika K.",
    note: "This was the last poem in the last book that Carver ever wrote. He was dying of cancer when he wrote it. It's what's written on his tombstone. You can have such a shitty life (alcoholism, abuse, depression, illness, divorce) and still say you've gotten what you wanted out of life if you felt loved even once. If you felt beloved even once on this Earth, you got the greatest thing you can in life. I read and re-read this poem a lot when my dad was dying of cancer. I felt really useless and hopeless because he was in chronic pain and I couldn't do anything. But I guess the point of this poem is the best, most honorable thing you can do is just to make someone feel loved.",
    additionalInfo: [
      "Raymond Carver wrote this poem after he found about his lung cancer diagnosis. He knew he did not have long. He died shortly after writing it in 1988. It's the final poem in his last collection.",
      "Carver had a tough early life dealing with years of alcholism and divorce and instability but it shifted near the end when he became sober and entered a stable, loving relationship. He seems like he died peacefully."
    ]
  },
];

export default function LMSYSamplePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [contentBlurred, setContentBlurred] = useState(true);
  const [passwordInput, setPasswordInput] = useState("Hit-Enter");
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
    const stored = sessionStorage.getItem("lmsy-sample-auth");
    if (stored === "true") {
      setIsAuthenticated(true);
      setContentBlurred(false); // No blur animation for returning users
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === PASSWORD) {
      setIsTransitioning(true);
      sessionStorage.setItem("lmsy-sample-auth", "true");
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
        className="h-screen w-full flex items-center justify-center p-4 overflow-hidden"
        style={{
          backgroundColor: "#f2f2f2",
        }}
      >
        <style jsx>{`
          @keyframes pulseBlur {
            0%, 100% { filter: blur(3px); }
            50% { filter: blur(10px); }
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
            {/* Blurred yellow/green version with pulse */}
            <p
              className="text-lg font-bold text-center font-[family-name:var(--font-inter)] select-none transition-opacity duration-300 opacity-100 group-hover:opacity-0 group-[.revealed]:opacity-0"
              style={{
                animation: "pulseBlur 2s ease-in-out infinite",
                color: "#e8c05a",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              &ldquo;It Feels Too Late&rdquo;
            </p>
            {/* Clear version on hover */}
            <p
              className="text-lg font-bold text-center font-[family-name:var(--font-inter)] select-none transition-opacity duration-300 opacity-0 group-hover:opacity-100 group-[.revealed]:opacity-100 absolute inset-0"
              style={{
                color: "#e8c05a",
                textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              &ldquo;It Feels Too Late&rdquo;
            </p>
          </div>
          <p className="text-white/70 text-center mb-6 font-[family-name:var(--font-inter)] font-medium text-sm">
            This is a free sample. Enter the password to view this exhibit. If you're a subscriber, find the password in your email. If you're not, become one <a href="/shop/let-me-show-you" className="font-bold underline hover:text-white">here</a>.
          </p>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="text"
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
        backgroundColor: "#f2f2f2",
      }}
    >
      {/* Main Glass Container */}
      <div
        className="w-full max-w-6xl h-[calc(100dvh-1rem)] md:h-[80vh] lg:h-[85vh] rounded-3xl overflow-hidden relative lg:mt-0"
        style={{
          background: "rgba(0, 0, 0, 0.2)",
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
                      <p className="text-white text-[24px] font-bold mt-2 font-[family-name:var(--font-inter)]">&ldquo;It feels too late.&rdquo;</p>
                      <p className="text-gray-400 text-base font-medium mt-3 font-[family-name:var(--font-inter)]">Jan 2026 Theme</p>
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
                <p className="text-white text-3xl font-bold mt-2 font-[family-name:var(--font-inter)]">&ldquo;It feels too late.&rdquo;</p>
              </div>
              <p className="text-gray-800 text-base font-medium mt-3 font-[family-name:var(--font-inter)]">Jan 2026 Theme</p>
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
                            {artwork.quote ? (
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
              <p className="text-white text-[18px] font-bold font-[family-name:var(--font-inter)]">&ldquo;It feels too late.&rdquo;</p>
              <p className="text-gray-800 text-xs font-medium mt-1">Jan 2026 Theme</p>
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
              {selectedArtwork.image && !selectedArtwork.quote ? (
                <div className="relative aspect-[4/3] lg:aspect-[16/10]">
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
              ) : selectedArtwork.quote ? (
                <div
                  className="relative min-h-[300px] lg:min-h-[400px] flex flex-col items-center justify-center p-8 rounded-xl"
                  style={{
                    background: "rgba(0, 0, 0, 0.2)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <p className="text-white/60 text-sm uppercase tracking-wider mb-4 font-semibold font-[family-name:var(--font-inter)]">QUOTE</p>
                  <p className="text-white text-2xl lg:text-3xl leading-relaxed italic text-center max-w-2xl font-[family-name:var(--font-inter)]" style={{ textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)" }}>
                    &ldquo;{selectedArtwork.quote}&rdquo;
                  </p>
                  <p className="text-white/70 mt-4 text-base font-[family-name:var(--font-inter)]">— {selectedArtwork.quoteAttribution || selectedArtwork.artist}</p>
                </div>
              ) : null}

              {/* Artwork Info */}
              <div className="mt-4">
                <h2 className="text-2xl lg:text-3xl font-semibold text-white font-[family-name:var(--font-inter)]">{selectedArtwork.title}</h2>
                {selectedArtwork.artist && (
                  <p className="text-white/60 text-base mt-1 font-[family-name:var(--font-inter)]">
                    Artist: <span className="font-medium">{selectedArtwork.artist}</span>
                  </p>
                )}
                {selectedArtwork.date && (
                  <p className="text-white/60 text-base mt-1 font-[family-name:var(--font-inter)]">
                    Date: <span className="font-medium">{selectedArtwork.date}</span>
                  </p>
                )}
                {selectedArtwork.medium && (
                  <p className="text-white/60 text-base mt-1 font-[family-name:var(--font-inter)]">
                    Medium: <span className="font-medium">{selectedArtwork.medium}</span>
                  </p>
                )}
              </div>

              
              {/* Quote below video if both exist */}
              {selectedArtwork.video && selectedArtwork.quote && (
                <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(255, 255, 255, 0.1)" }}>
                  <p className="text-black/60 text-sm uppercase tracking-wider mb-3 text-center font-semibold font-[family-name:var(--font-inter)]">Transcript From Video</p>
                  <p className="text-black text-base leading-relaxed italic text-center font-medium font-[family-name:var(--font-inter)]">
                    &ldquo;{selectedArtwork.quote}&rdquo;
                  </p>
                  <p className="text-black/70 mt-3 text-sm text-center font-medium font-[family-name:var(--font-inter)]">— {selectedArtwork.quoteAttribution || selectedArtwork.artist}</p>
                </div>
              )}

              {/* Curator Note */}
              {selectedArtwork.note && (
                <div
                  className="mt-4 p-3 rounded-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-2 font-semibold font-[family-name:var(--font-inter)]">Curator Notes</p>
                  <p className="text-white text-[15px] md:text-[18px] italic font-[family-name:var(--font-inter)]">&ldquo;{selectedArtwork.note}&rdquo;</p>
                </div>
              )}

              {/* Additional Info */}
              {selectedArtwork.additionalInfo && Array.isArray(selectedArtwork.additionalInfo) && (
                <div
                  className="mt-4 p-3 rounded-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
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

      {/* Sample Banner - hidden on mobile */}
      <div className="hidden md:block fixed top-4 left-1/2 -translate-x-1/2 bg-black text-white px-5 py-1.5 rounded-full text-xs font-medium z-50">
        This is a free sample.
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
              Let Me Show You is a monthly digital art exhibit from Rithika is a Fool! This is just a sample preview but you can learn more about the full thing <a href="/shop/let-me-show-you" className="font-bold underline hover:opacity-70">here</a>.
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
              className="relative w-full h-full max-w-[95vw] max-h-[95vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedArtwork.image}
                alt={selectedArtwork.title}
                fill
                className="object-contain"
                unoptimized
              />
              {/* Close button */}
              <button
                onClick={() => setIsExpanded(false)}
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
