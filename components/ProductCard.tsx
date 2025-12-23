"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { client } from "@/lib/shopify";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, openCart } = useCart();
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-select first available variant if the default is sold out
  useEffect(() => {
    if (product.variants && !product.variants[0]?.available) {
      const firstAvailableIndex = product.variants.findIndex((v: any) => v.available);
      if (firstAvailableIndex !== -1) {
        setSelectedVariantIndex(firstAvailableIndex);
      }
    }
  }, [product]);

  const selectedVariant = product.variants?.[selectedVariantIndex];
  const price = selectedVariant?.price;
  const image = product.images?.[0]?.src;
  const hasMultipleVariants = product.variants?.length > 1;
  const isSelectedVariantAvailable = selectedVariant?.available ?? true;
  const allVariantsSoldOut = product.variants?.every((v: any) => !v.available) ?? false;

  const handleAddToCart = () => {
    setErrorMessage(null);
    const productWithSelectedVariant = {
      ...product,
      selectedVariantIndex
    };
    const result = addToCart(productWithSelectedVariant);
    if (result && result.error) {
      setErrorMessage(result.error);
    } else {
      openCart();
    }
  };

  const handleBuyNow = async () => {
    if (selectedVariant?.id) {
      try {
        const checkout = await client.checkout.create();
        const lineItemsToAdd = [{
          variantId: selectedVariant.id,
          quantity: 1
        }];

        const updatedCheckout = await client.checkout.addLineItems(checkout.id, lineItemsToAdd);

        window.open(updatedCheckout.webUrl, '_blank');
      } catch (error) {
        console.error('Error creating checkout:', error);
        alert('Unable to process checkout. Please try again.');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg overflow-hidden"
      style={{ boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.1)' }}
    >
      {/* Product Image */}
      <div className="relative w-full h-80 bg-gray-200">
        {image ? (
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
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-[#F8330D] px-4 py-2 shadow-lg">
              <span className="text-sm font-bold text-white font-[family-name:var(--font-inter)]">
                SOLD OUT
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6">
        <h3 className="text-xl font-semibold text-black mb-2 font-[family-name:var(--font-inter)]">
          {product.title}
        </h3>

        {product.description && (
          <p className="text-sm text-gray-600 mb-4 font-[family-name:var(--font-inter)] line-clamp-2">
            {product.description}
          </p>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600 font-semibold font-[family-name:var(--font-inter)]">
              {errorMessage}
            </p>
          </div>
        )}

        {hasMultipleVariants && (
          <div className="mb-4">
            <label className="text-sm font-semibold text-black mb-2 block font-[family-name:var(--font-inter)]">
              Size:
            </label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant: any, index: number) => {
                const isAvailable = variant.available;
                const isSelected = selectedVariantIndex === index;

                return (
                  <button
                    key={variant.id}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedVariantIndex(index);
                        setErrorMessage(null);
                      }
                    }}
                    disabled={!isAvailable}
                    className={`px-4 py-2 border-2 rounded-md text-sm font-semibold transition-all font-[family-name:var(--font-inter)] ${
                      !isAvailable
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                        : isSelected
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-black hover:border-black'
                    }`}
                  >
                    {variant.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-4">
          <span className="text-2xl font-bold text-black font-[family-name:var(--font-inter)]">
            ${price?.amount || '0.00'}
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!isSelectedVariantAvailable}
            className={`flex-1 px-4 py-2 border-2 rounded-full text-sm font-semibold transition-all font-[family-name:var(--font-inter)] ${
              !isSelectedVariantAvailable
                ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100'
                : 'border-black text-black hover:bg-black hover:text-white'
            }`}
          >
            Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            disabled={!isSelectedVariantAvailable}
            className={`flex-1 px-4 py-2 border-2 rounded-full text-sm font-semibold transition-all font-[family-name:var(--font-inter)] ${
              !isSelectedVariantAvailable
                ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-gray-100'
                : 'border-black text-black hover:bg-black hover:text-white'
            }`}
            style={isSelectedVariantAvailable ? { boxShadow: '0px 4px 4px 0px #F8330D' } : {}}
            onMouseEnter={(e) => isSelectedVariantAvailable && (e.currentTarget.style.boxShadow = 'inset 0px 0px 10px 2px rgba(0, 0, 0, 0.8)')}
            onMouseLeave={(e) => isSelectedVariantAvailable && (e.currentTarget.style.boxShadow = '0px 4px 4px 0px #F8330D')}
          >
            Buy Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}
