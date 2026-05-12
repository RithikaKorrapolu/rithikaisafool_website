"use client";

import Header from "@/components/Header";
import Menu from "@/components/Menu";
import CartDrawer from "@/components/CartDrawer";
import FloatingSignupPopup from "@/components/FloatingSignupPopup";
import { CartProvider } from "@/context/CartContext";
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Check if we're on a standalone project page
  const isStandalonePage = pathname?.startsWith('/shop/let-me-show-you-sample') || pathname?.startsWith('/let-me-show-you') || pathname === '/theRIAFMuseumOfArt' || pathname === '/shop/stranger-archive' || pathname === '/songs-that-hold-memories-exhibit' || pathname === '/please-hold';

  // Scroll to top on route change
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 10);
  }, [pathname]);

  return (
    <CartProvider>
      {!isStandalonePage && (
        <>
          <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          <Header onMenuClick={() => setIsMenuOpen(true)} />
          <CartDrawer />
        </>
      )}
      {children}
      {!isStandalonePage && <FloatingSignupPopup />}
    </CartProvider>
  );
}
