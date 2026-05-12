import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { Inter, Jaldi, Neuton, Archivo_Narrow, Noto_Serif_Ethiopic, Instrument_Serif } from 'next/font/google';
import localFont from 'next/font/local';
import type { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap', preload: true });
const instrumentSerif = Instrument_Serif({ weight: ['400'], subsets: ['latin'], variable: '--font-instrument-serif', display: 'swap', preload: true });
const jaldi = Jaldi({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-jaldi', display: 'swap', preload: false });
const neuton = Neuton({ weight: ['400'], subsets: ['latin'], variable: '--font-neuton', display: 'swap', preload: false });
const archivoNarrow = Archivo_Narrow({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-archivo-narrow', display: 'swap', preload: false });
const notoSerifEthiopic = Noto_Serif_Ethiopic({ weight: ['400'], subsets: ['latin'], variable: '--font-noto-serif-ethiopic', display: 'swap', preload: false });
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

export const metadata: Metadata = {
  title: 'Rithika is a Fool',
  description: 'A chance to be fools',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical images for faster LCP */}
        <link rel="preload" href="/assets/shop awning 2.webp" as="image" type="image/webp" />
        <link rel="preload" href="/assets/SongsThatHoldMemories/democover-poster.webp" as="image" type="image/webp" />
        <link rel="preload" href="/assets/COTM/coverreal.webp" as="image" type="image/webp" />
      </head>
      <body className={`antialiased ${inter.variable} ${jaldi.variable} ${neuton.variable} ${abrilFatface.variable} ${loubag.variable} ${archivoNarrow.variable} ${notoSerifEthiopic.variable} ${instrumentSerif.variable}`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
