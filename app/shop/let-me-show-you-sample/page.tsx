"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

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
    note: "I always get a feeling of loneliness when looking at this piece. To me, it looks like a woman keeping some parts of herself locked up because maybe she's ashamed or afraid to embody them fully. It feels like she's comfortable doing this and has given up on the chance to be fully seen by others and the world.",
    additionalInfo: [
      "Remedios Varo was a Spanish-born surrealist painter who spent much of her life in exile, eventually settling in Mexico after fleeing Europe during World War II.",
      "Her paintings often depict solitary women in enclosed, interior spaces that suggest the mind or inner life more than the physical world.",
      "She was strongly influenced by mysticism, alchemy, and Jungian psychology, shaping her recurring themes of transformation and hidden selves."
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
    note: "This song is Kanye realizing his own toxicity and how much he's hurt others. The piano sounds lonely and dramatic, and the whole song feels heavy. In it, he's asking people he loves to run away from him. Maybe he feels like it's too late or too hard to change. He sounds resigned.",
    additionalInfo: [
      "The song sits in the middle of the album, My Beautiful Dark Twisted Fantasy, which many fans see as Kanye confronting both his genius and his self-sabotage at the same time.",
      "Unlike most rap songs about ego, Runaway is about self-awareness without redemption. Kanye doesn't promise growth, change, or healing. He just admits the damage is real.",
      "The distorted, wordless vocal outro at the end is Kanye's voice run through heavy effects, meant to sound emotional but not clear to express how he's feeling pain but doesn't know how to articulate it properly."
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
    note: "Oh God, Baldwin is so good. He cuts straight to the bone. This is about shame to me, the painful process of unlearning shame. You have to fight for it, you have to fight to unlearn the bad things that your parents, your teachers, society may have taught you about yourself. I spent so much of my life listening to other people and their opinions of me than myself and what I wanted and what I thought I could be good at. I wished I realized it earlier but I'm glad I can now exist fully in the world.",
    additionalInfo: [
      "As a Black, queer man in mid-20th-century America, Baldwin grew up surrounded by messages telling him he was dangerous, sinful, or disposable. This quote reflects years of internal conflict.",
      "Baldwin left the United States for France in his twenties partly to survive emotionally. Distance gave him the space to reflect and write about his experiences in America."
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
      "Glioblastoma is the most aggressive type of brain cancer, with a median survival of 14-16 months after diagnosis."
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
    note: "This image feels like the exact moment in a sci-fi story where everything changes. Like the main character didn't mean to get chosen, but it's happening anyway. What I like is how normal everything else is - suburban houses, parked cars, power lines. I like the idea that this can happen to anybody. At any moment, your life can completely change.",
    additionalInfo: [
      "Gregory Crewdson is an American photographer known for elaborately staged, cinematic images of American suburban life.",
      "His photographs are produced like film sets, involving crews of dozens, complex lighting rigs, and months of preparation for a single shot.",
      "Although a lot of his images resemble alien encounters or supernatural events, Crewdson has said they are meant to represent emotional or psychological states, not literal narratives."
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
    note: "This reminds me of my first relationship. Everything felt so serious and intense and heavy. I was always doubting whether my partner liked me and replaying conversations. I was exhausted all the time. I wish I could go back and be a lot more light in it. I wish I knew that it was going to end and that I would be fine.",
    additionalInfo: [
      "Jane Stembridge was a British poet whose work often focused on intimate relationships, memory, and emotional hindsight, especially how love feels once it's already over."
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
    note: "If I had to guess the story behind this painting, I'd say that the usher was an aspiring actress who has just decided to give up on her dreams to pursue something more sensible. Maybe she initially got this job for her love of movies, but overtime, she lost it standing in the same spot night after night. The magic is gone.",
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
    note: "I had an optimistic take on the theme. That something can feel too late but it never is. This scene is from the end of the movie where Button is writing a letter to his daughter. It's about holding on to hope that you can always change, no matter how many mistakes you've made.",
    additionalInfo: [
      "The Curious Case of Benjamin Button was released in 2008 and directed by David Fincher, loosely based on a 1922 short story by F. Scott Fitzgerald.",
      "The story follows a man who is born physically old and ages backward, exploring themes of time, love, memory, and mortality.",
      "It received 13 Academy Award nominations, winning 3 Oscars (Best Art Direction, Best Makeup, and Best Visual Effects)."
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
    note: "This podcast is about a funny, rad 101-year-old woman named Deborah who suddenly feels a rush of intense, romantic feelings for someone decades after his death. It sounds like a wild story, but I found it weirdly relatable. Don't we all get those moments of intensely missing someone sometimes? It's hard to control when or who you feel love towards sometimes. In the podcast, Deborah doesn't get a chance to tell him because he's passed but she honors him in a very sweet way. Made me think about how I can honor the people who've passed in my life.",
    additionalInfo: [
      "Heavyweight is a podcast hosted by Jonathan Goldstein that helps people resolve long-held regrets and revisit moments from their past.",
      "The episode explores how memory and emotion can resurface unexpectedly, regardless of age or the passage of time."
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
    note: "This was the last poem in the last book that Carver ever wrote. He was dying of cancer when he wrote it. It's what's written on his tombstone. You can have such a shitty life (alcoholism, abuse, depression, illness, divorce) and still say you've gotten what you wanted out of life if you felt loved even once. If you felt beloved even once on this Earth, you got the greatest thing you can in life.",
    additionalInfo: [
      "Raymond Carver was an American short story writer and poet, considered one of the most influential writers of the 20th century.",
      "He wrote 'Late Fragment' shortly before his death from lung cancer in 1988, and it serves as the final poem in his last collection.",
      "The poem reflects a major shift in Carver's life: after years of alcoholism and instability, he found sobriety and a stable, loving relationship late in life."
    ]
  },
];

export default function LMSYSamplePage() {
  const [selectedArtwork, setSelectedArtwork] = useState(ARTWORKS[0]);
  const [showInfoPopup, setShowInfoPopup] = useState(false);
  const [themeRevealed, setThemeRevealed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Capture scroll events on the page and redirect to main content (except when over sidebar or mobile menu)
  useEffect(() => {
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
  }, [mobileMenuOpen]);

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
        className="w-full max-w-6xl h-[80vh] lg:h-[85vh] rounded-3xl overflow-hidden relative mt-12 lg:mt-0"
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "0.5px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
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
                className="lg:hidden fixed inset-0 bg-black/50 z-50"
                onClick={() => setMobileMenuOpen(false)}
                onTouchMove={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="w-[70%] max-w-sm h-full"
                  style={{
                    background: "rgba(50, 50, 50, 0.95)",
                    backdropFilter: "blur(20px)",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    className="p-6 h-full overflow-y-scroll overscroll-contain"
                    style={{
                      WebkitOverflowScrolling: 'touch',
                    }}
                    onTouchMove={(e) => e.stopPropagation()}
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
                      <h1 className="text-white/60 text-xl tracking-tight font-[family-name:var(--font-abril-fatface)]">LET ME SHOW YOU:</h1>
                      <p className="text-white text-2xl font-bold mt-2">&ldquo;It feels too late.&rdquo;</p>
                      <p className="text-gray-400 text-base font-medium mt-3">Feb 2026 Theme</p>
                    </div>

                    {/* Artwork List */}
                    <div className="border-t border-white/20 pt-4">
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Artworks</p>
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
                <p className="text-white text-3xl font-bold mt-2">&ldquo;It feels too late.&rdquo;</p>
              </div>
              <p className="text-gray-800 text-base font-medium mt-3">Feb 2026 Theme</p>
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
          <div ref={mainContentRef} className="flex-1 p-4 pt-2 lg:p-8 overflow-y-auto glass-scrollbar">
            {/* Mobile Header */}
            <div className="lg:hidden mb-4 pb-3 border-b border-white/20 text-center">
              <p className="text-white/60 text-sm font-[family-name:var(--font-abril-fatface)]">LET ME SHOW YOU:</p>
              <p className="text-white text-lg font-bold">&ldquo;It feels too late.&rdquo;</p>
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
                <div className="relative min-h-[300px] lg:min-h-[400px] flex flex-col items-center justify-center p-8">
                  <p className="text-black/60 text-sm uppercase tracking-wider mb-4">Transcript</p>
                  <p className="text-black text-2xl lg:text-3xl leading-relaxed italic text-center max-w-2xl" style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}>
                    &ldquo;{selectedArtwork.quote}&rdquo;
                  </p>
                  <p className="text-black/70 mt-4 text-base">— {selectedArtwork.quoteAttribution || selectedArtwork.artist}</p>
                </div>
              ) : null}

              {/* Artwork Info */}
              <div className="mt-4">
                <h2 className="text-2xl lg:text-3xl font-semibold text-white">{selectedArtwork.title}</h2>
                {selectedArtwork.artist && (
                  <p className="text-white/60 text-base mt-1">
                    Artist: <span className="font-medium">{selectedArtwork.artist}</span>
                  </p>
                )}
                {selectedArtwork.date && (
                  <p className="text-white/60 text-base mt-1">
                    Date: <span className="font-medium">{selectedArtwork.date}</span>
                  </p>
                )}
                {selectedArtwork.medium && (
                  <p className="text-white/60 text-base mt-1">
                    Medium: <span className="font-medium">{selectedArtwork.medium}</span>
                  </p>
                )}
              </div>

              
              {/* Quote below video if both exist */}
              {selectedArtwork.video && selectedArtwork.quote && (
                <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(255, 255, 255, 0.1)" }}>
                  <p className="text-black/60 text-sm uppercase tracking-wider mb-3 text-center font-semibold">Transcript From Video</p>
                  <p className="text-black text-base leading-relaxed italic text-center font-medium">
                    &ldquo;{selectedArtwork.quote}&rdquo;
                  </p>
                  <p className="text-black/70 mt-3 text-sm text-center font-medium">— {selectedArtwork.quoteAttribution || selectedArtwork.artist}</p>
                </div>
              )}

              {/* Curator Note */}
              {selectedArtwork.note && (
                <div
                  className="mt-4 p-4 rounded-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <p className="text-white/60 text-sm uppercase tracking-wider mb-2 font-semibold">Curator Notes</p>
                  <p className="text-white text-xl italic">&ldquo;{selectedArtwork.note}&rdquo;</p>
                  <p className="text-white text-base mt-2 text-right">— {selectedArtwork.curator}</p>
                </div>
              )}

              {/* Additional Info */}
              {selectedArtwork.additionalInfo && Array.isArray(selectedArtwork.additionalInfo) && (
                <div
                  className="mt-4 p-4 rounded-xl"
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <p className="text-white/60 text-sm uppercase tracking-wider mb-2 font-semibold">Additional Info</p>
                  <ul className="text-white text-lg space-y-2">
                    {selectedArtwork.additionalInfo.map((info: string, index: number) => (
                      <li key={index} className="flex">
                        <span className="mr-2">•</span>
                        <span>{info}</span>
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
            className="max-w-xl w-full rounded-2xl p-8 relative"
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

            <p className="text-gray-700">
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
