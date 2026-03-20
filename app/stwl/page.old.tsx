"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";

const RevealImage = ({ src, alt, onFullyRevealed }: { src: string; alt: string; onFullyRevealed: () => void }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [maskUrl, setMaskUrl] = useState<string>("");
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const lastPosRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fullyRevealed, setFullyRevealed] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ x: number; y: number; delay: number; duration: number }>>([]);

  const initializeCanvas = () => {
    if (canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const img = imageRef.current;

      // Set canvas dimensions to match the actual rendered image
      canvas.width = img.offsetWidth;
      canvas.height = img.offsetHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const checkRevealPercentage = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let transparentPixels = 0;
    const totalPixels = canvas.width * canvas.height;

    // Check alpha channel (every 4th value in the array)
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const revealPercentage = (transparentPixels / totalPixels) * 100;

    if (revealPercentage >= 50 && !fullyRevealed) {
      setFullyRevealed(true);
      onFullyRevealed();
    }
  };

  useEffect(() => {
    if (imageLoaded) {
      initializeCanvas();

      // Generate random sparkles
      const newSparkles = [];
      for (let i = 0; i < 20; i++) {
        newSparkles.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 2,
          duration: 1.5 + Math.random() * 1.5,
        });
      }
      setSparkles(newSparkles);
    }
  }, [imageLoaded]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !canvasRef.current || fullyRevealed) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only draw if mouse has moved at least 3 pixels from last position
    const dx = x - lastPosRef.current.x;
    const dy = y - lastPosRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 3) return;

    lastPosRef.current = { x, y };

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      // Draw a circle to reveal (transparent area)
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();

      // Update mask immediately
      setMaskUrl(canvas.toDataURL());

      // Check if 50% is revealed
      checkRevealPercentage();
    }
  };

  return (
    <div
      ref={containerRef}
      className="reveal-container relative mb-8"
      onMouseMove={handleMouseMove}
    >
      {/* Hidden canvas for mask */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      {/* Clear image layer */}
      <div style={{ position: 'relative' }}>
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          onLoad={() => setImageLoaded(true)}
          className="w-full h-auto clear-layer"
          style={{ display: 'block' }}
        />
      </div>

      {/* Blurred overlay */}
      <div
        className={`blur-layer ${fullyRevealed ? 'fading' : ''}`}
        style={{
          WebkitMaskImage: maskUrl ? `url(${maskUrl})` : 'none',
          maskImage: maskUrl ? `url(${maskUrl})` : 'none',
        }}
      >
        <Image
          src={src}
          alt={`${alt} Blurred`}
          width={1200}
          height={800}
          className="w-full h-auto"
        />
      </div>

      {/* Sparkles on top of blur */}
      {!fullyRevealed && (
        <div className="sparkles">
          {sparkles.map((sparkle, index) => (
            <div
              key={index}
              className="sparkle"
              style={{
                left: `${sparkle.x}%`,
                top: `${sparkle.y}%`,
                animation: `${index % 2 === 0 ? 'sparkle' : 'sparkle-delayed'} ${sparkle.duration}s ease-in-out infinite`,
                animationDelay: `${sparkle.delay}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface Position {
  x: number;
  y: number;
  width: number;
  height: number;
}

const checkOverlap = (pos1: Position, pos2: Position): boolean => {
  return !(
    pos1.x + pos1.width < pos2.x ||
    pos2.x + pos2.width < pos1.x ||
    pos1.y + pos1.height < pos2.y ||
    pos2.y + pos2.height < pos1.y
  );
};

export default function STWL() {
  const [allSetsPositions, setAllSetsPositions] = useState<{ [key: number]: Position[] }>({});
  const [currentSet, setCurrentSet] = useState(1);
  const [revealedCount, setRevealedCount] = useState(0);
  const [imagesExist, setImagesExist] = useState(true);
  const [revealedSets, setRevealedSets] = useState<number[]>([]);
  const [showWhatIsThis, setShowWhatIsThis] = useState(false);
  const [showTellUsYours, setShowTellUsYours] = useState(false);
  const [showSeeAll, setShowSeeAll] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionName, setSubmissionName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const generatePositions = () => {
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Calculate scale factor based on viewport - 30% bigger on mobile
      let scale = 1;
      if (viewportWidth < 640) {
        scale = 0.585; // 30% bigger than before
      } else if (viewportWidth < 768) {
        scale = 0.715; // 30% bigger than before
      } else if (viewportWidth < 1024) {
        scale = 0.7;
      } else {
        scale = 0.85;
      }

      // Set 3 images are 69% bigger (1.3 * 1.3)
      const set3Multiplier = currentSet === 3 ? 1.69 : 1;

      const images = [
        {
          width: 224 * scale * set3Multiplier * (currentSet === 4 ? 1.3 : 1),
          height: 280 * scale * set3Multiplier * (currentSet === 4 ? 1.3 : 1)
        }, // .1 - 30% bigger if set 4
        {
          width: 291 * scale * set3Multiplier * (currentSet === 1 ? 1.3 : 1),
          height: 364 * scale * set3Multiplier * (currentSet === 1 ? 1.3 : 1)
        }, // .2 - 30% bigger base, plus 30% more if set 1
        {
          width: 269 * scale * set3Multiplier * (currentSet === 2 ? 1.4 : currentSet === 4 ? 1.4 : 1),
          height: 336 * scale * set3Multiplier * (currentSet === 2 ? 1.4 : currentSet === 4 ? 1.4 : 1)
        }, // .3 - 20% bigger, plus 40% if set 2 or set 4
      ];

      const headerHeight = viewportWidth < 768 ? 200 : 280; // Account for header and title
      const padding = 30;

      // Calculate available space and divide into 3 equal rows
      const availableHeight = viewportHeight - headerHeight - padding * 2;
      const rowHeight = availableHeight / 3;

      const newPositions: Position[] = [];

      images.forEach((image, index) => {
        // Calculate Y position range for this row
        const rowStart = headerHeight + (rowHeight * index) + padding;
        const rowEnd = rowStart + rowHeight - image.height - padding;

        // Calculate X position range
        const maxX = viewportWidth - image.width - padding * 2;

        // Random position within the row
        const x = Math.random() * Math.max(maxX, padding) + padding;
        const y = Math.random() * Math.max(rowEnd - rowStart, 0) + rowStart;

        // Ensure Y position doesn't exceed viewport
        const constrainedY = Math.min(y, viewportHeight - image.height - padding);

        newPositions.push({
          x,
          y: constrainedY,
          width: image.width,
          height: image.height,
        });
      });

      return newPositions;
    };

    const positions = generatePositions();
    setAllSetsPositions(prev => ({
      ...prev,
      [currentSet]: positions
    }));

    // Recalculate on window resize (debounced)
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newPositions = generatePositions();
        setAllSetsPositions(prev => ({
          ...prev,
          [currentSet]: newPositions
        }));
      }, 250);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [currentSet]);

  // Check if next set of images exists
  useEffect(() => {
    const checkImagesExist = async () => {
      try {
        const response = await fetch(`/assets/STWL/${currentSet}.1.png`);
        setImagesExist(response.ok);
      } catch {
        setImagesExist(false);
      }
    };
    checkImagesExist();
  }, [currentSet]);

  // When all 3 images are revealed, move to next set
  useEffect(() => {
    if (revealedCount === 3) {
      setTimeout(() => {
        // Add current set to revealed sets
        setRevealedSets(prev => [...prev, currentSet]);
        // Move to next set
        setCurrentSet(prev => prev + 1);
        setRevealedCount(0);
      }, 1000); // Wait 1 second before showing next set
    }
  }, [revealedCount, currentSet]);

  const handleImageRevealed = () => {
    setRevealedCount(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!submissionText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/submit-stwl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: submissionText,
          name: submissionName.trim() || 'Anonymous'
        }),
      });

      if (response.ok) {
        // Success - show green button
        setIsSubmitting(false);
        setSubmitSuccess(true);

        // After 2 seconds, reset everything
        setTimeout(() => {
          setSubmitSuccess(false);
          setSubmissionText("");
          setSubmissionName("");
          setShowTellUsYours(false);
        }, 2000);
      } else {
        alert("Failed to submit. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert("Failed to submit. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @font-face {
          font-family: 'Caslon 540';
          src: url('/fonts/Caslon 540 Regular/Caslon 540 Regular.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
        }

        .reveal-container {
          position: relative;
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0.1;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.4;
            transform: scale(1.2);
          }
        }

        @keyframes sparkle-delayed {
          0%, 100% {
            opacity: 0.08;
            transform: scale(0.9);
          }
          50% {
            opacity: 0.35;
            transform: scale(1.1);
          }
        }

        .blur-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          filter: blur(20px);
          z-index: 2;
          pointer-events: none;
          opacity: 1;
          transition: opacity 1.5s ease-out;
        }

        .blur-layer.fading {
          opacity: 0;
        }

        .blur-layer::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, transparent 30%, rgba(242, 242, 242, 0.3) 100%);
          pointer-events: none;
        }

        .sparkles {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 3;
          pointer-events: none;
        }

        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 0 8px 2px rgba(255, 255, 255, 0.8);
        }

        .clear-layer {
          position: relative;
          z-index: 1;
        }

        .reveal-circle {
          position: absolute;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, transparent 0%, transparent 100%);
          pointer-events: none;
          z-index: 3;
          mix-blend-mode: destination-out;
          transition: opacity 0.3s ease;
        }

        .random-image {
          position: absolute;
          z-index: 10;
        }

        .corner-button {
          position: fixed;
          font-family: 'Caslon 540', serif;
          font-size: 1.56rem;
          font-weight: 400;
          color: black;
          background: none;
          border: none;
          cursor: pointer;
          z-index: 100;
          font-style: italic;
          transition: color 0.2s ease;
        }

        .corner-button:hover,
        .corner-button:active {
          color: #0978FF;
        }

        .top-left {
          top: 60px;
          left: 60px;
        }

        .top-right {
          top: 60px;
          right: 60px;
        }

        .bottom-left {
          bottom: 60px;
          left: 60px;
        }

        .bottom-right {
          bottom: 60px;
          right: 60px;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 3rem;
          border-radius: 8px;
          max-width: 600px;
          width: 90%;
          position: relative;
          box-shadow: 0 4px 34px rgba(0, 0, 0, 0.25);
          opacity: 0.9;
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #000;
        }

        .modal-title {
          font-family: 'Caslon 540', serif;
          font-style: normal;
          font-size: 2rem;
          margin-bottom: 0.25rem;
          color: black;
        }

        .modal-text {
          font-family: 'Inter', sans-serif;
          font-size: 1.265rem;
          line-height: 1.6;
          color: black;
          margin-bottom: 1rem;
        }

        .modal-link {
          color: #0978FF;
          text-decoration: none;
        }

        .modal-link:hover {
          text-decoration: underline;
        }

        .form-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          color: black;
          margin-top: 0;
          margin-bottom: 1.5rem;
        }

        .modal-textarea {
          width: 100%;
          min-height: 150px;
          padding: 1rem;
          border: 2px dashed #000000;
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: black;
          resize: vertical;
          margin-bottom: 1.5rem;
          box-sizing: border-box;
          outline: none;
        }

        .modal-textarea:focus {
          border-color: #0978FF;
        }

        .modal-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px dashed #808080;
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
          font-size: 1rem;
          color: black;
          margin-bottom: 1rem;
          box-sizing: border-box;
          outline: none;
        }

        .modal-input:focus {
          border-color: #808080;
        }

        .optional-label {
          font-family: 'Inter', sans-serif;
          font-size: 0.9rem;
          color: #404040;
          margin-bottom: 0.5rem;
        }

        .submit-button {
          background: #0978FF;
          color: white;
          border: none;
          padding: 0.78rem 2.08rem;
          border-radius: 10px;
          font-family: 'Inter', sans-serif;
          font-size: 1.04rem;
          font-weight: 600;
          cursor: pointer;
          display: block;
          margin: 0 auto;
        }

        .submit-button:hover:not(:disabled) {
          background: #0862d9;
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submit-button.success {
          background: #22c55e;
        }

        .submit-button.success:hover {
          background: #22c55e;
        }

        .see-all-content {
          max-height: 400px;
          overflow-y: auto;
          padding-right: 1rem;
        }

        .see-all-list {
          list-style-type: disc;
          padding-left: 1.5rem;
          font-family: 'Inter', sans-serif;
          font-size: 1.1rem;
          line-height: 1.8;
          color: black;
        }

        .see-all-list li {
          margin-bottom: 0.75rem;
        }
      `}} />
      <main className="h-screen overflow-hidden pt-16 px-8" style={{ backgroundColor: '#F2F2F2' }}>
        <h1
          className="text-center text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl mb-2 text-black"
          style={{ fontFamily: "'Caslon 540', serif" }}
        >
          SPECIFIC THINGS<br />WE LIKE
        </h1>

        {/* Corner buttons */}
        <button className="corner-button top-left" onClick={() => setShowTellUsYours(true)}>
          tell us yours
        </button>
        <button className="corner-button top-right" onClick={() => setShowWhatIsThis(true)}>
          what is this
        </button>
        <button className="corner-button bottom-left" onClick={() => setShowSeeAll(true)}>
          see all
        </button>
        <button className="corner-button bottom-right" onClick={() => window.location.href = 'https://rithikaisafool.com/studio'}>
          more like this
        </button>

        {/* What is this modal */}
        {showWhatIsThis && (
          <div className="modal-overlay" onClick={() => setShowWhatIsThis(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowWhatIsThis(false)}>×</button>
              <h2 className="modal-title">what is this?</h2>
              <p className="modal-text">
                This is pretty much what it sounds like - a collection of specific things that people like.
              </p>
              <p className="modal-text">
                You can hover/swipe over each of the notes to reveal them and unlock more. Or you can see them all <a href="#" className="modal-link">here.</a>
              </p>
              <p className="modal-text">
                <a href="https://rithikaisafool.com/" className="modal-link">We</a> drop new ones every week here and on our <a href="https://www.instagram.com/rithikaisafool/" className="modal-link">instagram.</a>
              </p>
              <p className="modal-text">
                Tell us something you like <a href="/connect" className="modal-link">here.</a>
              </p>
            </div>
          </div>
        )}

        {/* Tell us yours modal */}
        {showTellUsYours && (
          <div className="modal-overlay" onClick={() => setShowTellUsYours(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowTellUsYours(false)}>×</button>
              <h2 className="modal-title">what's something specific you like?</h2>
              <p className="form-subtitle">(the more specific the better)</p>
              <textarea
                className="modal-textarea"
                placeholder=""
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
              ></textarea>
              <p className="optional-label">name (optional)</p>
              <input
                type="text"
                className="modal-input"
                placeholder=""
                value={submissionName}
                onChange={(e) => setSubmissionName(e.target.value)}
              />
              <button
                className={`submit-button ${submitSuccess ? 'success' : ''}`}
                onClick={handleSubmit}
                disabled={isSubmitting || submitSuccess}
              >
                {submitSuccess ? 'Done' : isSubmitting ? 'submitting...' : 'submit'}
              </button>
            </div>
          </div>
        )}

        {/* See all modal */}
        {showSeeAll && (
          <div className="modal-overlay" onClick={() => setShowSeeAll(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowSeeAll(false)}>×</button>
              <h2 className="modal-title">Here are all the specific things we've collected so far:</h2>
              <div className="see-all-content">
                <ul className="see-all-list">
                  <li>When people go "speech! speech! speech!" and then somebody actually gives a speech</li>
                  <li>When parents carry kids on their shoulders</li>
                  <li>Seeing someone's handwriting for the first time</li>
                  <li>First dates at furniture stores</li>
                  <li>When dogs jump on you in the elevator</li>
                  <li>Bad singing at karaoke</li>
                  <li>Watching people bow</li>
                  <li>Doing fake parkour (when you jump a little and yell "Parkour!")</li>
                  <li>Finding out the meaning behind tattoos</li>
                  <li>Giving people piggy-back rides</li>
                  <li>Drinking juice from a mug</li>
                  <li>Tucking friends and family into bed</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Render all previously revealed sets */}
        {revealedSets.map(setNum => {
          const positions = allSetsPositions[setNum];
          if (!positions) return null;
          return (
            <div key={`set-${setNum}`}>
              <div
                className="random-image"
                style={{
                  left: `${positions[0].x}px`,
                  top: `${positions[0].y}px`,
                  width: `${positions[0].width}px`,
                }}
              >
                <img
                  src={`/assets/STWL/${setNum}.1.png`}
                  alt={`Part ${setNum}.1`}
                  className="w-full h-auto"
                  style={{ display: 'block' }}
                />
              </div>
              <div
                className="random-image"
                style={{
                  left: `${positions[1].x}px`,
                  top: `${positions[1].y}px`,
                  width: `${positions[1].width}px`,
                }}
              >
                <img
                  src={`/assets/STWL/${setNum}.2.png`}
                  alt={`Part ${setNum}.2`}
                  className="w-full h-auto"
                  style={{ display: 'block' }}
                />
              </div>
              <div
                className="random-image"
                style={{
                  left: `${positions[2].x}px`,
                  top: `${positions[2].y}px`,
                  width: `${positions[2].width}px`,
                }}
              >
                <img
                  src={`/assets/STWL/${setNum}.3.png`}
                  alt={`Part ${setNum}.3`}
                  className="w-full h-auto"
                  style={{ display: 'block' }}
                />
              </div>
            </div>
          );
        })}

        {/* Render current unrevealed set */}
        {allSetsPositions[currentSet] && imagesExist && (
          <>
            <div
              className="random-image"
              style={{
                left: `${allSetsPositions[currentSet][0].x}px`,
                top: `${allSetsPositions[currentSet][0].y}px`,
                width: `${allSetsPositions[currentSet][0].width}px`,
              }}
            >
              <RevealImage
                src={`/assets/STWL/${currentSet}.1.png`}
                alt={`Part ${currentSet}.1`}
                onFullyRevealed={handleImageRevealed}
              />
            </div>
            <div
              className="random-image"
              style={{
                left: `${allSetsPositions[currentSet][1].x}px`,
                top: `${allSetsPositions[currentSet][1].y}px`,
                width: `${allSetsPositions[currentSet][1].width}px`,
              }}
            >
              <RevealImage
                src={`/assets/STWL/${currentSet}.2.png`}
                alt={`Part ${currentSet}.2`}
                onFullyRevealed={handleImageRevealed}
              />
            </div>
            <div
              className="random-image"
              style={{
                left: `${allSetsPositions[currentSet][2].x}px`,
                top: `${allSetsPositions[currentSet][2].y}px`,
                width: `${allSetsPositions[currentSet][2].width}px`,
              }}
            >
              <RevealImage
                src={`/assets/STWL/${currentSet}.3.png`}
                alt={`Part ${currentSet}.3`}
                onFullyRevealed={handleImageRevealed}
              />
            </div>
          </>
        )}
      </main>
    </>
  );
}
