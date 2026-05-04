// Museum artworks data with emotion tags
// Used by both the museum page and the waitlist SMS handler

export interface Artwork {
  id: number;
  title: string;
  artist: string;
  image: string;
  feelings: string[];
}

export const ARTWORKS: Artwork[] = [
  { id: 8, title: "Hushed Music", artist: "Alfredo Castaneda", image: "/assets/museum/artgallery/8.webp", feelings: ["contemplative", "quiet", "peaceful", "thoughtful"] },
  { id: 9, title: "La llamada (The Call)", artist: "Remedios Varo", image: "/assets/museum/artgallery/9.webp", feelings: ["serene", "mystical", "spiritual", "calm"] },
  { id: 10, title: "Men In The Cities", artist: "Robert Longo", image: "/assets/museum/artgallery/10.webp", feelings: ["intense", "dramatic", "bold", "powerful"] },
  { id: 11, title: "I'm in the bush outside and I really love you", artist: "Babak Ganjei", image: "/assets/museum/artgallery/11.webp", feelings: ["playful", "love", "quirky", "romantic"] },
  { id: 12, title: "The Lantern Bearers", artist: "Maxfield Parrish", image: "/assets/museum/artgallery/12.webp", feelings: ["mysterious", "magical", "dreamy", "wonder"] },
  { id: 13, title: "Papilla Estelar (Star Maker)", artist: "Remedios Varo", image: "/assets/museum/artgallery/13.webp", feelings: ["peaceful", "cosmic", "mystical", "serene"] },
  { id: 14, title: "Untitled", artist: "Alfredo Castaneda", image: "/assets/museum/artgallery/14.webp", feelings: ["dreamy", "surreal", "introspective", "ethereal"] },
  { id: 15, title: "Personaje (Character)", artist: "Remedios Varo", image: "/assets/museum/artgallery/15.webp", feelings: ["nostalgic", "warm", "contemplative", "curious"] },
  { id: 16, title: "Encuentro", artist: "Remedios Varo", image: "/assets/museum/artgallery/16.webp", feelings: ["mysterious", "connection", "ethereal", "spiritual"] },
  { id: 17, title: "Les Feuilles Mortes (Dead Leaves)", artist: "Remedios Varo", image: "/assets/museum/artgallery/17.webp", feelings: ["introspective", "melancholy", "nostalgic", "poetic"] },
  { id: 18, title: "Untitled", artist: "Alfredo Castaneda", image: "/assets/museum/artgallery/18.webp", feelings: ["ethereal", "dreamy", "surreal", "mysterious"] },
  { id: 19, title: "Duo de pez (Fish Duo)", artist: "Alfredo Castaneda", image: "/assets/museum/artgallery/19.webp", feelings: ["whimsical", "playful", "surreal", "imaginative"] },
  { id: 20, title: "Morning After The Wedding", artist: "Norman Rockwell", image: "/assets/museum/artgallery/20.webp", feelings: ["tender", "intimate", "love", "warm"] },
  { id: 21, title: "Anguish", artist: "August Friedrich Albrecht Schenck", image: "/assets/museum/artgallery/21.webp", feelings: ["sad", "grief", "melancholy", "emotional"] },
  { id: 22, title: "Isle of the Dead (Die Toteninsel)", artist: "Arnold Bocklin", image: "/assets/museum/artgallery/22.webp", feelings: ["haunting", "mysterious", "solemn", "contemplative"] },
  { id: 23, title: "Soir Bleu (Evening Blue)", artist: "Edward Hopper", image: "/assets/museum/artgallery/23.webp", feelings: ["lonely", "melancholy", "contemplative", "urban"] },
  { id: 24, title: "Vive la couleur (Long live color)", artist: "Cheri Samba", image: "/assets/museum/artgallery/24.webp", feelings: ["joyful", "vibrant", "hopeful", "energetic"] },
  { id: 25, title: "Birthday", artist: "Marc Chagall", image: "/assets/museum/artgallery/25.webp", feelings: ["joyful", "romantic", "whimsical", "love"] },
  { id: 26, title: "Lovers (Self-Portrait with Wally)", artist: "Egon Schiele", image: "/assets/museum/artgallery/26.webp", feelings: ["intimate", "tender", "vulnerable", "love"] },
  { id: 27, title: "Carry You Home", artist: "Kelechi Nwaneri", image: "/assets/museum/artgallery/27.webp", feelings: ["protective", "warm", "nurturing", "connection"] },
  { id: 28, title: "Blackbird", artist: "Kelechi Nwaneri", image: "/assets/museum/artgallery/28.webp", feelings: ["free", "hopeful", "uplifting", "peaceful"] },
  { id: 29, title: "Retreat and Perseverance", artist: "Kelechi Nwaneri", image: "/assets/museum/artgallery/29.webp", feelings: ["determined", "strong", "resilient", "grounded"] },
  { id: 30, title: "Portrait of a Human Brain", artist: "Kelechi Nwaneri", image: "/assets/museum/artgallery/30.webp", feelings: ["curious", "complex", "introspective", "wonder"] },
  { id: 31, title: "Twilight", artist: "Gregory Crewdson", image: "/assets/museum/artgallery/31.webp", feelings: ["mysterious", "cinematic", "lonely", "contemplative"] },
  { id: 32, title: "Untitled", artist: "Gregory Crewdson", image: "/assets/museum/artgallery/32.webp", feelings: ["haunting", "atmospheric", "quiet", "surreal"] },
  { id: 33, title: "The Green Bar", artist: "Salman Toor", image: "/assets/museum/artgallery/33.webp", feelings: ["intimate", "warm", "romantic", "connection"] },
  { id: 34, title: "Drowning Girl", artist: "Roy Lichtenstein", image: "/assets/museum/artgallery/34.webp", feelings: ["dramatic", "emotional", "bold", "intense"] },
  { id: 35, title: "Oh, Jeff...I Love You, Too...But...", artist: "Roy Lichtenstein", image: "/assets/museum/artgallery/35.webp", feelings: ["romantic", "dramatic", "bold", "emotional"] },
  { id: 36, title: "The Lovers", artist: "Rene Magritte", image: "/assets/museum/artgallery/36.webp", feelings: ["mysterious", "romantic", "surreal", "intimate"] },
  { id: 38, title: "Morning Sun", artist: "Edward Hopper", image: "/assets/museum/artgallery/38.webp", feelings: ["solitude", "quiet", "reflective", "contemplative"] },
  { id: 39, title: "The Lie", artist: "Felix Vallotton", image: "/assets/museum/artgallery/39.webp", feelings: ["desperate", "sad", "uncomfortable", "intense"] },
  { id: 40, title: "stop that", artist: "Brian Kershisnik", image: "/assets/museum/artgallery/40.webp", feelings: ["playful", "goofy", "charming", "whimsical"] },
  { id: 41, title: "winter dance", artist: "Brian Kershisnik", image: "/assets/museum/artgallery/41.webp", feelings: ["joyful", "whimsical", "celebratory", "enchanting"] },
  { id: 42, title: "spirited conversation", artist: "Brian Kershisnik", image: "/assets/museum/artgallery/42.webp", feelings: ["lively", "warm", "intimate", "engaging"] },
  { id: 43, title: "divine intervention", artist: "Brian Kershisnik", image: "/assets/museum/artgallery/43.webp", feelings: ["spiritual", "profound", "hopeful", "transcendent"] },
  { id: 44, title: "The Road", artist: "Jeffrey Alan Love", image: "/assets/museum/artgallery/44.webp", feelings: ["mysterious", "solitary", "contemplative", "haunting"] },
  { id: 53, title: "The Elephants", artist: "Salvador Dali", image: "/assets/museum/artgallery/53.webp", feelings: ["surreal", "dreamlike", "haunting", "majestic"] },
  { id: 54, title: "The Giantess", artist: "Leonora Carrington", image: "/assets/museum/artgallery/54.webp", feelings: ["mystical", "fantastical", "powerful", "ethereal"] },
  { id: 55, title: "Moonlight Sonata", artist: "Rafal Olbinski", image: "/assets/museum/artgallery/55.webp", feelings: ["dreamy", "romantic", "surreal", "ethereal"] },
  { id: 56, title: "Jumpers", artist: "Rob Browning", image: "/assets/museum/artgallery/56.webp", feelings: ["playful", "joyful", "whimsical", "energetic"] },
  { id: 59, title: "Inocencia Negra / Black Boy Joy", artist: "Mark Feijao Milligan", image: "/assets/museum/artgallery/59.webp", feelings: ["joyful", "vibrant", "hopeful", "warm"] },
  { id: 60, title: "Rainy Night", artist: "Rafal Olbinski", image: "/assets/museum/artgallery/60.webp", feelings: ["melancholy", "romantic", "dreamy", "mysterious"] },
  { id: 77, title: "Vignette", artist: "Kerry James Marshall", image: "/assets/museum/artgallery/77.webp", feelings: ["romantic", "intimate", "warm", "tender"] },
  { id: 82, title: "My Mama Whooping Me", artist: "Tim Brown", image: "/assets/museum/artgallery/82.webp", feelings: ["nostalgic", "humorous", "warm", "playful"] },
  { id: 83, title: "Music", artist: "Tim Brown", image: "/assets/museum/artgallery/83.webp", feelings: ["joyful", "vibrant", "energetic", "warm"] },
  { id: 84, title: "GRANDMA'S BIRTHDAY", artist: "Tim Brown", image: "/assets/museum/artgallery/84.webp", feelings: ["warm", "nostalgic", "joyful", "familial"] },
  { id: 92, title: "When the Tenderest Parts of You Become the Reason Others Find Their Way Home", artist: "Aunia Kahn", image: "/assets/museum/artgallery/92.webp", feelings: ["vulnerable", "tender", "nurturing", "emotional"] },
  { id: 95, title: "Kabuki II (the performance)", artist: "Toni Hamel", image: "/assets/museum/artgallery/95.webp", feelings: ["whimsical", "playful", "surreal", "imaginative"] },
  { id: 96, title: "In Bed (Le Lit)", artist: "Henri de Toulouse-Lautrec", image: "/assets/museum/artgallery/96.webp", feelings: ["intimate", "tender", "peaceful", "warm"] },
];

