"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// Artwork data - add paintings here
// Each artwork has colors extracted from the image for the background gradient
const ARTWORKS = [
  {
    id: 8,
    title: "Hushed Music",
    artist: "Alfredo Castañeda",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/8.webp",
    feelings: ["contemplative", "quiet", "peaceful", "thoughtful"],
    colors: ["#0eb2d2", "#01292f"]
  },
  {
    id: 9,
    title: "La llamada (The Call)",
    artist: "Remedios Varo",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/9.webp",
    feelings: ["serene", "mystical", "spiritual", "calm"],
    colors: ["#ccc15f", "#a64b00"]
  },
  {
    id: 10,
    title: "Men In The Cities",
    artist: "Robert Longo",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/10.webp",
    feelings: ["intense", "dramatic", "bold", "powerful"],
    colors: ["#1a1a1a", "#000000"]
  },
  {
    id: 11,
    title: "I'm in the bush outside and I really love you",
    artist: "Babak Ganjei",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/11.webp",
    feelings: ["playful", "love", "quirky", "romantic"],
    colors: ["#000000", "#ffffff"]
  },
  {
    id: 12,
    title: "The Lantern Bearers",
    artist: "Maxfield Parrish",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/12.webp",
    feelings: ["mysterious", "magical", "dreamy", "wonder"],
    colors: ["#302f72", "#2f2518"]
  },
  {
    id: 13,
    title: "Papilla Estelar (Star Maker)",
    artist: "Remedios Varo",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/13.webp",
    feelings: ["peaceful", "cosmic", "mystical", "serene"],
    colors: ["#19261e", "#000000"]
  },
  {
    id: 14,
    title: "Untitled",
    artist: "Alfredo Castañeda",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/14.webp",
    feelings: ["dreamy", "surreal", "introspective", "ethereal"],
    colors: ["#7d563a", "#754e33"]
  },
  {
    id: 15,
    title: "Personaje (Character)",
    artist: "Remedios Varo",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/15.webp",
    feelings: ["nostalgic", "warm", "contemplative", "curious"],
    colors: ["#b97439", "#4c3a25"]
  },
  {
    id: 16,
    title: "Encuentro",
    artist: "Remedios Varo",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/16.webp",
    feelings: ["mysterious", "connection", "ethereal", "spiritual"],
    colors: ["#969d91", "#525347"]
  },
  {
    id: 17,
    title: "Les Feuilles Mortes (Dead Leaves)",
    artist: "Remedios Varo",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/17.webp",
    feelings: ["introspective", "melancholy", "nostalgic", "poetic"],
    colors: ["#eadfcc", "#c6a075"]
  },
  {
    id: 18,
    title: "Untitled",
    artist: "Alfredo Castañeda",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/18.webp",
    feelings: ["ethereal", "dreamy", "surreal", "mysterious"],
    colors: ["#696e45", "#503215"]
  },
  {
    id: 19,
    title: "Dúo de pez (Fish Duo)",
    artist: "Alfredo Castañeda",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/19.webp",
    feelings: ["whimsical", "playful", "surreal", "imaginative"],
    colors: ["#d3cebc", "#cbc9b7"]
  },
  {
    id: 20,
    title: "Morning After The Wedding",
    artist: "Norman Rockwell",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/20.webp",
    feelings: ["tender", "intimate", "love", "warm"],
    colors: ["#c47557", "#0b1014"]
  },
  {
    id: 21,
    title: "Anguish",
    artist: "August Friedrich Albrecht Schenck",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/21.webp",
    feelings: ["sad", "grief", "melancholy", "emotional"],
    colors: ["#87725a", "#fcf3e1"]
  },
  {
    id: 22,
    title: "Isle of the Dead (Die Toteninsel)",
    artist: "Arnold Böcklin",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/22.webp",
    feelings: ["haunting", "mysterious", "solemn", "contemplative"],
    colors: ["#c1ccee", "#162127"]
  },
  {
    id: 23,
    title: "Soir Bleu (Evening Blue)",
    artist: "Edward Hopper",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/23.webp",
    feelings: ["lonely", "melancholy", "contemplative", "urban"],
    colors: ["#6b95b6", "#273657"]
  },
  {
    id: 24,
    title: "Vive la couleur (Long live color)",
    artist: "Chéri Samba",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/24.webp",
    feelings: ["joyful", "vibrant", "hopeful", "energetic"],
    colors: ["#6394cd", "#79bbe5"]
  },
  {
    id: 25,
    title: "Birthday",
    artist: "Marc Chagall",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/25.webp",
    feelings: ["joyful", "romantic", "whimsical", "love"],
    colors: ["#bcc1aa", "#a33b28"]
  },
  {
    id: 26,
    title: "Lovers (Self-Portrait with Wally)",
    artist: "Egon Schiele",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/26.webp",
    feelings: ["intimate", "tender", "vulnerable", "love"],
    colors: ["#f1f1e7", "#cdccbf"]
  },
  {
    id: 27,
    title: "Carry You Home",
    artist: "Kelechi Nwaneri",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/27.webp",
    feelings: ["protective", "warm", "nurturing", "connection"],
    colors: ["#8e8a8a", "#6b8367"]
  },
  {
    id: 28,
    title: "Blackbird",
    artist: "Kelechi Nwaneri",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/28.webp",
    feelings: ["free", "hopeful", "uplifting", "peaceful"],
    colors: ["#65b8da", "#bb9c6b"]
  },
  {
    id: 29,
    title: "Retreat and Perseverance",
    artist: "Kelechi Nwaneri",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/29.webp",
    feelings: ["determined", "strong", "resilient", "grounded"],
    colors: ["#4c4b49", "#045242"]
  },
  {
    id: 30,
    title: "Portrait of a Human Brain",
    artist: "Kelechi Nwaneri",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/30.webp",
    feelings: ["curious", "complex", "introspective", "wonder"],
    colors: ["#1484da", "#eddac2"]
  },
  {
    id: 31,
    title: "Twilight",
    artist: "Gregory Crewdson",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/31.webp",
    feelings: ["mysterious", "cinematic", "lonely", "contemplative"],
    colors: ["#1c3d6d", "#030e26"]
  },
  {
    id: 32,
    title: "Untitled",
    artist: "Gregory Crewdson",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/32.webp",
    feelings: ["haunting", "atmospheric", "quiet", "surreal"],
    colors: ["#141013", "#030904"]
  },
  {
    id: 33,
    title: "The Green Bar",
    artist: "Salman Toor",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/33.webp",
    feelings: ["intimate", "warm", "romantic", "connection"],
    colors: ["#535a26", "#4f5439"]
  },
  {
    id: 34,
    title: "Drowning Girl",
    artist: "Roy Lichtenstein",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/34.webp",
    feelings: ["dramatic", "emotional", "bold", "intense"],
    colors: ["#e1e2d1", "#a39fac"]
  },
  {
    id: 35,
    title: "Oh, Jeff...I Love You, Too...But...",
    artist: "Roy Lichtenstein",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/35.webp",
    feelings: ["romantic", "dramatic", "bold", "emotional"],
    colors: ["#fcd00f", "#fbd8c0"]
  },
  {
    id: 36,
    title: "The Lovers",
    artist: "René Magritte",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/36.webp",
    feelings: ["mysterious", "romantic", "surreal", "intimate"],
    colors: ["#344750", "#4c7b81"]
  },
  {
    id: 39,
    title: "The Lie",
    artist: "Félix Vallotton",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/39.webp",
    feelings: ["desperate", "sad", "uncomfortable", "intense"],
    colors: ["#f4c24d", "#b61813"]
  },
  {
    id: 38,
    title: "Morning Sun",
    artist: "Edward Hopper",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/38.webp",
    feelings: ["solitude", "quiet", "reflective", "contemplative"],
    colors: ["#343334", "#c8d1b9"]
  },
  {
    id: 40,
    title: "stop that",
    artist: "Brian Kershisnik",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/40.webp",
    feelings: ["playful", "goofy", "charming", "whimsical"],
    colors: ["#c3cae6", "#b08876"]
  },
  {
    id: 41,
    title: "winter dance",
    artist: "Brian Kershisnik",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/41.webp",
    feelings: ["joyful", "whimsical", "celebratory", "enchanting"],
    colors: ["#9ccdc7", "#62d1d1"]
  },
  {
    id: 42,
    title: "spirited conversation",
    artist: "Brian Kershisnik",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/42.webp",
    feelings: ["lively", "warm", "intimate", "engaging"],
    colors: ["#405d4a", "#c1ccbe"]
  },
  {
    id: 43,
    title: "divine intervention",
    artist: "Brian Kershisnik",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/43.webp",
    feelings: ["spiritual", "profound", "hopeful", "transcendent"],
    colors: ["#d9d9cf", "#8e4501"]
  },
  {
    id: 44,
    title: "The Road",
    artist: "Jeffrey Alan Love",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/44.webp",
    feelings: ["mysterious", "solitary", "contemplative", "haunting"],
    colors: ["#c1cbba", "#bbbfaa"]
  },
  {
    id: 45,
    title: "Untitled",
    artist: "PQHAÜS",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/45.webp",
    feelings: ["abstract", "bold", "modern", "striking"],
    colors: ["#c0dff4", "#93aa55"]
  },
  {
    id: 46,
    title: "Idol Behind the Curtains",
    artist: "Chen Wei",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/46.webp",
    feelings: ["mysterious", "cinematic", "atmospheric", "enigmatic"],
    colors: ["#404445", "#58523f"]
  },
  {
    id: 47,
    title: "The Blank Signature",
    artist: "René Magritte",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/47.webp",
    feelings: ["surreal", "dreamlike", "mysterious", "contemplative"],
    colors: ["#273a20", "#355f35"]
  },
  {
    id: 48,
    title: "a mass",
    artist: "Eugene Korolev",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/48.webp",
    feelings: ["ethereal", "spiritual", "solemn", "transcendent"],
    colors: ["#45697e", "#db9462"]
  },
  {
    id: 49,
    title: "Ascending House",
    artist: "Ben Grasso",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/49.webp",
    feelings: ["surreal", "dreamlike", "weightless", "wonder"],
    colors: ["#435385", "#221b02"]
  },
  {
    id: 50,
    title: "Untitled",
    artist: "Teun Hocks",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/50.webp",
    feelings: ["whimsical", "absurd", "playful", "curious"],
    colors: ["#7d5331", "#d9a740"]
  },
  {
    id: 51,
    title: "Untitled",
    artist: "Teun Hocks",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/51.webp",
    feelings: ["whimsical", "quirky", "humorous", "imaginative"],
    colors: ["#011116", "#3b211a"]
  },
  {
    id: 52,
    title: "O abalo de um estalo num cavalo",
    artist: "Diogo Potes",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/52.webp",
    feelings: ["dynamic", "expressive", "bold", "visceral"],
    colors: ["#f4b40f", "#064ac0"]
  },
  {
    id: 53,
    title: "The Elephants",
    artist: "Salvador Dalí",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/53.webp",
    feelings: ["surreal", "dreamlike", "haunting", "majestic"],
    colors: ["#7b1824", "#b56a38"]
  },
  {
    id: 54,
    title: "The Giantess",
    artist: "Leonora Carrington",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/54.webp",
    feelings: ["mystical", "fantastical", "powerful", "ethereal"],
    colors: ["#48352e", "#dcbb6c"]
  },
  {
    id: 55,
    title: "Moonlight Sonata",
    artist: "Rafal Olbinski",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/55.webp",
    feelings: ["dreamy", "romantic", "surreal", "ethereal"],
    colors: ["#0e1a3c", "#0671c5"]
  },
  {
    id: 56,
    title: "Jumpers",
    artist: "Rob Browning",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/56.webp",
    feelings: ["playful", "joyful", "whimsical", "energetic"],
    colors: ["#37618f", "#1b1505"]
  },
  {
    id: 57,
    title: "Flier & Red Roof",
    artist: "Rob Browning",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/57.webp",
    feelings: ["whimsical", "dreamy", "nostalgic", "warm"],
    colors: ["#5b98e1", "#7a5400"]
  },
  {
    id: 58,
    title: "The Flock",
    artist: "Toni Hamel",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/58.webp",
    feelings: ["serene", "peaceful", "contemplative", "unity"],
    colors: ["#889abd", "#32512c"]
  },
  {
    id: 59,
    title: "Inocencia Negra / Black Boy Joy",
    artist: "Mark Feijão Milligan",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/59.webp",
    feelings: ["joyful", "vibrant", "hopeful", "warm"],
    colors: ["#1ebcee", "#009471"]
  },
  {
    id: 60,
    title: "Rainy Night",
    artist: "Rafał Olbiński",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/60.webp",
    feelings: ["melancholy", "romantic", "dreamy", "mysterious"],
    colors: ["#372d3a", "#040203"]
  },
  {
    id: 61,
    title: "The Badminton Game",
    artist: "David Inshaw",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/61.webp",
    feelings: ["nostalgic", "peaceful", "dreamy", "whimsical"],
    colors: ["#1d3b36", "#728143"]
  },
  {
    id: 62,
    title: "Garden Ballet II",
    artist: "Alan Parry",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/62.webp",
    feelings: ["graceful", "whimsical", "serene", "enchanting"],
    colors: ["#b5d3ef", "#3d5037"]
  },
  {
    id: 63,
    title: "Alliums and an Old Tuba",
    artist: "Alan Parry",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/63.webp",
    feelings: ["whimsical", "nostalgic", "charming", "playful"],
    colors: ["#b7d3f7", "#8a90ad"]
  },
  {
    id: 64,
    title: "Jules",
    artist: "Robert Longo",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/64.webp",
    feelings: ["intense", "dramatic", "bold", "powerful"],
    colors: ["#f2f4f3", "#110d0b"]
  },
  {
    id: 65,
    title: "Ellen",
    artist: "Robert Longo",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/65.webp",
    feelings: ["intense", "dramatic", "bold", "powerful"],
    colors: ["#f4efed", "#2c2827"]
  },
  {
    id: 66,
    title: "Gra",
    artist: "Malwina de Brade",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/66.webp",
    feelings: ["playful", "whimsical", "curious", "warm"],
    colors: ["#0f1712", "#0f1712"]
  },
  {
    id: 67,
    title: "Czarodziejki (sorceresses)",
    artist: "Malwina de Brade",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/67.webp",
    feelings: ["mystical", "enchanting", "magical", "feminine"],
    colors: ["#393b16", "#4a3e22"]
  },
  {
    id: 68,
    title: "Owl Trainer No. 2",
    artist: "Gertrude Abercrombie",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/68.webp",
    feelings: ["mysterious", "surreal", "quiet", "contemplative"],
    colors: ["#25393c", "#4b362d"]
  },
  {
    id: 69,
    title: "Split Personality",
    artist: "Gertrude Abercrombie",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/69.webp",
    feelings: ["surreal", "introspective", "mysterious", "dreamlike"],
    colors: ["#7a8486", "#39404a"]
  },
  {
    id: 70,
    title: "The Magician",
    artist: "Gertrude Abercrombie",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/70.webp",
    feelings: ["mysterious", "magical", "surreal", "enchanting"],
    colors: ["#414f4f", "#706453"]
  },
  {
    id: 71,
    title: "Madame E",
    artist: "Lolita Pelegrime",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/71.webp",
    feelings: ["elegant", "mysterious", "romantic", "sophisticated"],
    colors: ["#4dadeb", "#0c0d0d"]
  },
  {
    id: 72,
    title: "School of Love",
    artist: "Jesse Mockrin",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/72.webp",
    feelings: ["romantic", "tender", "intimate", "classical"],
    colors: ["#334357", "#334b56"]
  },
  {
    id: 73,
    title: "A Boy and His Toys",
    artist: "Edward Kinsella III",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/73.webp",
    feelings: ["nostalgic", "whimsical", "playful", "imaginative"],
    colors: ["#d3cab4", "#212322"]
  },
  {
    id: 74,
    title: "Le Vol du Fou (The Flight of the Fool)",
    artist: "Gérard Garouste",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/74.webp",
    feelings: ["surreal", "whimsical", "dreamlike", "mysterious"],
    colors: ["#cf3226", "#264b4e"]
  },
  {
    id: 75,
    title: "making out with the sun",
    artist: "Chris Mcholm",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/75.webp",
    feelings: ["warm", "romantic", "radiant", "dreamy"],
    colors: ["#eed1ae", "#ead2b5"]
  },
  {
    id: 76,
    title: "Woodland Arena",
    artist: "Rob Gonsalves",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/76.webp",
    feelings: ["magical", "whimsical", "dreamlike", "enchanting"],
    colors: ["#4b5c8f", "#4b5c8f"]
  },
  {
    id: 77,
    title: "Vignette",
    artist: "Kerry James Marshall",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/77.webp",
    feelings: ["romantic", "intimate", "warm", "tender"],
    colors: ["#88a8d0", "#475a42"]
  },
  {
    id: 78,
    title: "When Frustrations Threatens Desire",
    artist: "Kerry James Marshall",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/78.webp",
    feelings: ["intense", "emotional", "contemplative", "powerful"],
    colors: ["#b2b2ac", "#c78e43"]
  },
  {
    id: 79,
    title: "Happiness Lies Within Your Attitude",
    artist: "Guy Billout",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/79.webp",
    feelings: ["whimsical", "hopeful", "contemplative", "surreal"],
    colors: ["#dcc5c8", "#d56f5a"]
  },
  {
    id: 80,
    title: "Sheriff's Shadow",
    artist: "Guy Billout",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/80.webp",
    feelings: ["mysterious", "whimsical", "surreal", "contemplative"],
    colors: ["#0281be", "#e7cf9b"]
  },
  {
    id: 81,
    title: "Untitled",
    artist: "Guy Billout",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/81.webp",
    feelings: ["whimsical", "surreal", "contemplative", "peaceful"],
    colors: ["#338d5b", "#17693f"]
  },
  {
    id: 82,
    title: "My Mama Whooping Me",
    artist: "Tim Brown",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/82.webp",
    feelings: ["nostalgic", "humorous", "warm", "playful"],
    colors: ["#cebdaa", "#d49662"]
  },
  {
    id: 83,
    title: "Music",
    artist: "Tim Brown",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/83.webp",
    feelings: ["joyful", "vibrant", "energetic", "warm"],
    colors: ["#4e6276", "#252525"]
  },
  {
    id: 84,
    title: "GRANDMA'S BIRTHDAY",
    artist: "Tim Brown",
    year: "",
    medium: "",
    image: "/assets/museum/artgallery/84.webp",
    feelings: ["warm", "nostalgic", "joyful", "familial"],
    colors: ["#c2a1b1", "#651825"]
  },
];

