"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { client, getProductByHandle } from "@/lib/shopify";
import { useCart } from "@/context/CartContext";
import { BouncingBallPoster } from "@/components/BouncingBallPoster";
import SpotifyPlayer from "@/components/SpotifyPlayer";

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
  const [selectedSellingPlan, setSelectedSellingPlan] = useState<string | null>(null);
  const [showWaitlistPopup, setShowWaitlistPopup] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');
  const [showArchivePopup, setShowArchivePopup] = useState(false);
  const [editionCount, setEditionCount] = useState(1);

  const editionImages = [
    { id: 0, srcFront: 'main', srcBack: 'main', alt: 'Current Edition', title: 'Edition #01', description: 'The current mystery design. What will it be?' },
    { id: 1, srcFront: '/assets/Sweatshirt/Editions/1a.png', srcBack: '/assets/Sweatshirt/Editions/1b.png', alt: 'Edition 1', title: 'Edition #01', description: '"The dream behind this project is to get strangers to collect and share stories with each other. For the first one, I liked the idea of someone on the sweatshirt literally asking for one. I hope it works and the wearer gets to hear a lot of cool stories." - Rithika K. from NYC' },
    { id: 2, srcFront: '/assets/Sweatshirt/Editions/2a.png', srcBack: '/assets/Sweatshirt/Editions/2b.png', alt: 'Edition 2', title: 'Edition #02', description: '"I made this sweatshirt as a nod to my Telugu upbringing. I grew up with a loving, teasing extended family and on visits home to India, I would learn the swear words. Dunnapothu is one of my favorites. It literally means male buffalo but it\'s used when someone\'s being stubborn or foolish. Use it well." - Revanth K. from NYC' },
    { id: 3, srcFront: '/assets/Sweatshirt/Editions/3a.png', srcBack: '/assets/Sweatshirt/Editions/3b.png', alt: 'Edition 3', title: 'Edition #03', description: 'This is the current hoodie up for sale. Someone will have to buy it to unlock it. You interested?' },
  ];

  const [archiveIndex, setArchiveIndex] = useState(0);
  const [archiveImageSide, setArchiveImageSide] = useState<'front' | 'back'>('front');
  const [cotmImageIndex, setCotmImageIndex] = useState(0);

  const COTM_IMAGES = [
    { src: '/assets/COTM/coverreal.png', alt: 'Condition of the Month Hat', style: { transform: 'scale(0.765) translateY(-5%)' }, className: 'object-contain' },
    { src: '/assets/COTM/backhat.png', alt: 'Condition of the Month Hat Back', style: { transform: 'scale(0.765) translateY(-5%)' }, className: 'object-contain' },
    { src: '/assets/COTM/sidehat.png', alt: 'Condition of the Month Hat Side', style: { transform: 'scale(0.9) translateX(-10%)' }, className: 'object-cover' },
  ];

  // Lock body scroll when any popup is open to prevent mobile address bar jumping
  useEffect(() => {
    const isAnyPopupOpen = showWaitlistPopup || sizeChartOpen || showArchivePopup;
    if (isAnyPopupOpen) {
      document.body.classList.add('popup-open');
    } else {
      document.body.classList.remove('popup-open');
    }
    return () => {
      document.body.classList.remove('popup-open');
    };
  }, [showWaitlistPopup, sizeChartOpen, showArchivePopup]);

  // Toggle archive image side every second on mobile
  useEffect(() => {
    if (!showArchivePopup) return;
    const interval = setInterval(() => {
      setArchiveImageSide(prev => prev === 'front' ? 'back' : 'front');
    }, 1000);
    return () => clearInterval(interval);
  }, [showArchivePopup]);

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 lg:gap-12">
          {/* Left: Product Image */}
          <div>
            {/* Stranger Product - Single Image */}
            {product.title?.toLowerCase().includes('stranger') ? (
              <div style={{ width: '85%', margin: '0 auto' }}>
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
                <div className="relative aspect-square rounded-lg overflow-hidden">
                  {isLMSYProduct ? (
                    <>
                      {/* Base layer - Image 7 (always visible) */}
                      <Image
                        src="/assets/CCP/7.png"
                        alt="CCP"
                        fill
                        className="object-contain"
                      />
                      {/* State 0: Images 8+9 */}
                      <AnimatePresence>
                        {ccpLayerIndex === 0 && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, transform: 'translateY(-25%)' }}
                            >
                              <Image src="/assets/CCP/8.png" alt="CCP" fill className="object-contain" />
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
                            >
                              <Image src="/assets/CCP/9.png" alt="CCP" fill className="object-contain" />
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                      {/* State 1: Images 11+12 */}
                      <AnimatePresence>
                        {ccpLayerIndex === 1 && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, transform: 'translateY(-10%)' }}
                            >
                              <Image src="/assets/CCP/11.png" alt="CCP" fill className="object-contain" />
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
                            >
                              <Image src="/assets/CCP/12.png" alt="CCP" fill className="object-contain" />
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                      {/* State 2: Images 15+16 */}
                      <AnimatePresence>
                        {ccpLayerIndex === 2 && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
                            >
                              <Image src="/assets/CCP/15.png" alt="CCP" fill className="object-contain" />
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
                            >
                              <Image src="/assets/CCP/16.png" alt="CCP" fill className="object-contain" />
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                      {/* State 3: Images 23+24 */}
                      <AnimatePresence>
                        {ccpLayerIndex === 3 && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
                            >
                              <Image src="/assets/CCP/23.png" alt="CCP" fill className="object-contain" />
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
                            >
                              <Image src="/assets/CCP/24.png" alt="CCP" fill className="object-contain" />
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                      {/* State 4: Images 27+28 */}
                      <AnimatePresence>
                        {ccpLayerIndex === 4 && (
                          <>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
                            >
                              <Image src="/assets/CCP/27.png" alt="CCP" fill className="object-contain" />
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.5 }}
                              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}
                            >
                              <Image src="/assets/CCP/28.png" alt="CCP" fill className="object-contain" />
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
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
              </div>
            )}

          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col lg:sticky lg:top-40 lg:self-start">
            {/* Title */}
            <h1 className="text-2xl md:text-4xl font-bold text-black mb-2 uppercase font-[family-name:var(--font-inter)]" style={{ letterSpacing: '-0.02em' }}>
              {product.title}
            </h1>
            {product.title?.toLowerCase().includes('stranger') && (
              <p className="text-lg font-bold mb-4 uppercase font-[family-name:var(--font-inter)] inline-block w-fit">
                <span className="bg-[#dcff73] text-black px-3 py-1 rounded">(EDITION #{String(editionCount).padStart(2, '0')})</span>
              </p>
            )}

            {/* Price - hide for LMSY products */}
            {!isLMSYProduct && (
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-2xl font-bold text-black font-[family-name:var(--font-inter)]">
                  ${displayPrice.toFixed(2)}{selectedSellingPlan ? '/mo' : ''}
                </span>
                {selectedSellingPlan && displayPrice < basePrice && (
                  <span className="text-lg text-gray-400 line-through font-[family-name:var(--font-inter)]">
                    ${basePrice.toFixed(2)}
                  </span>
                )}
                <span className="text-sm text-gray-600 font-[family-name:var(--font-inter)]">
                  <Link href="/legal" className="underline hover:text-[#F8330D] transition-colors">SHIPPING</Link> CALCULATED AT CHECKOUT.
                </span>
              </div>
            )}

            {/* Sold Out Notice */}
            {!isAvailable && (
              <div className="mb-4">
                <p className="text-base font-bold text-[#F8330D] mb-3 font-[family-name:var(--font-inter)]">
                  Sold out! But more on the way!! We can let you know when it's back -
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
                      const response = await fetch('/api/coming-soon-subscribe', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: waitlistEmail }),
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
                      waitlistSuccess ? 'bg-black text-white' : 'bg-[#F8330D] hover:bg-black text-white'
                    }`}
                  >
                    {waitlistSubmitting ? '...' : waitlistSuccess ? "You're in!" : "Let me know"}
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
                  <div className="mb-6">
                    <iframe
                      style={{ borderRadius: '12px', width: '100%' }}
                      src="https://open.spotify.com/embed/track/5dE8s6uWRGNc1Ac7y8rULq?utm_source=generator&theme=0"
                      height="80"
                      frameBorder="0"
                      allowFullScreen
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    ></iframe>
                  </div>
                  <p className="text-base text-black font-[family-name:var(--font-inter)]">
                    Can you trust a stranger to design your hoodie?
                  </p>
                  <p className="text-base text-black font-[family-name:var(--font-inter)]">
                    <strong>Each of these hoodies are custom-designed by a different person</strong> and you don't get to see it ahead of time. You pick your size but the design is a total mystery until it arrives. After you buy one, you get a design call with me (Rithika) where <strong>you help design the next hoodie for the next stranger.</strong> And so forth!
                  </p>
                  <p className="text-base text-black font-[family-name:var(--font-inter)] mt-4">
                    <span className="bg-[#dcff73] px-1">You can check out the archive <button onClick={() => setShowArchivePopup(true)} className="font-bold underline hover:opacity-70">here</button></span>. We are currently on hoodie <strong>#{editionCount}</strong>.
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
                  <p><strong>Every month, we feature a new condition and make merch for it.</strong> You can vote for next month&apos;s condition on our socials:</p>
                  <div className="flex gap-4 mt-2 mb-4">
                    <a href="https://www.instagram.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                      <svg className="w-5 h-5" fill="black" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    <a href="https://www.tiktok.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                      <svg className="w-5 h-5" fill="black" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                      </svg>
                    </a>
                    <a href="https://x.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                      <svg className="w-5 h-5" fill="black" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                    <a href="https://substack.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                      <svg className="w-5 h-5" fill="black" viewBox="0 0 24 24">
                        <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/>
                      </svg>
                    </a>
                  </div>
                  <p>If you wear this merch, you are signaling something powerful. That you are not ashamed of your weaknesses but in fact proud of them. <strong>You will attract others like you. And you will rise.</strong></p>
                  <p className="mt-2 italic">*Makes a great gift for someone special.</p>
                </div>
              ) : isLMSYProduct ? (
                <div>
                  <p className="text-base text-black font-[family-name:var(--font-inter)] italic mb-4">
                    &quot;The role of the artist is exactly the same as the role of the lover. If I love you, I have to make you conscious of the things you don&apos;t see.&quot;
                    <br />— James Baldwin
                  </p>
                  <p className="text-sm text-black font-[family-name:var(--font-inter)] mb-4">
                    Let Me Show You is a <strong>monthly digital art exhibit</strong>. Each month, we pick a theme and <strong>invite guests to share art that they love.</strong> They share all kinds of things: paintings, songs, podcast excerpts, texts from their mom, whatever they deem as art and fits the theme.
                  </p>
                  <p className="text-sm text-black font-[family-name:var(--font-inter)] mb-4">
                    Each exhibit will have it&apos;s own custom website and you will get a link and password to access it whenever you would like. Subscribers will get email notifications whenever we have new drops.
                  </p>
                  <p className="text-sm text-black font-[family-name:var(--font-inter)] mb-4">
                    <span className="bg-[#dcff73] px-1">You can check out a sample <a href="/shop/let-me-show-you-sample" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:opacity-70">here</a>.</span>
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

            {/* Subscription Options */}
            {product.sellingPlanGroups && product.sellingPlanGroups.length > 0 && (
              <div className="mb-6">
                <label className="text-sm font-bold text-black mb-3 block uppercase font-[family-name:var(--font-inter)]">
                  PURCHASE OPTIONS
                </label>
                <div className="space-y-2">
                  {/* Single Month / One-time purchase option */}
                  <button
                    onClick={() => setSelectedSellingPlan(null)}
                    className={`w-full px-4 py-3 text-left text-sm font-bold transition-all rounded-lg font-[family-name:var(--font-inter)] border-2 ${
                      selectedSellingPlan === null
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                  >
                    {isLMSYProduct ? `Single Month Purchase ($${basePrice.toFixed(0)})` : 'One-time purchase'}
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
                            <span>
                              {isLMSYProduct
                                ? `Monthly Subscription ($${planPrice.toFixed(0)}/month)`
                                : plan.name
                              }
                            </span>
                            <span className="text-xs bg-[#dcff73] text-black px-2 py-1 rounded">
                              SAVE 30% OFF
                            </span>
                          </div>
                          {plan.description && !isLMSYProduct && (
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
                {selectedSellingPlan ? 'SUBSCRIBE NOW' : 'BUY NOW'}
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
                      <p><strong>Single Month Purchase</strong></p>
                      <p>For the single month purchase, you will receive a link and password to the current month&apos;s exhibit once it is complete. So for example, if you bought the single month purchase on 1/10, you will receive one email on 1/31 with clear access instructions.</p>
                      <p className="mt-4"><strong>Monthly Subscription Purchase</strong></p>
                      <p>For the monthly subscription purchase, you will receive an email with the link and password to the current month&apos;s exhibit. You will continue to receive email notifications anytime there is a new drop.</p>
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

    {/* Archive Popup */}
    <AnimatePresence>
      {showArchivePopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 popup-backdrop"
          onClick={() => setShowArchivePopup(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 shadow-2xl relative overflow-y-auto md:overflow-hidden"
            style={{ width: '90vw', maxWidth: '1100px', height: '85vh', maxHeight: '850px' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close X Button */}
            <button
              onClick={() => setShowArchivePopup(false)}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center text-black hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>

            <h2 className="text-2xl font-bold mb-0 text-black font-[family-name:var(--font-inter)] uppercase text-center">
              Hoodie Archive
            </h2>
            <AnimatePresence mode="wait">
              <motion.h3
                key={archiveIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xl font-bold text-black font-[family-name:var(--font-inter)] uppercase text-center mb-1"
              >
                {editionImages[archiveIndex + 1].title}
              </motion.h3>
            </AnimatePresence>

            {/* Carousel Content */}
            <div className="flex flex-col h-[calc(100%-35px)] -mt-18">
              {/* Images with Arrows */}
              <div className="flex items-center" style={{ height: '100%' }}>
                {/* Left Arrow */}
                <button
                  onClick={() => setArchiveIndex((prev) => (prev === 0 ? editionImages.length - 2 : prev - 1))}
                  className="flex-shrink-0 w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors mr-4"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>

                {/* Images - Front and Back */}
                <div className="flex-1 h-full relative overflow-visible">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={archiveIndex}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.3 }}
                      className="relative w-full h-full flex flex-col md:flex-row gap-0 md:gap-4 justify-center md:items-center pt-28 md:pt-0"
                    >
                      {/* Mobile: Single rotating image */}
                      <div className="md:hidden relative w-full h-[300px] flex-shrink-0">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={archiveImageSide}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="absolute inset-0"
                          >
                            {archiveImageSide === 'front' ? (
                              editionImages[archiveIndex + 1].srcFront === 'unlock' ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                                    <div className="text-center">
                                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                      <p className="text-gray-500 font-bold text-sm">COMING SOON</p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <Image
                                  src={editionImages[archiveIndex + 1].srcFront}
                                  alt={`${editionImages[archiveIndex + 1].alt} Front`}
                                  fill
                                  className="object-contain"
                                />
                              )
                            ) : (
                              editionImages[archiveIndex + 1].srcBack === 'unlock' ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                                    <div className="text-center">
                                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                      <p className="text-gray-500 font-bold text-sm">COMING SOON</p>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <Image
                                  src={editionImages[archiveIndex + 1].srcBack}
                                  alt={`${editionImages[archiveIndex + 1].alt} Back`}
                                  fill
                                  className="object-contain"
                                />
                              )
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                      {/* Desktop: Both images side by side */}
                      <div className="hidden md:block relative w-full h-full md:w-[50%] flex-shrink-0">
                        {editionImages[archiveIndex + 1].srcFront === 'unlock' ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                              <div className="text-center">
                                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <p className="text-gray-500 font-bold text-sm">COMING SOON</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Image
                            src={editionImages[archiveIndex + 1].srcFront}
                            alt={`${editionImages[archiveIndex + 1].alt} Front`}
                            fill
                            className="object-contain"
                          />
                        )}
                      </div>
                      <div className="hidden md:block relative w-full h-full md:w-[50%] flex-shrink-0">
                        {editionImages[archiveIndex + 1].srcBack === 'unlock' ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                              <div className="text-center">
                                <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <p className="text-gray-500 font-bold text-sm">COMING SOON</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Image
                            src={editionImages[archiveIndex + 1].srcBack}
                            alt={`${editionImages[archiveIndex + 1].alt} Back`}
                            fill
                            className="object-contain"
                          />
                        )}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Right Arrow */}
                <button
                  onClick={() => setArchiveIndex((prev) => (prev === editionImages.length - 2 ? 0 : prev + 1))}
                  className="flex-shrink-0 w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors ml-4"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>

              {/* Text and Dots below images */}
              <div className="text-center mt-6 md:-mt-10 mx-auto pb-8 md:pb-0" style={{ width: '80%' }}>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={archiveIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="text-base md:text-lg text-black font-[family-name:var(--font-inter)]"
                  >
                    {editionImages[archiveIndex + 1].description}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

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
            <a href="https://www.tiktok.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
              <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
            </a>
            <a href="https://x.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
              <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://substack.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
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
            <a href="https://www.tiktok.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
              <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
            </a>
            <a href="https://x.com/rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
              <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="https://substack.com/@rithikaisafool" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
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
