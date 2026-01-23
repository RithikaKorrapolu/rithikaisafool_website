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
      <style jsx>{`
        @keyframes soundWave {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-4px) scaleY(1.5); }
        }
        @keyframes barWave1 {
          0%, 100% { height: 25px; }
          50% { height: 85px; }
        }
        @keyframes barWave2 {
          0%, 100% { height: 43px; }
          40% { height: 110px; }
        }
        @keyframes barWave3 {
          0%, 100% { height: 17px; }
          60% { height: 76px; }
        }
        @keyframes barWave4 {
          0%, 100% { height: 34px; }
          35% { height: 94px; }
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
        {/* Floating number blobs */}
        {[
          { num: '6', startX: -100, startY: -80, endX: 500, endY: 600, rotate: 30, duration: 2.2, delay: 0 },
          { num: '0', startX: 450, startY: -100, endX: -150, endY: 550, rotate: -25, duration: 2.5, delay: 0.3 },
          { num: '9', startX: -80, startY: 350, endX: 520, endY: -80, rotate: 45, duration: 1.9, delay: 0.6 },
          { num: '7', startX: 400, startY: 500, endX: -100, endY: -50, rotate: -40, duration: 2.3, delay: 0.9 },
          { num: '3', startX: -120, startY: 150, endX: 550, endY: 400, rotate: 20, duration: 2.1, delay: 1.2 },
          { num: '2', startX: 480, startY: 200, endX: -80, endY: 450, rotate: -35, duration: 2.4, delay: 1.5 },
          { num: '4', startX: 200, startY: -100, endX: 100, endY: 650, rotate: 15, duration: 2.0, delay: 1.8 },
          { num: '8', startX: -60, startY: 500, endX: 480, endY: 100, rotate: -50, duration: 2.6, delay: 2.1 },
        ].map((item, index) => (
          <motion.span
            key={index}
            initial={{ x: item.startX, y: item.startY, rotate: 0 }}
            animate={{ x: item.endX, y: item.endY, rotate: item.rotate }}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              ease: "linear",
              delay: item.delay,
            }}
            style={{
              position: 'absolute',
              fontSize: '80px',
              fontWeight: 'bold',
              color: 'rgba(255,255,255,0.5)',
              filter: 'blur(8px)',
              fontFamily: 'var(--font-loubag), Arial, sans-serif',
              top: 0,
              left: 0,
            }}
          >
            {item.num}
          </motion.span>
        ))}

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
      <div style={{
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
                  animation: `${randomAnim} ${randomDuration}s ease-in-out infinite`,
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
                animation: `soundWave 0.6s ease-in-out infinite`,
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
