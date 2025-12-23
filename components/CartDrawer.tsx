"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import Image from "next/image";

export default function CartDrawer() {
  const { cart, isCartOpen, closeCart, removeFromCart, updateQuantity, checkout, cartCount } = useCart();

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#F2F2F2] z-[70] flex flex-col"
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
                  {cart.map((item) => (
                    <div
                      key={item.variantId}
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
                        <p className="text-sm text-gray-600 mb-2 font-[family-name:var(--font-inter)]">
                          ${item.price.toFixed(2)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 font-[family-name:var(--font-inter)]">
                            Qty: {item.quantity}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.variantId)}
                            className="ml-auto text-xs text-[#F8330D] hover:underline font-[family-name:var(--font-inter)]"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  className="w-full px-6 py-3 border-2 border-black rounded-full text-base font-semibold text-black hover:bg-black hover:text-white transition-all font-[family-name:var(--font-inter)]"
                  style={{ boxShadow: '0px 4px 4px 0px #F8330D' }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'inset 0px 0px 10px 2px rgba(0, 0, 0, 0.8)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0px 4px 4px 0px #F8330D'}
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
