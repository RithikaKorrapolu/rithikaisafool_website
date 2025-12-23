"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen pt-[100px] sm:pt-[130px] md:pt-[160px] lg:pt-[180px] pb-32" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 text-black font-[family-name:var(--font-inter)]">Shop!</h1>
          <p className="text-lg text-black font-[family-name:var(--font-inter)]">
            Check out our latest collection
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-xl text-black font-[family-name:var(--font-inter)]">Loading products...</div>
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

      {/* Bottom Scrolling Text */}
      <div className="fixed bottom-0 left-0 w-full bg-white py-3 overflow-hidden z-40" style={{ boxShadow: '0px 4px 34px 0px rgba(0, 0, 0, 0.25)' }}>
        <div className="flex animate-marquee-seamless" style={{ letterSpacing: '-0.06em' }}>
          <div className="flex whitespace-nowrap">
            {Array(20).fill(0).map((_, i) => (
              <span key={i} className="text-base md:text-xl font-normal italic text-black font-[family-name:var(--font-inter)]">
                Support independent creators!&nbsp;
              </span>
            ))}
          </div>
          <div className="flex whitespace-nowrap" aria-hidden="true">
            {Array(20).fill(0).map((_, i) => (
              <span key={i} className="text-base md:text-xl font-normal italic text-black font-[family-name:var(--font-inter)]">
                Support independent creators!&nbsp;
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
