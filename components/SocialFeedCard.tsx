"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

interface SocialPost {
  platform: "instagram" | "twitter" | "tiktok";
  postUrl?: string;
}

interface SocialFeedCardProps {
  post: SocialPost;
  index: number;
}

interface PostData {
  id: string;
  caption: string;
  imageUrl: string | null;
  postUrl: string;
  timestamp: string;
  platform: string;
}

export default function SocialFeedCard({ post, index }: SocialFeedCardProps) {
  const [postData, setPostData] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await fetch(`/api/social/${post.platform}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch post');
        }

        const data = await response.json();
        setPostData(data);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching ${post.platform} post:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load post');
        setLoading(false);
      }
    }

    fetchPost();
  }, [post.platform]);

  const getPlatformIcon = () => {
    switch (post.platform) {
      case "instagram":
        return (
          <svg className="w-6 h-6" fill="url(#instagram-gradient-card)" viewBox="0 0 24 24">
            <defs>
              <linearGradient id="instagram-gradient-card" x1="0%" y1="0%" x2="100%" y2="100%">
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

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-white rounded-lg p-6 shadow-lg border border-gray-200"
      >
        <div className="flex items-center gap-3 mb-4">
          {getPlatformIcon()}
          <span className="font-semibold text-black capitalize font-[family-name:var(--font-inter)]">
            {post.platform}
          </span>
        </div>
        <div className="text-center py-8 text-gray-500 font-[family-name:var(--font-inter)]">
          Loading latest post...
        </div>
      </motion.div>
    );
  }

  if (error || !postData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="bg-white rounded-lg p-6 shadow-lg border border-gray-200"
      >
        <div className="flex items-center gap-3 mb-4">
          {getPlatformIcon()}
          <span className="font-semibold text-black capitalize font-[family-name:var(--font-inter)]">
            {post.platform}
          </span>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 font-[family-name:var(--font-inter)] mb-2">
            {error === 'Instagram credentials not configured' ||
             error === 'Twitter credentials not configured' ||
             error === 'TikTok credentials not configured' ? (
              <>API credentials not configured</>
            ) : (
              <>Unable to load post</>
            )}
          </p>
          <p className="text-sm text-gray-400 font-[family-name:var(--font-inter)]">
            {error}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.a
      href={postData.postUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="block bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-200">
        {getPlatformIcon()}
        <div className="flex-1">
          <span className="font-semibold text-black capitalize font-[family-name:var(--font-inter)]">
            {post.platform}
          </span>
          <p className="text-xs text-gray-500 font-[family-name:var(--font-inter)]">
            {formatDate(postData.timestamp)}
          </p>
        </div>
      </div>

      {/* Image */}
      {postData.imageUrl && (
        <div className="relative w-full aspect-square bg-gray-100">
          <Image
            src={postData.imageUrl}
            alt={postData.caption || 'Social media post'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Caption */}
      {postData.caption && (
        <div className="p-4">
          <p className="text-sm text-black font-[family-name:var(--font-inter)] line-clamp-3">
            {postData.caption}
          </p>
        </div>
      )}
    </motion.a>
  );
}
