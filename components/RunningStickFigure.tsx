"use client";

export default function RunningStickFigure() {
  return (
    <>
      <style jsx global>{`
        .runner-container {
          position: relative;
          width: 100%;
          height: 320px;
          overflow: hidden;
          pointer-events: none;
        }

        .ground-line {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 5px;
          height: 2px;
          background: #1a1a1a;
          opacity: 0.55;
        }
        .ground-line::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 6px;
          height: 1px;
          background: repeating-linear-gradient(90deg, #1a1a1a 0, #1a1a1a 6px, transparent 6px, transparent 18px);
          opacity: 0.35;
        }

        .runner {
          position: absolute;
          bottom: 0;
          left: 0;
          transform: translate3d(-640px, 0, 0);
          will-change: transform;
          animation: run-across 9s linear infinite;
        }

        @keyframes run-across {
          from { transform: translate3d(-640px, 0, 0); }
          to { transform: translate3d(100vw, 0, 0); }
        }
      `}</style>

      <div className="runner-container">
        <div className="ground-line"></div>
        <div className="runner">
          <svg width="800" height="360" viewBox="-150 0 800 360" xmlns="http://www.w3.org/2000/svg" aria-label="Running stick figure with banner">
            {/* Banner */}
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-2 550 75; 2 550 75; -2 550 75"
                dur="1.2s"
                repeatCount="indefinite"
              />
              <line x1="550" y1="30" x2="550" y2="150" stroke="#1a1a1a" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="550" cy="28" r="4" fill="#1a1a1a"/>
              <path d="M 550 40 L -100 36 Q -120 70, -100 104 L 550 100 Z" fill="#F7330C" stroke="#1a1a1a" strokeWidth="2.5" strokeLinejoin="round"/>
              <path d="M 544 46 L -94 42 Q -110 70, -94 98 L 544 94 Z" fill="none" stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" opacity="0.7"/>
              <text x="225" y="80" textAnchor="middle" fontFamily="'Courier New', monospace" fontWeight="700" fontSize="22" fill="#ffffff" letterSpacing="0.5">
                BUYING WEIRD ART FROM WOMEN IS GOOD FOR YOU!
              </text>
            </g>

            {/* Back Leg */}
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-30 540 255; 38 540 255; -30 540 255"
                dur="0.5s"
                repeatCount="indefinite"
              />
              <line x1="540" y1="255" x2="542" y2="305" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round"/>
              <line x1="542" y1="305" x2="534" y2="355" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round"/>
              <line x1="534" y1="355" x2="548" y2="355" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round"/>
            </g>

            {/* Back Arm */}
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="35 540 205; -35 540 205; 35 540 205"
                dur="0.5s"
                repeatCount="indefinite"
              />
              <line x1="540" y1="205" x2="520" y2="228" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round"/>
              <line x1="520" y1="228" x2="502" y2="218" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round"/>
              <circle cx="502" cy="218" r="4" fill="#1a1a1a"/>
            </g>

            {/* Torso */}
            <line x1="540" y1="205" x2="540" y2="255" stroke="#1a1a1a" strokeWidth="6" strokeLinecap="round"/>

            {/* Front Arm (holding banner) */}
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="-3 540 205; 3 540 205; -3 540 205"
                dur="1.2s"
                repeatCount="indefinite"
              />
              <line x1="540" y1="205" x2="552" y2="160" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round"/>
              <line x1="552" y1="160" x2="550" y2="115" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round"/>
              <circle cx="550" cy="115" r="4.5" fill="#1a1a1a"/>
            </g>

            {/* Head */}
            <circle cx="540" cy="175" r="22" fill="#F2F2F2" stroke="#1a1a1a" strokeWidth="4"/>
            <circle cx="550" cy="173" r="2.5" fill="#1a1a1a"/>
            <path d="M 544 184 Q 552 189, 560 184" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"/>

            {/* Front Leg */}
            <g>
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="38 540 255; -30 540 255; 38 540 255"
                dur="0.5s"
                repeatCount="indefinite"
              />
              <line x1="540" y1="255" x2="538" y2="305" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round"/>
              <line x1="538" y1="305" x2="546" y2="355" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round"/>
              <line x1="546" y1="355" x2="560" y2="355" stroke="#1a1a1a" strokeWidth="5" strokeLinecap="round"/>
            </g>
          </svg>
        </div>
      </div>
    </>
  );
}
