import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
