"use client";

import { useEffect, useState, useRef } from "react";

export default function Eyes() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const eyeRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePupilPosition = (eyeIndex: number) => {
    const eye = eyeRefs.current[eyeIndex];
    if (!eye) return { x: 0, y: 0 };

    const eyeRect = eye.getBoundingClientRect();
    const eyeCenterX = eyeRect.left + eyeRect.width / 2;
    const eyeCenterY = eyeRect.top + eyeRect.height / 2;

    const angle = Math.atan2(mousePos.y - eyeCenterY, mousePos.x - eyeCenterX);
    // In SVG coordinates: eye radius is 45, pupil radius is 20
    // Max distance = 45 - 20 = 25 to keep pupil fully inside eye
    const maxDistance = 25;

    return {
      x: Math.cos(angle) * maxDistance,
      y: Math.sin(angle) * maxDistance,
    };
  };

  return (
    <>
      <div className="text-[64px] sm:text-[80px] md:text-[96px] lg:text-[122px] font-light font-[family-name:var(--font-inter)] text-black flex items-center gap-0 tracking-tighter follow-text justify-center" style={{ lineHeight: '1' }}>
        {/* F●ll●w us around - all on one line */}
        <span>F</span>

        {/* First eye (first 'o') */}
        <span
          ref={(el) => { eyeRefs.current[0] = el; }}
          className="relative inline-flex items-center justify-center"
          style={{ width: '0.594em', height: '0.594em', verticalAlign: 'text-bottom' }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Eye white */}
            <circle cx="50" cy="50" r="45" fill="white" />
            {/* Pupil */}
            <circle
              cx={50 + calculatePupilPosition(0).x}
              cy={50 + calculatePupilPosition(0).y}
              r="20"
              fill="black"
            />
          </svg>
        </span>

        <span>ll</span>

        {/* Second eye (second 'o') */}
        <span
          ref={(el) => { eyeRefs.current[1] = el; }}
          className="relative inline-flex items-center justify-center"
          style={{ width: '0.594em', height: '0.594em', verticalAlign: 'text-bottom' }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Eye white */}
            <circle cx="50" cy="50" r="45" fill="white" />
            {/* Pupil */}
            <circle
              cx={50 + calculatePupilPosition(1).x}
              cy={50 + calculatePupilPosition(1).y}
              r="20"
              fill="black"
            />
          </svg>
        </span>

        <span>w us around</span>
      </div>
    </>
  );
}
