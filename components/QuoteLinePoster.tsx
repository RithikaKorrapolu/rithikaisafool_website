"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// Control variables
const BORDER_INSET = 35; // px from edge
const FONT_SIZE = 24; // px
const LETTER_SPACING = 2; // px
const PHONE_NUMBER = "609-732-2482";
const GAP = "                    "; // 20 spaces for large gaps

export default function QuoteLinePoster() {

  // Create border text with gaps - massive repetition for seamless loop
  const borderText = Array(40).fill(PHONE_NUMBER + GAP).join("");

  // Calculate path for border text (rectangular path)
  const width = 500;
  const height = 625;
  const inset = BORDER_INSET;

  // Create a rectangular path with rounded corners
  const cornerRadius = 10;
  const pathD = `
    M ${inset + cornerRadius} ${inset}
    L ${width - inset - cornerRadius} ${inset}
    Q ${width - inset} ${inset} ${width - inset} ${inset + cornerRadius}
    L ${width - inset} ${height - inset - cornerRadius}
    Q ${width - inset} ${height - inset} ${width - inset - cornerRadius} ${height - inset}
    L ${inset + cornerRadius} ${height - inset}
    Q ${inset} ${height - inset} ${inset} ${height - inset - cornerRadius}
    L ${inset} ${inset + cornerRadius}
    Q ${inset} ${inset} ${inset + cornerRadius} ${inset}
    Z
  `;

  return (
    <>
      <style>{`
        @-webkit-keyframes soundWave {
          0%, 100% { -webkit-transform: translateY(0) scaleY(1); transform: translateY(0) scaleY(1); }
          50% { -webkit-transform: translateY(-4px) scaleY(1.5); transform: translateY(-4px) scaleY(1.5); }
        }
        @keyframes soundWave {
          0%, 100% { -webkit-transform: translateY(0) scaleY(1); transform: translateY(0) scaleY(1); }
          50% { -webkit-transform: translateY(-4px) scaleY(1.5); transform: translateY(-4px) scaleY(1.5); }
        }
        @-webkit-keyframes barWave1 {
          0%, 100% { height: 25px; }
          50% { height: 85px; }
        }
        @keyframes barWave1 {
          0%, 100% { height: 25px; }
          50% { height: 85px; }
        }
        @-webkit-keyframes barWave2 {
          0%, 100% { height: 43px; }
          40% { height: 110px; }
        }
        @keyframes barWave2 {
          0%, 100% { height: 43px; }
          40% { height: 110px; }
        }
        @-webkit-keyframes barWave3 {
          0%, 100% { height: 17px; }
          60% { height: 76px; }
        }
        @keyframes barWave3 {
          0%, 100% { height: 17px; }
          60% { height: 76px; }
        }
        @-webkit-keyframes barWave4 {
          0%, 100% { height: 34px; }
          35% { height: 94px; }
        }
        @keyframes barWave4 {
          0%, 100% { height: 34px; }
          35% { height: 94px; }
        }
        @media (max-width: 375px) {
          .phone-visualizer {
            -webkit-transform: translate(-50%, -50%) scale(0.95) !important;
            transform: translate(-50%, -50%) scale(0.95) !important;
          }
        }
      `}</style>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          background: `
            radial-gradient(ellipse 80% 50% at 20% 30%, #b8eafa 0%, transparent 50%),
            radial-gradient(ellipse 60% 70% at 80% 20%, #9fe2f9 0%, transparent 40%),
            radial-gradient(ellipse 70% 60% at 70% 80%, #89dcf8 0%, transparent 45%),
            radial-gradient(ellipse 90% 40% at 30% 70%, #b8eafa 0%, transparent 50%),
            radial-gradient(ellipse 50% 80% at 50% 50%, #9fe2f9 0%, transparent 60%),
            linear-gradient(180deg, #ebf8fd 0%, #b8eafa 50%, #89dcf8 100%)
          `,
          overflow: 'hidden',
          borderRadius: '8px'
        }}
      >
        {/* Cover image on top */}
        <Image
          src="/assets/QuoteLine/quotecover8.png"
          alt="Quote Line"
          width={500}
          height={625}
          className="absolute inset-0 w-full h-full object-contain z-10"
          unoptimized
        />


      {/* Phone number and visualizer */}
      <div className="phone-visualizer" style={{
        position: 'absolute',
        top: '55%',
        left: '60%',
        transform: 'translate(-50%, -50%)',
        zIndex: 20
      }}>
        {/* Sound wave bars behind text */}
        <div style={{
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          gap: '1px',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 0
        }}>
          {Array.from({ length: 72 }).map((_, index) => {
            const animations = ['barWave1', 'barWave2', 'barWave3', 'barWave4'];
            const durations = [0.5, 0.7, 0.6, 0.8, 0.55, 0.65];
            const randomAnim = animations[index % animations.length];
            const randomDuration = durations[index % durations.length];
            return (
              <div
                key={index}
                style={{
                  width: '2.5px',
                  backgroundColor: 'black',
                  borderRadius: '9999px',
                  border: '1px solid black',
                  height: '11px',
                  WebkitAnimation: `${randomAnim} ${randomDuration}s ease-in-out infinite`,
                  animation: `${randomAnim} ${randomDuration}s ease-in-out infinite`,
                  WebkitAnimationDelay: `${(index * 0.03) + (index % 3) * 0.1}s`,
                  animationDelay: `${(index * 0.03) + (index % 3) * 0.1}s`
                }}
              />
            );
          })}
        </div>
        {/* Phone number text */}
        <div style={{
          position: 'relative',
          fontSize: '2rem',
          fontWeight: 'bold',
          color: 'white',
          fontFamily: 'var(--font-loubag), Arial, sans-serif',
          display: 'flex',
          zIndex: 1,
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
        }}>
          {PHONE_NUMBER.split('').map((char, index) => (
            <span
              key={index}
              style={{
                display: 'inline-block',
                WebkitAnimation: `soundWave 0.6s ease-in-out infinite`,
                animation: `soundWave 0.6s ease-in-out infinite`,
                WebkitAnimationDelay: `${index * 0.05}s`,
                animationDelay: `${index * 0.05}s`
              }}
            >
              {char}
            </span>
          ))}
        </div>
      </div>
      </div>
    </>
  );
}
