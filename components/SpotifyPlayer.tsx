"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface SpotifyPlayerProps {
  trackId: string;
}

interface TrackData {
  name: string;
  artist: string;
  albumArt: string;
  previewUrl: string | null;
  duration: number;
  spotifyUrl: string;
}

export default function SpotifyPlayer({ trackId }: SpotifyPlayerProps) {
  const [trackData, setTrackData] = useState<TrackData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    async function fetchTrack() {
      try {
        const response = await fetch(`/api/spotify/track/${trackId}`);
        if (response.ok) {
          const data = await response.json();
          setTrackData(data);
          setDuration(30); // Preview is always 30 seconds
        }
      } catch (error) {
        console.error("Failed to fetch track:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrack();
  }, [trackId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [trackData]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !trackData?.previewUrl) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  if (loading) {
    return (
      <div className="bg-[#282828] rounded-xl p-4 flex items-center gap-4 animate-pulse">
        <div className="w-16 h-16 bg-gray-700 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-700 rounded w-24" />
        </div>
      </div>
    );
  }

  if (!trackData) {
    return null;
  }

  return (
    <div className="bg-[#282828] rounded-xl p-4 w-full">
      {trackData.previewUrl && (
        <audio ref={audioRef} src={trackData.previewUrl} preload="metadata" />
      )}

      <div className="flex items-center gap-4">
        {/* Album Art */}
        <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
          <Image
            src={trackData.albumArt}
            alt={trackData.name}
            fill
            className="object-cover"
          />
        </div>

        {/* Track Info & Controls */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-white font-semibold text-sm truncate">
                {trackData.name}
              </h3>
              <p className="text-gray-400 text-xs truncate">
                {trackData.artist}
              </p>
            </div>

            {/* Spotify Logo */}
            <a
              href={trackData.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1DB954">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
            </a>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] text-gray-400 w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeek}
              className="flex-1 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0 hover:[&::-webkit-slider-thumb]:w-3 hover:[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:transition-all"
              style={{
                background: `linear-gradient(to right, #1DB954 ${(currentTime / duration) * 100}%, #4d4d4d ${(currentTime / duration) * 100}%)`,
              }}
            />
            <span className="text-[10px] text-gray-400 w-8">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Play Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => skip(-10)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.5 3C17.15 3 21.08 6.03 22.47 10.22L20.1 11C19.05 7.81 16.04 5.5 12.5 5.5C10.54 5.5 8.77 6.22 7.38 7.38L10 10H3V3L5.6 5.6C7.45 4 9.85 3 12.5 3M10 12V22H8V14H6V12H10M18 14V20C18 21.11 17.11 22 16 22H14C12.9 22 12 21.11 12 20V14C12 12.9 12.9 12 14 12H16C17.11 12 18 12.9 18 14M14 14V20H16V14H14Z"/>
            </svg>
          </button>

          <button
            onClick={togglePlay}
            disabled={!trackData.previewUrl}
            className="w-10 h-10 flex items-center justify-center bg-white rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlaying ? (
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 text-black ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button
            onClick={() => skip(10)}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.5 3C6.85 3 2.92 6.03 1.53 10.22L3.9 11C4.95 7.81 7.96 5.5 11.5 5.5C13.46 5.5 15.23 6.22 16.62 7.38L14 10H21V3L18.4 5.6C16.55 4 14.15 3 11.5 3M10 12V22H8V14H6V12H10M18 14V20C18 21.11 17.11 22 16 22H14C12.9 22 12 21.11 12 20V14C12 12.9 12.9 12 14 12H16C17.11 12 18 12.9 18 14M14 14V20H16V14H14Z"/>
            </svg>
          </button>
        </div>
      </div>

      {!trackData.previewUrl && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          Preview not available. <a href={trackData.spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-[#1DB954] hover:underline">Listen on Spotify</a>
        </p>
      )}
    </div>
  );
}
