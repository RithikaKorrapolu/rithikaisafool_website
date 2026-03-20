"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { client, getProductByHandle } from "@/lib/shopify";
import { useCart } from "@/context/CartContext";
import { BouncingBallPoster } from "@/components/BouncingBallPoster";
import SpotifyPlayer from "@/components/SpotifyPlayer";

// Typewriter effect component
function SplitFlapText({ text, className = '', delay = 0, cycleTime = 6000 }: { text: string; className?: string; delay?: number; cycleTime?: number }) {
  const [visibleCount, setVisibleCount] = useState(0); // Start empty
  const [typingComplete, setTypingComplete] = useState(false);

  useEffect(() => {
    let typingInterval: NodeJS.Timeout;
    let completeTimeout: NodeJS.Timeout;

    const runAnimation = () => {
      // Start empty
      setVisibleCount(0);
      setTypingComplete(false);

      // Type out with delay
      setTimeout(() => {
        let count = 0;
        typingInterval = setInterval(() => {
          count++;
          setVisibleCount(count);
          if (count >= text.length) {
            clearInterval(typingInterval);
            // Turn last letter black after a short delay
            completeTimeout = setTimeout(() => {
              setTypingComplete(true);
            }, 100);
          }
        }, 70);
      }, delay);
    };

    // Run initial animation
    runAnimation();

    // Repeat the animation
    const repeatInterval = setInterval(runAnimation, cycleTime);

    return () => {
      clearInterval(repeatInterval);
      clearInterval(typingInterval);
      clearTimeout(completeTimeout);
    };
  }, [text, delay, cycleTime]);

  return (
    <span
      className={`${className}`}
    >
      {text.split('').map((letter, i) => {
        const isVisible = i < visibleCount;
        const isLatest = i === visibleCount - 1 && !typingComplete;
        return (
          <span
            key={i}
            style={{
              color: !isVisible ? 'transparent' : isLatest ? '#F7330C' : 'black',
              transition: 'color 0.1s ease'
            }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </span>
        );
      })}
    </span>
  );
}

const GLORY_IMAGES = [
  "/assets/STIL Cards/14.png",
  "/assets/STIL Cards/15.png",
  "/assets/STIL Cards/16.png",
  "/assets/STIL Cards/17.png",
];

// Define which transitions to use
// 'fade' = slow fade IN, 'flip' = card flip
const GLORY_TRANSITIONS = [
  'flip', // Image 14 (coming from 17): flip
  'fade', // Image 15 (coming from 14): slow fade
  'flip', // Image 16 (coming from 15): flip
  'fade', // Image 17 (coming from 16): slow fade
] as const;

export default function ProductDetailPage() {
  const params = useParams();
  const handle = params.handle as string;
  const { addToCart, openCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [gloryImageIndex, setGloryImageIndex] = useState(0);
  const [ccpLayerIndex, setCcpLayerIndex] = useState(0);
  const [lmsyImageIndex, setLmsyImageIndex] = useState(0); // 0 = animation, 1 = video
  const [selectedSellingPlan, setSelectedSellingPlan] = useState<string | null>(null);
  const [showWaitlistPopup, setShowWaitlistPopup] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');
  const [editionCount, setEditionCount] = useState(9);
  const [slotNumber, setSlotNumber] = useState(1);
  const [slotAnimating, setSlotAnimating] = useState(false);
  const [cotmImageIndex, setCotmImageIndex] = useState(0);
  const [strangerImageIndex, setStrangerImageIndex] = useState(0);
  const [conditionRevealed, setConditionRevealed] = useState(false);
  const [hatsRevealed, setHatsRevealed] = useState(false);
  const [imageRevealed, setImageRevealed] = useState(false);
  const [heartOpen, setHeartOpen] = useState(false);
  const [selectedArchiveEdition, setSelectedArchiveEdition] = useState<number | null>(null);
  const [archivePopupImageSide, setArchivePopupImageSide] = useState<'front' | 'back'>('front');
  const [hoveredArchiveEdition, setHoveredArchiveEdition] = useState<number | null>(null);

  // LMSY Exhibit State
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [lmsyMobileMenuOpen, setLmsyMobileMenuOpen] = useState(false);
  const [showSamplePopup, setShowSamplePopup] = useState(false);
  const [showStickyButtons, setShowStickyButtons] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const mainButtonsRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  // LMSY Artworks Data (same as sample page)
  const LMSY_ARTWORKS = [
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

  // Initialize selectedArtwork when component mounts
  useEffect(() => {
    if (LMSY_ARTWORKS.length > 0 && !selectedArtwork) {
      setSelectedArtwork(LMSY_ARTWORKS[0]);
    }
  }, [selectedArtwork]);

  const COTM_IMAGES = [
    { src: '/assets/COTM/coverreal.png', alt: 'Condition of the Month Hat', style: { transform: 'scale(0.765) translateY(-5%)' }, className: 'object-contain' },
    { src: '/assets/COTM/backhat2.png', alt: 'Condition of the Month Hat Back', style: { transform: 'scale(0.765) translateY(-5%)' }, className: 'object-contain' },
    { src: '/assets/COTM/sidehat.png', alt: 'Condition of the Month Hat Side', style: { transform: 'scale(0.9) translateX(-10%)' }, className: 'object-cover' },
  ];

  // Lock body scroll when any popup is open to prevent mobile address bar jumping
  useEffect(() => {
    const isAnyPopupOpen = showWaitlistPopup || sizeChartOpen || showSamplePopup || selectedArchiveEdition;
    if (isAnyPopupOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('popup-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('popup-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('popup-open');
    };
  }, [showWaitlistPopup, sizeChartOpen, showSamplePopup, selectedArchiveEdition]);

  // Measure header height and set CSS variable for proper spacing
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;

    const setHeaderHeight = () => {
      const h = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    };

    // Set immediately
    setHeaderHeight();

    // Re-measure when fonts finish loading (common cause of layout shift)
    if (document.fonts?.ready) {
      document.fonts.ready.then(setHeaderHeight);
    }

    // Re-measure when header size changes (responsive, cart count, etc.)
    const ro = new ResizeObserver(setHeaderHeight);
    ro.observe(header);

    // Handle orientation change
    window.addEventListener('orientationchange', setHeaderHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', setHeaderHeight);
    };
  }, []);

  // Check if this is the Let Me Show You product
  const isLMSYProduct = product?.title?.toLowerCase().includes('let me show you') ||
                        handle?.toLowerCase().includes('let-me-show-you');

  // Check if this is the Condition of the Month product
  const isCOTMProduct = product?.title?.toLowerCase().includes('condition') ||
                        product?.title?.toLowerCase().includes('month') ||
                        handle?.toLowerCase().includes('condition-of-the-month');

  // Check if this is the Stranger sweatshirt product
  const isStrangerProduct = product?.title?.toLowerCase().includes('stranger');

  // Cycle through glory images for STWL product with custom timing
  useEffect(() => {
    const isCardProduct = product?.title?.toLowerCase().includes('specific things') ||
                          product?.title?.toLowerCase().includes('card') ||
                          product?.title?.toLowerCase().includes('love');
    if (isCardProduct && !product?.title?.toLowerCase().includes('stranger')) {
      // Image 15 (index 1) shows for 4 seconds, Image 17 (index 3) shows for 6 seconds, others show for 2 seconds
      const delay = gloryImageIndex === 3 ? 2500 : gloryImageIndex === 1 ? 1500 : 1000;
      const timeoutId = setTimeout(() => {
        setGloryImageIndex((prev) => (prev + 1) % GLORY_IMAGES.length);
      }, delay);
      return () => clearTimeout(timeoutId);
    }
  }, [product?.title, gloryImageIndex]);

  // CCP animation cycle - simple 5 states
  // State 0: 8+9, State 1: 11+12, State 2: 15+16, State 3: 23+24, State 4: 27+28
  useEffect(() => {
    if (isLMSYProduct) {
      const delay = 2000; // 2 seconds per state
      const timeoutId = setTimeout(() => {
        setCcpLayerIndex((prev) => (prev + 1) % 5);
      }, delay);
      return () => clearTimeout(timeoutId);
    }
  }, [isLMSYProduct, ccpLayerIndex]);

  // Show sticky buttons when main buttons scroll out of view
  useEffect(() => {
    if (!isLMSYProduct && !isCOTMProduct && !isStrangerProduct) return;

    // Small delay to ensure ref is attached after render
    const timeoutId = setTimeout(() => {
      if (!mainButtonsRef.current) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          // Show sticky buttons when main buttons are NOT visible
          setShowStickyButtons(!entry.isIntersecting);
        },
        { threshold: 0, rootMargin: '-50px 0px 0px 0px' }
      );

      observer.observe(mainButtonsRef.current);

      return () => observer.disconnect();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [isLMSYProduct, isCOTMProduct, isStrangerProduct, product]);

  // Hide sticky buttons when footer is visible
  useEffect(() => {
    if (!isLMSYProduct && !isCOTMProduct && !isStrangerProduct) return;

    const handleScroll = () => {
      if (!footerRef.current) return;
      const footerRect = footerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      // Hide buttons when footer is visible in viewport
      setFooterVisible(footerRect.top < windowHeight);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLMSYProduct, product]);

  // Fetch edition count for stranger hoodie
  useEffect(() => {
    if (handle === 'a-stranger-designed-my-sweatshirt') {
      fetch('/api/edition-count')
        .then(res => res.json())
        .then(data => {
          if (data.editionCount) {
            setEditionCount(data.editionCount);
          }
        })
        .catch(err => console.error('Failed to fetch edition count:', err));
    }
  }, [handle]);

  // Slot machine animation for stranger count - loops with pause at edition count
  useEffect(() => {
    if (handle === 'a-stranger-designed-my-sweatshirt' && editionCount > 1) {
      setSlotAnimating(true);
      let current = 1;
      const targetCount = editionCount; // Use actual edition count
      let pauseCount = 0;
      const pauseDuration = 10; // Pause for 10 intervals (1.5 seconds)

      const interval = setInterval(() => {
        if (current >= targetCount) {
          pauseCount++;
          if (pauseCount >= pauseDuration) {
            current = 1; // Reset to 1 after pause
            pauseCount = 0;
            setSlotNumber(current);
          }
          // Stay on target during pause
        } else {
          current++;
          setSlotNumber(current);
        }
      }, 150);
      return () => clearInterval(interval);
    }
  }, [handle, editionCount]);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const foundProduct = await getProductByHandle(handle);
        if (foundProduct) {
          setProduct(foundProduct);
          // Auto-select first available variant
          const firstAvailableIndex = foundProduct.variants.findIndex((v: any) => v.available);
          if (firstAvailableIndex !== -1) {
            setSelectedVariantIndex(firstAvailableIndex);
          }
          // Auto-select subscription for LMSY product
          const isLMSY = foundProduct.title?.toLowerCase().includes('let me show you');
          if (isLMSY && foundProduct.sellingPlanGroups?.length > 0) {
            const firstPlan = foundProduct.sellingPlanGroups[0]?.sellingPlans?.[0];
            if (firstPlan) {
              setSelectedSellingPlan(firstPlan.id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F2F2F2' }}>
        <p className="text-xl text-black font-[family-name:var(--font-abril-fatface)]">Loading...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-16 flex items-center justify-center">
        <p className="text-lg">Product not found</p>
      </div>
    );
  }

  const selectedVariant = product.variants[selectedVariantIndex];
  const basePrice = parseFloat(selectedVariant?.price?.amount || "0.00");
  const isAvailable = selectedVariant?.available ?? false;
  const image = product.images?.[0]?.src;

  // Calculate subscription price if a selling plan is selected
  const getDisplayPrice = () => {
    if (!selectedSellingPlan) return basePrice;

    const selectedPlan = product.sellingPlanGroups
      ?.flatMap((g: any) => g.sellingPlans)
      ?.find((p: any) => p.id === selectedSellingPlan);

    if (!selectedPlan?.priceAdjustments?.[0]?.adjustmentValue) return basePrice;

    const adjustment = selectedPlan.priceAdjustments[0].adjustmentValue;

    // Handle different adjustment types
    if (adjustment.adjustmentPercentage !== undefined) {
      return basePrice * (1 - adjustment.adjustmentPercentage / 100);
    } else if (adjustment.adjustmentAmount?.amount) {
      return basePrice - parseFloat(adjustment.adjustmentAmount.amount);
    } else if (adjustment.price?.amount) {
      return parseFloat(adjustment.price.amount);
    }

    return basePrice;
  };

  const displayPrice = getDisplayPrice();

  const handleAddToCart = () => {
    setInventoryError(null);

    // Override the variant price with the subscription price if applicable
    const priceOverride = selectedSellingPlan ? displayPrice : undefined;

    // Build custom properties
    const customProps: { [key: string]: string } = {};
    if (product.title?.toLowerCase().includes('stranger')) {
      customProps.Size = selectedSize;
    }

    const productWithSelectedVariant = {
      ...product,
      selectedVariantIndex,
      customProperties: Object.keys(customProps).length > 0 ? customProps : undefined,
      // Override variant price for subscriptions
      variants: priceOverride ? product.variants.map((v: any, i: number) =>
        i === selectedVariantIndex ? { ...v, price: { ...v.price, amount: priceOverride.toString() } } : v
      ) : product.variants
    };

    // Get the inventory quantity for the selected variant
    const quantityAvailable = selectedVariant?.quantityAvailable;

    // Get the selling plan info if selected
    const sellingPlanInfo = selectedSellingPlan ? {
      id: selectedSellingPlan,
      name: product.sellingPlanGroups?.flatMap((g: any) => g.sellingPlans)?.find((p: any) => p.id === selectedSellingPlan)?.name || 'Subscription'
    } : null;

    const result = addToCart(productWithSelectedVariant, quantityAvailable, sellingPlanInfo);
    if (result?.error) {
      setInventoryError(result.error);
    } else {
      openCart();
    }
  };

  const handleBuyNow = async () => {
    if (selectedVariant?.id) {
      try {
        // Build attributes
        const attributes: { key: string; value: string }[] = [];
        if (product.title?.toLowerCase().includes('stranger')) {
          attributes.push({ key: 'Size', value: selectedSize });
        }

        // Use GraphQL cart API for all CCP purchases (supports attributes + subscriptions)
        const cartCreateMutation = `
          mutation cartCreate($input: CartInput!) {
            cartCreate(input: $input) {
              cart {
                id
                checkoutUrl
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

        const lineInput: any = {
          merchandiseId: selectedVariant.id,
          quantity: 1,
        };
        if (selectedSellingPlan) {
          lineInput.sellingPlanId = selectedSellingPlan;
        }
        if (attributes.length > 0) {
          lineInput.attributes = attributes;
        }

        const response = await fetch(
          `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
            },
            body: JSON.stringify({
              query: cartCreateMutation,
              variables: {
                input: {
                  lines: [lineInput]
                }
              }
            }),
          }
        );

        const data = await response.json();
        if (data.data?.cartCreate?.cart?.checkoutUrl) {
          window.open(data.data.cartCreate.cart.checkoutUrl, '_blank');
        } else {
          console.error('Cart creation error:', data.data?.cartCreate?.userErrors);
          alert('Unable to process checkout. Please try again.');
        }
      } catch (error) {
        console.error('Error creating checkout:', error);
        alert('Unable to process checkout. Please try again.');
      }
    }
  };

  return (
    <>
    <main className="min-h-screen pb-16" style={{ backgroundColor: '#F2F2F2', paddingTop: 'calc(var(--header-h, 160px) + 20px)' }}>
      <div className="container mx-auto px-6">
        {/* LMSY Full-Width Header */}
        {isLMSYProduct && (
          <div className="mb-6 mt-4 text-center max-w-[58rem] mx-auto">
            <h2 className="text-black text-3xl lg:text-5xl tracking-tight font-[family-name:var(--font-instrument-serif)]">
              <span className="font-[family-name:var(--font-instrument-serif)] italic" style={{ textDecoration: 'underline', textDecorationStyle: 'wavy', textDecorationColor: '#F8330D' }}>Let Me Show You</span> is a monthly digital exhibit where everyday people <span className="font-bold">share art they love</span> and what it <span className="font-bold">means to them.</span>
            </h2>
            <div ref={mainButtonsRef} className="flex flex-col items-center gap-3 mt-6">
              <span className="text-lg text-black font-[family-name:var(--font-inter)] italic">
                4$/monthly subscription
              </span>
              <div className="flex w-full lg:w-auto gap-2 lg:gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 lg:flex-none px-6 py-3 lg:px-14 lg:py-3 text-sm lg:text-base bg-white border-2 border-black text-black font-bold font-[family-name:var(--font-inter)] rounded-full hover:bg-black hover:text-white transition-colors hover-wiggle"
                >
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 lg:flex-none px-6 py-3 lg:px-14 lg:py-3 text-sm lg:text-base bg-[#dcff73] text-black font-bold font-[family-name:var(--font-inter)] rounded-full hover:bg-black hover:text-white transition-colors hover-wiggle"
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LMSY Preview Container */}
        {isLMSYProduct && selectedArtwork && (
          <div className="w-full max-w-5xl mx-auto relative mb-8">
            {/* Preview Container - Full Content */}
            <div
              className="w-full h-[480px] lg:h-[620px] rounded-2xl overflow-hidden relative"
              style={{
                backgroundImage: `url("/assets/CCP/bglmsu.jpg")`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                boxShadow: "0 25px 60px -10px rgba(0, 0, 0, 0.5), 0 10px 30px -5px rgba(0, 0, 0, 0.3)",
              }}
            >
              {/* Free Sample Label - Corner Banner */}
              <div className="absolute top-0 right-0 z-10 overflow-hidden w-72 h-72">
                <div className="absolute top-12 right-[-70px] rotate-45 bg-[#dcff73] text-black text-sm font-normal font-[family-name:var(--font-inter)] uppercase tracking-wider py-3 w-96 text-center shadow-md">
                  &nbsp;&nbsp;&nbsp;Click For <span className="font-black">Free Sample</span>
                </div>
              </div>
              {/* Main Glass Container */}
              <div
                className="w-full h-full rounded-2xl overflow-hidden"
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "0.5px solid rgba(255, 255, 255, 0.3)",
                }}
              >
                <div className="flex flex-col lg:flex-row h-full">
                  {/* Left Sidebar - Desktop only */}
                  <div
                    className="hidden lg:block w-64 p-5 flex-shrink-0 overflow-y-auto"
                    style={{
                      background: "rgba(50, 50, 50, 0.4)",
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <div className="mb-6">
                      <h1 className="text-white text-2xl font-bold font-[family-name:var(--font-instrument-serif)]">LET ME SHOW YOU:</h1>
                      <p className="text-white text-xl font-bold mt-2 font-[family-name:var(--font-inter)]">&ldquo;It feels too late.&rdquo;</p>
                      <p className="text-gray-400 text-sm font-medium mt-2">Sample Theme</p>
                    </div>
                    <div className="border-t border-white/20 pt-4">
                      <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Artworks</p>
                      <div className="space-y-2">
                        {LMSY_ARTWORKS.slice(0, 5).map((artwork) => (
                          <div
                            key={artwork.id}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg ${
                              selectedArtwork.id === artwork.id ? "bg-white/20" : ""
                            }`}
                          >
                            <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                              {artwork.image ? (
                                <Image src={artwork.image} alt={artwork.title} fill className="object-cover" unoptimized />
                              ) : artwork.video ? (
                                <Image src={`https://img.youtube.com/vi/${artwork.video}/hqdefault.jpg`} alt={artwork.title} fill className="object-cover" unoptimized />
                              ) : (
                                <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-sm">&ldquo;</div>
                              )}
                            </div>
                            <span className={`text-sm truncate ${selectedArtwork.id === artwork.id ? "text-white font-medium" : "text-white/70"}`}>
                              {artwork.title}
                            </span>
                          </div>
                        ))}
                        <p className="text-white/40 text-xs mt-2">+ {LMSY_ARTWORKS.length - 5} more...</p>
                      </div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-3 lg:p-4 overflow-hidden">
                    {/* Mobile Header */}
                    <div className="lg:hidden mb-3 pb-2 border-b border-white/20 text-center">
                      <p className="text-white text-2xl font-bold font-[family-name:var(--font-instrument-serif)]">LET ME SHOW YOU:</p>
                      <p className="text-white text-lg font-bold font-[family-name:var(--font-inter)]">&ldquo;It feels too late.&rdquo;</p>
                    </div>
                    {/* Featured Artwork Preview */}
                    <div className="relative">
                      {selectedArtwork.image && !selectedArtwork.quote ? (
                        <div className="relative aspect-[4/3]">
                          <Image
                            src={selectedArtwork.image}
                            alt={selectedArtwork.title}
                            fill
                            className="object-contain rounded-lg"
                            unoptimized
                          />
                        </div>
                      ) : selectedArtwork.video ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-black/30 flex items-center justify-center">
                          <Image
                            src={`https://img.youtube.com/vi/${selectedArtwork.video}/hqdefault.jpg`}
                            alt={selectedArtwork.title}
                            fill
                            className="object-cover opacity-70"
                            unoptimized
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ) : selectedArtwork.quote ? (
                        <div className="min-h-[150px] flex flex-col items-center justify-center p-4 rounded-lg" style={{ background: "rgba(0, 0, 0, 0.2)" }}>
                          <p className="text-white/60 text-xs uppercase tracking-wider mb-2">QUOTE</p>
                          <p className="text-white text-base lg:text-lg italic text-center line-clamp-3">&ldquo;{selectedArtwork.quote}&rdquo;</p>
                        </div>
                      ) : null}

                      {/* Artwork Info */}
                      <div className="mt-2">
                        <h2 className="text-lg lg:text-xl font-semibold text-white">{selectedArtwork.title}</h2>
                        {selectedArtwork.artist && <p className="text-white/60 text-xs mt-0.5">Artist: {selectedArtwork.artist}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Click to expand overlay */}
              <div
                className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.3)" }}
                onClick={() => setShowSamplePopup(true)}
              >
                <div className="bg-white/90 px-4 py-2 rounded-full text-black font-bold font-[family-name:var(--font-inter)] flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                  Click to explore
                </div>
              </div>
            </div>
            <p className="text-lg text-black/60 font-[family-name:var(--font-inter)] mt-2 text-center italic">
              click to explore
            </p>
          </div>
        )}

        {/* LMSY Two Column Section */}
        {isLMSYProduct && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Left Column - Rotating Images */}
            <div className="flex flex-col">
              <div className="relative aspect-square" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <AnimatePresence mode="sync">
                  <motion.img
                    key={ccpLayerIndex}
                    src={`/assets/CCP/${(ccpLayerIndex % 5) + 68}.png`}
                    alt="Let Me Show You"
                    className="absolute w-full h-full object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  />
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column - Text */}
            <div className="flex flex-col justify-center">
              <p className="text-lg lg:text-xl text-black font-[family-name:var(--font-inter)] tracking-tight">
                Every month, we pick a theme and ask different guests to <strong>share something they find beautiful.</strong>
              </p>
              <p className="text-lg lg:text-xl text-black font-[family-name:var(--font-inter)] tracking-tight mt-10">
                Each piece comes with a <span style={{ backgroundColor: '#dcff73' }}>personal note</span> from the guest explaining their experience with it along with some <span style={{ backgroundColor: '#dcff73' }}>artist research</span> from us.
              </p>
            </div>
          </motion.div>
        )}

        {/* LMSY Second Section */}
        {isLMSYProduct && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Video - shows first on mobile, second on desktop */}
            <div className="flex flex-col order-1 lg:order-2">
              <div className="relative aspect-square" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <video
                  src="/assets/CCP/mailRec.mov"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ borderRadius: '16px' }}
                />
              </div>
              <p className="text-sm text-black/60 font-[family-name:var(--font-inter)] mt-2 text-center italic">
                Sample Email Notification
              </p>
            </div>

            {/* Text - shows second on mobile, first on desktop */}
            <div className="flex flex-col justify-center order-2 lg:order-1">
              <p className="text-lg lg:text-xl text-black font-[family-name:var(--font-inter)] tracking-tight">
                The exhibit <strong>unfolds over the course of a month</strong> with new pieces dropping every week. That way, you&apos;re <span style={{ backgroundColor: '#dcff73' }}>discovering new art</span> and <span style={{ backgroundColor: '#dcff73' }}>connecting with someone new</span> every single week.
              </p>
            </div>
          </motion.div>
        )}

        {/* LMSY Third Section */}
        {isLMSYProduct && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Left Column - Video */}
            <div className="flex flex-col">
              <div className="relative aspect-square" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <video
                  src="/assets/CCP/archiveRec.mov"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  style={{ borderRadius: '16px' }}
                />
              </div>
              <p className="text-sm text-black/60 font-[family-name:var(--font-inter)] mt-2 text-center italic">
                Archive of all past exhibits
              </p>
            </div>

            {/* Right Column - Text */}
            <div className="flex flex-col justify-center">
              <p className="text-lg lg:text-xl text-black font-[family-name:var(--font-inter)] tracking-tight">
                Each exhibit has its own custom-designed website (like the <span className="text-[#561DF1] cursor-pointer hover:opacity-70" onClick={() => setShowSamplePopup(true)}>sample</span>) and you&apos;ll receive a private link and password to <strong>access any of the artwork anytime.</strong>
              </p>
              <p className="text-lg lg:text-xl text-black font-[family-name:var(--font-inter)] tracking-tight mt-10 mb-4 italic">
                Subscribers receive:
              </p>
              <ul className="text-lg lg:text-xl text-black font-[family-name:var(--font-inter)] tracking-tight list-disc pl-6 italic">
                <li>Private access to each new exhibit</li>
                <li>Guest reflections and artist research</li>
                <li>A password-protected archive of all past exhibits</li>
                <li>Email notifications for each new drop</li>
              </ul>
            </div>
          </motion.div>
        )}

        {/* LMSY Quote - Dropdown */}
        {isLMSYProduct && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="w-full max-w-[58rem] mx-auto mb-12 mt-16"
          >
            <div className="mb-8 -mx-[50vw] left-1/2 right-1/2 relative w-screen overflow-hidden">
              <svg width="100%" height="12" viewBox="0 0 1200 12" preserveAspectRatio="none">
                <path
                  d="M0,6 Q15,0 30,6 T60,6 T90,6 T120,6 T150,6 T180,6 T210,6 T240,6 T270,6 T300,6 T330,6 T360,6 T390,6 T420,6 T450,6 T480,6 T510,6 T540,6 T570,6 T600,6 T630,6 T660,6 T690,6 T720,6 T750,6 T780,6 T810,6 T840,6 T870,6 T900,6 T930,6 T960,6 T990,6 T1020,6 T1050,6 T1080,6 T1110,6 T1140,6 T1170,6 T1200,6"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="border-2 border-white rounded-xl p-10 md:p-12 bg-white shadow-lg">
              <p className="text-2xl lg:text-4xl text-black font-[family-name:var(--font-inter)] font-bold" style={{ letterSpacing: '-0.08em' }}>
                What was I thinking?
              </p>
              <div className="pb-2">
                <p className="text-base lg:text-lg text-black font-[family-name:var(--font-inter)] tracking-tight mt-4 text-left italic">
                  &ldquo;The role of the artist is exactly the same as the role of the lover. If I love you, I have to make you conscious of the things you don&apos;t see.&rdquo;
                </p>
                <p className="text-base lg:text-lg text-black font-[family-name:var(--font-inter)] tracking-tight mt-2 text-left italic">
                  — James Baldwin
                </p>
                <p className="text-base lg:text-lg text-black font-[family-name:var(--font-inter)] tracking-tight mt-6 text-left">
                  &ldquo;I like the idea that there are a bunch of people helping each other grow in this sort of intimate way, even when they don&apos;t know each other. <span className="font-bold">When someone shares something beautiful and tells you what it means to them, it&apos;s an act of love.</span> Like Baldwin says, it makes us &lsquo;conscious of the things we don&apos;t see&rsquo;. I love the idea of random people doing that for each other.&rdquo;
                </p>
                <p className="text-base lg:text-lg text-black font-[family-name:var(--font-inter)] tracking-tight text-right mt-2">
                  — Rithika
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* COTM Full-Width Header */}
        {isCOTMProduct && (
          <div className="mb-6 mt-4 text-center max-w-[58rem] mx-auto">
            <h2 className="text-black text-4xl lg:text-6xl tracking-tight font-[family-name:var(--font-instrument-serif)]">
              Every month, we feature a new <span className="italic font-bold"><SplitFlapText text="condition" delay={0} cycleTime={4000} /></span> and make <span className="italic font-bold"><SplitFlapText text="merch" delay={1000} cycleTime={4000} /></span> for it.
            </h2>
          </div>
        )}

        {/* COTM Two Column Section - Images + Text */}
        {isCOTMProduct && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 mb-8"
          >
            {/* Left Column - Hat Image */}
            <div className="flex flex-col">
              <div className="relative aspect-square" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <img
                  src={COTM_IMAGES[0].src}
                  alt={COTM_IMAGES[0].alt}
                  className="absolute w-full h-full object-contain"
                  style={{
                    ...COTM_IMAGES[0].style,
                  }}
                />
              </div>
            </div>

            {/* Right Column - Price + Buttons */}
            <div className="flex flex-col justify-start pt-0 lg:pt-24">
              <p className="text-lg lg:text-xl text-black font-[family-name:var(--font-inter)] tracking-tight font-normal mb-2">
                This month&apos;s condition is <span className="italic font-medium text-[1.1em] text-black">tree nut allergy</span> and we made <span className="italic font-medium text-[1.1em] text-black">hats</span>.
              </p>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-xl lg:text-2xl text-black font-[family-name:var(--font-inter)] font-bold">
                  ${displayPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 font-[family-name:var(--font-inter)]">
                  SHIPPING CALCULATED AT CHECKOUT.
                </span>
              </div>
              {/* Buttons */}
              <div ref={mainButtonsRef} className="flex flex-col gap-8">
                <div className="flex w-full gap-2 lg:gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    className="flex-1 py-3 text-sm lg:text-base bg-white border-2 border-black text-black font-bold font-[family-name:var(--font-inter)] rounded-full hover:bg-black hover:text-white transition-colors hover-wiggle disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAvailable ? 'Add to Cart' : 'Sold Out'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!isAvailable}
                    className="flex-1 py-3 text-sm lg:text-base bg-[#dcff73] text-black font-bold font-[family-name:var(--font-inter)] rounded-full hover:bg-black hover:text-white transition-colors hover-wiggle disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              </div>

              {/* Details Accordion */}
              <div className="border-t border-black mt-8">
                <button
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="w-full py-4 flex items-center justify-between text-left font-bold text-black font-[family-name:var(--font-inter)]"
                >
                  <span className="uppercase">DETAILS</span>
                  <motion.span
                    animate={{ rotate: detailsOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    ▼
                  </motion.span>
                </button>
                {detailsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pb-4"
                  >
                    <div className="text-sm text-gray-700 font-[family-name:var(--font-inter)] space-y-2">
                      <p>Low profile hat with an adjustable strap and curved visor.</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>100% chino cotton twill</li>
                        <li>Green Camo color is 35% chino cotton twill, 65% polyester</li>
                        <li>Unstructured, 6-panel, low-profile</li>
                        <li>6 embroidered eyelets</li>
                        <li>3 ⅛&quot; (7.6 cm) crown</li>
                        <li>Adjustable strap with antique buckle</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* COTM Text Section */}
        {isCOTMProduct && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="w-full max-w-3xl mx-auto text-center mb-8"
          >
            <p className="text-lg lg:text-xl text-black font-[family-name:var(--font-inter)] tracking-tight">
              People rep their schools, sport&apos;s teams, favorite bands, cities, etc.
            </p>
            <p className="text-[2.86rem] lg:text-[3.44rem] text-black font-[family-name:var(--font-inter)] mt-2" style={{ letterSpacing: '-0.08em' }}>
              <strong>Why not our conditions?</strong>
            </p>
            <p className="text-lg lg:text-xl text-black font-[family-name:var(--font-inter)] tracking-tight mt-2">
              <span style={{ backgroundColor: '#dcff73' }}>They&apos;re a part of who we are.</span>
            </p>
          </motion.div>
        )}

        {/* COTM Second Section - Two Images Side by Side */}
        {isCOTMProduct && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-8 mb-0 lg:mb-8"
          >
            {/* Left Column - Side Hat Image */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative aspect-square w-full" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <img
                  src={COTM_IMAGES[2].src}
                  alt={COTM_IMAGES[2].alt}
                  className="absolute w-full h-full object-contain"
                  style={COTM_IMAGES[2].style}
                />
              </div>
            </div>

            {/* Right Column - Back Hat Image */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative aspect-square w-full" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <img
                  src={COTM_IMAGES[1].src}
                  alt={COTM_IMAGES[1].alt}
                  className="absolute w-full h-full object-contain"
                  style={COTM_IMAGES[1].style}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* COTM Text Section - Below Images */}
        {isCOTMProduct && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="w-full max-w-3xl mx-auto text-center mb-8"
          >
            <p className="text-lg lg:text-xl text-black font-[family-name:var(--font-inter)] tracking-tight">
              If you wear this merch, you will attract others like you.
            </p>
            <p className="text-[3.44rem] lg:text-[4.12rem] text-black font-[family-name:var(--font-inter)] mt-2" style={{ letterSpacing: '-0.08em' }}>
              And <strong>you will rise.</strong>
            </p>
            <p className="text-base lg:text-lg text-black/70 font-[family-name:var(--font-inter)] tracking-tight mt-4 italic">
              *Makes a great gift for someone special.
            </p>
          </motion.div>
        )}

        {/* COTM Quote - Dropdown */}
        {isCOTMProduct && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="w-full max-w-[58rem] mx-auto mb-12 mt-16"
          >
            <div className="mb-8 -mx-[50vw] left-1/2 right-1/2 relative w-screen overflow-hidden">
              <svg width="100%" height="12" viewBox="0 0 1200 12" preserveAspectRatio="none">
                <path
                  d="M0,6 Q15,0 30,6 T60,6 T90,6 T120,6 T150,6 T180,6 T210,6 T240,6 T270,6 T300,6 T330,6 T360,6 T390,6 T420,6 T450,6 T480,6 T510,6 T540,6 T570,6 T600,6 T630,6 T660,6 T690,6 T720,6 T750,6 T780,6 T810,6 T840,6 T870,6 T900,6 T930,6 T960,6 T990,6 T1020,6 T1050,6 T1080,6 T1110,6 T1140,6 T1170,6 T1200,6"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="border-2 border-white rounded-xl p-10 md:p-12 bg-white shadow-lg">
              <p className="text-2xl lg:text-4xl text-black font-[family-name:var(--font-inter)] font-bold" style={{ letterSpacing: '-0.08em' }}>
                What was I thinking?
              </p>
              <div className="pb-2">
                <p className="text-base lg:text-lg text-black font-[family-name:var(--font-inter)] tracking-tight mt-4 text-left">
                  &ldquo;The concept of merch is powerful because it lets people easily signal their identity and represent what they love. When someone&apos;s wearing &ldquo;<em>Geese</em>&rdquo; (a band I like) or &ldquo;<em>New Jersey</em>&rdquo; (the best state in the US) merch, I feel an automatic connection with them. I like the idea that strangers will connect in a similar way but over their conditions. And maybe have a more interesting, sort of goofy interaction. That&apos;s the goal at least.&rdquo;
                </p>
                <p className="text-base lg:text-lg text-black font-[family-name:var(--font-inter)] tracking-tight text-right mt-2">
                  — Rithika
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stranger Full-Width Header */}
        {isStrangerProduct && (
          <div className="mb-6 mt-4 text-center max-w-[58rem] mx-auto">
            <h2 className="text-black text-4xl lg:text-6xl tracking-tight font-[family-name:var(--font-instrument-serif)] font-bold">
              Can you trust a <span className="italic">stranger</span> to design your sweatshirt?
            </h2>
            <p className="text-black text-3xl lg:text-5xl tracking-tight font-[family-name:var(--font-instrument-serif)] mt-2">
              So far, <span className="inline-block bg-[#dcff73] px-2 py-0.5 rounded font-bold min-w-[2.5rem] text-center">
                <motion.span
                  key={slotNumber}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.1, ease: "easeOut" }}
                  className="inline-block"
                >
                  {slotNumber}
                </motion.span>
              </span> people have.
            </p>
          </div>
        )}

        {/* Stranger Two Column Section - Images + Text */}
        {isStrangerProduct && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
          >
            {/* Left Column - Poster Image */}
            <div className="flex flex-col">
              <div className="relative aspect-square" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <BouncingBallPoster />
              </div>
            </div>

            {/* Right Column - Price + Buttons */}
            <div ref={mainButtonsRef} className="flex flex-col justify-start pt-4 lg:pt-12">
              <p className="text-[1.62rem] lg:text-[1.935rem] text-black font-[family-name:var(--font-inter)] font-normal mb-2" style={{ letterSpacing: '-0.08em' }}>
                Every sweatshirt in this series is <span className="italic" style={{ backgroundColor: '#dcff73' }}>one-of-a-kind</span> designed by the person who bought it before you.
              </p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-xl lg:text-2xl text-black font-[family-name:var(--font-inter)] font-bold">
                  ${displayPrice.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 font-[family-name:var(--font-inter)]">
                  SHIPPING CALCULATED AT CHECKOUT.
                </span>
              </div>

              {/* Sold Out Notice */}
              {!isAvailable && (
                <div className="mb-4">
                  <p className="text-base font-bold text-[#F8330D] mb-3 font-[family-name:var(--font-inter)]">
                    Sold out for the month! We can tell you when it's back.
                  </p>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!waitlistEmail) {
                        setWaitlistError('Please enter your email');
                        return;
                      }
                      if (!waitlistEmail.includes('@') || !waitlistEmail.includes('.')) {
                        setWaitlistError('Please enter a valid email address');
                        return;
                      }
                      setWaitlistSubmitting(true);
                      setWaitlistError('');
                      try {
                        const response = await fetch('/api/klaviyo/subscribe', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            email: waitlistEmail,
                            productName: product.title,
                            productHandle: handle,
                          }),
                        });
                        if (response.ok) {
                          setWaitlistSuccess(true);
                          setWaitlistEmail('');
                        } else {
                          const data = await response.json();
                          setWaitlistError(data.error || 'Something went wrong. Please try again.');
                        }
                      } catch {
                        setWaitlistError('Something went wrong. Please try again.');
                      } finally {
                        setWaitlistSubmitting(false);
                      }
                    }}
                    className="flex gap-2"
                  >
                    {waitlistSuccess ? (
                      <p className="text-black font-bold font-[family-name:var(--font-inter)]">
                        You're on the list.
                      </p>
                    ) : (
                      <>
                        <input
                          type="email"
                          value={waitlistEmail}
                          onChange={(e) => setWaitlistEmail(e.target.value)}
                          placeholder="EMAIL"
                          className="flex-1 px-4 py-2 text-sm text-black border-2 border-black rounded-full font-[family-name:var(--font-inter)] placeholder:text-gray-400 focus:outline-none focus:ring-0"
                        />
                        <button
                          type="submit"
                          disabled={waitlistSubmitting}
                          className="px-4 py-2 bg-[#F7330C] text-white text-sm font-bold rounded-full font-[family-name:var(--font-inter)] hover:bg-black transition-colors disabled:opacity-50 hover-wiggle"
                        >
                          {waitlistSubmitting ? '...' : 'LET ME KNOW'}
                        </button>
                      </>
                    )}
                  </form>
                  {waitlistError && (
                    <p className="text-sm text-red-500 mt-2 font-[family-name:var(--font-inter)]">{waitlistError}</p>
                  )}
                </div>
              )}

              {/* Size Selector */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm font-bold text-black font-[family-name:var(--font-inter)] uppercase">Size</span>
                  <button
                    onClick={() => setSizeChartOpen(true)}
                    className="text-sm font-bold text-black underline hover:text-gray-600 transition-colors font-[family-name:var(--font-inter)]"
                  >
                    Size Chart
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`px-6 py-3 text-sm font-bold transition-all rounded-lg font-[family-name:var(--font-inter)] ${
                        !isAvailable
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : selectedSize === size
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-4">
                <div className="flex w-full gap-2 lg:gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={!isAvailable}
                    className="flex-1 py-3 text-sm lg:text-base bg-white border-2 border-black text-black font-bold font-[family-name:var(--font-inter)] rounded-full hover:bg-black hover:text-white transition-colors hover-wiggle disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAvailable ? 'Add to Cart' : 'Sold Out'}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={!isAvailable}
                    className="flex-1 py-3 text-sm lg:text-base bg-[#dcff73] text-black font-bold font-[family-name:var(--font-inter)] rounded-full hover:bg-black hover:text-white transition-colors hover-wiggle disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAvailable ? 'Buy Now' : 'Sold Out'}
                  </button>
                </div>
              </div>

              {/* Details Accordion */}
              <div className="border-t border-black mt-8">
                <button
                  onClick={() => setDetailsOpen(!detailsOpen)}
                  className="w-full py-4 flex items-center justify-between text-left font-bold text-black font-[family-name:var(--font-inter)]"
                >
                  <span className="uppercase">DETAILS</span>
                  <motion.span
                    animate={{ rotate: detailsOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    ▼
                  </motion.span>
                </button>
                {detailsOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pb-4"
                  >
                    <div className="text-sm text-gray-700 font-[family-name:var(--font-inter)] space-y-2">
                      <p>
                        We buy our base hoodie from <a href="https://www.amazon.com/stores/FAIABLE/page/1F1A104F-AA5E-45F0-9CFC-21F491363633?lp_asin=B0CL4PN7LP&ref_=ast_bln&store_ref=bl_ast_dp_brandLogo_sto" target="_blank" rel="noopener noreferrer" className="underline hover:text-black">FAIABLE</a>:
                      </p>
                      <p><strong>Fit:</strong> Relaxed</p>
                      <p><strong>Care instructions:</strong> Machine Wash</p>
                      <p><strong>Fabric:</strong> Heavy weight, ~10 oz, 42% cotton 53% polyester, cotton fleece inside</p>
                      <p><strong>Construction:</strong> Super soft, pullover hood, drop shoulder, kangaroo pocket, self-fabric lined hood, no drawcord, sleeve cuff ribbing.</p>
                      <p className="mt-4"><strong>DESIGN PROCESS</strong></p>
                      <p>Once you purchase a sweatshirt (woohoo), we&apos;ll start processing and shipping your order AND you&apos;ll get an email to set up a 1 hour design call with me. On that call, we&apos;ll live walk through designing the sweatshirt together. We then take that design, get it printed at a local screenprinting store and ship it to the next buyer.</p>
                    </div>
                  </motion.div>
                )}
              </div>

            </div>
          </motion.div>
        )}

        {/* Stranger Explanation Section - Video + Text */}
        {isStrangerProduct && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
          >
            {/* Left Column - Video */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative aspect-square w-full" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <video
                  src="/assets/glory_sweatshirt.mov"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-500 font-[family-name:var(--font-inter)] mt-2 text-center italic">
                Model is 5&apos;4, wearing a size S, loves to dance, did this for free because she is my friend and knows I cannot afford a real model but I think she&apos;s better anyway. If you want to book her, here&apos;s her <a href="https://linkedin.com/in/glory-kanes-597670104/?lipi=urn%3Ali%3Apage%3Ad_flagship3_feed%3BkLayPpbMSiSNKNlU91Tb7w%3D%3D" target="_blank" rel="noopener noreferrer" className="underline hover:text-black">LinkedIn</a>.
              </p>
            </div>

            {/* Right Column - Text */}
            <div className="flex flex-col justify-center">
              <p className="text-lg lg:text-xl text-black font-[family-name:var(--font-inter)] tracking-tight font-normal">
                Your sweatshirt <span style={{ backgroundColor: '#dcff73' }}>design will be a total mystery</span> until it shows up at your door with a note explaining it all.
              </p>
              <p className="text-lg lg:text-xl text-black font-[family-name:var(--font-inter)] tracking-tight font-normal mt-6">
                When you purchase one, you get a design call with me where you <strong>help design the next one</strong> for the next buyer.
              </p>
            </div>
          </motion.div>
        )}

        {/* Stranger Archive Preview - Full Width */}
        {isStrangerProduct && (() => {
          const archiveEditions = [
            { id: 1, srcFront: '/assets/Sweatshirt/Editions/1a.png', srcBack: '/assets/Sweatshirt/Editions/1b.png', title: 'Edition #01', designer: 'Rithika', description: '"The dream behind this project is to get strangers to collect and share stories with each other. For the first one, I liked the idea of someone on the sweatshirt literally asking for one. I hope it works and the wearer gets to hear a lot of cool stories." - Rithika' },
            { id: 2, srcFront: '/assets/Sweatshirt/Editions/2a.png', srcBack: '/assets/Sweatshirt/Editions/2b.png', title: 'Edition #02', designer: 'Revanth', description: '"I made this sweatshirt as a nod to my Telugu upbringing. I grew up with a loving, teasing extended family and on visits home to India, I would learn the swear words. Dunnapothu is one of my favorites. It literally means male buffalo but it\'s used when someone\'s being stubborn or foolish. Use it well." - Revanth' },
            { id: 3, srcFront: '/assets/Sweatshirt/Editions/3a.png', srcBack: '/assets/Sweatshirt/Editions/3a.png', title: 'Edition #03', designer: 'M', description: '"I remember the first time I saw a peacock I was in India and my jaw dropped at how beautiful it was with its feathers open. It felt like it came from a different world. I wanted the sleeves to represent the feathers of a peacock and for the sweatshirt to represent the animal\'s beauty." - M' },
            { id: 4, srcFront: '/assets/Sweatshirt/Editions/4a.png', srcBack: '/assets/Sweatshirt/Editions/4b.png', title: 'Edition #04', designer: 'Ishaan', description: '"\'The Duality of Man\' is a trope long explored in art; here, it is rendered anew. This piece explores Man as Doll: immaculate and legible from the front, only to be undone by a litany of unsavory truths trailing behind. The garment stages the collapse between how we present and how we are named, between the curated self and the unruly chorus of perception. To wear it is to inhabit that contradiction, and to reckon with the uneasy realization that identity is as much imposed as it is performed." - Ishaan' },
            { id: 5, srcFront: '/assets/Sweatshirt/Editions/5a.png', srcBack: '/assets/Sweatshirt/Editions/5a.png', title: 'Edition #05', designer: 'Pranav', description: '"Apple computers. Lay\'s Chips. Polo Bear (by Ralph Lauren). Every so often, we see art that doesn\'t seek external validation. Instead, it is an expression of what the artist wishes to see in the world; it is their truth. I won\'t claim that this sweatshirt represents my truth. I found it so hard to bring myself to sign the damn thing; is this really - of all the possible messages / themes / ideas / hopes - what I wanted to contribute? I\'m warming up to it. I think Polo is iconic. They\'re just so damn playful with that bear. I don\'t know who I am as an artist, but I know who inspires me - and whether or not this sweatshirt becomes a staple of your wardrobe, I hope it can be a reminder of the people and ideas who you aspire to, too." - Pranav' },
            { id: 6, srcFront: '/assets/Sweatshirt/Editions/6a.png', srcBack: '/assets/Sweatshirt/Editions/6a.png', title: 'Edition #06', designer: 'Jordan', description: '"My intention with this piece was to be a comment on… nay. A dialogue with… nay. A reflection of the sacred masculine spirit." - Jordan' },
            { id: 7, srcFront: '/assets/Sweatshirt/Editions/7a.png', srcBack: '/assets/Sweatshirt/Editions/7b.png', title: 'Edition #07', designer: 'Kasra', description: '"I added a tiger because I love tigers, and I especially like that they represent "graceful strength." they are powerful and self-assured, but they are not belligerent. I thought this particular tiger looked cute, and the mary oliver quote fit it well – about making the most of life, and not shying away from the wildness of it." - Kasra', scale: 1.21 },
          ];
          const selectedEdition = selectedArchiveEdition ? archiveEditions.find(e => e.id === selectedArchiveEdition) : null;
          const selectedHasTwoImages = selectedEdition ? selectedEdition.srcFront !== selectedEdition.srcBack : false;

          return (
            <>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                viewport={{ once: true, amount: 0.05 }}
                className="w-full max-w-5xl mx-auto mb-12"
              >
                <div className="text-center mb-6">
                  <h3 className="text-6xl lg:text-7xl font-bold text-black font-[family-name:var(--font-instrument-serif)]">The Lineage</h3>
                  <p className="text-lg lg:text-xl text-black font-[family-name:var(--font-inter)] tracking-tight font-normal mt-1">There's a story behind every one. Just click.</p>
                  <div className="mt-4 max-w-lg mx-auto" style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))' }}>
                    <iframe
                      style={{ borderRadius: '12px' }}
                      src="https://open.spotify.com/embed/track/5dE8s6uWRGNc1Ac7y8rULq?utm_source=generator&theme=0"
                      width="100%"
                      height="88"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {archiveEditions.map((edition) => {
                    const hasTwoImages = edition.srcFront !== edition.srcBack;
                    const isHovered = hoveredArchiveEdition === edition.id;

                    return (
                      <motion.div
                        key={edition.id}
                        onClick={() => setSelectedArchiveEdition(edition.id)}
                        onMouseEnter={() => setHoveredArchiveEdition(edition.id)}
                        onMouseLeave={() => setHoveredArchiveEdition(null)}
                        className="cursor-pointer"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative aspect-square">
                          <Image
                            src={hasTwoImages && isHovered ? edition.srcBack : edition.srcFront}
                            alt={edition.title}
                            fill
                            className="object-contain transition-opacity duration-300"
                            style={{ transform: (edition as any).scale ? `scale(${(edition as any).scale})` : undefined }}
                          />
                        </div>
                        <p className="text-lg text-center text-black mt-2 font-[family-name:var(--font-inter)] font-medium">
                          {edition.title.replace('Edition ', '')}{edition.designer && ` (${edition.designer})`}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Archive Popup */}
              <AnimatePresence>
                {selectedArchiveEdition && selectedEdition && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed z-[100] flex items-center justify-center p-4 overflow-y-auto"
                    style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: '100dvh' }}
                    onClick={() => setSelectedArchiveEdition(null)}
                  >
                    {/* Dark overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed bg-black/80"
                      style={{ top: 0, left: 0, right: 0, bottom: 0, minHeight: '100dvh' }}
                    />

                    {/* Popup content */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 20 }}
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                      className="relative z-10 bg-white rounded-2xl p-3 md:p-4 max-w-5xl w-[calc(100%-32px)] md:w-full max-h-[65vh] md:max-h-[90vh] overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Close button */}
                      <button
                        onClick={() => setSelectedArchiveEdition(null)}
                        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>

                      {/* Title */}
                      <h2 className="text-xl md:text-3xl font-bold text-black font-[family-name:var(--font-inter)] uppercase mb-4">
                        {selectedEdition.title}{selectedEdition.designer && ` (${selectedEdition.designer})`}
                      </h2>

                      {/* Description */}
                      {selectedEdition.description && (
                        <p className="text-black text-base md:text-2xl font-[family-name:var(--font-inter)] leading-relaxed italic mb-6" style={{ letterSpacing: '-0.04em' }}>
                          {selectedEdition.description}
                        </p>
                      )}

                      {/* Images */}
                      <div className="flex flex-col md:flex-row gap-6">
                        {selectedHasTwoImages ? (
                          <div className="flex flex-col gap-6 w-full md:w-2/3 mx-auto">
                            <div className="relative w-full aspect-square">
                              <Image
                                src={selectedEdition.srcFront}
                                alt={`${selectedEdition.title} Front`}
                                fill
                                className="object-contain"
                              />
                            </div>
                            <div className="relative w-full aspect-square">
                              <Image
                                src={selectedEdition.srcBack}
                                alt={`${selectedEdition.title} Back`}
                                fill
                                className="object-contain"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="relative w-full md:w-2/3 mx-auto aspect-square">
                            <Image
                              src={selectedEdition.srcFront}
                              alt={selectedEdition.title}
                              fill
                              className="object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          );
        })()}


        {/* Stranger Quote - Dropdown */}
        {isStrangerProduct && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.2 }}
              className="w-full max-w-[58rem] mx-auto mb-12 mt-16"
            >
              <div className="mb-8 -mx-[50vw] left-1/2 right-1/2 relative w-screen overflow-hidden">
              <svg width="100%" height="12" viewBox="0 0 1200 12" preserveAspectRatio="none">
                <path
                  d="M0,6 Q15,0 30,6 T60,6 T90,6 T120,6 T150,6 T180,6 T210,6 T240,6 T270,6 T300,6 T330,6 T360,6 T390,6 T420,6 T450,6 T480,6 T510,6 T540,6 T570,6 T600,6 T630,6 T660,6 T690,6 T720,6 T750,6 T780,6 T810,6 T840,6 T870,6 T900,6 T930,6 T960,6 T990,6 T1020,6 T1050,6 T1080,6 T1110,6 T1140,6 T1170,6 T1200,6"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2"
                />
              </svg>
            </div>
              <div className="border-2 border-white rounded-xl p-10 md:p-12 bg-white shadow-lg">
                <p className="text-2xl lg:text-4xl text-black font-[family-name:var(--font-inter)] font-bold" style={{ letterSpacing: '-0.08em' }}>
                  What was I thinking?
                </p>
                <div className="pb-2">
                  <p className="text-base lg:text-lg text-black font-[family-name:var(--font-inter)] tracking-tight mt-4 text-left italic">
                    &ldquo;There are no strangers here; only friends you haven&apos;t yet met.&rdquo;
                  </p>
                  <p className="text-base lg:text-lg text-black font-[family-name:var(--font-inter)] tracking-tight mt-2 text-left italic">
                    — William Butler Yeats
                  </p>
                  <p className="text-base lg:text-lg text-black font-[family-name:var(--font-inter)] tracking-tight mt-6 text-left">
                    &ldquo;Have you ever heard of those stories where people pay for the person behind them in line at a drive-thru or coffee shop and it sets off a chain of people doing it for the next person? I wanted to do a version of that but with art. This is essentially a creative trust exercise. It&apos;s a chain of people giving strangers an opportunity to make art. They don&apos;t know what it&apos;ll look like or if they&apos;ll like it but they pay it forward anyway. And I chose a sweatshirt specifically because I like the idea that <span className="font-bold">each person is helping represent and carry someone else&apos;s story through wearing this piece.</span>&rdquo;
                  </p>
                  <p className="text-base lg:text-lg text-black font-[family-name:var(--font-inter)] tracking-tight text-right mt-2">
                    — Rithika
                  </p>
                </div>
              </div>
          </motion.div>
          </>
        )}

        {/* LMSY Sample Popup */}
        <AnimatePresence>
          {showSamplePopup && selectedArtwork && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
              onClick={() => setShowSamplePopup(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="w-full max-w-5xl h-[80vh] rounded-2xl overflow-hidden relative"
                style={{
                  backgroundImage: `url("/assets/CCP/bglmsu.jpg")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  boxShadow: "0 25px 60px -10px rgba(0, 0, 0, 0.5), 0 10px 30px -5px rgba(0, 0, 0, 0.3)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Button */}
                <button
                  onClick={() => setShowSamplePopup(false)}
                  className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
            {/* Main Glass Container */}
            <div
              className="w-full h-full rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "0.5px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <div className="flex flex-col lg:flex-row h-full">
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setLmsyMobileMenuOpen(true)}
                  className="lg:hidden absolute top-3 left-3 z-40 w-8 h-8 rounded-full text-white flex items-center justify-center"
                  style={{
                    background: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                </button>

                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                  {lmsyMobileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="lg:hidden fixed inset-0 z-50 flex"
                    >
                      <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setLmsyMobileMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "-100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-[85%] max-w-md h-full overflow-y-auto"
                        style={{
                          background: "rgba(50, 50, 50, 0.9)",
                          backdropFilter: "blur(20px)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-6">
                          <button
                            onClick={() => setLmsyMobileMenuOpen(false)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                          </button>
                          <div className="mb-6">
                            <h1 className="text-white text-3xl font-bold font-[family-name:var(--font-instrument-serif)]">LET ME SHOW YOU:</h1>
                            <p className="text-white text-xl font-bold mt-1 font-[family-name:var(--font-inter)]">&ldquo;It feels too late.&rdquo;</p>
                            <p className="text-gray-400 text-sm font-medium mt-2">Sample Theme</p>
                          </div>
                          <div className="border-t border-white/20 pt-4">
                            <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Artworks</p>
                            <div className="space-y-2">
                              {LMSY_ARTWORKS.map((artwork) => (
                                <button
                                  key={artwork.id}
                                  onClick={() => {
                                    setSelectedArtwork(artwork);
                                    setLmsyMobileMenuOpen(false);
                                  }}
                                  className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                                    selectedArtwork.id === artwork.id ? "bg-white/20" : "hover:bg-white/10"
                                  }`}
                                >
                                  <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                                    {artwork.image ? (
                                      <Image src={artwork.image} alt={artwork.title} fill className="object-cover" unoptimized />
                                    ) : artwork.video ? (
                                      <Image src={`https://img.youtube.com/vi/${artwork.video}/hqdefault.jpg`} alt={artwork.title} fill className="object-cover" unoptimized />
                                    ) : (
                                      <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-sm">&ldquo;</div>
                                    )}
                                  </div>
                                  <span className={`text-sm truncate ${selectedArtwork.id === artwork.id ? "text-white font-medium" : "text-white/70"}`}>
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
                  className="hidden lg:block w-64 p-5 flex-shrink-0 overflow-y-auto"
                  style={{
                    background: "rgba(50, 50, 50, 0.4)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <div className="mb-6">
                    <h1 className="text-white text-2xl font-bold font-[family-name:var(--font-instrument-serif)]">LET ME SHOW YOU:</h1>
                    <p className="text-white text-xl font-bold mt-2 font-[family-name:var(--font-inter)]">&ldquo;It feels too late.&rdquo;</p>
                    <p className="text-gray-400 text-sm font-medium mt-2">Sample Theme</p>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Artworks</p>
                    <div className="space-y-2">
                      {LMSY_ARTWORKS.map((artwork) => (
                        <button
                          key={artwork.id}
                          onClick={() => setSelectedArtwork(artwork)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                            selectedArtwork.id === artwork.id ? "bg-white/20" : "hover:bg-white/10"
                          }`}
                        >
                          <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            {artwork.image ? (
                              <Image src={artwork.image} alt={artwork.title} fill className="object-cover" unoptimized />
                            ) : artwork.video ? (
                              <Image src={`https://img.youtube.com/vi/${artwork.video}/hqdefault.jpg`} alt={artwork.title} fill className="object-cover" unoptimized />
                            ) : (
                              <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-sm">&ldquo;</div>
                            )}
                          </div>
                          <span className={`text-sm truncate ${selectedArtwork.id === artwork.id ? "text-white font-medium" : "text-white/70"}`}>
                            {artwork.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 p-3 lg:p-4 overflow-y-auto">
                  {/* Mobile Header */}
                  <div className="lg:hidden mb-3 pb-2 border-b border-white/20 text-center">
                    <p className="text-white text-2xl font-bold font-[family-name:var(--font-instrument-serif)]">LET ME SHOW YOU:</p>
                    <p className="text-white text-lg font-bold font-[family-name:var(--font-inter)]">&ldquo;It feels too late.&rdquo;</p>
                  </div>
                  {/* Featured Artwork */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedArtwork.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="relative"
                    >
                      {selectedArtwork.image && !selectedArtwork.quote ? (
                        <div className="relative aspect-[4/3]">
                          <Image
                            src={selectedArtwork.image}
                            alt={selectedArtwork.title}
                            fill
                            className="object-contain rounded-lg"
                            unoptimized
                          />
                          <button
                            onClick={() => setIsImageExpanded(true)}
                            className="absolute top-2 right-2 w-6 h-6 rounded bg-black/30 backdrop-blur flex items-center justify-center text-white hover:bg-black/50"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                            </svg>
                          </button>
                        </div>
                      ) : selectedArtwork.video ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden">
                          <iframe
                            src={`https://www.youtube.com/embed/${selectedArtwork.video}?modestbranding=1&rel=0`}
                            title={selectedArtwork.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                          />
                        </div>
                      ) : selectedArtwork.quote ? (
                        <div className="min-h-[150px] flex flex-col items-center justify-center p-4 rounded-lg" style={{ background: "rgba(0, 0, 0, 0.2)" }}>
                          <p className="text-white/60 text-xs uppercase tracking-wider mb-2">QUOTE</p>
                          <p className="text-white text-base lg:text-lg italic text-center">&ldquo;{selectedArtwork.quote}&rdquo;</p>
                          <p className="text-white/70 mt-2 text-sm">— {selectedArtwork.artist}</p>
                        </div>
                      ) : null}

                      {/* Artwork Info */}
                      <div className="mt-3">
                        <h2 className="text-xl lg:text-2xl font-semibold text-white">{selectedArtwork.title}</h2>
                        {selectedArtwork.artist && <p className="text-white/60 text-sm mt-1">Artist: {selectedArtwork.artist}</p>}
                        {selectedArtwork.medium && <p className="text-white/60 text-sm">Medium: {selectedArtwork.medium}</p>}
                      </div>

                      {/* Curator Note */}
                      {selectedArtwork.note && (
                        <div className="mt-3 p-3 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.15)" }}>
                          <p className="text-white/60 text-sm uppercase tracking-wider mb-1">Curator Notes</p>
                          <p className="text-white text-base italic">&ldquo;{selectedArtwork.note}&rdquo;</p>
                        </div>
                      )}

                      {/* Additional Info */}
                      {selectedArtwork.additionalInfo && Array.isArray(selectedArtwork.additionalInfo) && (
                        <div className="mt-3 p-3 rounded-lg" style={{ background: "rgba(255, 255, 255, 0.15)" }}>
                          <p className="text-white/60 text-sm uppercase tracking-wider mb-1">Additional Info</p>
                          <ul className="text-white text-base space-y-1">
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
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Expanded Modal for LMSY */}
        <AnimatePresence>
          {isImageExpanded && selectedArtwork?.image && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
              onClick={() => setIsImageExpanded(false)}
            >
              <button
                onClick={() => setIsImageExpanded(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              <div className="relative w-full h-full max-w-5xl max-h-[90vh] m-4">
                <Image
                  src={selectedArtwork.image}
                  alt={selectedArtwork.title}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Non-LMSY/COTM/Stranger Products Grid */}
        {!isLMSYProduct && !isCOTMProduct && !isStrangerProduct && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 lg:gap-12">
          {/* Left: Product Image */}
          <div>
            {/* Stranger Product */}
            {product.title?.toLowerCase().includes('stranger') ? (
              <div className="relative" style={{ width: '85%', margin: '0 auto' }}>
                {/* Mobile Carousel Arrows */}
                <div className="lg:hidden absolute inset-y-0 -left-4 -right-4 flex justify-between items-center pointer-events-none z-20">
                  <button
                    onClick={() => setStrangerImageIndex((prev) => (prev === 0 ? 1 : 0))}
                    className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md pointer-events-auto"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setStrangerImageIndex((prev) => (prev === 0 ? 1 : 0))}
                    className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md pointer-events-auto"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </div>

                {/* Mobile Carousel */}
                <div className="lg:hidden relative aspect-square rounded-lg overflow-hidden">
                  <AnimatePresence mode="wait">
                    {strangerImageIndex === 0 ? (
                      <motion.div
                        key="bouncing-ball"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                      >
                        <BouncingBallPoster showLogo={false} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="glory-video"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full"
                      >
                        <video
                          src="/assets/glory_sweatshirt.mov"
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {/* Sold Out Sticker */}
                  {!isAvailable && (
                    <div className="absolute top-3 right-3 z-10 rotate-6">
                      <div className="relative px-4 py-1.5 bg-[#F8330D]" style={{ borderRadius: '4px' }}>
                        <span className="text-sm font-black text-white font-[family-name:var(--font-inter)] tracking-wide">
                          SOLD OUT
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                {/* Mobile Caption - Only shown when video is displayed */}
                {strangerImageIndex === 1 && (
                  <div className="lg:hidden mt-2 bg-white/90 px-3 py-2 rounded text-xs text-black font-[family-name:var(--font-inter)]">
                    <p>Model is 5&apos;4, wearing a size S, loves to dance, did this for free because she is my friend and knows I cannot afford a real model but I think she&apos;s better anyway. If you want to book her, here&apos;s her <a href="https://linkedin.com/in/glory-kanes-597670104/?lipi=urn%3Ali%3Apage%3Ad_flagship3_feed%3BkLayPpbMSiSNKNlU91Tb7w%3D%3D" target="_blank" rel="noopener noreferrer" className="underline hover:text-black">LinkedIn</a>.</p>
                    <p className="mt-2">Note: This is just a sample base hoodie. Each one will vary in color and design.</p>
                  </div>
                )}

                {/* Desktop - Both Images Stacked */}
                <div className="hidden lg:block">
                  {/* Main image - Bouncing Ball Poster */}
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <BouncingBallPoster showLogo={false} />
                    {/* Sold Out Sticker */}
                    {!isAvailable && (
                      <div className="absolute top-3 right-3 z-10 rotate-6">
                        <div className="relative px-4 py-1.5 bg-[#F8330D]" style={{ borderRadius: '4px' }}>
                          <span className="text-sm font-black text-white font-[family-name:var(--font-inter)] tracking-wide">
                            SOLD OUT
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Glory Sweatshirt Video */}
                  <div className="relative aspect-square mt-4">
                    <video
                      src="/assets/glory_sweatshirt.mov"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                  <div className="mt-2 bg-white/90 px-3 py-2 rounded text-xs text-black font-[family-name:var(--font-inter)]">
                    <p>Model is 5&apos;4, wearing a size S, loves to dance, did this for free because she is my friend and knows I cannot afford a real model but I think she&apos;s better anyway. If you want to book her, here&apos;s her <a href="https://linkedin.com/in/glory-kanes-597670104/?lipi=urn%3Ali%3Apage%3Ad_flagship3_feed%3BkLayPpbMSiSNKNlU91Tb7w%3D%3D" target="_blank" rel="noopener noreferrer" className="underline hover:text-black">LinkedIn</a>.</p>
                    <p className="mt-2">Note: This is just a sample base hoodie. Each one will vary in color and design.</p>
                  </div>
                </div>
              </div>
            ) : (
              /* Other Products - Original Single Image Layout */
              <div className="relative" style={{ width: '85%', margin: '0 auto', maxWidth: '500px' }}>
                {/* COTM Mobile Carousel Arrows */}
                {(product?.title?.toLowerCase().includes('condition') ||
                  product?.title?.toLowerCase().includes('month')) && (
                  <div className="lg:hidden absolute inset-y-0 -left-4 -right-4 flex justify-between items-center pointer-events-none z-20">
                    <button
                      onClick={() => setCotmImageIndex((prev) => (prev === 0 ? COTM_IMAGES.length - 1 : prev - 1))}
                      className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md pointer-events-auto"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setCotmImageIndex((prev) => (prev === COTM_IMAGES.length - 1 ? 0 : prev + 1))}
                      className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md pointer-events-auto"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                  </div>
                )}
                {/* LMSY Carousel Arrows - Mobile Only */}
                {isLMSYProduct && (
                  <div className="lg:hidden absolute inset-y-0 -left-4 -right-4 flex justify-between items-center pointer-events-none z-20">
                    <button
                      onClick={() => setLmsyImageIndex((prev) => (prev === 0 ? 1 : prev - 1))}
                      className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md pointer-events-auto"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => setLmsyImageIndex((prev) => (prev === 1 ? 0 : prev + 1))}
                      className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md pointer-events-auto"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                    </button>
                  </div>
                )}
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  {isLMSYProduct ? (
                    <>
                      {lmsyImageIndex === 0 ? (
                        <div style={{ transform: 'scale(1.15)', transformOrigin: 'center center', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                          {/* Base layer - Image 30 (always visible) */}
                          <Image
                            src="/assets/CCP/30.png"
                            alt="Let Me Show You"
                            fill
                            className="object-contain"
                          />
                          {/* Rotating images 33-37 with crossfade */}
                          <AnimatePresence>
                            <motion.div
                              key={ccpLayerIndex}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.8 }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            >
                              <Image
                                src={`/assets/CCP/${33 + ccpLayerIndex}.png`}
                                alt="Let Me Show You"
                                fill
                                className="object-contain"
                              />
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      ) : (
                        <video
                          src="/assets/CCP/LMSU-sample_.mp4"
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      )}
                    </>
                  ) : (product.title?.toLowerCase().includes('specific things') ||
                       product.title?.toLowerCase().includes('card') ||
                       product.title?.toLowerCase().includes('love')) &&
                      !product.title?.toLowerCase().includes('stranger') ? (
                    <>
                      {GLORY_TRANSITIONS[gloryImageIndex] === 'fade' ? (
                        // Fade transition
                        <>
                          {/* Base layer - show previous image */}
                          <Image
                            src={GLORY_IMAGES[gloryImageIndex === 1 ? 0 : 2]}
                            alt={product.title}
                            fill
                            className="object-contain"
                          />
                          {/* Fade layer on top */}
                          <AnimatePresence>
                            <motion.div
                              key={gloryImageIndex}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 2 }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                            >
                              <Image
                                src={GLORY_IMAGES[gloryImageIndex]}
                                alt={product.title}
                                fill
                                className="object-contain"
                              />
                            </motion.div>
                          </AnimatePresence>
                        </>
                      ) : (
                        // Flip transition
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={gloryImageIndex}
                            initial={{ rotateY: -90, opacity: 0 }}
                            animate={{ rotateY: 0, opacity: 1 }}
                            exit={{ rotateY: 90, opacity: 0 }}
                            transition={{ duration: 0.6 }}
                            style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              transformStyle: 'preserve-3d'
                            }}
                          >
                            <Image
                              src={GLORY_IMAGES[gloryImageIndex]}
                              alt={product.title}
                              fill
                              className="object-contain"
                            />
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </>
                  ) : (product.title?.toLowerCase().includes('condition') ||
                       product.title?.toLowerCase().includes('month')) ? (
                    <>
                      {/* Mobile Carousel */}
                      <div className="lg:hidden w-full h-full">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={cotmImageIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full"
                          >
                            <Image
                              src={COTM_IMAGES[cotmImageIndex].src}
                              alt={COTM_IMAGES[cotmImageIndex].alt}
                              fill
                              className={COTM_IMAGES[cotmImageIndex].className}
                              style={COTM_IMAGES[cotmImageIndex].style}
                            />
                          </motion.div>
                        </AnimatePresence>
                      </div>
                      {/* Desktop - First Image Only */}
                      <div className="hidden lg:block w-full h-full">
                        <Image
                          src="/assets/COTM/coverreal.png"
                          alt={product.title}
                          fill
                          className="object-contain"
                          style={{ transform: 'scale(0.765) translateY(-5%)' }}
                        />
                      </div>
                    </>
                  ) : image ? (
                    <Image
                      src={image}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      No Image
                    </div>
                  )}
                  {/* Sold Out Sticker */}
                  {!isAvailable && (
                    <div className="absolute top-3 right-3 z-10 rotate-6">
                      <div className="relative px-4 py-1.5 bg-[#F8330D]" style={{ borderRadius: '4px' }}>
                        <span className="text-sm font-black text-white font-[family-name:var(--font-inter)] tracking-wide">
                          SOLD OUT
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                                {/* COTM Hat Images - Desktop Only */}
                {(product.title?.toLowerCase().includes('condition') ||
                  product.title?.toLowerCase().includes('month')) && (
                  <div className="hidden lg:block">
                    <div className="relative aspect-square rounded-lg overflow-hidden -mt-16">
                      <Image
                        src="/assets/COTM/backhat.png"
                        alt="Condition of the Month Hat Back"
                        fill
                        className="object-contain"
                        style={{ transform: 'scale(0.765) translateY(-5%)' }}
                      />
                    </div>
                    <div className="relative aspect-square rounded-lg overflow-hidden -mt-16">
                      <Image
                        src="/assets/COTM/sidehat.png"
                        alt="Condition of the Month Hat Side"
                        fill
                        className="object-cover"
                        style={{ transform: 'scale(0.9) translateX(-10%)' }}
                      />
                    </div>
                  </div>
                )}
                                {/* LMSY Video - Desktop Only */}
                {isLMSYProduct && (
                  <div className="hidden lg:block mt-4">
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                      <video
                        src="/assets/CCP/LMSU-sample_.mp4"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col lg:sticky lg:top-40 lg:self-start mt-4 lg:mt-0">
            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-black mb-2 uppercase font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.02em' }}>
              {product.title}
            </h1>
            {/* Price */}
            {isLMSYProduct ? (
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-xl md:text-2xl font-bold text-black font-[family-name:var(--font-inter)]">
                  $4/month subscription
                </span>
              </div>
            ) : (
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-xl md:text-2xl font-bold text-black font-[family-name:var(--font-inter)]">
                  ${displayPrice.toFixed(2)}{selectedSellingPlan ? '/mo' : ''}
                </span>
                {selectedSellingPlan && displayPrice < basePrice && (
                  <span className="text-base md:text-lg text-gray-400 line-through font-[family-name:var(--font-inter)]">
                    ${basePrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xs md:text-sm text-gray-600 font-[family-name:var(--font-inter)]">
                  <Link href="/legal" className="underline hover:text-[#F8330D] transition-colors">SHIPPING</Link> CALCULATED AT CHECKOUT.
                </span>
              </div>
            )}

            {/* Sold Out Notice */}
            {!isAvailable && (
              <div className="mb-4">
                <p className="text-base font-bold text-[#F8330D] mb-3 font-[family-name:var(--font-inter)]">
                  Sold out for the month! We can tell you when it's back.
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!waitlistEmail) {
                      setWaitlistError('Please enter your email');
                      return;
                    }
                    if (!waitlistEmail.includes('@') || !waitlistEmail.includes('.')) {
                      setWaitlistError('Please enter a valid email address');
                      return;
                    }
                    setWaitlistSubmitting(true);
                    setWaitlistError('');
                    try {
                      const response = await fetch('/api/klaviyo/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: waitlistEmail,
                          productName: product.title,
                          productHandle: handle,
                        }),
                      });
                      if (response.ok) {
                        setWaitlistSuccess(true);
                        setWaitlistEmail('');
                      } else {
                        const data = await response.json();
                        setWaitlistError(data.error || 'Something went wrong. Please try again.');
                      }
                    } catch (error) {
                      setWaitlistError('Something went wrong. Please try again.');
                    } finally {
                      setWaitlistSubmitting(false);
                    }
                  }}
                  className="flex flex-col md:flex-row gap-2"
                >
                  <input
                    type="text"
                    value={waitlistEmail}
                    onChange={(e) => { setWaitlistEmail(e.target.value); setWaitlistError(''); }}
                    placeholder="Enter your email"
                    disabled={waitlistSuccess}
                    className="flex-1 px-4 py-2 border-2 border-black rounded-full font-[family-name:var(--font-inter)] focus:border-[#F8330D] focus:outline-none text-black disabled:bg-gray-100"
                  />
                  <button
                    type="submit"
                    disabled={waitlistSubmitting || waitlistSuccess}
                    className={`px-6 py-2 rounded-full font-bold font-[family-name:var(--font-inter)] transition-colors hover-wiggle whitespace-nowrap ${
                      waitlistSuccess ? 'bg-green-500 text-white' : 'bg-[#F8330D] hover:bg-black text-white'
                    }`}
                  >
                    {waitlistSubmitting ? '...' : waitlistSuccess ? "You're in baby!" : "Let me know"}
                  </button>
                </form>
                {waitlistError && (
                  <p className="text-red-500 text-sm mt-2 font-[family-name:var(--font-inter)]">{waitlistError}</p>
                )}
              </div>
            )}

            {/* Details */}
            <div className="mb-6">
              {product.title?.toLowerCase().includes('stranger') ? (
                <div className="space-y-4">
                  {/* Music Player */}
                  <div className="mb-6" style={{ filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))' }}>
                    <iframe
                      style={{ borderRadius: '12px', width: '100%' }}
                      src="https://open.spotify.com/embed/track/5dE8s6uWRGNc1Ac7y8rULq?utm_source=generator&theme=0"
                      height="88"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    ></iframe>
                  </div>
                  <p className="text-base text-black font-[family-name:var(--font-inter)]">
                    <strong>Each of these hoodies are custom-designed by a different person</strong> and you don't get to see it ahead of time. You pick your size but the design is a total mystery until it arrives. After you buy one, you get a design call with me (Rithika) where <strong>you help design the next hoodie for the next stranger.</strong> And so forth!
                  </p>
                  <p className="text-base text-black font-[family-name:var(--font-inter)] mt-4">
                    <span className="bg-[#dcff73] px-1">You can check out the archive <Link href="/shop/stranger-archive" className="font-bold underline hover:opacity-70">here</Link></span>. Note: The archive updates about once a month, so you might not see some of the newest sweatshirts in there yet. If you're curious, we're on <strong>hoodie #{editionCount}</strong> right now. <em>And if you like reading the stories behind people's designs and don't want to miss new drops, you can <button onClick={() => window.dispatchEvent(new CustomEvent('openNewsletterPopup', { detail: { title: 'BREAKING NEWS', description: 'We have a newsletter, you can sign up below :)' } }))} className="font-bold underline hover:opacity-70">sign up for our newsletter</button>.</em>
                  </p>
                </div>
              ) : (product.title?.toLowerCase().includes('specific things') ||
                   product.title?.toLowerCase().includes('card') ||
                   product.title?.toLowerCase().includes('love')) &&
                  !product.title?.toLowerCase().includes('stranger') ? (
                <p className="text-base text-black font-[family-name:var(--font-inter)]">
                  The thing about love is that it's so big, it's like the biggest thing in the world. But it's also really small. Love starts with noticing small, good things about someone until it adds up and becomes something big. This is a card for the small things.
                </p>
              ) : product.title?.toLowerCase().includes('condition') ? (
                <div className="text-base text-black font-[family-name:var(--font-inter)]">
                  <p><strong>Every month, we feature a new condition and make merch for it.</strong></p>
                  <p>People usually wear merch for things that they&apos;re proud of and identify with like their favorite sports teams or what college they went to. Why not our conditions? We must be proud of those too. <strong>If you wear this merch, you will attract others like you. And you will rise.</strong></p>
                  <p className="mt-2 italic">*Makes a great gift for someone special.</p>
                </div>
              ) : isLMSYProduct ? (
                <div>
                  <p className="text-sm text-black font-[family-name:var(--font-inter)] mb-4">
                    Let Me Show You is a <strong>curated digital art exhibit</strong> that unfolds over the course of a month. Each month revolves around a new theme and we <strong>invite guests to share a piece of art that moved them</strong> related to that theme. It might be a painting. A song. A voicemail. A screenshot. A poem. A text from their mom. Whatever they deem as art.
                  </p>
                  <p className="text-sm text-black font-[family-name:var(--font-inter)] mb-4">
                    Each piece comes with an <strong>explanation from the guest explaining why it mattered to them</strong>.
                  </p>
                  <p className="text-sm text-black font-[family-name:var(--font-inter)] mb-4">
                    Each exhibit has its own custom-designed website built for that theme. You&apos;ll receive a private link and password to access it anytime.
                  </p>
                  <p className="text-sm text-black font-[family-name:var(--font-inter)] mb-4">
                    We <strong>drop new pieces over the course of the month</strong> and subscribers will get notified via email whenever we do.
                  </p>
                  <p className="text-sm text-black font-[family-name:var(--font-inter)] mb-4">
                    <strong>Subscribers receive:</strong>
                  </p>
                  <ul className="text-sm text-black font-[family-name:var(--font-inter)] mb-4 list-disc list-inside">
                    <li>Private access to each new exhibit</li>
                    <li>Guest reflections and artist research</li>
                    <li>A password-protected archive of all past exhibits</li>
                    <li>Email notifications for each new drop</li>
                  </ul>
                  <p className="text-sm text-black font-[family-name:var(--font-inter)] mb-4">
                    <span className="bg-[#dcff73] px-1">You can check out a sample <a href="/shop/let-me-show-you-sample" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:opacity-70">here</a>.</span> And the exhibit archive <a href="/let-me-show-you-archive" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:opacity-70">here</a>.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-700 font-[family-name:var(--font-inter)]">
                  {product.description || "No description available."}
                </p>
              )}
            </div>

            {/* Size Selection */}
            {product.title?.toLowerCase().includes('stranger') ? (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <label className="text-sm font-bold text-black uppercase font-[family-name:var(--font-inter)]">
                    SIZE
                  </label>
                  <button
                    onClick={() => setSizeChartOpen(true)}
                    className="text-sm font-bold text-black underline hover:text-gray-600 transition-colors font-[family-name:var(--font-inter)]"
                  >
                    Size Chart
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                    <button
                      key={size}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`px-6 py-3 text-sm font-bold transition-all rounded-lg font-[family-name:var(--font-inter)] ${
                        !isAvailable
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                          : selectedSize === size
                          ? 'bg-black text-white'
                          : 'bg-white text-black hover:bg-black hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            ) : product.variants && product.variants.length > 1 && (
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <label className="text-sm font-bold text-black uppercase font-[family-name:var(--font-inter)]">
                    {(product.title?.toLowerCase().includes('specific things') ||
                      product.title?.toLowerCase().includes('card') ||
                      product.title?.toLowerCase().includes('love')) &&
                     !product.title?.toLowerCase().includes('stranger') ? 'COLOR' : 'SIZE'}
                  </label>
                  {!((product.title?.toLowerCase().includes('specific things') ||
                      product.title?.toLowerCase().includes('card') ||
                      product.title?.toLowerCase().includes('love')) &&
                     !product.title?.toLowerCase().includes('stranger')) && (
                    <button
                      onClick={() => setSizeChartOpen(true)}
                      className="text-sm font-bold text-black underline hover:text-gray-600 transition-colors font-[family-name:var(--font-inter)]"
                    >
                      Size Chart
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant: any, index: number) => {
                    const isVariantAvailable = variant.available;
                    const isSelected = selectedVariantIndex === index;

                    return (
                      <button
                        key={variant.id}
                        onClick={() => {
                          if (isVariantAvailable) {
                            setSelectedVariantIndex(index);
                          }
                        }}
                        disabled={!isVariantAvailable}
                        className={`px-6 py-3 text-sm font-bold transition-all rounded-lg font-[family-name:var(--font-inter)] ${
                          !isVariantAvailable
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-black text-white'
                            : 'bg-white text-black hover:bg-gray-100'
                        }`}
                      >
                        {variant.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Subscription Options - hidden for LMSY */}
            {!isLMSYProduct && product.sellingPlanGroups && product.sellingPlanGroups.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-bold text-black mb-3 block uppercase font-[family-name:var(--font-inter)]">
                  PURCHASE OPTIONS
                </label>
                <div className="space-y-2">
                  {/* One-time purchase option */}
                  <button
                    onClick={() => setSelectedSellingPlan(null)}
                    className={`w-full px-4 py-3 text-left text-sm font-bold transition-all rounded-lg font-[family-name:var(--font-inter)] border-2 ${
                      selectedSellingPlan === null
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    One-time purchase
                  </button>
                  {/* Subscription options */}
                  {product.sellingPlanGroups.map((group: any) =>
                    group.sellingPlans.map((plan: any) => {
                      // Calculate subscription price for this plan
                      const planPrice = (() => {
                        if (!plan.priceAdjustments?.[0]?.adjustmentValue) return basePrice;
                        const adj = plan.priceAdjustments[0].adjustmentValue;
                        if (adj.adjustmentPercentage !== undefined) {
                          return basePrice * (1 - adj.adjustmentPercentage / 100);
                        } else if (adj.adjustmentAmount?.amount) {
                          return basePrice - parseFloat(adj.adjustmentAmount.amount);
                        } else if (adj.price?.amount) {
                          return parseFloat(adj.price.amount);
                        }
                        return basePrice;
                      })();

                      return (
                        <button
                          key={plan.id}
                          onClick={() => setSelectedSellingPlan(selectedSellingPlan === plan.id ? null : plan.id)}
                          className={`w-full px-4 py-3 text-left text-sm font-bold transition-all rounded-lg font-[family-name:var(--font-inter)] border-2 ${
                            selectedSellingPlan === plan.id
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-black border-gray-300 hover:border-black'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{plan.name}</span>
                            <span className="text-xs bg-[#dcff73] text-black px-2 py-1 rounded">
                              SAVE 30% OFF
                            </span>
                          </div>
                          {plan.description && (
                            <p className="text-xs font-normal mt-1 opacity-70">{plan.description}</p>
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Inventory Error Message */}
            {inventoryError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-bold font-[family-name:var(--font-inter)]">
                  {inventoryError}
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mb-3">
              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className={`w-1/2 py-3.5 rounded-full text-[0.8rem] md:text-base font-bold transition-all font-[family-name:var(--font-inter)] border-2 ${
                  !isAvailable
                    ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                    : 'bg-white text-black border-black hover:bg-black hover:text-white hover-wiggle'
                }`}
              >
                ADD TO CART
              </button>

              {/* Buy Now / Subscribe Button OR Join Waitlist */}
              <button
                onClick={isAvailable ? handleBuyNow : undefined}
                disabled={!isAvailable}
                className={`w-1/2 py-3.5 rounded-full text-[0.8rem] md:text-base font-bold transition-all font-[family-name:var(--font-inter)] ${
                  isAvailable
                    ? 'bg-[#dcff73] text-black hover:bg-black hover:text-white hover-wiggle'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {selectedSellingPlan && !isLMSYProduct ? 'SUBSCRIBE NOW' : 'BUY NOW'}
              </button>
            </div>

            {/* More Payment Options */}
            <div className="text-center mb-6">
              <button
                onClick={handleBuyNow}
                disabled={!isAvailable}
                className="text-sm font-bold text-black underline hover:text-gray-600 transition-colors font-[family-name:var(--font-inter)] disabled:cursor-not-allowed"
              >
                MORE PAYMENT OPTIONS
              </button>
            </div>

            {/* Details Accordion */}
            <div className="border-t border-black">
              <button
                onClick={() => setDetailsOpen(!detailsOpen)}
                className="w-full py-4 flex items-center justify-between text-left font-bold text-black font-[family-name:var(--font-inter)]"
              >
                <span className="uppercase">DETAILS</span>
                <motion.span
                  animate={{ rotate: detailsOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  ▼
                </motion.span>
              </button>
              {detailsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="pb-4"
                >
                  {product.title?.toLowerCase().includes('stranger') ? (
                    <div className="text-sm text-gray-700 font-[family-name:var(--font-inter)] space-y-2">
                      <p>
                        We buy our base hoodie from <a href="https://www.amazon.com/stores/FAIABLE/page/1F1A104F-AA5E-45F0-9CFC-21F491363633?lp_asin=B0CL4PN7LP&ref_=ast_bln&store_ref=bl_ast_dp_brandLogo_sto" target="_blank" rel="noopener noreferrer" className="underline hover:text-black">FAIABLE</a>:
                      </p>
                      <p><strong>Fit:</strong> Relaxed</p>
                      <p><strong>Care instructions:</strong> Machine Wash</p>
                      <p><strong>Fabric:</strong> Heavy weight, ~10 oz, 42% cotton 53% polyester, cotton fleece inside</p>
                      <p><strong>Construction:</strong> Super soft, pullover hood, drop shoulder, kangaroo pocket, self-fabric lined hood, no drawcord, sleeve cuff ribbing.</p>
                      <p className="mt-4"><strong>DESIGN PROCESS</strong></p>
                      <p>Once you purchase a sweatshirt (woohoo), we&apos;ll start processing and shipping your order AND you&apos;ll get an email to set up a 1 hour design call with me. On that call, we&apos;ll live walk through designing the sweatshirt together. We then take that design, get it printed at a local screenprinting store and ship it to the next buyer.</p>
                    </div>
                  ) : isLMSYProduct ? (
                    <div className="text-sm text-gray-700 font-[family-name:var(--font-inter)] space-y-2">
                      <p><strong>How It Works</strong></p>
                      <p>With your subscription, you&apos;ll receive an email with the link and password to the current month&apos;s exhibit. You&apos;ll continue to receive email notifications whenever there is a new drop.</p>
                      <p className="mt-4 text-gray-800">If you&apos;ve got special requests for notifications, or purchasing a previous theme, you can email us at <a href="mailto:support@rithikaisafool.com" className="underline hover:text-black">support@rithikaisafool.com</a></p>
                      <p className="mt-4 text-gray-800"><em>Calling all art lovers!</em> If you want to be a contributing guest, email us with one of your favorite pieces of art and why at <a href="mailto:submissions@rithikaisafool.com" className="underline hover:text-black">submissions@rithikaisafool.com</a></p>
                    </div>
                  ) : (product.title?.toLowerCase().includes('condition') ||
                       product.title?.toLowerCase().includes('month')) ? (
                    <div className="text-sm text-gray-700 font-[family-name:var(--font-inter)] space-y-2">
                      <p>Low profile hat with an adjustable strap and curved visor.</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>100% chino cotton twill</li>
                        <li>Green Camo color is 35% chino cotton twill, 65% polyester</li>
                        <li>Unstructured, 6-panel, low-profile</li>
                        <li>6 embroidered eyelets</li>
                        <li>3 ⅛" (7.6 cm) crown</li>
                        <li>Adjustable strap with antique buckle</li>
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 font-[family-name:var(--font-inter)]">
                      {product.description || "No description available."}
                    </p>
                  )}
                </motion.div>
              )}
            </div>

          </div>
        </div>
        )}

      </div>
    </main>


    {/* Waitlist Slide-in Panel */}
    <AnimatePresence>
      {showWaitlistPopup && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 popup-backdrop"
            onClick={() => {
              setShowWaitlistPopup(false);
              setWaitlistSuccess(false);
              setWaitlistError('');
            }}
          />
          {/* Slide-in Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 p-8 flex flex-col justify-center"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setShowWaitlistPopup(false);
                setWaitlistSuccess(false);
                setWaitlistError('');
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {waitlistSuccess ? (
              <>
                <h2 className="text-2xl font-bold mb-4 text-black font-[family-name:var(--font-inter)] uppercase">
                  You&apos;re on the list!
                </h2>
                <p className="text-gray-700 font-[family-name:var(--font-inter)] mb-6">
                  We&apos;ll notify you when this item is back in stock.
                </p>
                <button
                  onClick={() => {
                    setShowWaitlistPopup(false);
                    setWaitlistSuccess(false);
                  }}
                  className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-full transition-colors font-bold font-[family-name:var(--font-inter)]"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2 text-black font-[family-name:var(--font-inter)]">
                  We&apos;ll be back with it soon!
                </h2>
                <p className="text-gray-700 font-[family-name:var(--font-inter)] mb-6">
                  Get notified
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();

                    // Custom email validation
                    if (!waitlistEmail) {
                      setWaitlistError('Please enter your email');
                      return;
                    }
                    if (!waitlistEmail.includes('@') || !waitlistEmail.includes('.')) {
                      setWaitlistError('Please enter a valid email address');
                      return;
                    }

                    setWaitlistSubmitting(true);
                    setWaitlistError('');

                    try {
                      const response = await fetch('/api/klaviyo/subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          email: waitlistEmail,
                          productName: product.title,
                          productHandle: handle,
                        }),
                      });

                      if (response.ok) {
                        setWaitlistSuccess(true);
                        setWaitlistEmail('');
                      } else {
                        const data = await response.json();
                        setWaitlistError(data.error || 'Something went wrong. Please try again.');
                      }
                    } catch (error) {
                      setWaitlistError('Something went wrong. Please try again.');
                    } finally {
                      setWaitlistSubmitting(false);
                    }
                  }}
                >
                  <input
                    type="text"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg mb-4 font-[family-name:var(--font-inter)] focus:border-black focus:outline-none text-black"
                  />
                  {waitlistError && (
                    <p className="text-red-500 text-sm mb-4 font-[family-name:var(--font-inter)]">{waitlistError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={waitlistSubmitting}
                    className="w-full py-3 bg-[#F8330D] hover:bg-black text-white rounded-full transition-colors font-bold font-[family-name:var(--font-inter)] disabled:opacity-50"
                  >
                    {waitlistSubmitting ? 'Submitting...' : 'Notify Me'}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Size Chart Popup */}
    <AnimatePresence>
      {sizeChartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 popup-backdrop"
          onClick={() => setSizeChartOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-4 md:p-8 max-w-4xl mx-4 shadow-2xl relative max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close X Button */}
            <button
              onClick={() => setSizeChartOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <h2 className="text-lg md:text-xl font-bold text-black font-[family-name:var(--font-inter)] mb-4 md:mb-6">
              Size Chart
            </h2>

            <p className="text-sm md:text-base font-semibold text-black font-[family-name:var(--font-inter)] mb-3 md:mb-4">
              US Regular
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm text-black font-[family-name:var(--font-inter)]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold">Brand Size</th>
                    <th className="text-left py-3 px-2 font-semibold">Chest (in)</th>
                    <th className="text-left py-3 px-2 font-semibold">Sleeve Length (in)</th>
                    <th className="text-left py-3 px-2 font-semibold">Shoulder (in)</th>
                    <th className="text-left py-3 px-2 font-semibold">Length (in)</th>
                    <th className="text-left py-3 px-2 font-semibold">Height (in)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-2 font-semibold">S</td>
                    <td className="py-3 px-2">24.4</td>
                    <td className="py-3 px-2">23.6</td>
                    <td className="py-3 px-2">21.9</td>
                    <td className="py-3 px-2">28.7</td>
                    <td className="py-3 px-2">60.6 - 62.2</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-2 font-semibold">M</td>
                    <td className="py-3 px-2">25.2</td>
                    <td className="py-3 px-2">24</td>
                    <td className="py-3 px-2">22.4</td>
                    <td className="py-3 px-2">28.5</td>
                    <td className="py-3 px-2">63 - 65.3</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-2 font-semibold">L</td>
                    <td className="py-3 px-2">26</td>
                    <td className="py-3 px-2">24.4</td>
                    <td className="py-3 px-2">23</td>
                    <td className="py-3 px-2">28.3</td>
                    <td className="py-3 px-2">65.3 - 68.5</td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-3 px-2 font-semibold">XL</td>
                    <td className="py-3 px-2">26.8</td>
                    <td className="py-3 px-2">24.8</td>
                    <td className="py-3 px-2">23.6</td>
                    <td className="py-3 px-2">29.1</td>
                    <td className="py-3 px-2">68.5 - 70.9</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-2 font-semibold">XXL</td>
                    <td className="py-3 px-2">27.6</td>
                    <td className="py-3 px-2">25.2</td>
                    <td className="py-3 px-2">24.2</td>
                    <td className="py-3 px-2">30</td>
                    <td className="py-3 px-2">70.9 - 73.2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Footer */}
    <footer ref={footerRef}>
      <div className="px-6 py-6 md:py-8" style={{ backgroundColor: '#000000', letterSpacing: '-0.08em' }}>
        {/* LMSY Signup Box */}
        {isLMSYProduct && (
          <div className="mb-6 flex justify-center">
            <div className="border border-white/30 rounded-xl p-5 py-6 w-full max-w-5xl">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const firstNameInput = form.elements.namedItem('lmsyFirstName') as HTMLInputElement;
                  const emailInput = form.elements.namedItem('lmsyEmail') as HTMLInputElement;
                  const phoneInput = form.elements.namedItem('lmsyPhone') as HTMLInputElement;
                  const submitBtn = form.querySelector('button[type="submit"]') as HTMLButtonElement;
                  const errorDiv = form.querySelector('.error-message') as HTMLDivElement;
                  const successDiv = form.querySelector('.success-message') as HTMLDivElement;
                  const formContent = form.querySelector('.form-content') as HTMLDivElement;

                  if (!emailInput.value && !phoneInput.value) {
                    if (errorDiv) errorDiv.textContent = 'Please enter an email or phone number';
                    return;
                  }

                  submitBtn.disabled = true;
                  submitBtn.textContent = 'Joining...';
                  if (errorDiv) errorDiv.textContent = '';

                  try {
                    const response = await fetch('/api/subscribe', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        firstName: firstNameInput.value,
                        email: emailInput.value,
                        phone: phoneInput.value,
                      }),
                    });

                    if (response.ok) {
                      if (successDiv && formContent) {
                        successDiv.style.display = 'flex';
                        formContent.style.display = 'none';
                      }
                    }
                  } catch (error) {
                    console.error('Subscription error:', error);
                  } finally {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Join';
                  }
                }}
              >
                <div className="form-content">
                  <p className="error-message text-red-500 text-sm mb-2"></p>
                  {/* Desktop: Title centered above inputs */}
                  <div className="hidden md:flex flex-col gap-4">
                    <span className="text-white font-semibold text-2xl text-left font-[family-name:var(--font-inter)] -mt-1">For cool, secret things</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        name="lmsyFirstName"
                        placeholder="First name"
                        className="min-w-0 flex-1 px-3 py-2 border border-white outline-none text-white placeholder:text-white/50 text-sm rounded-full bg-transparent"
                      />
                      <input
                        type="email"
                        name="lmsyEmail"
                        placeholder="Email"
                        className="min-w-0 flex-1 px-3 py-2 border border-white outline-none text-white placeholder:text-white/50 text-sm rounded-full bg-transparent"
                      />
                      <div className="flex items-center px-3 py-2 border border-white rounded-full bg-transparent shrink-0">
                        <span className="mr-1 text-sm">🇺🇸</span>
                        <span className="text-white text-sm mr-1">+1</span>
                        <input
                          type="tel"
                          name="lmsyPhone"
                          placeholder="Phone"
                          className="w-20 text-white placeholder:text-white/50 text-sm focus:outline-none bg-transparent"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#dcff73] text-black font-bold hover:bg-white transition-colors text-sm rounded-full whitespace-nowrap shrink-0"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                  {/* Mobile: Stacked layout */}
                  <div className="flex flex-col gap-2 md:hidden">
                    <span className="text-white font-semibold text-xl text-left font-[family-name:var(--font-inter)] mb-2">For cool, secret things</span>
                    <input
                      type="text"
                      name="lmsyFirstName"
                      placeholder="First name"
                      className="w-full px-4 py-3 border border-white outline-none text-white placeholder:text-white/50 text-sm rounded-full bg-transparent"
                    />
                    <input
                      type="email"
                      name="lmsyEmail"
                      placeholder="Email"
                      className="w-full px-4 py-3 border border-white outline-none text-white placeholder:text-white/50 text-sm rounded-full bg-transparent"
                    />
                    <div className="flex items-center px-4 py-3 border border-white rounded-full bg-transparent">
                      <span className="mr-1 text-sm">🇺🇸</span>
                      <span className="text-white text-sm mr-1">+1</span>
                      <input
                        type="tel"
                        name="lmsyPhone"
                        placeholder="Phone (optional)"
                        className="flex-1 text-white placeholder:text-white/50 text-sm focus:outline-none bg-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#dcff73] text-black font-bold hover:bg-white transition-colors text-sm rounded-full"
                    >
                      Join
                    </button>
                  </div>
                </div>

                <div className="success-message hidden items-center justify-center py-2">
                  <p className="text-[#561DF1] font-bold text-lg">Thank you! You're now part of the world.</p>
                </div>
              </form>
            </div>
          </div>
        )}

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
        {/* Desktop layout */}
        <div className="hidden md:block relative">
          <div className="container mx-auto flex justify-between items-center">
            <p className="text-white text-base font-normal font-[family-name:var(--font-inter)]">© Rithika is a Fool 2026</p>
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

    {/* LMSY Sticky Floating Buttons */}
    <AnimatePresence>
      {isLMSYProduct && showStickyButtons && !footerVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 flex flex-row lg:flex-col gap-2 lg:gap-3"
        >
          <button
            onClick={handleAddToCart}
            className="px-6 py-2 lg:px-10 lg:py-3 text-sm lg:text-base bg-white border-2 border-black text-black font-bold font-[family-name:var(--font-inter)] rounded-full hover:bg-black hover:text-white transition-colors hover-wiggle shadow-lg"
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            className="px-6 py-2 lg:px-10 lg:py-3 text-sm lg:text-base bg-[#dcff73] text-black font-bold font-[family-name:var(--font-inter)] rounded-full hover:bg-black hover:text-white transition-colors hover-wiggle shadow-lg"
          >
            Buy Now
          </button>
        </motion.div>
      )}
    </AnimatePresence>

    {/* COTM Sticky Floating Buttons */}
    <AnimatePresence>
      {isCOTMProduct && showStickyButtons && !footerVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 flex flex-row lg:flex-col gap-2 lg:gap-3"
        >
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className="px-6 py-2 lg:px-10 lg:py-3 text-sm lg:text-base bg-white border-2 border-black text-black font-bold font-[family-name:var(--font-inter)] rounded-full hover:bg-black hover:text-white transition-colors hover-wiggle shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAvailable ? 'Add to Cart' : 'Sold Out'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!isAvailable}
            className="px-6 py-2 lg:px-10 lg:py-3 text-sm lg:text-base bg-[#dcff73] text-black font-bold font-[family-name:var(--font-inter)] rounded-full hover:bg-black hover:text-white transition-colors hover-wiggle shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buy Now
          </button>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Stranger Sticky Floating Buttons */}
    <AnimatePresence>
      {isStrangerProduct && showStickyButtons && !footerVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 flex flex-row lg:flex-col gap-2 lg:gap-3"
        >
          <button
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className="px-6 py-2 lg:px-10 lg:py-3 text-sm lg:text-base bg-white border-2 border-black text-black font-bold font-[family-name:var(--font-inter)] rounded-full hover:bg-black hover:text-white transition-colors hover-wiggle shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAvailable ? 'Add to Cart' : 'Sold Out'}
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!isAvailable}
            className="px-6 py-2 lg:px-10 lg:py-3 text-sm lg:text-base bg-[#dcff73] text-black font-bold font-[family-name:var(--font-inter)] rounded-full hover:bg-black hover:text-white transition-colors hover-wiggle shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Buy Now
          </button>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
