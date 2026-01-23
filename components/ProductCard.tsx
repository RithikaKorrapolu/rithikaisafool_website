"use client";

import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { BouncingBallPoster } from "./BouncingBallPoster";

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

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [gloryImageIndex, setGloryImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [ccpLayerIndex, setCcpLayerIndex] = useState(0);
  const [editionCount, setEditionCount] = useState(1);

  const isStrangerProduct = product.title?.toLowerCase().includes('stranger');

  // Fetch edition count for stranger hoodie
  useEffect(() => {
    if (isStrangerProduct) {
      fetch('/api/edition-count')
        .then(res => res.json())
        .then(data => {
          if (data.editionCount) {
            setEditionCount(data.editionCount);
          }
        })
        .catch(err => console.error('Failed to fetch edition count:', err));
    }
  }, [isStrangerProduct]);

  const isCCPProduct = product.title?.toLowerCase().includes('creative') &&
                       product.title?.toLowerCase().includes('care');

  // Cycle through glory images for STWL product with custom timing
  useEffect(() => {
    const isCardProduct = product.title?.toLowerCase().includes('specific things') ||
                          product.title?.toLowerCase().includes('card') ||
                          product.title?.toLowerCase().includes('love');
    if (isCardProduct && !product.title?.toLowerCase().includes('stranger')) {
      // Image 15 (index 1) shows for 1.5 seconds, Image 17 (index 3) shows for 2.5 seconds, others show for 1 second
      const delay = gloryImageIndex === 3 ? 2500 : gloryImageIndex === 1 ? 1500 : 1000;
      const timeoutId = setTimeout(() => {
        setGloryImageIndex((prev) => (prev + 1) % GLORY_IMAGES.length);
      }, delay);
      return () => clearTimeout(timeoutId);
    }
  }, [product.title, gloryImageIndex]);

  // CCP animation cycle - simple 5 states
  // State 0: 8+9, State 1: 11+12, State 2: 15+16, State 3: 23+24, State 4: 27+28
  useEffect(() => {
    if (isCCPProduct) {
      const delay = 2000; // 2 seconds per state
      const timeoutId = setTimeout(() => {
        setCcpLayerIndex((prev) => (prev + 1) % 5);
      }, delay);
      return () => clearTimeout(timeoutId);
    }
  }, [isCCPProduct, ccpLayerIndex]);

  const image = product.images?.[0]?.src;
  const allVariantsSoldOut = product.variants?.every((v: any) => !v.available) ?? false;

  // Create URL-friendly handle from product handle or title
  const productHandle = product.handle || product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  return (
    <Link href={`/shop/${productHandle}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
        transition={{ duration: 0.5 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="bg-white rounded-lg overflow-visible cursor-pointer hover:shadow-2xl transition-shadow"
        style={{ boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.1)' }}
      >
        {/* Product Image */}
        <div className="relative w-full h-80" style={{ backgroundColor: '#F2F2F2' }}>
          {isCCPProduct ? (
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
          ) : product.title?.toLowerCase().includes('stranger') ? (
            <BouncingBallPoster showLogo={false} isHovered={isHovered} />
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
               product.title?.toLowerCase().includes('month')) && image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              className="object-contain"
              style={{ transform: 'scale(0.88)' }}
            />
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
          {allVariantsSoldOut && (
            <div className="absolute top-3 right-3 z-10 rotate-6">
              <div className="relative px-4 py-1.5 bg-[#F8330D]" style={{
                borderRadius: '4px'
              }}>
                <span className="text-sm font-black text-white font-[family-name:var(--font-inter)] tracking-wide">
                  SOLD OUT
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-black mb-2 font-[family-name:var(--font-inter)]">
            {product.title?.toLowerCase().includes('stranger') ? 'A STRANGER DESIGNED MY HOODIE' : product.title}
          </h3>
          {product.title?.toLowerCase().includes('stranger') && (
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <span className="bg-[#dcff73] text-black px-2 py-1 text-xs font-bold uppercase rounded font-[family-name:var(--font-inter)]">(EDITION #{String(editionCount).padStart(2, '0')})</span>
                <p className="text-lg font-bold text-black font-[family-name:var(--font-inter)]">
                  ${product.variants?.[0]?.price?.amount ? parseFloat(product.variants[0].price.amount).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          )}

          {(product.title?.toLowerCase().includes('specific things') ||
            product.title?.toLowerCase().includes('card') ||
            product.title?.toLowerCase().includes('love')) &&
           !product.title?.toLowerCase().includes('stranger') && (
            <div className="mb-2">
              <p className="text-lg font-bold text-black font-[family-name:var(--font-inter)]">
                ${product.variants?.[0]?.price?.amount ? parseFloat(product.variants[0].price.amount).toFixed(2) : '0.00'}
              </p>
            </div>
          )}

          {isCCPProduct && (
            <div className="mb-2">
              <p className="text-lg font-bold text-black font-[family-name:var(--font-inter)]">
                $8 / $6 subscription
              </p>
            </div>
          )}

          {(product.title?.toLowerCase().includes('condition') ||
            product.title?.toLowerCase().includes('month')) &&
           !isCCPProduct && (
            <div className="mb-2">
              <p className="text-lg font-bold text-black font-[family-name:var(--font-inter)]">
                ${product.variants?.[0]?.price?.amount ? parseFloat(product.variants[0].price.amount).toFixed(2) : '0.00'}
              </p>
            </div>
          )}

          {product.title?.toLowerCase().includes('stranger') ? (
            <p className="text-base text-black font-[family-name:var(--font-inter)]">
              Can you trust a stranger to design your hoodie? Let&apos;s find out!
            </p>
          ) : (product.title?.toLowerCase().includes('specific things') ||
               product.title?.toLowerCase().includes('card') ||
               product.title?.toLowerCase().includes('love')) &&
              !product.title?.toLowerCase().includes('stranger') ? (
            <p className="text-base text-black font-[family-name:var(--font-inter)] line-clamp-2">
              The thing about love is that it's so big, it's like the biggest thing in the world. But it's also really small. Love starts with noticing small, good things about someone until it adds up and becomes something big. This is a card for the small things.
            </p>
          ) : isCCPProduct ? (
            <p className="text-base text-black font-[family-name:var(--font-inter)] line-clamp-2">
              A monthly care package full of creative goodies to inspire you.
            </p>
          ) : (
            <>
              {product.description && (
                <p className="text-base text-black font-[family-name:var(--font-inter)] line-clamp-2">
                  {product.description}
                </p>
              )}
            </>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
