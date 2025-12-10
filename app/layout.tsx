import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import { Inter, Jaldi } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jaldi = Jaldi({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-jaldi' });

export const metadata: Metadata = {
  title: "Rithika's Portfolio",
  description: "An animation-rich, modern portfolio website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased ${inter.variable} ${jaldi.variable}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