// Emotion synonyms for better matching
const EMOTION_MAP: Record<string, string[]> = {
  happy: ['joyful', 'vibrant', 'energetic', 'playful', 'whimsical', 'hopeful', 'uplifting', 'warm'],
  sad: ['melancholy', 'grief', 'lonely', 'nostalgic', 'solemn', 'quiet', 'emotional'],
  calm: ['peaceful', 'serene', 'tranquil', 'quiet', 'contemplative', 'grounded'],
  anxious: ['intense', 'dramatic', 'complex', 'emotional', 'uncomfortable'],
  excited: ['energetic', 'vibrant', 'bold', 'powerful', 'joyful', 'lively'],
  love: ['romantic', 'intimate', 'tender', 'warm', 'connection', 'love'],
  angry: ['intense', 'bold', 'powerful', 'dramatic', 'strong'],
  scared: ['haunting', 'mysterious', 'dark', 'intense', 'uncomfortable'],
  curious: ['wonder', 'curious', 'imaginative', 'complex', 'introspective'],
  inspired: ['hopeful', 'uplifting', 'energetic', 'powerful', 'bold', 'determined'],
  lonely: ['lonely', 'melancholy', 'quiet', 'contemplative', 'introspective', 'solitude'],
  peaceful: ['peaceful', 'serene', 'calm', 'tranquil', 'quiet', 'contemplative'],
  nostalgic: ['nostalgic', 'warm', 'tender', 'dreamy', 'poetic'],
  dreamy: ['dreamy', 'ethereal', 'surreal', 'mystical', 'magical', 'whimsical'],
  mysterious: ['mysterious', 'haunting', 'magical', 'mystical', 'ethereal'],
  romantic: ['romantic', 'love', 'intimate', 'tender', 'warm'],
  energetic: ['energetic', 'vibrant', 'bold', 'powerful', 'intense', 'lively'],
  hopeful: ['hopeful', 'uplifting', 'warm', 'peaceful', 'free'],
  free: ['free', 'uplifting', 'energetic', 'vibrant', 'playful'],
  vulnerable: ['vulnerable', 'tender', 'intimate', 'emotional', 'quiet'],
  strong: ['strong', 'powerful', 'bold', 'determined', 'resilient'],
  tired: ['quiet', 'peaceful', 'contemplative', 'melancholy', 'solitude'],
  grateful: ['warm', 'joyful', 'tender', 'hopeful', 'peaceful'],
  alive: ['energetic', 'vibrant', 'joyful', 'hopeful', 'free'],
  lost: ['contemplative', 'mysterious', 'solitary', 'introspective', 'melancholy'],
  hopeless: ['melancholy', 'sad', 'haunting', 'emotional', 'quiet'],
  content: ['peaceful', 'warm', 'serene', 'quiet', 'contemplative'],
  confused: ['mysterious', 'surreal', 'complex', 'introspective'],
  bored: ['quiet', 'contemplative', 'dreamy', 'whimsical'],
  stressed: ['intense', 'dramatic', 'emotional', 'uncomfortable'],
  relaxed: ['peaceful', 'calm', 'serene', 'quiet', 'warm'],
  overwhelmed: ['intense', 'emotional', 'complex', 'dramatic'],
  creative: ['imaginative', 'whimsical', 'surreal', 'dreamy', 'playful'],
  melancholy: ['melancholy', 'nostalgic', 'sad', 'quiet', 'poetic'],
  blessed: ['warm', 'joyful', 'hopeful', 'peaceful', 'tender'],
  good: ['joyful', 'warm', 'peaceful', 'hopeful', 'playful'],
  bad: ['sad', 'melancholy', 'emotional', 'quiet'],
  okay: ['peaceful', 'contemplative', 'quiet', 'warm'],
  fine: ['peaceful', 'quiet', 'contemplative', 'serene'],
  great: ['joyful', 'energetic', 'vibrant', 'hopeful', 'warm'],
  amazing: ['joyful', 'vibrant', 'energetic', 'hopeful', 'magical'],
  terrible: ['sad', 'melancholy', 'emotional', 'haunting'],
  weird: ['surreal', 'mysterious', 'whimsical', 'quirky'],
  strange: ['surreal', 'mysterious', 'whimsical', 'ethereal'],
  meh: ['quiet', 'contemplative', 'melancholy'],
};

