"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { getProducts } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [textShadow, setTextShadow] = useState('');
  const textRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const fetchedProducts = await getProducts();
        // Custom sort: Conditions hat before Let Me Show You
        const sortedProducts = [...fetchedProducts].sort((a, b) => {
          const aTitle = a.title?.toLowerCase() || '';
          const bTitle = b.title?.toLowerCase() || '';
          // Put "condition" products before "let me show you" products
          const aIsCondition = aTitle.includes('condition');
          const bIsCondition = bTitle.includes('condition');
          const aIsLMSY = aTitle.includes('let me show you');
          const bIsLMSY = bTitle.includes('let me show you');

          if (aIsCondition && bIsLMSY) return -1;
          if (aIsLMSY && bIsCondition) return 1;
          return 0;
        });
        setProducts(sortedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    if (!textRef.current) return;

    const textRect = textRef.current.getBoundingClientRect();
    const textCenterX = textRect.left + textRect.width / 2;
    const textCenterY = textRect.top + textRect.height / 2;

    // Calculate angle from mouse to text
    const angle = Math.atan2(textCenterY - mousePos.y, textCenterX - mousePos.x);

    // Create long shadow effect (multiple shadows stacked)
    let shadows = [];
    for (let i = 1; i <= 10; i++) {
      const x = Math.cos(angle) * i;
      const y = Math.sin(angle) * i;
      shadows.push(`${x}px ${y}px 3px rgba(0, 0, 0, 1)`);
    }

    setTextShadow(shadows.join(', '));
  }, [mousePos]);

  return (
    <>
    <main className="min-h-screen pt-[150px] md:pt-[160px] lg:pt-[180px] pb-32" style={{ backgroundColor: '#F2F2F2' }}>
      {/* Shop Awning Image - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6 sm:mb-4 md:mb-12 w-full overflow-hidden -mt-[30px] sm:-mt-[39px] md:-mt-[48px] lg:-mt-[54px] relative h-[150px] sm:h-[180px] md:h-auto md:min-h-0"
      >
        <Image
          src="/assets/shop awning 2.png"
          alt="Shop Awning"
          width={2400}
          height={1200}
          className="max-w-none w-[230%] -ml-[65%] sm:w-[180%] sm:-ml-[40%] md:w-[110%] md:ml-0 lg:w-full h-full md:h-auto object-cover"
        />
        {/* Text overlay on awning */}
        <div className="absolute inset-0 flex items-start justify-center pt-6 sm:pt-6 md:pt-10 lg:pt-16 px-4">
          <h2
            ref={textRef}
            className="font-[family-name:var(--font-abril-fatface)] text-center max-w-[90%] sm:max-w-none"
            style={{
              fontSize: 'clamp(1.6rem, 4.8vw, 3.2rem)',
              color: '#E5FF00',
              textShadow: textShadow,
              fontWeight: '900'
            }}
          >
            BUYING WEIRD ART IS GOOD FOR YOU
          </h2>
        </div>
      </motion.div>

      <div className="container mx-auto px-6 max-w-7xl">

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]" style={{ backgroundColor: '#F2F2F2' }}>
            <div className="text-xl text-black font-[family-name:var(--font-abril-fatface)]">Loading...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-black font-[family-name:var(--font-inter)]">
              No products available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}

          </div>
        )}
      </div>
    </main>

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
