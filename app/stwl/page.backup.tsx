"use client";

import { useEffect, useRef, useState } from 'react';

// Add new posters to this array each week!
const POSTERS = [
  { id: 1, label: "Poster 1" },
  { id: 2, label: "Poster 2" },
  { id: 3, label: "Poster 3" },
  { id: 4, label: "Poster 4" },
  { id: 5, label: "Poster 5" },
  { id: 6, label: "Poster 6" },
  { id: 7, label: "Poster 7" },
  { id: 8, label: "Poster 8" },
  { id: 9, label: "Poster 9" },
  { id: 10, label: "Poster 10" },
];

export default function STWLTW() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const positionRef = useRef(0);
  const [scrollSpeed, setScrollSpeed] = useState(0);
  const centerOffsetRef = useRef(0);

  useEffect(() => {
    // Calculate center position on mount
    if (wrapperRef.current) {
      const viewportHeight = window.innerHeight;
      const posterHeight = viewportHeight * 0.8; // 80vh
      centerOffsetRef.current = (viewportHeight - posterHeight) / 2;
      // Start with negative position to move content down and center first poster
      positionRef.current = -centerOffsetRef.current;
    }
  }, []);

  useEffect(() => {
    const animate = () => {
      if (wrapperRef.current) {
        // Update position
        positionRef.current += scrollSpeed;

        // Apply transform
        wrapperRef.current.style.transform = `translateY(-${positionRef.current}px)`;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [scrollSpeed]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const viewportHeight = window.innerHeight;
    const mouseY = e.clientY;
    const edgeThreshold = viewportHeight * 0.2; // 20% from edges

    if (mouseY < edgeThreshold) {
      setScrollSpeed(2); // Move down (reverse)
    } else if (mouseY > viewportHeight - edgeThreshold) {
      setScrollSpeed(-2); // Move up (forward)
    } else {
      setScrollSpeed(0); // Pause
    }
  };

  const handleMouseLeave = () => {
    setScrollSpeed(0);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .poster-card {
          transition: transform 0.3s ease;
          cursor: pointer;
        }
        .poster-card:hover {
          transform: scale(1.1);
          z-index: 10;
        }
      `}} />
      <main className="min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#ECECE2' }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        <div className="relative h-full overflow-hidden px-8">
          <div
            ref={wrapperRef}
            className="flex flex-col gap-8"
            style={{ paddingTop: '8vh', paddingBottom: '50vh', willChange: 'transform' }}
          >
            {POSTERS.map((poster) => (
              <div
                key={poster.id}
                className="poster-card flex-shrink-0 bg-gray-300 rounded-lg shadow-xl flex items-center justify-center"
                style={{
                  width: '64vh',
                  height: '80vh',
                }}
              >
                <span className="text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-black">{poster.id}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
