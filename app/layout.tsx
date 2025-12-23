"use client";

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Menu from "@/components/Menu";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";
import { Inter, Jaldi, Neuton } from 'next/font/google';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jaldi = Jaldi({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-jaldi' });
const neuton = Neuton({ weight: ['400'], subsets: ['latin'], variable: '--font-neuton' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <html lang="en">
      <body className={`antialiased ${inter.variable} ${jaldi.variable} ${neuton.variable}`}>
        <CartProvider>
          <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
          <Header onMenuClick={() => setIsMenuOpen(true)} />
          <CartDrawer />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
