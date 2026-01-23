"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { useState } from "react";

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, checkout, cartCount } = useCart();
  const [attemptedIncrease, setAttemptedIncrease] = useState<Set<string>>(new Set());

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleIncrease = (variantId: string, currentQuantity: number, maxQuantity: number | undefined, sellingPlanId?: string) => {
    const itemKey = `${variantId}-${sellingPlanId || ''}`;
    // Only check inventory if maxQuantity is a positive number (0 or undefined means unlimited)
    if (maxQuantity !== undefined && maxQuantity > 0 && currentQuantity >= maxQuantity) {
      setAttemptedIncrease(prev => new Set(prev).add(itemKey));
    } else {
      updateQuantity(variantId, currentQuantity + 1, sellingPlanId);
      setAttemptedIncrease(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleDecrease = (variantId: string, currentQuantity: number, sellingPlanId?: string) => {
    const itemKey = `${variantId}-${sellingPlanId || ''}`;
    updateQuantity(variantId, currentQuantity - 1, sellingPlanId);
    setAttemptedIncrease(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemKey);
      return newSet;
    });
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-[70]"
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed right-0 top-0 h-full w-full max-w-xs md:max-w-sm bg-[#F2F2F2] z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-black font-[family-name:var(--font-inter)]">
                  Cart ({cartCount})
                </h2>
                <button
                  onClick={closeCart}
                  className="text-2xl font-bold text-black hover:text-[#F8330D] transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <p className="text-center text-gray-600 mt-8 font-[family-name:var(--font-inter)]">
                  Your cart is empty
                </p>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => {
                    const itemKey = `${item.variantId}-${item.sellingPlanId || ''}`;
                    return (
                      <div
                        key={itemKey}
                        className="flex gap-4 bg-white p-4 rounded-lg"
                        style={{ boxShadow: '0px 2px 10px 0px rgba(0, 0, 0, 0.1)' }}
                      >
                        {/* Product Image */}
                        {item.image && (
                          <div className="relative w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        )}

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-black mb-1 font-[family-name:var(--font-inter)]">
                            {item.title}
                          </h3>
                          {(item.title?.toLowerCase().includes('creative') && item.title?.toLowerCase().includes('care')) && (
                            <p className="text-xs text-black font-bold mb-1 font-[family-name:var(--font-inter)]">
                              {item.sellingPlanId ? 'Monthly Subscription' : 'Single Month Purchase'}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 mb-2 font-[family-name:var(--font-inter)]">
                            ${item.price.toFixed(2)}{item.sellingPlanId ? '/mo' : ''}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center border border-black rounded">
                              <button
                                onClick={() => handleDecrease(item.variantId, item.quantity, item.sellingPlanId)}
                                className="w-8 h-8 flex items-center justify-center text-black font-bold hover:bg-gray-100 transition-colors font-[family-name:var(--font-inter)]"
                              >
                                -
                              </button>
                              <div className="w-10 h-8 flex items-center justify-center bg-black text-white font-bold font-[family-name:var(--font-inter)]">
                                {item.quantity}
                              </div>
                              <button
                                onClick={() => handleIncrease(item.variantId, item.quantity, item.quantityAvailable, item.sellingPlanId)}
                                className="w-8 h-8 flex items-center justify-center text-black font-bold hover:bg-gray-100 transition-colors font-[family-name:var(--font-inter)]"
                              >
                                +
                              </button>
                            </div>
                            {attemptedIncrease.has(itemKey) && (
                              <p className="text-xs text-[#F8330D] font-bold font-[family-name:var(--font-inter)]">
                                No more available in stock
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-300">
                <div className="flex justify-between mb-4">
                  <span className="text-lg font-semibold text-black font-[family-name:var(--font-inter)]">Total:</span>
                  <span className="text-lg font-bold text-black font-[family-name:var(--font-inter)]">${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={checkout}
                  className="w-full px-6 py-3 rounded-full text-base font-semibold text-white bg-[#f7330c] hover:bg-black transition-all font-[family-name:var(--font-inter)] hover-wiggle"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
