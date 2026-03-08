"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const editionImages = [
  { id: 1, srcFront: '/assets/Sweatshirt/Editions/1a.png', srcBack: '/assets/Sweatshirt/Editions/1b.png', alt: 'Edition 1', title: 'Edition #01', designer: 'Rithika', description: '"The dream behind this project is to get strangers to collect and share stories with each other. For the first one, I liked the idea of someone on the sweatshirt literally asking for one. I hope it works and the wearer gets to hear a lot of cool stories." - Rithika' },
  { id: 2, srcFront: '/assets/Sweatshirt/Editions/2a.png', srcBack: '/assets/Sweatshirt/Editions/2b.png', alt: 'Edition 2', title: 'Edition #02', designer: 'Revanth', description: '"I made this sweatshirt as a nod to my Telugu upbringing. I grew up with a loving, teasing extended family and on visits home to India, I would learn the swear words. Dunnapothu is one of my favorites. It literally means male buffalo but it\'s used when someone\'s being stubborn or foolish. Use it well." - Revanth' },
  { id: 3, srcFront: '/assets/Sweatshirt/Editions/3a.png', srcBack: '/assets/Sweatshirt/Editions/3a.png', alt: 'Edition 3', title: 'Edition #03', designer: 'M', description: '"I remember the first time I saw a peacock I was in India and my jaw dropped at how beautiful it was with its feathers open. It felt like it came from a different world. I wanted the sleeves to represent the feathers of a peacock and for the sweatshirt to represent the animal\'s beauty." - M' },
  { id: 4, srcFront: '/assets/Sweatshirt/Editions/4a.png', srcBack: '/assets/Sweatshirt/Editions/4b.png', alt: 'Edition 4', title: 'Edition #04', designer: 'Ishaan', description: '"\'The Duality of Man\' is a trope long explored in art; here, it is rendered anew. This piece explores Man as Doll: immaculate and legible from the front, only to be undone by a litany of unsavory truths trailing behind. The garment stages the collapse between how we present and how we are named, between the curated self and the unruly chorus of perception. To wear it is to inhabit that contradiction, and to reckon with the uneasy realization that identity is as much imposed as it is performed." - Ishaan' },
  { id: 5, srcFront: '/assets/Sweatshirt/Editions/5a.png', srcBack: '/assets/Sweatshirt/Editions/5a.png', alt: 'Edition 5', title: 'Edition #05', designer: 'Pranav', description: '"Apple computers. Lay\'s Chips. Polo Bear (by Ralph Lauren). Every so often, we see art that doesn\'t seek external validation. Instead, it is an expression of what the artist wishes to see in the world; it is their truth. I won\'t claim that this sweatshirt represents my truth. I found it so hard to bring myself to sign the damn thing; is this really - of all the possible messages / themes / ideas / hopes - what I wanted to contribute? I\'m warming up to it. I think Polo is iconic. They\'re just so damn playful with that bear. I don\'t know who I am as an artist, but I know who inspires me - and whether or not this sweatshirt becomes a staple of your wardrobe, I hope it can be a reminder of the people and ideas who you aspire to, too." - Pranav' },
  { id: 6, srcFront: '/assets/Sweatshirt/Editions/6a.png', srcBack: '/assets/Sweatshirt/Editions/6a.png', alt: 'Edition 6', title: 'Edition #06', designer: 'Jordan', description: '"My intention with this piece was to be a comment on… nay. A dialogue with… nay. A reflection of the sacred masculine spirit." - Jordan' },
  { id: 7, srcFront: '/assets/Sweatshirt/Editions/7a.png', srcBack: '/assets/Sweatshirt/Editions/7b.png', alt: 'Edition 7', title: 'Edition #07', designer: 'Kasra', description: '"I added a tiger because I love tigers, and I especially like that they represent "graceful strength." they are powerful and self-assured, but they are not belligerent. I thought this particular tiger looked cute, and the mary oliver quote fit it well – about making the most of life, and not shying away from the wildness of it." - Kasra', scale: 1.3 },
];

