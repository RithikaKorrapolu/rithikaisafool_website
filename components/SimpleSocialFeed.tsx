"use client";

import { motion } from "framer-motion";
import { useEffect } from "react";

interface SimpleSocialFeedProps {
  platform: "instagram" | "twitter" | "tiktok";
  postUrl: string;
  index: number;
}

export default function SimpleSocialFeed({ platform, postUrl, index }: SimpleSocialFeedProps) {
  useEffect(() => {
    // Load platform scripts
    if (platform === "twitter" && !window.twttr) {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);
    }

    if (platform === "instagram" && !window.instgrm) {
      const script = document.createElement("script");
      script.src = "//www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);

      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
      };
    }

    if (platform === "tiktok" && !window.TikTok) {
      const script = document.createElement("script");
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, [platform]);

  const getPlatformIcon = () => {
    switch (platform) {
      case "instagram":
        return (
          <svg className="w-6 h-6" fill="url(#instagram-gradient-simple)" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="instagram-gradient-simple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#833AB4' }} />
                <stop offset="50%" style={{ stopColor: '#E1306C' }} />
                <stop offset="100%" style={{ stopColor: '#FD1D1D' }} />
              </linearGradient>
            </defs>
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case "twitter":
        return (
          <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case "tiktok":
        return (
          <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
          </svg>
        );
    }
  };

  if (!postUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-white rounded-lg p-6 shadow-lg border border-gray-200 flex flex-col items-center justify-center min-h-[400px]"
      >
        <div className="flex items-center gap-3 mb-4">
          {getPlatformIcon()}
          <span className="font-semibold text-black capitalize font-[family-name:var(--font-inter)]">
            {platform}
          </span>
        </div>
        <p className="text-gray-500 text-center font-[family-name:var(--font-inter)]">
          Add a post URL in the code to display it here
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
    >
      {platform === "instagram" && (
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={postUrl}
          data-instgrm-version="14"
          style={{
            background: '#FFF',
            border: '0',
            borderRadius: '3px',
            boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
            margin: '1px',
            maxWidth: '540px',
            minWidth: '326px',
            padding: '0',
            width: 'calc(100% - 2px)'
          }}
        />
      )}

      {platform === "twitter" && (
        <div className="flex justify-center p-4">
          <blockquote className="twitter-tweet" data-theme="light">
            <a href={postUrl}></a>
          </blockquote>
        </div>
      )}

      {platform === "tiktok" && (
        <div className="flex justify-center p-4">
          <blockquote
            className="tiktok-embed"
            cite={postUrl}
            data-video-id={postUrl.split('/video/')[1]?.split('?')[0]}
            style={{ maxWidth: '605px', minWidth: '325px' }}
          >
            <section>
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={postUrl}
              >
                View on TikTok
              </a>
            </section>
          </blockquote>
        </div>
      )}
    </motion.div>
  );
}

// Add type definitions for platform scripts
declare global {
  interface Window {
    twttr?: any;
    instgrm?: any;
    TikTok?: any;
  }
}
