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
  customProperties?: { [key: string]: string };
  quantityAvailable?: number;
  sellingPlanId?: string;
  sellingPlanName?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantityAvailable?: number, sellingPlan?: { id: string; name: string } | null) => { error?: string } | void;
  removeFromCart: (variantId: string, sellingPlanId?: string) => void;
  updateQuantity: (variantId: string, quantity: number, sellingPlanId?: string) => void;
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

  const addToCart = (product: any, quantityAvailable?: number, sellingPlan?: { id: string; name: string } | null) => {
    const variantIndex = product.selectedVariantIndex ?? 0;
    const selectedVariant = product.variants?.[variantIndex];
    const variantId = selectedVariant?.id;

    // Check if this is the "A Stranger Designed My Hoodie" product - limit to 1
    const isStrangerProduct = product.title?.toLowerCase().includes('stranger');
    if (isStrangerProduct) {
      const existingStrangerItem = cart.find(item =>
        item.title?.toLowerCase().includes('stranger')
      );
      if (existingStrangerItem) {
        return { error: 'You can only add one of this item to your cart' };
      }
    }

    // Find existing item - must match both variantId AND sellingPlanId
    const existingItem = cart.find(item =>
      item.variantId === variantId && item.sellingPlanId === (sellingPlan?.id || undefined)
    );

    // Check inventory if quantityAvailable is provided and greater than 0
    // (0 or null means inventory is not tracked - allow unlimited)
    if (quantityAvailable !== undefined && quantityAvailable !== null && quantityAvailable > 0) {
      const currentQuantityInCart = existingItem?.quantity || 0;
      if (currentQuantityInCart >= quantityAvailable) {
        return { error: 'No more available in stock' };
      }
    }

    if (existingItem) {
      // Don't increase quantity for stranger product
      if (isStrangerProduct) {
        return { error: 'You can only add one of this item to your cart' };
      }
      setCart(cart.map(item =>
        item.variantId === variantId && item.sellingPlanId === (sellingPlan?.id || undefined)
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
        customProperties: product.customProperties,
        quantityAvailable,
        sellingPlanId: sellingPlan?.id,
        sellingPlanName: sellingPlan?.name,
      };
      setCart([...cart, newItem]);
    }
  };

  const removeFromCart = (variantId: string, sellingPlanId?: string) => {
    setCart(cart.filter(item =>
      !(item.variantId === variantId && item.sellingPlanId === sellingPlanId)
    ));
  };

  const updateQuantity = (variantId: string, quantity: number, sellingPlanId?: string) => {
    if (quantity <= 0) {
      removeFromCart(variantId, sellingPlanId);
    } else {
      setCart(cart.map(item => {
        if (item.variantId === variantId && item.sellingPlanId === sellingPlanId) {
          // Limit "A Stranger Designed My Hoodie" to 1
          if (item.title?.toLowerCase().includes('stranger')) {
            return { ...item, quantity: 1 };
          }
          // Check if trying to exceed inventory (only if quantityAvailable is a positive number)
          // 0, null, undefined, or negative means unlimited stock
          if (item.quantityAvailable !== undefined && item.quantityAvailable > 0) {
            const newQuantity = Math.min(quantity, item.quantityAvailable);
            return { ...item, quantity: newQuantity };
          }
          return { ...item, quantity };
        }
        return item;
      }));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const checkout = async () => {
    try {
      // Use GraphQL Cart API to support subscriptions
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

      const lines = cart.map(item => {
        const line: any = {
          merchandiseId: item.variantId,
          quantity: item.quantity,
        };
        if (item.sellingPlanId) {
          line.sellingPlanId = item.sellingPlanId;
        }
        if (item.customProperties) {
          line.attributes = Object.entries(item.customProperties).map(([key, value]) => ({ key, value }));
        }
        return line;
      });

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
              input: { lines }
            }
          }),
        }
      );

      const data = await response.json();

      if (data.data?.cartCreate?.cart?.checkoutUrl) {
        window.location.href = data.data.cartCreate.cart.checkoutUrl;
      } else {
        console.error('Cart creation error:', data.data?.cartCreate?.userErrors || data.errors);
        alert('Unable to process checkout. Please try again.');
      }
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
