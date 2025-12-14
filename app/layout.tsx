"use client";

import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Menu from "@/components/Menu";
import { Inter, Jaldi } from 'next/font/google';
import { useState } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jaldi = Jaldi({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-jaldi' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <html lang="en">
      <body className={`antialiased ${inter.variable} ${jaldi.variable}`}>
        <Menu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        <Header onMenuClick={() => setIsMenuOpen(true)} />
        {children}
      </body>
    </html>
  );
}
