"use client";

import { useState, useEffect, useRef } from "react";

interface BouncingBallPosterProps {
  showLogo?: boolean;
  isHovered?: boolean;
}

export function BouncingBallPoster({ showLogo = false, isHovered = false }: BouncingBallPosterProps = {}) {
  const [ballPos, setBallPos] = useState({ x: 50, y: 50 });
  const ballVelocity = useRef({ x: 1.2, y: 0.9 });
  const animationRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [radiusPercent, setRadiusPercent] = useState({ x: 12, y: 12 });

  useEffect(() => {
    // Calculate the ball radius as a percentage of container dimensions
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const ballRadiusPx = 60;
      setRadiusPercent({
        x: (ballRadiusPx / width) * 100,
        y: (ballRadiusPx / height) * 100
      });
    }
  }, []);

  useEffect(() => {
    // Initialize with random values only on client side
    if (!isInitialized) {
      const minBound = Math.max(radiusPercent.x, radiusPercent.y);
      const maxBound = 100 - minBound;
      setBallPos({
        x: Math.random() * (maxBound - minBound) + minBound,
        y: Math.random() * (maxBound - minBound) + minBound
      });
      ballVelocity.current = {
        x: (Math.random() - 0.5) * 2.4,
        y: (Math.random() - 0.5) * 1.8
      };
      setIsInitialized(true);
    }

    const animate = () => {
      setBallPos(prev => {
        let newX = prev.x + ballVelocity.current.x;
        let newY = prev.y + ballVelocity.current.y;

        // Account for ball radius in boundary detection
        if (newX <= radiusPercent.x || newX >= 100 - radiusPercent.x) {
          ballVelocity.current.x *= -1;
          ballVelocity.current.y += (Math.random() - 0.5) * 0.1;
          newX = Math.max(radiusPercent.x, Math.min(100 - radiusPercent.x, newX));
        }
        if (newY <= radiusPercent.y || newY >= 100 - radiusPercent.y) {
          ballVelocity.current.y *= -1;
          ballVelocity.current.x += (Math.random() - 0.5) * 0.1;
          newY = Math.max(radiusPercent.y, Math.min(100 - radiusPercent.y, newY));
        }

        return { x: newX, y: newY };
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [radiusPercent, isInitialized]);

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* Red layer (background) - hoodie + logo */}
      <div className="absolute inset-0">
        <img
          src="/assets/Sweatshirt/redcover.png"
          alt="Red Hoodie"
          className="absolute inset-0 w-full h-full object-contain"
        />
        {showLogo && (
          <img
            src="/assets/shop/Shop Logo Red.png"
            alt="Shop Logo Red"
            className="absolute top-4 right-4 w-18 h-18 md:w-22 md:h-22 object-contain shop-sticker"
            style={isHovered ? {
              transform: 'rotate(360deg)',
              transition: 'transform 0.6s ease-in-out'
            } : {
              transition: 'transform 0.6s ease-in-out'
            }}
          />
        )}
      </div>
      {/* Black layer (top) - hoodie + logo with mask */}
      <div
        className="absolute inset-0"
        style={{
          maskImage: `radial-gradient(circle at ${ballPos.x}% ${ballPos.y}%, transparent 0%, transparent 50px, black 70px)`,
          WebkitMaskImage: `radial-gradient(circle at ${ballPos.x}% ${ballPos.y}%, transparent 0%, transparent 50px, black 70px)`,
        }}
      >
        <img
          src="/assets/Sweatshirt/blackcover.png"
          alt="Black Hoodie"
          className="absolute inset-0 w-full h-full object-contain"
        />
        {showLogo && (
          <img
            src="/assets/shop/Shop Logo.png"
            alt="Shop Logo"
            className="absolute top-4 right-4 w-18 h-18 md:w-22 md:h-22 object-contain shop-sticker"
            style={isHovered ? {
              transform: 'rotate(360deg)',
              transition: 'transform 0.6s ease-in-out'
            } : {
              transition: 'transform 0.6s ease-in-out'
            }}
          />
        )}
      </div>
    </div>
  );
}
