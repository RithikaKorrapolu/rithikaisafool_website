"use client";

import { useEffect, useRef, useCallback } from "react";

interface AnimatedGridProps {
  columns?: number;
  rows?: number;
  strokeColor?: string;
  strokeWidth?: number;
  hoveredCell?: { row: number; col: number } | null;
}

export default function AnimatedGrid({
  columns = 3,
  rows = 4,
  strokeColor = "rgba(0, 0, 0, 0.12)",
  strokeWidth = 1,
  hoveredCell = null,
}: AnimatedGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    if (width === 0 || height === 0) return null;

    // Set canvas size with device pixel ratio for sharp lines
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    return { ctx, width, height };
  }, []);

  const drawGrid = useCallback(() => {
    const setup = setupCanvas();
    if (!setup) return;

    const { ctx, width, height } = setup;
    ctx.clearRect(0, 0, width, height);

    // Draw hand-drawn squiggly grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = strokeWidth + 1;

    // Seeded random for consistent squiggles
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };

    const squiggleAmount = 3;
    const segmentLength = 15;

    // Vertical lines
    for (let i = 0; i <= columns; i++) {
      const baseX = (i / columns) * width;
      ctx.beginPath();
      for (let y = 0; y <= height; y += segmentLength) {
        const seed = i * 1000 + y;
        const offset = (seededRandom(seed) - 0.5) * squiggleAmount * 2;
        if (y === 0) ctx.moveTo(baseX + offset, y);
        else ctx.lineTo(baseX + offset, y);
      }
      ctx.stroke();
    }

    // Horizontal lines
    for (let i = 0; i <= rows; i++) {
      const baseY = (i / rows) * height;
      ctx.beginPath();
      for (let x = 0; x <= width; x += segmentLength) {
        const seed = i * 2000 + x;
        const offset = (seededRandom(seed) - 0.5) * squiggleAmount * 2;
        if (x === 0) ctx.moveTo(x, baseY + offset);
        else ctx.lineTo(x, baseY + offset);
      }
      ctx.stroke();
    }
  }, [columns, rows, strokeWidth, setupCanvas]);

  useEffect(() => {
    drawGrid();

    const handleResize = () => drawGrid();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [drawGrid]);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
      />
    </div>
  );
}