// Find artwork that matches a feeling/emotion
export function findArtworkByFeeling(feeling: string): Artwork | null {
  const normalizedFeeling = feeling.toLowerCase().trim();

  // Direct match on artwork feelings
  let match = ARTWORKS.find(artwork =>
    artwork.feelings.some(f => f.toLowerCase() === normalizedFeeling)
  );

  if (match) return match;

  // Try emotion map for synonyms
  const mappedFeelings = EMOTION_MAP[normalizedFeeling] || [];

  // Score artworks based on matches
  let bestMatch: Artwork | null = null;
  let bestScore = 0;

  for (const artwork of ARTWORKS) {
    let score = 0;
    for (const artworkFeeling of artwork.feelings) {
      if (mappedFeelings.includes(artworkFeeling.toLowerCase())) {
        score += 2;
      }
      // Partial match
      if (artworkFeeling.toLowerCase().includes(normalizedFeeling) ||
          normalizedFeeling.includes(artworkFeeling.toLowerCase())) {
        score += 1;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = artwork;
    }
  }

  // If still no match, return a random artwork
  if (!bestMatch) {
    bestMatch = ARTWORKS[Math.floor(Math.random() * ARTWORKS.length)];
  }

  return bestMatch;
}

// Get the full URL for an artwork image
export function getArtworkImageUrl(artwork: Artwork): string {
  return `https://rithikaisafool.com${artwork.image}`;
}