export default function StrangerArchivePage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [popupImageSide, setPopupImageSide] = useState<'front' | 'back'>('front');
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const selectedEdition = selectedId ? editionImages.find(e => e.id === selectedId) : null;
  const selectedHasTwoImages = selectedEdition ? selectedEdition.srcFront !== selectedEdition.srcBack : false;

  // Rotate popup image between front and back
  useEffect(() => {
    if (!selectedEdition || !selectedHasTwoImages) return;

    const interval = setInterval(() => {
      setPopupImageSide(prev => prev === 'front' ? 'back' : 'front');
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedId, selectedEdition, selectedHasTwoImages]);

  // Reset popup image side when selecting new edition
  useEffect(() => {
    setPopupImageSide('front');
  }, [selectedId]);

  // Set body background to match page
  useEffect(() => {
    document.body.style.backgroundColor = '#f5f5f7';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);

  // Lock scroll when popup is open
  useEffect(() => {
    if (selectedId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedId]);

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 border-b border-black/10 bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <Link
            href="/shop/a-stranger-designed-my-sweatshirt"
            className="flex items-center gap-2 text-black/60 hover:text-black transition-colors font-[family-name:var(--font-inter)]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            Back
          </Link>
          <h1 className="text-lg md:text-xl font-medium text-black uppercase tracking-wide" style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}>
            Hoodie Archive
          </h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {editionImages.map((edition) => {
            const hasTwoImages = edition.srcFront !== edition.srcBack;

            return (
              <motion.div
                key={edition.id}
                onClick={() => setSelectedId(edition.id)}
                onMouseEnter={() => setHoveredId(edition.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="cursor-pointer group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative aspect-square mb-3">
                  <Image
                    src={hasTwoImages && hoveredId === edition.id ? edition.srcBack : edition.srcFront}
                    alt={edition.alt}
                    fill
                    className="object-contain transition-opacity duration-300"
                    style={{ transform: edition.scale ? `scale(${edition.scale})` : undefined }}
                  />
                </div>
                <p className="text-center text-black/60 text-sm font-medium font-[family-name:var(--font-inter)] uppercase tracking-wide">
                  {edition.title}{edition.designer && ` (${edition.designer})`}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Spotlight Overlay & Popup */}
      <AnimatePresence>
        {selectedId && selectedEdition && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            onClick={() => setSelectedId(null)}
          >
            {/* Dark overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80"
            />

            {/* Popup content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative z-10 bg-white rounded-2xl p-4 md:p-8 mx-4 max-w-4xl max-h-[90vh] overflow-y-auto"
              style={{ width: 'calc(100% - 32px)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedId(null)}
                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>

              {/* Title */}
              <h2 className="text-2xl md:text-3xl font-bold text-black font-[family-name:var(--font-inter)] uppercase mb-6">
                {selectedEdition.title}{selectedEdition.designer && ` (${selectedEdition.designer})`}
              </h2>

              {/* Images */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Mobile: single rotating image */}
                <div className="md:hidden relative w-full aspect-square">
                  <AnimatePresence initial={false}>
                    <motion.div
                      key={popupImageSide}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={popupImageSide === 'front' ? selectedEdition.srcFront : selectedEdition.srcBack}
                        alt={selectedEdition.alt}
                        fill
                        className="object-contain"
                      />
                    </motion.div>
                  </AnimatePresence>
                  {selectedHasTwoImages && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      <div className={`w-2 h-2 rounded-full transition-colors ${popupImageSide === 'front' ? 'bg-black' : 'bg-black/30'}`} />
                      <div className={`w-2 h-2 rounded-full transition-colors ${popupImageSide === 'back' ? 'bg-black' : 'bg-black/30'}`} />
                    </div>
                  )}
                </div>

                {/* Desktop: show both or one centered */}
                {selectedHasTwoImages ? (
                  <>
                    <div className="hidden md:block relative flex-1 aspect-square">
                      <Image
                        src={selectedEdition.srcFront}
                        alt={`${selectedEdition.alt} Front`}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="hidden md:block relative flex-1 aspect-square">
                      <Image
                        src={selectedEdition.srcBack}
                        alt={`${selectedEdition.alt} Back`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </>
                ) : (
                  <div className="hidden md:block relative w-1/2 mx-auto aspect-square">
                    <Image
                      src={selectedEdition.srcFront}
                      alt={selectedEdition.alt}
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedEdition.description && (
                <p className="text-black/70 text-sm md:text-base font-[family-name:var(--font-inter)] leading-relaxed italic">
                  {selectedEdition.description}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
