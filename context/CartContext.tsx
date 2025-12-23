"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { client } from "@/lib/shopify";

interface CartItem {
  id: string;
  variantId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any) => { error?: string } | void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  checkout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any) => {
    const variantIndex = product.selectedVariantIndex ?? 0;
    const selectedVariant = product.variants?.[variantIndex];
    const variantId = selectedVariant?.id;
    const existingItem = cart.find(item => item.variantId === variantId);

    // Check if this product (any variant) is already in cart
    const existingProductInCart = cart.find(item => item.id === product.id);

    if (existingProductInCart) {
      return { error: 'You can only purchase one item per month. Please remove the current item from your cart if you want to select a different size.' };
    }

    if (existingItem) {
      if (existingItem.quantity >= 1) {
        return { error: 'Maximum quantity of 1 per month.' };
      }
      setCart(cart.map(item =>
        item.variantId === variantId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: product.id,
        variantId,
        title: `${product.title}${selectedVariant.title !== 'Default Title' ? ` - ${selectedVariant.title}` : ''}`,
        price: parseFloat(selectedVariant.price.amount),
        quantity: 1,
        image: product.images?.[0]?.src,
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (variantId: string) => {
    setCart(cart.filter(item => item.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
    } else if (quantity > 1) {
      alert('Maximum quantity of 1 per month.');
      return;
    } else {
      setCart(cart.map(item =>
        item.variantId === variantId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const checkout = async () => {
    try {
      const shopifyCheckout = await client.checkout.create();
      const lineItemsToAdd = cart.map(item => ({
        variantId: item.variantId,
        quantity: item.quantity
      }));

      const updatedCheckout = await client.checkout.addLineItems(shopifyCheckout.id, lineItemsToAdd);

      window.open(updatedCheckout.webUrl, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      alert('Unable to process checkout. Please try again.');
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      isCartOpen,
      openCart,
      closeCart,
      checkout,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
