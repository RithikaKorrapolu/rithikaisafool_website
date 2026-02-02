"use client";

import "./globals.css";
import Header from "@/components/Header";
import Menu from "@/components/Menu";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { Inter, Jaldi, Neuton, Archivo_Narrow } from 'next/font/google';
import localFont from 'next/font/local';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jaldi = Jaldi({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-jaldi', display: 'swap' });
const neuton = Neuton({ weight: ['400'], subsets: ['latin'], variable: '--font-neuton', display: 'swap' });
const archivoNarrow = Archivo_Narrow({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-archivo-narrow', display: 'swap' });
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
  const isStandalonePage = pathname?.startsWith('/stwl') || pathname?.startsWith('/shop/let-me-show-you-sample');

  return (
    <html lang="en">
      <body className={`antialiased ${inter.variable} ${jaldi.variable} ${neuton.variable} ${abrilFatface.variable} ${loubag.variable} ${archivoNarrow.variable}`}>
        <CartProvider>
          {!isStandalonePage && (
            <>
              <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
              <Header onMenuClick={() => setIsMenuOpen(true)} />
              <CartDrawer />
            </>
          )}
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
