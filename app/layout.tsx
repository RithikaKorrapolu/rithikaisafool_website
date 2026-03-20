"use client";

import "./globals.css";
import Header from "@/components/Header";
import Menu from "@/components/Menu";
import CartDrawer from "@/components/CartDrawer";
import FloatingSignupPopup from "@/components/FloatingSignupPopup";
import { CartProvider } from "@/context/CartContext";
import { Inter, Jaldi, Neuton, Archivo_Narrow, Noto_Serif_Ethiopic, Instrument_Serif } from 'next/font/google';
import localFont from 'next/font/local';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jaldi = Jaldi({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-jaldi', display: 'swap' });
const neuton = Neuton({ weight: ['400'], subsets: ['latin'], variable: '--font-neuton', display: 'swap' });
const archivoNarrow = Archivo_Narrow({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-archivo-narrow', display: 'swap' });
const notoSerifEthiopic = Noto_Serif_Ethiopic({ weight: ['400'], subsets: ['latin'], variable: '--font-noto-serif-ethiopic', display: 'swap' });
const instrumentSerif = Instrument_Serif({ weight: ['400'], subsets: ['latin'], variable: '--font-instrument-serif', display: 'swap' });
const abrilFatface = localFont({
  src: '../public/fonts/Abril_Fatface/AbrilFatface-Regular.ttf',
  variable: '--font-abril-fatface',
  display: 'swap',
});
const loubag = localFont({
  src: '../public/fonts/loubag/Loubag-Medium.otf',
  variable: '--font-loubag',
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Check if we're on a standalone project page (like stwl or sample pages)
  const isStandalonePage = pathname?.startsWith('/shop/let-me-show-you-sample') || pathname?.startsWith('/let-me-show-you') || pathname === '/theRIAFMuseumOfArt' || pathname === '/shop/stranger-archive' || pathname === '/songs-that-hold-memories-exhibit';

  // Scroll to top on route change
  useEffect(() => {
    // Disable browser's scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    // Multiple methods to ensure scroll to top works on all devices
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    // Slight delay for mobile browsers
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, 10);
  }, [pathname]);

  return (
    <html lang="en">
      <body className={`antialiased ${inter.variable} ${jaldi.variable} ${neuton.variable} ${abrilFatface.variable} ${loubag.variable} ${archivoNarrow.variable} ${notoSerifEthiopic.variable} ${instrumentSerif.variable}`}>
        <CartProvider>
          {!isStandalonePage && (
            <>
              <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
              <Header onMenuClick={() => setIsMenuOpen(true)} />
              <CartDrawer />
            </>
          )}
          {children}
          <FloatingSignupPopup />
        </CartProvider>
      </body>
    </html>
  );
}