// Triple the artworks for seamless looping
const LOOPED_ARTWORKS = [...ARTWORKS, ...ARTWORKS, ...ARTWORKS];

export default function TheRIAFMuseumOfArt() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [showInfoForId, setShowInfoForId] = useState<number | null>(null);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [showWarningForId, setShowWarningForId] = useState<number | null>(null);
  const [isHoveringArt, setIsHoveringArt] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof ARTWORKS>([]);
  const [suggestedFeelings, setSuggestedFeelings] = useState<string[]>([]);
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Helper function to determine if background is light or dark
  const isLightBackground = (hexColor: string): boolean => {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.7;
  };

  // Check if current artwork has light background (use first color of gradient)
  const currentArtwork = ARTWORKS[currentIndex];
  const useDarkText = isLightBackground(currentArtwork?.colors[0] || '#000000');

  // Preload first image before showing content (others load with spinner)
  useEffect(() => {
    // Only need to wait for the first image (the one user sees first)
    const firstImage = ARTWORKS[0].image;

    const img = new window.Image();
    img.onload = () => {
      setLoadedImages(prev => new Set(prev).add(firstImage));
      // Add delay to ensure image renders on screen
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };
    img.onerror = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    };
    img.src = firstImage;

    // Fallback: hide loading screen after 8 seconds max (slower networks)
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 8000);

    return () => {
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Track when images load
  const handleImageLoad = (src: string) => {
    setLoadedImages(prev => new Set(prev).add(src));
  };

  // Auto-hide info box after 3 seconds with fade out
  useEffect(() => {
    if (showInfoForId !== null) {
      setIsFadingOut(false);
      const fadeTimer = setTimeout(() => {
        setIsFadingOut(true);
      }, 2000); // Start fade at 2 seconds
      const hideTimer = setTimeout(() => {
        setShowInfoForId(null);
        setIsFadingOut(false);
      }, 3000); // Hide at 3 seconds
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [showInfoForId]);

  // Auto-hide "Do Not Touch" warning after 1 second on mobile
  useEffect(() => {
    if (showWarningForId !== null) {
      const hideTimer = setTimeout(() => {
        setShowWarningForId(null);
      }, 1000);
      return () => clearTimeout(hideTimer);
    }
  }, [showWarningForId]);

  // Focus search input when search opens
  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  // Generate random suggested feelings on mount - one from each of 6 different paintings
  useEffect(() => {
    const shuffledArtworks = [...ARTWORKS].sort(() => Math.random() - 0.5);
    const selectedFeelings: string[] = [];

    for (const artwork of shuffledArtworks) {
      if (selectedFeelings.length >= 8) break;
      // Pick a random feeling from this artwork
      const randomFeeling = artwork.feelings[Math.floor(Math.random() * artwork.feelings.length)];
      // Only add if we don't already have this feeling
      if (!selectedFeelings.includes(randomFeeling)) {
        selectedFeelings.push(randomFeeling);
      }
    }

    setSuggestedFeelings(selectedFeelings);
  }, []);

  // Handle clicking a suggested feeling
  const handleFeelingClick = (feeling: string) => {
    setSelectedFeeling(feeling);
    const matchingArtwork = ARTWORKS.find(artwork =>
      artwork.feelings.some(f => f.toLowerCase() === feeling.toLowerCase())
    );
    if (matchingArtwork) {
      navigateToArtwork(matchingArtwork.id);
    }
  };

  // Emotion synonyms/related words mapping for better search
  const emotionMap: { [key: string]: string[] } = {
    happy: ['joyful', 'vibrant', 'energetic', 'playful', 'whimsical', 'hopeful', 'uplifting'],
    sad: ['melancholy', 'grief', 'lonely', 'nostalgic', 'solemn', 'quiet'],
    calm: ['peaceful', 'serene', 'tranquil', 'quiet', 'contemplative', 'grounded'],
    love: ['romantic', 'intimate', 'tender', 'warm', 'connection', 'love'],
    angry: ['intense', 'bold', 'powerful', 'dramatic', 'strong'],
    scared: ['haunting', 'mysterious', 'dark', 'intense'],
    curious: ['wonder', 'curious', 'imaginative', 'complex', 'introspective'],
    inspired: ['hopeful', 'uplifting', 'energetic', 'powerful', 'bold', 'determined'],
    lonely: ['lonely', 'melancholy', 'quiet', 'contemplative', 'introspective'],
    peaceful: ['peaceful', 'serene', 'calm', 'tranquil', 'quiet', 'contemplative'],
    nostalgic: ['nostalgic', 'warm', 'tender', 'dreamy', 'poetic'],
    dreamy: ['dreamy', 'ethereal', 'surreal', 'mystical', 'magical', 'whimsical'],
    mysterious: ['mysterious', 'haunting', 'magical', 'mystical', 'ethereal'],
    romantic: ['romantic', 'love', 'intimate', 'tender', 'warm'],
    energetic: ['energetic', 'vibrant', 'bold', 'powerful', 'intense'],
    anxious: ['intense', 'dramatic', 'complex', 'emotional'],
    hopeful: ['hopeful', 'uplifting', 'warm', 'peaceful', 'free'],
    free: ['free', 'uplifting', 'energetic', 'vibrant', 'playful'],
    vulnerable: ['vulnerable', 'tender', 'intimate', 'emotional', 'quiet'],
    strong: ['strong', 'powerful', 'bold', 'determined', 'resilient'],
  };

  // Filter artworks based on search query with fuzzy matching
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }
    const query = searchQuery.toLowerCase().trim();

    // Get related feelings from emotion map
    const relatedFeelings = emotionMap[query] || [];

    // Score each artwork based on how well it matches
    const scoredArtworks = ARTWORKS.map(artwork => {
      let score = 0;

      // Direct match in feelings (highest priority)
      artwork.feelings.forEach(feeling => {
        if (feeling.toLowerCase() === query) score += 10;
        else if (feeling.toLowerCase().includes(query)) score += 5;
        else if (query.includes(feeling.toLowerCase())) score += 3;
      });

      // Match via emotion map
      artwork.feelings.forEach(feeling => {
        if (relatedFeelings.includes(feeling.toLowerCase())) score += 4;
      });

      // Partial match on any feeling
      artwork.feelings.forEach(feeling => {
        const feelingLower = feeling.toLowerCase();
        if (feelingLower.startsWith(query.slice(0, 3)) || query.startsWith(feelingLower.slice(0, 3))) {
          score += 2;
        }
      });

      return { artwork, score };
    });

    // Sort by score and filter out zero scores, or return top matches
    const results = scoredArtworks
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.artwork);

    // If no matches found, return a random artwork as a suggestion
    if (results.length === 0 && query.length > 0) {
      const randomArtwork = ARTWORKS[Math.floor(Math.random() * ARTWORKS.length)];
      setSearchResults([randomArtwork]);
    } else {
      setSearchResults(results);
    }
  }, [searchQuery]);

  const navigateToArtwork = (artworkId: number) => {
    const container = scrollContainerRef.current;
    if (container) {
      const artworkIndex = ARTWORKS.findIndex(a => a.id === artworkId);
      if (artworkIndex !== -1) {
        const targetScroll = (ARTWORKS.length + artworkIndex) * window.innerHeight;
        container.scrollTo({ top: targetScroll, behavior: 'smooth' });
      }
    }
  };

  const isScrollingRef = useRef(false);

  // Handle scroll to detect which artwork is in view
  useEffect(() => {
    if (isLoading) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrollingRef.current) return;

      const scrollTop = container.scrollTop;
      // Use container.clientHeight for consistency on mobile (not affected by address bar)
      const itemHeight = container.clientHeight;
      const index = Math.round(scrollTop / itemHeight);
      // Ensure positive modulo result
      const actualIndex = ((index % ARTWORKS.length) + ARTWORKS.length) % ARTWORKS.length;
      setCurrentIndex(actualIndex);

      // Loop back when reaching the end or beginning of the tripled list
      const totalHeight = LOOPED_ARTWORKS.length * itemHeight;
      const oneSetHeight = ARTWORKS.length * itemHeight;

      if (scrollTop >= totalHeight - itemHeight) {
        isScrollingRef.current = true;
        container.scrollTop = oneSetHeight;
        setTimeout(() => { isScrollingRef.current = false; }, 50);
      } else if (scrollTop <= 0) {
        isScrollingRef.current = true;
        container.scrollTop = oneSetHeight;
        setTimeout(() => { isScrollingRef.current = false; }, 50);
      }
    };

    // Start in the middle set at the first artwork (use element-based positioning for mobile reliability)
    isScrollingRef.current = true;
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Get the first artwork element in the middle set (index = ARTWORKS.length)
      const middleSetFirstArtworkIndex = ARTWORKS.length;
      const artworkElements = container.querySelectorAll('[data-artwork-item]');
      const targetElement = artworkElements[middleSetFirstArtworkIndex] as HTMLElement;

      if (targetElement) {
        // Scroll to the element directly - this is more reliable than calculating with window.innerHeight
        targetElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      } else {
        // Fallback to calculation if element not found
        const containerHeight = container.clientHeight;
        const initialScrollTop = ARTWORKS.length * containerHeight;
        container.scrollTop = initialScrollTop;
      }
      setCurrentIndex(0);
      // Allow scroll events after initial position is set
      setTimeout(() => {
        isScrollingRef.current = false;
        container.addEventListener('scroll', handleScroll);
      }, 100);
    });

    return () => container.removeEventListener('scroll', handleScroll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen h-screen flex flex-col items-center justify-center bg-black overflow-hidden relative"
      >
        <style jsx>{`
          @keyframes warpTunnel {
            0% {
              transform: scale(0) rotate(0deg);
              opacity: 0;
            }
            20% {
              opacity: 0.6;
            }
            100% {
              transform: scale(15) rotate(180deg);
              opacity: 0;
            }
          }
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.1);
              opacity: 1;
            }
          }
          @keyframes fadeInUp {
            0% {
              transform: translateY(20px);
              opacity: 0;
            }
            100% {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .warp-ring {
            animation: warpTunnel 2s ease-in infinite;
          }
          .warp-ring-1 { animation-delay: 0s; }
          .warp-ring-2 { animation-delay: 0.3s; }
          .warp-ring-3 { animation-delay: 0.6s; }
          .warp-ring-4 { animation-delay: 0.9s; }
          .warp-ring-5 { animation-delay: 1.2s; }
          .warp-ring-6 { animation-delay: 1.5s; }
          .center-pulse {
            animation: pulse 1.5s ease-in-out infinite;
          }
          .fade-in-up {
            animation: fadeInUp 0.8s ease-out forwards;
            animation-delay: 0.5s;
            opacity: 0;
          }
        `}</style>

        {/* Warp tunnel rings */}
        <div className="relative flex items-center justify-center" style={{ perspective: '500px' }}>
          <div className="absolute w-40 h-40 rounded-full border border-white/20 warp-ring warp-ring-1" />
          <div className="absolute w-40 h-40 rounded-full border border-white/25 warp-ring warp-ring-2" />
          <div className="absolute w-40 h-40 rounded-full border border-white/30 warp-ring warp-ring-3" />
          <div className="absolute w-40 h-40 rounded-full border border-white/25 warp-ring warp-ring-4" />
          <div className="absolute w-40 h-40 rounded-full border border-white/20 warp-ring warp-ring-5" />
          <div className="absolute w-40 h-40 rounded-full border border-white/15 warp-ring warp-ring-6" />

          {/* Center focal point */}
          <div className="w-4 h-4 rounded-full bg-white/80 center-pulse shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
        </div>

        <p
          className="text-white/60 text-sm tracking-[0.3em] uppercase mt-12 fade-in-up z-10"
          style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
        >
          Entering Museum
        </p>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen h-screen overflow-hidden transition-[background] duration-300 ease-out"
      style={{
        background: (isHoveringArt || showWarningForId !== null)
          ? 'linear-gradient(180deg, #dc2626 0%, #991b1b 100%)'
          : `linear-gradient(180deg, ${ARTWORKS[currentIndex].colors[0]} 0%, ${ARTWORKS[currentIndex].colors[1]} 100%)`
      }}
      onClick={() => setShowWarningForId(null)}
    >
      {/* Logo - Top Left */}
      <a
        href="/museum"
        className="fixed top-6 left-6 z-50 opacity-40 hover:opacity-80 transition-opacity"
      >
        <Image
          src="/assets/museum/artgallery/logo.webp"
          alt="Logo"
          width={50}
          height={50}
          className="w-10 md:w-14 h-auto"
          unoptimized
        />
      </a>

      {/* Search - Top Right */}
      <div className="fixed top-6 left-20 right-4 md:left-auto md:right-6 z-50 flex flex-col items-end">
        <div className="w-full md:w-96">
          {/* Search Input - Always visible */}
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What are you feeling?"
            className={`w-full px-4 py-2 rounded-full backdrop-blur-md border text-sm focus:outline-none transition-colors ${useDarkText ? 'bg-black/10 border-black/20 text-black placeholder-black/50 focus:bg-black/20' : 'bg-white/20 border-white/30 text-white placeholder-white/60 focus:bg-white/30'}`}
            style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif', boxShadow: useDarkText ? '0 2px 10px rgba(0, 0, 0, 0.1)' : '0 2px 10px rgba(0, 0, 0, 0.3)' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchResults.length > 0) {
                navigateToArtwork(searchResults[0].id);
                setSearchQuery("");
              }
            }}
          />
        </div>
        {/* Suggested feelings - separate container */}
        <div className="w-full md:w-96 mt-2 flex flex-col gap-1.5">
          <div className="flex gap-1.5 md:gap-2 justify-end">
            {suggestedFeelings.slice(0, 4).map((feeling) => (
              <button
                key={feeling}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleFeelingClick(feeling);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFeelingClick(feeling);
                }}
                className={`px-2 md:px-3 py-1 text-[10px] md:text-xs rounded-full backdrop-blur-md border transition-all hover:scale-105 whitespace-nowrap ${
                  selectedFeeling === feeling
                    ? (useDarkText ? 'bg-black text-white border-black' : 'bg-white text-black border-white')
                    : (useDarkText ? 'bg-black/10 border-black/20 text-black hover:bg-black/20' : 'bg-white/20 border-white/30 text-white hover:bg-white/40')
                }`}
                style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif', touchAction: 'manipulation' }}
              >
                {feeling}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 md:gap-2 justify-end">
            {suggestedFeelings.slice(4, 8).map((feeling) => (
              <button
                key={feeling}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handleFeelingClick(feeling);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleFeelingClick(feeling);
                }}
                className={`px-2 md:px-3 py-1 text-[10px] md:text-xs rounded-full backdrop-blur-md border transition-all hover:scale-105 whitespace-nowrap ${
                  selectedFeeling === feeling
                    ? (useDarkText ? 'bg-black text-white border-black' : 'bg-white text-black border-white')
                    : (useDarkText ? 'bg-black/10 border-black/20 text-black hover:bg-black/20' : 'bg-white/20 border-white/30 text-white hover:bg-white/40')
                }`}
                style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif', touchAction: 'manipulation' }}
              >
                {feeling}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-full">
        {/* Scrollable Content */}
        <div
          ref={scrollContainerRef}
          className="w-full h-screen overflow-y-scroll overflow-x-hidden snap-y snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {LOOPED_ARTWORKS.map((artwork, idx) => (
            <div
              key={`${artwork.id}-${idx}`}
              data-artwork-item
              className="h-screen snap-start flex flex-col md:flex-row items-center justify-center py-8 md:py-0"
            >
              {/* Clickable Artwork Image with Spotlight */}
              <div
                className="flex-shrink-0 hover:scale-[1.02] transition-transform relative"
              >
                {/* Spotlight glow behind artwork */}
                <div
                  className="absolute -inset-20 blur-3xl opacity-50 pointer-events-none"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)'
                  }}
                />
                {/* Image wrapper for hover detection */}
                <div
                  className="relative z-10 group cursor-pointer flex flex-col"
                  onMouseEnter={() => {
                    // Only set hover state on devices with hover capability
                    if (window.matchMedia('(hover: hover)').matches) {
                      setIsHoveringArt(true);
                    }
                  }}
                  onMouseLeave={() => setIsHoveringArt(false)}
                >
                  {/* Image with touch handlers - only triggers on the actual image */}
                  <div
                    className="relative w-fit"
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
                    }}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      // Only trigger warning if it was a tap (not a scroll)
                      if (touchStartRef.current) {
                        const touch = e.changedTouches[0];
                        const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
                        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
                        const deltaTime = Date.now() - touchStartRef.current.time;
                        // If touch moved less than 10px and lasted less than 300ms, it's a tap
                        if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
                          setShowWarningForId(artwork.id);
                        }
                      }
                      touchStartRef.current = null;
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {/* Loading spinner - shows while image is loading */}
                    {!loadedImages.has(artwork.image) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />
                      </div>
                    )}
                    <Image
                      src={artwork.image}
                      alt={artwork.title}
                      width={1200}
                      height={1500}
                      className="max-w-[265px] md:max-w-none max-h-[55vh] md:max-h-none w-auto h-auto md:h-[70vh] object-contain transition-opacity duration-500"
                      style={{
                        display: 'block',
                        opacity: loadedImages.has(artwork.image) ? 1 : 0
                      }}
                      priority={idx < 3}
                      unoptimized
                      onLoad={() => handleImageLoad(artwork.image)}
                    />
                    {/* "Please Do Not Touch" Warning - Desktop hover, Mobile click */}
                    <div
                      className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none
                        transition-all duration-150 ease-out
                        ${showWarningForId === artwork.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90 md:group-hover:opacity-100 md:group-hover:scale-100'}`}
                      style={{ willChange: 'transform, opacity' }}
                    >
                      <div
                        className="bg-red-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-lg text-center"
                        style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
                      >
                        <p className="text-xs md:text-sm font-bold tracking-wider">PLEASE DO NOT TOUCH</p>
                      </div>
                    </div>
                  </div>
                  {/* Desktop Info Box - Below Image, Right Aligned */}
                  <div
                    className="hidden md:block self-end mt-2 bg-white/70 backdrop-blur-sm rounded-lg p-4 max-w-[250px] z-20 shadow-lg"
                    style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
                  >
                    <h3 className="text-lg font-bold text-black mb-0">
                      {artwork.title}
                    </h3>
                    {artwork.artist && (
                      <p className="text-gray-600 text-sm mb-1">
                        {artwork.artist}
                      </p>
                    )}
                    {artwork.year && (
                      <p className="text-gray-500 text-xs mb-2">
                        {artwork.year}
                      </p>
                    )}
                    {artwork.medium && (
                      <p className="text-gray-400 text-xs italic">
                        {artwork.medium}
                      </p>
                    )}
                  </div>
                  {/* Mobile Info Box - Below Image, Right Aligned */}
                  <div
                    className="md:hidden self-end mt-2 bg-white/70 backdrop-blur-sm rounded-lg p-3 max-w-[200px] z-20 shadow-lg"
                    style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}
                  >
                    <h3 className="text-sm font-bold text-black mb-0">
                      {artwork.title}
                    </h3>
                    {artwork.artist && (
                      <p className="text-gray-600 text-xs">
                        {artwork.artist}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
