"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

// Grid constants
const TILE_SIZE_DESKTOP = 387;
const GAP = 22;
const DEFAULT_TILES = 58;
const TILES_PER_PAGE_DESKTOP = 35; // Fixed 7x5 grid on desktop
const TILES_PER_PAGE_MOBILE = 24; // Fixed 4x6 grid on mobile

// Get number of columns based on screen dimensions (independent of tile count)
const getGridCols = (screenWidth: number, screenHeight: number): number => {
  const screenAspect = screenWidth / screenHeight;

  if (screenAspect > 1) {
    // Landscape (desktop): calculate based on ~64 tiles target
    const targetTiles = 64;
    let bestCols = 8;
    let bestScore = Infinity;

    for (let cols = 4; cols <= 12; cols++) {
      const rows = Math.ceil(targetTiles / cols);
      const gridAspect = cols / rows;
      const score = Math.abs(gridAspect - screenAspect);
      if (score < bestScore) {
        bestScore = score;
        bestCols = cols;
      }
    }
    return bestCols;
  } else {
    // Portrait (mobile): force 7 columns for better width fill
    return 7;
  }
};

// Calculate tile size based on screen width (80% on mobile)
const getTileSize = (windowWidth: number) => {
  if (windowWidth < 768) {
    return Math.min(windowWidth * 0.8, TILE_SIZE_DESKTOP);
  }
  return TILE_SIZE_DESKTOP;
};

// Calculate grid dimensions - 4 columns on mobile, 7 on desktop
const getGridDimensions = (totalTiles: number, screenWidth: number = 1200, screenHeight: number = 800) => {
  const cols = screenWidth < 768 ? 4 : 7; // 4 cols mobile, 7 cols desktop
  return { cols, rows: Math.ceil(totalTiles / cols) };
};

// Type for song tile data
type SongTile = { albumCover: string; title: string; artist: string; memory: string; youtubeId: string };

// Default song data for tiles with album covers
const defaultSongTiles: { [key: number]: SongTile } = {
  0: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273db0917ddd4139153bc1d1a1a',
    title: 'Modern Love',
    artist: 'David Bowie',
    memory: "This was from a school trip a bunch of us took when we were high school seniors, touring college campuses. The girl I had crushed on all through high school was there, and she danced with me in the aisle of the bus (for which we were scolded, and there's nothing like a little rule-breaking with a girl you love to cement a memory).",
    youtubeId: 'HivQqTtiHVw',
  },
  1: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b27357a0868419086b576553c9f4',
    title: 'Sweet Disposition',
    artist: 'The Temper Trap',
    memory: "This song reminds me of watching the movie 500 Days of Summer with the first girl I said 'I love you' to.",
    youtubeId: 'jxKjOOR9sPU',
  },
  2: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b27360282020360f5048976275aa',
    title: 'Caroline',
    artist: 'Aminé',
    memory: "I was a late bloomer so I had my first kiss in college. It was with a random guy at this frat party. Luckily, he was really sweet so it was a nice memory. This was playing in the background. Always takes me back.",
    youtubeId: '3j8ecF8Wt4E',
  },
  3: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273e2352cc20602d45e9a0e7617',
    title: 'SpottieOttieDopaliscious',
    artist: 'Outkast',
    memory: "Reminds me of the summer before my first year of college. All I did was go to the beach with my dogs literally every single day.",
    youtubeId: 'KwhBreZic8I',
  },
  4: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273e21cc1db05580b6f2d2a3b6e',
    title: 'Viva La Vida',
    artist: 'Coldplay',
    memory: "8 years ago, I dated this girl for 2 months and genuinely felt like the happiest person in the world, listened to this song/album on repeat.",
    youtubeId: 'dvgZkm1xWPE',
  },
  5: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273cab7ae4868e9f9ce6bdfdf43',
    title: 'Helena',
    artist: 'My Chemical Romance',
    memory: "I was in high school and one of my best friends at the time had just lost her dad at the time that this video came out. Every time I hear this now it reminds me of his funeral.",
    youtubeId: 'UCCyoocDxBA',
  },
  6: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b27311d4224a94f84b9750e231bf',
    title: 'For the Summer',
    artist: 'Ray LaMontagne',
    memory: "I remember walking down by the Mississippi river in St. Paul, MN after college classes in the spring. Freshman in college, just started dating a wonderful girl, and sitting on a rock by the river when a barge slowly floated down river. When I listen to that song, I am brought back to that moment.",
    youtubeId: 'UAJM0Jgir4I',
  },
  7: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273e55d015183de42d9565644dc',
    title: 'Rivers and Roads',
    artist: 'The Head and the Heart',
    memory: "My parents were dropping me off to start college and I sat in the back in silence with my headphones on playing this on repeat.",
    youtubeId: 'RIlLZ3CAP8Y',
  },
  8: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2733ab3ff3559d2664560e1fdb4',
    title: 'Camisado',
    artist: 'Panic! At The Disco',
    memory: "Listening to this instantly brings me back to my 11 year old self's bedroom playing Dragonball Z Warriors on my PS2",
    youtubeId: 'csNwIk3DL28',
  },
  9: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273bcf2e51e254b5bdd336c6cd9',
    title: "Won't You Come Home",
    artist: 'Devendra Banhart',
    memory: "This song always makes me depressed because I used to put it on repeat after my first girlfriend broke up with me.",
    youtubeId: '8JI_uPla2FE',
  },
  10: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273fb304ec81a4ab3a5b5b7eea4',
    title: 'Closing Time',
    artist: 'Semisonic',
    memory: "This song was the first to come up on a random iPod shuffle as I walked out of my very last exam of my college degree. It was like something out of a movie. Like you'd see the credits start to roll right then and there.",
    youtubeId: 'xGytDsqkQY8',
  },
  11: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273b23d1b3eb6fcd4a6c892d4f7',
    title: 'Unwell',
    artist: 'Matchbox Twenty',
    memory: "The last night of summer camp when I was 16, the kids all gone home, a bunch of us counselors were hanging out at the lake trying to make the night last forever. A few people had their car radios on and I can still remember this song playing, and whenever I hear it now I'm back with those people on that one warm night.",
    youtubeId: 'WziA88-n02k',
  },
  12: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b27317e1907923e91181f38290ac',
    title: "Workin' For MCA",
    artist: 'Lynyrd Skynyrd',
    memory: "I used to come off a 12-hour shift in New Orleans in 1975 and hit the Hummingbird Inn, an awesome dive bar, and sooner than later someone would play this song on the jukebox. To this day if I hear it, I can smell and taste and almost see that place.",
    youtubeId: 'ZxSSUX3MEJM',
  },
  13: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2730ec8c8bbb4ae1157c4dbe75d',
    title: "The Bride's Dad",
    artist: 'Hamilton Leithauser',
    memory: "I found this song a year after my dad passed away. It still makes me cry when I think about the fact he won't be at my wedding. But I can almost picture him as the dad in this song. It lets me imagine what it would've been like.",
    youtubeId: 'Tygdn3w3nMQ',
  },
  14: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b27389289af092e4b233c6165ebb',
    title: 'Ebony and Ivory',
    artist: 'Paul McCartney',
    memory: "My aunt and uncle had bought a house outside of town, which was unusual, of the five siblings they were the only ones to move outside of town. Not far, but it was like a 45 minute drive to get there and I wasn't used to that long for a visit. The year they bought the house we drove down to see them a few times, and this song was always on the radio.",
    youtubeId: 'fXAlfh6QKQs',
  },
  15: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273ada101c2e9e97feb8fae37a9',
    title: 'There Is a Light That Never Goes Out',
    artist: 'The Smiths',
    memory: "Had a breakdown in the car telling my mom me and my girlfriend broke up while listening to this.",
    youtubeId: '3r-qDvD3F3c',
  },
  16: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273dfed999f959177dfc4f33cdc',
    title: 'Apocalypse',
    artist: 'Cigarettes After Sex',
    memory: "I remember just like a month after graduating high school, I was getting incredibly stoned with girl I had a short fling with, and she showed me this song while we were lighting up and to this day it is one of the most beautiful moments I've shared with someone.",
    youtubeId: 'sElE_BfQ67s',
  },
  17: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b27349b5b0e43ad82f8b6d0379e4',
    title: 'Harvest Moon',
    artist: 'Neil Young',
    memory: "I remember my very best friend showing it to me and it was also featured in one of our favorite shows. we went to hawaii together and we danced on the beach to this a little tipsy. the sun was setting, a full moon was out and we were going to hop in the ocean shortly after. we were both so happy",
    youtubeId: 'n2MtEsrcTTs',
  },
  18: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2739164bafe9aaa168d93f4816a',
    title: 'Yellow',
    artist: 'Coldplay',
    memory: "On 9/11, this was the last thing on MTV before I fell asleep. (They showed music videos back then). I remember the gravity of the day hit me while it was on and it was incredibly sad. Still takes me right back there.",
    youtubeId: 'yKNxeF4KMsY',
  },
  19: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273cfe4163cbb6d12f3ec15898e',
    title: 'Maneater',
    artist: 'Hall & Oates',
    memory: "Me and my buddy were seniors in high school. I was driving my mom's car and we heard a siren behind us. We saw what looked like a wreck in front so I stopped and the police smashed into us from the back. This was playing when we got hit.",
    youtubeId: 'yRYFKcMa_Ek',
  },
  20: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2736ba30c7787e3cfa8300429da',
    title: 'More News from Nowhere',
    artist: 'Nick Cave & The Bad Seeds',
    memory: "It was the 3rd of July, 2010. I was driving my then-boyfriend and now-husband to \"fiddle camp\" at Fort Worden in WA. He'd taken me out to a really nice dinner the night before, using our \"one month anniversary\" as an excuse. I told him that morning that I loved him, and he told me he loved me back.",
    youtubeId: 'bFjrmATIUYU',
  },
  21: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2732e35d25eb7288830d5540484',
    title: 'Love Is A Wild Thing',
    artist: 'Kacey Musgraves',
    memory: "My husband told his affair partner that he felt like it was about their relationship. It was one of my favorite songs and is absolutely crushing every time I hear it.",
    youtubeId: 'iwrxzuD2zsc',
  },
  22: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273649fa6da25444974c752db30',
    title: 'Bad Reputation',
    artist: 'Joan Jett',
    memory: "My mum was driving me home from school one day, and the song came on the radio. She doesn't usually like singing in front of/around other people, but she just started jamming out as we were waiting at the stop sign. It was great.",
    youtubeId: 'LeYn_W14zTU',
  },
  23: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273e91de611bffe5f01b9aa2cbd',
    title: "Don't Stop Believing",
    artist: 'Journey',
    memory: "My late wife and I were on a cruise and went into Senior Frogs in the Bahamas and it was just starting as we were walking in. There was a stage with at least 50 people on it doing group karaoke. We immediately went up and joined in. We met a lot of people and made friends with almost everyone.",
    youtubeId: '1k8craCGpgs',
  },
  24: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273def7146ca744f3b1bf838404',
    title: 'Immortality',
    artist: 'Celine Dion',
    memory: "I'm not even a CD fan, however this was the song used at a funeral of a classmate who took their only life at only 12 years old. It still haunts me every time I hear it now, 27 years later.",
    youtubeId: 'WdYaGt_sm3Q',
  },
  25: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b27363134b3cf76a63e91647e1bb',
    title: 'Rhinestone Cowboy',
    artist: 'Glen Campbell',
    memory: "Everyone I hear it, I am transported back to being with my grandma in the car. We were somewhere shopping I think, not sure where, but I can still can hear her singing along with this song.",
    youtubeId: '8kAU3B9Pi_U',
  },
  26: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273de09e02aa7febf30b7c02d82',
    title: 'Clocks',
    artist: 'Coldplay',
    memory: "Always reminds me of being in nursing school, in a cold, sterile operating room, observing the removal of an ectopic pregnancy. That moment has stuck with me vividly since that day 20+ years ago.",
    youtubeId: 'd020hcWA_Wg',
  },
  27: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273aaad9cc8209b05f314ca1179',
    title: 'Radar Love',
    artist: 'Golden Earring',
    memory: "I was in college about 5 hours away from the love of my life. He spent so much time every weekend driving down to see me. It was physically painful for us to be apart. That song was written for him.",
    youtubeId: 'ckM51xoTC2U',
  },
  28: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273105f043a4f470cf58cc01ccf',
    title: 'Wisemen',
    artist: 'James Blunt',
    memory: "Driving my first car a '93 Saturn SC2 each cold morning and just hooking up my mp3 player to my aftermarket stereo. Just the right melody for driving alone and cold.",
    youtubeId: 'cueB7j4ZGrM',
  },
  29: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273eb73ed4988bcb9d13607d2a9',
    title: 'Handyman',
    artist: 'Jimmy Jones',
    memory: "I had just gotten divorced and rebounded with a guy I had a HUGE crush on, and he sang this to me over the phone.",
    youtubeId: 'Wf6ZuwccJ48',
  },
  30: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b27374fad40214d982351347e46e',
    title: 'Pardon Me',
    artist: 'Incubus',
    memory: "I remember laying on my best friends floor and us listening to this, laughing that we really didn't know the words. She got in a motorcycle accident a few years later. I know the words now.",
    youtubeId: 'PXzuDXZwZtI',
  },
  31: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273ccdddd46119a4ff53eaf1f5d',
    title: 'Mr. Brightside',
    artist: 'The Killers',
    memory: "Used to play this on my CD player every day before work at the greenhouse. Each time I hear it I'm transported back to my old truck, racing down gravel roads with golden wheat fields as far as the eye can see",
    youtubeId: 'gGdGFtwCNBE',
  },
  32: {
    albumCover: 'https://img.youtube.com/vi/HKLnmMacEB4/maxresdefault.jpg',
    title: 'The Game of Love',
    artist: 'Santana and Michelle Branch',
    memory: "I got a very unjust speeding ticket while this song was on the radio. Can't not think about it any time I hear it. That was 22 years ago. Lol.",
    youtubeId: 'HKLnmMacEB4',
  },
  33: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273c8e97cafeb2acb85b21a777e',
    title: 'Every Breath You Take',
    artist: 'The Police',
    memory: "This song always reminds me of watching stranger things with my mom during the summer— the first summer in the new house and my dad also watching the episodes while away on a work trip and discussing the plot twists over the phone :)",
    youtubeId: 'OMOGaugKpzs',
  },
  34: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2730c12ef918102b8d303dc9e9b',
    title: 'Motorcycle Drive By',
    artist: 'Third Eye Blind',
    memory: "I was driving home from an amazing night with the woman I knew I was going to marry but somehow knew deep down that it wasn't going to last. It was like a bizarre foreshadowing of all of the good times to come and their inevitable end",
    youtubeId: 'tjtRbO1GCQU',
  },
  35: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273bb639863b7b716acf67bfa64',
    title: '18 And Life',
    artist: 'Skid Row',
    memory: "Any time I hear this, it's 56° F, the first week of October, and I'm about to board the tilt-a-whirl for the very first time.",
    youtubeId: 'Ghd2bkIadG4',
  },
  36: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2737a4c8c59851c88f6794c3cbf',
    title: 'Wonderwall',
    artist: 'Oasis',
    memory: "Made out with a Scottish lad to this in a club in Hanoi, Vietnam. Great kiss.",
    youtubeId: '6hzrDeceEKc',
  },
  37: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273f3eaae22e1c6b26400073c05',
    title: 'Defying Gravity',
    artist: 'Idina Menzel',
    memory: "This makes me think of when I was in the 4th grade because my teacher used it along with a slideshow of all our memories from that year. Never saw the musical, but always knew the lyrics to this song. Whenever I hear it, I remember the last day of grade 4 where the whole class was crying because we loved her so much.",
    youtubeId: 'wYTeyNB1k5g',
  },
  38: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273bfc36bb3d809957da578eb54',
    title: "Chasin' the Wind",
    artist: 'Chicago',
    memory: "I had a massive crush on all through high school, and while we were good friends I didn't have the nerve to say anything because I was afraid I'd lose her as a friend. She never indicated she was interested in anything else either. This song came out the year we graduated and went our separate ways. Every time I play it I relive damn near every good memory I have of her.",
    youtubeId: 'rF9sCEBI9q8',
  },
  39: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273fb995d2871f084b34afae3b3',
    title: 'Money for Nothing',
    artist: 'Dire Straits',
    memory: "My sister had just turned 16 and was practicing driving in the high school parking lot and somehow I ended up in the car with her (it was 1985. Clearly no one was concerned that an 8 year old was in a car with an unlicensed driver lol). This was on the radio and to this day whenever I hear it I think of driving around the parking lot on a hot summer day.",
    youtubeId: 'wTP2RUD_cL0',
  },
  40: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273509342e69eb341df70e5c2e3',
    title: 'Road to Nowhere',
    artist: 'Ozzy Osbourne',
    memory: "10 years ago this summer I had to walk across a major bridge near me due to a summer transit closure that impacted me. I played \"Road to Nowhere\" almost every day since I was going through the motions at my job and was a year away from 30, feeling this pressure to figure out what I wanted to do long-term. I lived in NYC at the time and the lyrics were very fitting considering I often played it while walking in the direction of the Manhattan skyline.",
    youtubeId: 'YFSgYa8YfWk',
  },
  41: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b27322463d6939fec9e17b2a6235',
    title: 'Everybody Wants To Rule The World',
    artist: 'Tears For Fears',
    memory: "Reminds me of sitting in doctor's waiting rooms in summer afternoons. My sister had some small issues with her leg and that's why she had to go to doctors. I don't know if that song played once or several times. But now every time I think of that song I remember thinking \"I could be home watching TV but I'm doing this instead\".",
    youtubeId: 'aGCdLKXNF3w',
  },
  42: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273709087714422d592d6591f41',
    title: "I'm Like A Bird",
    artist: 'Nelly Furtado',
    memory: "One time when I was a kid I ate an absurd amount of gummy bears on a road trip, and I have a vivid memory of throwing up on the side of the road while this was playing. I'll never not think about throwing up when I hear that song lol.",
    youtubeId: 'roPQ_M3yJTA',
  },
  43: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b27315145482a542a9adb282250b',
    title: 'One Call Away',
    artist: 'Charlie Puth',
    memory: "I was really upset about something and this song came on while I was driving. Even though it wasn't what the singer was saying, it reminded me that God is only one 'call' away, and I could pray for comfort.",
    youtubeId: 'BxuY9FET9Y4',
  },
  44: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273a561ebb45326bae60310f10f',
    title: 'Late in the Evening',
    artist: 'Paul Simon',
    memory: "At my wedding in 1992, a conga line formed spontaneously during this song, and I always flash back to that moment when I hear it.",
    youtubeId: 'ilzvuie7Bks',
  },
  45: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273795c9ba853f5a9f7a88b4e31',
    title: 'Take Me Home, Country Roads',
    artist: 'John Denver',
    memory: "My dad taught me to drive. Once I was a couple weeks out from my test and could drive well, he started putting on music whilst I drove and I have such a nice memory of driving down a road near my house and it was sunny and the windows were open and my dad was listening and singing along to this. It makes me emotional every time.",
    youtubeId: '1vrEljMfXYo',
  },
  46: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273717f38200c8370df83f6364b',
    title: "I Don't Want To Fall In Love",
    artist: 'She Wants Revenge',
    memory: "This song was playing in my earphones when the bus I was traveling in collided with a car (fortunately no one was seriously hurt).",
    youtubeId: 'WqKAbfA8TxU',
  },
  47: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273d5fccf9ce08b6a1e7d12a222',
    title: 'War Pigs',
    artist: 'Black Sabbath',
    memory: "I used to work in a pub and this was the last song we would play on the juke box before going home. Now anytime I hear it I think \"oh great, time to go home\". The boss was a bit bonkers but a nice bloke and it reminds me of the fun we had.",
    youtubeId: 'bc5Nk1DXyEY',
  },
  48: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b27363c87ef2657626d2b8ff0d24',
    title: "Jesu, Joy of Man's Desiring",
    artist: 'Bach',
    memory: "My music teacher always played this on the piano as pupils walked out of the hall back to their classrooms after morning assembly in primary school.",
    youtubeId: 'S6OgZCCoXWc',
  },
  49: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2734f3bbf9631faeb8de9912a23',
    title: 'All Star',
    artist: 'Smash Mouth',
    memory: "I was in a school van on the way home from a week away at camp. This had just been released, probably while we were in camp, and all the kids in the van just sat enraptured listening to one of the hottest bops that had blessed our little elementary school ears. By the end we were all dancing in our seats and singing the chorus at the top of our lungs. And I remember thinking, \"Yes. I am now a teenager.\"",
    youtubeId: 'L_jWHffIx5E',
  },
  50: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2732d13aa2907e8ea5e59fb3505',
    title: 'Tongue Tied',
    artist: 'Grouplove',
    memory: "It's night, I'm at a summer camp, struggling to fix my string backpack, not understanding why the other girls are able to be so happy and friendly with each other and I'm sitting on a concrete step alone while everyone else is dancing to this together and laughing. Why I seemingly can't do anything right, from packing to talking.",
    youtubeId: 'Fot9VQGVxAk',
  },
  51: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2738b1dc76f3a0cc8381b012e24',
    title: 'Ashes of Eden',
    artist: 'Breaking Benjamin',
    memory: "Putting my soul dog to sleep. She meant, and still means, so much to me. This will always be hers.",
    youtubeId: 'd1yTyAh8IA8',
  },
  52: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2734ea992d3d7a0dd145f8ee213',
    title: 'Chattahoochee',
    artist: 'Alan Jackson',
    memory: "This will forever be burned in my brain as the song I jumped to on my grandparent's trampoline out in a farm in Saskatchewan with my uncles bouncing us so high we could see over the roof of the house.",
    youtubeId: 'V9dkylrNq1g',
  },
  53: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2733147cf1d923adde6b27721ff',
    title: 'Make It Wonderful',
    artist: 'Erasure',
    memory: "The day before my son was born, I was listening to this on repeat. I was 32 weeks pregnant. My son came bursting into the world in the early hours of the following day. Two months early. Nothing wrong with him, nothing wrong with me, he just really wanted to be here.",
    youtubeId: 'U3PmcPcxl7I',
  },
  54: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273a6f6056c9ded5242ca245c56',
    title: 'Sweden',
    artist: 'C418',
    memory: "Whenever I hear this, I'm instantly reminded of the first time I played Minecraft with my best friend at her house in December 2012. I can still picture us sitting on her living room floor, surrounded by snacks while she patiently guided me through the game, even though I had no clue what I was doing. The music played softly and I can vividly recall the excitement we felt.",
    youtubeId: 'aBkTkxKDduc',
  },
  55: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b27345d8eaebe1528abd4d9895cf',
    title: 'Merchandise',
    artist: 'Fugazi',
    memory: "I listen to music while running, and every once in a while a song really sticks to a specific place and time. This one I remember playing as I was running along a bustling street in Thailand.",
    youtubeId: 'RQ8muwMQNbg',
  },
  56: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b2734e7ff4a30597e57f5bc988f9',
    title: 'Spiders',
    artist: 'System of a Down',
    memory: "The best girl I ever dated once asked me to sing her to sleep. The closest thing I knew to a lullaby/ballad was this song.",
    youtubeId: 'SqZNMvIEHhs',
  },
  57: {
    albumCover: 'https://i.scdn.co/image/ab67616d0000b273b7bea3d01f04e6d0408d2afe',
    title: 'Where The Streets Have No Name',
    artist: 'U2',
    memory: "I was deployed in Iraq in '03. When I heard we were finally getting to go home, this was one of the first songs I listened to. I was instantly brought to tears and felt a sense of relief, like a huge weight/burden was taken off my shoulders. Since then, whenever I hear this song, I just stop and smile, remembering the joy this song brought me 16 years ago.",
    youtubeId: 'GzZWSrr5wFI',
  },
};

const tiles = [
  { bg: '#C41E3A', pattern: 'gingham' },
  { bg: '#E8D4A8', pattern: 'crosshatch' },
  { bg: '#4A6FA5', pattern: 'plaid' },
  { bg: '#6B8E23', pattern: 'floral' },
  { bg: '#DDA0DD', pattern: 'polkadot' },
  { bg: '#8B4513', pattern: 'herringbone' },
  { bg: '#F4A460', pattern: 'patches' },
  { bg: '#5F9EA0', pattern: 'stitches' },
  { bg: '#DB7093', pattern: 'gingham' },
  { bg: '#556B2F', pattern: 'crosshatch' },
  { bg: '#CD853F', pattern: 'plaid' },
  { bg: '#6A5ACD', pattern: 'floral' },
  { bg: '#BC8F8F', pattern: 'polkadot' },
  { bg: '#2F4F4F', pattern: 'herringbone' },
  { bg: '#DAA520', pattern: 'patches' },
  { bg: '#8FBC8F', pattern: 'stitches' },
];

const getPatternStyle = (pattern: string) => {
  const thread = 'rgba(255,255,255,0.4)';
  const shadow = 'rgba(0,0,0,0.1)';
  const stitch = 'rgba(255,255,255,0.6)';

  switch (pattern) {
    case 'gingham':
      return {
        backgroundImage: `
          linear-gradient(90deg, ${thread} 50%, transparent 50%),
          linear-gradient(${thread} 50%, transparent 50%)
        `,
        backgroundSize: '20px 20px',
      };
    case 'crosshatch':
      return {
        backgroundImage: `
          repeating-linear-gradient(45deg, ${thread} 0, ${thread} 1px, transparent 0, transparent 50%),
          repeating-linear-gradient(-45deg, ${thread} 0, ${thread} 1px, transparent 0, transparent 50%)
        `,
        backgroundSize: '12px 12px'
      };
    case 'plaid':
      return {
        backgroundImage: `
          repeating-linear-gradient(0deg, ${thread} 0px, ${thread} 2px, transparent 2px, transparent 20px),
          repeating-linear-gradient(90deg, ${thread} 0px, ${thread} 2px, transparent 2px, transparent 20px),
          repeating-linear-gradient(0deg, ${shadow} 0px, ${shadow} 1px, transparent 1px, transparent 10px),
          repeating-linear-gradient(90deg, ${shadow} 0px, ${shadow} 1px, transparent 1px, transparent 10px)
        `
      };
    case 'floral':
      return {
        backgroundImage: `
          radial-gradient(circle at 25% 25%, ${thread} 8%, transparent 8%),
          radial-gradient(circle at 75% 75%, ${thread} 8%, transparent 8%),
          radial-gradient(circle at 25% 75%, ${shadow} 5%, transparent 5%),
          radial-gradient(circle at 75% 25%, ${shadow} 5%, transparent 5%)
        `,
        backgroundSize: '30px 30px'
      };
    case 'polkadot':
      return {
        backgroundImage: `
          radial-gradient(circle, ${thread} 25%, transparent 25%)
        `,
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 10px 10px'
      };
    case 'herringbone':
      return {
        backgroundImage: `
          repeating-linear-gradient(45deg, ${thread} 0, ${thread} 2px, transparent 0, transparent 10px),
          repeating-linear-gradient(-45deg, ${shadow} 0, ${shadow} 2px, transparent 0, transparent 10px)
        `,
        backgroundSize: '20px 20px'
      };
    case 'patches':
      return {
        backgroundImage: `
          linear-gradient(${stitch} 1px, transparent 1px),
          linear-gradient(90deg, ${stitch} 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%',
        boxShadow: `inset 0 0 0 3px ${thread}, inset 4px 4px 0 0 ${shadow}`
      };
    case 'stitches':
      return {
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 8px, ${stitch} 8px, ${stitch} 10px, transparent 10px, transparent 18px),
          repeating-linear-gradient(90deg, transparent, transparent 8px, ${stitch} 8px, ${stitch} 10px, transparent 10px, transparent 18px)
        `,
        backgroundSize: '20px 20px',
        boxShadow: `inset 0 0 0 2px ${thread}`
      };
    default:
      return {};
  }
};

// Get tile position (center of tile)
const getTilePosition = (index: number, gridCols: number, tileSize: number) => {
  const col = index % gridCols;
  const row = Math.floor(index / gridCols);
  const x = col * (tileSize + GAP) + tileSize / 2;
  const y = row * (tileSize + GAP) + tileSize / 2;
  return { x, y };
};

export default function SongsThatHoldMemoriesExhibit() {
  // Mobile detection - start with null to avoid hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [showIntro, setShowIntro] = useState(false); // Start false to avoid flash
  const [introFading, setIntroFading] = useState(false);
  const [showMemoryText, setShowMemoryText] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check mobile and set up intro on mount
  useEffect(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    setMounted(true);

    if (mobile) {
      // On mobile: no animations, start in grid view
      setShowIntro(false);
      setShowFullQuilt(true);
      setActiveTile(0);
      setShowMemoryText(false);

      // Lock body scroll on mobile
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      // Start intro on desktop
      setShowIntro(true);
    }

    return () => {
      // Restore body scroll on unmount
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);
  // Start near center of grid
  const initialGrid = getGridDimensions(DEFAULT_TILES);
  const centerTile = Math.floor(initialGrid.rows / 2) * initialGrid.cols + Math.floor(initialGrid.cols / 2);
  const [activeTile, setActiveTile] = useState<number>(Math.min(centerTile, DEFAULT_TILES - 1));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [flippedTile, setFlippedTile] = useState<number | null>(null);
  const [mobileVideoPopup, setMobileVideoPopup] = useState<{ index: number; youtubeId: string; title: string; artist: string } | null>(null);
  const [showFullQuilt, setShowFullQuilt] = useState(true);
  const [lastActiveTile, setLastActiveTile] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Popup and form state
  const [showPopup, setShowPopup] = useState(false);
  const [formMemory, setFormMemory] = useState('');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Spotify search state
  const [spotifyQuery, setSpotifyQuery] = useState('');
  const [spotifyResults, setSpotifyResults] = useState<{ id: string; title: string; artist: string; albumCover: string }[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<{ id: string; title: string; artist: string; albumCover: string } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [songTiles, setSongTiles] = useState<{ [key: number]: SongTile }>(defaultSongTiles);
  const [totalTiles, setTotalTiles] = useState(DEFAULT_TILES);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);

  // Window dimensions for quilt view and responsive tile size
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });

  // Helper to get smaller image (300x300 instead of 640x640) for better performance
  const getOptimizedImage = (url: string) => {
    // Always use smaller images for better performance
    return url.replace('ab67616d0000b273', 'ab67616d00001e02');
  };

  // Fixed tiles per page for consistent performance
  const tilesPerPage = isMobile ? TILES_PER_PAGE_MOBILE : TILES_PER_PAGE_DESKTOP;

  // Pagination calculations
  const totalPages = Math.ceil(totalTiles / tilesPerPage);
  const pageStartIndex = currentPage * tilesPerPage;
  const pageEndIndex = Math.min(pageStartIndex + tilesPerPage, totalTiles);
  const tilesOnCurrentPage = pageEndIndex - pageStartIndex;
  const currentPageTileIndices = Array.from({ length: tilesOnCurrentPage }, (_, i) => pageStartIndex + i);

  // Fixed grid dimensions: 4 columns mobile, 7 columns desktop
  // Always use full page dimensions for consistent layout (even on last page with fewer tiles)
  const gridCols = isMobile ? 4 : 7;
  const fullPageRows = isMobile ? 6 : 5; // 4x6 mobile, 7x5 desktop
  const gridDimensions = { cols: gridCols, rows: fullPageRows };

  // Calculate responsive tile size
  const tileSize = getTileSize(windowSize.width);

  useEffect(() => {
    const updateSize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate grid total size and quilt scale
  const gridWidth = gridDimensions.cols * (tileSize + GAP) - GAP;
  const gridHeight = gridDimensions.rows * (tileSize + GAP) - GAP;
  // Account for header space (more on mobile due to stacked layout)
  const headerOffset = windowSize.width < 768 ? 140 : 60;
  const availableHeight = windowSize.height - headerOffset;

  const quiltScale = isMobile
    ? Math.min(
        (windowSize.width * 0.85) / gridWidth,
        (availableHeight * 0.80) / gridHeight
      )
    : Math.min(
        (windowSize.width * 0.9) / gridWidth,
        (availableHeight * 0.85) / gridHeight
      );

  // Lock body scroll when popup is open
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showPopup]);

  // Load user-submitted tiles from API on mount
  useEffect(() => {
    const fetchSubmittedSongs = async () => {
      try {
        const response = await fetch('/api/songs/list');
        if (response.ok) {
          const data = await response.json();
          if (data.songs && data.songs.length > 0) {
            const userTiles: { [key: number]: SongTile } = {};
            data.songs.forEach((song: SongTile, index: number) => {
              userTiles[DEFAULT_TILES + index] = song;
            });
            setSongTiles({ ...defaultSongTiles, ...userTiles });
            setTotalTiles(DEFAULT_TILES + data.songs.length);
          }
        }
      } catch (error) {
        console.error('Error fetching submitted songs:', error);
      }
    };
    fetchSubmittedSongs();
  }, []);

  // Debounced Spotify search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!spotifyQuery.trim() || spotifyQuery.length < 2) {
      setSpotifyResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(spotifyQuery)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          setSpotifyResults(data.tracks || []);
        } else {
          setSpotifyResults([]);
        }
      } catch (error) {
        console.error('Spotify search error:', error);
        setSpotifyResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [spotifyQuery]);

  // Extract YouTube video ID from URL
  const extractYoutubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Validate YouTube URL
  const isValidYoutubeUrl = (url: string): boolean => {
    const youtubePattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
    return youtubePattern.test(url);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validate required fields
    if (!selectedTrack) {
      setFormError('Please search and select a song');
      return;
    }

    if (!formYoutubeUrl.trim()) {
      setFormError('Please enter a YouTube link');
      return;
    }

    // Validate YouTube URL format
    if (!isValidYoutubeUrl(formYoutubeUrl)) {
      setFormError('Please enter a valid YouTube URL (youtube.com or youtu.be)');
      return;
    }

    const youtubeId = extractYoutubeId(formYoutubeUrl);
    if (!youtubeId) {
      setFormError('Could not extract video ID from the YouTube URL. Please check the link.');
      return;
    }

    // Validate memory length
    if (formMemory.length > 360) {
      setFormError('Memory must be 360 characters or less');
      return;
    }

    if (formMemory.trim().length === 0) {
      setFormError('Please enter a memory');
      return;
    }

    setIsSubmitting(true);

    // Use album cover from selected track, fallback to YouTube thumbnail
    const albumCover = selectedTrack.albumCover || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

    const newTile: SongTile = {
      albumCover,
      title: selectedTrack.title,
      artist: selectedTrack.artist,
      memory: formMemory.trim(),
      youtubeId: youtubeId,
    };

    // Save to API (Vercel KV)
    try {
      const saveResponse = await fetch('/api/songs/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTile),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to save song');
      }

      const newIndex = totalTiles;
      const updatedTiles = { ...songTiles, [newIndex]: newTile };
      setSongTiles(updatedTiles);
      setTotalTiles(newIndex + 1);
      // Reset form and close popup
      setSpotifyQuery('');
      setSpotifyResults([]);
      setSelectedTrack(null);
      setFormMemory('');
      setFormYoutubeUrl('');
      setFormError('');
      setIsSubmitting(false);
      setShowPopup(false);

      // Navigate to the new tile
      setTimeout(() => {
        goToTile(newIndex);
      }, 100);
    } catch (error) {
      console.error('Error saving song:', error);
      setFormError('Failed to save your memory. Please try again.');
      setIsSubmitting(false);
      return;
    }
  };

  
  // Search function - only shows results where title or artist starts with query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results: number[] = [];

    Object.entries(songTiles).forEach(([key, song]) => {
      const titleLower = song.title.toLowerCase();
      const artistLower = song.artist.toLowerCase();

      // Only match if title or artist starts with query (not middle of name)
      if (titleLower.startsWith(lowerQuery) || artistLower.startsWith(lowerQuery)) {
        results.push(parseInt(key));
      }
    });

    setSearchResults(results);
    setShowResults(true);
  };

  const goToTile = (tileIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setShowMemoryText(false);
    setActiveTile(tileIndex);
    // Update page to show the tile
    setCurrentPage(Math.floor(tileIndex / tilesPerPage));
    setShowFullQuilt(false); // Zoom into the tile
    setShowResults(false);
    setSearchQuery('');
    setTimeout(() => {
      setIsTransitioning(false);
      setShowMemoryText(true);
    }, 400);
  };

  // Calculate camera position to center on active tile (relative to current page)
  const tileIndexOnPage = activeTile - pageStartIndex;
  const activePos = getTilePosition(tileIndexOnPage, gridDimensions.cols, tileSize);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setShowMemoryText(false);
    setShowFullQuilt(false); // Exit quilt view if active
    setFlippedTile(null);

    // Pick a random tile with a song (different from current)
    const songIndices = Object.keys(songTiles).map(Number);
    let newTile = activeTile;
    while (newTile === activeTile && songIndices.length > 1) {
      newTile = songIndices[Math.floor(Math.random() * songIndices.length)];
    }

    setActiveTile(newTile);
    // Update page to show the new tile
    setCurrentPage(Math.floor(newTile / tilesPerPage));

    // Reset transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
      setShowMemoryText(true);
    }, 400);
  }, [activeTile, isTransitioning, songTiles]);

  useEffect(() => {
    // Skip intro animation on mobile
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return;
    }

    // Start fading out after the writing animation completes
    // Title has 24 characters, last letter appears at ~2.4s (24 * 0.08s delay + 0.5s animation)
    const fadeTimer = setTimeout(() => {
      setIntroFading(true);
    }, 2500);

    // Hide intro and move title to top right after letters finish
    const hideTimer = setTimeout(() => {
      setShowIntro(false);
      // Pick a random tile from default tiles (0 to DEFAULT_TILES-1)
      setActiveTile(0);
      setShowFullQuilt(false);
    }, 2600);

    // Show memory text after zoom animation completes
    const memoryTimer = setTimeout(() => {
      setShowMemoryText(true);
    }, 3800);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
      clearTimeout(memoryTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Store refs for keyboard navigation
  const activeTileRef = useRef(activeTile);
  const isTransitioningRef = useRef(isTransitioning);
  const totalTilesRef = useRef(totalTiles);
  const currentPageRef = useRef(currentPage);
  const tilesOnCurrentPageRef = useRef(tilesOnCurrentPage);
  const tilesPerPageRef = useRef(tilesPerPage);

  useEffect(() => {
    activeTileRef.current = activeTile;
  }, [activeTile]);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  useEffect(() => {
    totalTilesRef.current = totalTiles;
  }, [totalTiles]);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  useEffect(() => {
    tilesOnCurrentPageRef.current = tilesOnCurrentPage;
  }, [tilesOnCurrentPage]);

  useEffect(() => {
    tilesPerPageRef.current = tilesPerPage;
  }, [tilesPerPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (isTransitioningRef.current) return;

      const currentTile = activeTileRef.current;
      const page = currentPageRef.current;
      const tilesOnPage = tilesOnCurrentPageRef.current;

      // Calculate page boundaries
      const pageStart = page * tilesPerPageRef.current;
      const pageEnd = pageStart + tilesOnPage;

      // Grid dimensions based on tiles on current page
      const { cols: gridCols } = getGridDimensions(tilesOnPage, window.innerWidth, window.innerHeight);

      // Calculate position relative to page start
      const tileOnPage = currentTile - pageStart;
      const col = tileOnPage % gridCols;
      const row = Math.floor(tileOnPage / gridCols);

      let newTile = currentTile;

      if (e.key === 'ArrowRight' && currentTile + 1 < pageEnd) {
        // Move right, wrapping to next row if at end of row
        e.preventDefault();
        newTile = currentTile + 1;
      } else if (e.key === 'ArrowLeft' && currentTile > pageStart) {
        // Move left, wrapping to previous row if at start of row
        e.preventDefault();
        newTile = currentTile - 1;
      } else if (e.key === 'ArrowDown' && currentTile + gridCols < pageEnd) {
        e.preventDefault();
        newTile = currentTile + gridCols;
      } else if (e.key === 'ArrowUp' && row > 0) {
        e.preventDefault();
        newTile = currentTile - gridCols;
      } else if (e.key === ' ') {
        e.preventDefault();
        handleNext();
        return;
      }

      if (newTile !== currentTile && newTile >= pageStart && newTile < pageEnd) {
        setIsTransitioning(true);
        setShowMemoryText(false);
        setFlippedTile(null);
        setActiveTile(newTile);
        setTimeout(() => {
          setIsTransitioning(false);
          setShowMemoryText(true);
        }, 400);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext]);

  // Touch swipe navigation for mobile
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTransitioningRef.current) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      const minSwipeDistance = 50;
      const page = currentPageRef.current;
      const tilesOnPage = tilesOnCurrentPageRef.current;
      const pageStart = page * tilesPerPageRef.current;
      const pageEnd = pageStart + tilesOnPage;
      const { cols: gridCols } = getGridDimensions(tilesOnPage, window.innerWidth, window.innerHeight);

      // Determine if horizontal or vertical swipe
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          const currentTile = activeTileRef.current;
          const tileOnPage = currentTile - pageStart;
          const col = tileOnPage % gridCols;
          let newTile = currentTile;

          if (deltaX < 0 && col < gridCols - 1 && currentTile + 1 < pageEnd) {
            // Swipe left = move right
            newTile = currentTile + 1;
          } else if (deltaX > 0 && col > 0) {
            // Swipe right = move left
            newTile = currentTile - 1;
          }

          if (newTile !== currentTile && newTile >= pageStart && newTile < pageEnd) {
            setIsTransitioning(true);
            setFlippedTile(null);
            setShowMemoryText(false);
            setActiveTile(newTile);
            // On mobile, show text after a brief delay
            setTimeout(() => {
              setShowMemoryText(true);
            }, 300);
            setTimeout(() => {
              setIsTransitioning(false);
            }, 500);
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          const currentTile = activeTileRef.current;
          const tileOnPage = currentTile - pageStart;
          const row = Math.floor(tileOnPage / gridCols);
          let newTile = currentTile;

          if (deltaY < 0 && currentTile + gridCols < pageEnd) {
            // Swipe up = move down
            newTile = currentTile + gridCols;
          } else if (deltaY > 0 && row > 0) {
            // Swipe down = move up
            newTile = currentTile - gridCols;
          }

          if (newTile !== currentTile && newTile >= pageStart && newTile < pageEnd) {
            setIsTransitioning(true);
            setFlippedTile(null);
            setShowMemoryText(false);
            setActiveTile(newTile);
            // On mobile, show text after a brief delay
            setTimeout(() => {
              setShowMemoryText(true);
            }, 300);
            setTimeout(() => {
              setIsTransitioning(false);
            }, 500);
          }
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Trackpad/scroll wheel navigation for desktop
  useEffect(() => {
    let lastWheelTime = 0;
    const wheelThrottle = 300; // ms between navigations

    const handleWheel = (e: WheelEvent) => {
      // Prevent browser back/forward navigation
      e.preventDefault();

      if (isTransitioningRef.current) return;
      if (showFullQuilt) return; // Don't navigate when zoomed out

      const now = Date.now();
      if (now - lastWheelTime < wheelThrottle) return;

      const currentTile = activeTileRef.current;
      const page = currentPageRef.current;
      const tilesOnPage = tilesOnCurrentPageRef.current;
      const pageStart = page * tilesPerPageRef.current;
      const pageEnd = pageStart + tilesOnPage;
      const { cols: gridCols } = getGridDimensions(tilesOnPage, window.innerWidth, window.innerHeight);

      const tileOnPage = currentTile - pageStart;
      const col = tileOnPage % gridCols;
      const row = Math.floor(tileOnPage / gridCols);
      let newTile = currentTile;

      // Determine primary scroll direction
      const threshold = 10;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        // Horizontal scroll - wrap between rows
        if (e.deltaX > threshold && currentTile + 1 < pageEnd) {
          newTile = currentTile + 1;
        } else if (e.deltaX < -threshold && currentTile > pageStart) {
          newTile = currentTile - 1;
        }
      } else {
        // Vertical scroll
        if (e.deltaY > threshold && currentTile + gridCols < pageEnd) {
          newTile = currentTile + gridCols;
        } else if (e.deltaY < -threshold && row > 0) {
          newTile = currentTile - gridCols;
        }
      }

      if (newTile !== currentTile && newTile >= pageStart && newTile < pageEnd) {
        lastWheelTime = now;
        setIsTransitioning(true);
        setShowMemoryText(false);
        setFlippedTile(null);
        setActiveTile(newTile);
        setTimeout(() => {
          setIsTransitioning(false);
          setShowMemoryText(true);
        }, 400);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [showFullQuilt]);

  return (
    <>
      <style jsx global>{`
        html, body {
          background-color: #0a0a0a !important;
          overflow: hidden;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .cursive-text {
          font-family: 'Instrument Serif', Georgia, serif;
          font-style: italic;
        }
        .letter {
          display: inline-block;
          opacity: 0;
          animation: fadeInUp 0.5s ease-out forwards;
        }
        .letter-done {
          display: inline-block;
          opacity: 1;
        }
        @keyframes blurIn {
          from {
            filter: blur(0px);
          }
          to {
            filter: blur(3px);
          }
        }
        @keyframes textFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-blur {
          animation: blurIn 1.5s ease-out forwards;
        }
        .animate-text-fade {
          opacity: 0;
          animation: textFadeIn 1.5s ease-out 0.5s forwards;
        }
        @keyframes jiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
          75% { transform: rotate(-3deg); }
        }
        @media (min-width: 768px) {
          .jiggle-hover:hover {
            animation: jiggle 0.3s ease-in-out infinite;
          }
        }
        .flip-card {
          perspective: 1000px;
        }
        .flip-card-inner {
          transition: transform 0.3s;
          transform-style: preserve-3d;
        }
        @media (min-width: 768px) {
          .flip-card-inner {
            transition: transform 0.6s;
          }
        }
        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }
        .flip-card-front, .flip-card-back {
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
        }
        .flip-card-front {
          z-index: 2;
        }
        .flip-card-inner.flipped .flip-card-front {
          visibility: hidden;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Dark overlay during intro for better text readability */}
      {showIntro && (
        <div
          className={`fixed inset-0 z-[45] bg-black/50 transition-opacity duration-500 pointer-events-none ${
            introFading ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      <main
        className="h-screen w-screen overflow-hidden bg-[#0a0a0a] relative"
        style={{
          height: '100dvh',
          touchAction: isMobile ? 'manipulation' : 'auto',
          overscrollBehavior: 'none',
        }}
      >
        {/* Title and Controls - Top Center */}
        <div className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 md:gap-4 w-[90%] max-w-sm md:w-auto md:max-w-none">
          {/* Title */}
          <h1
            className="text-white text-2xl md:text-2xl lg:text-3xl tracking-tight cursive-text text-center drop-shadow-2xl whitespace-nowrap"
            style={{
              transform: (isMobile === true) ? 'none' : (showIntro ? 'translateY(40vh) scale(1.8)' : 'translateY(0) scale(1)'),
              transition: 'transform 1s ease-out',
              transformOrigin: 'center center',
              willChange: 'transform',
            }}
          >
            {Array.from("Songs That Hold Memories").map((char, i) => (
              <span
                key={i}
                className={(isMobile === true) ? 'letter-done' : (showIntro ? 'letter' : 'letter-done')}
                style={{ animationDelay: (isMobile !== true && showIntro) ? `${i * 0.08}s` : '0s' }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>
                    {/* Controls row */}
          <div className="flex flex-col-reverse md:flex-row items-center gap-2 md:gap-3 w-full md:w-auto">
          {/* Search bar - last on desktop */}
          <div className="relative flex-1 md:flex-none md:order-3">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 z-10 pointer-events-none"
              fill="none"
              stroke="white"
              strokeOpacity="0.6"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by song or artist"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-3 py-2 bg-white/20 backdrop-blur-md text-white text-base md:text-sm font-medium rounded-full w-full md:w-80 placeholder-white/60 focus:outline-none focus:bg-white/30 transition-all font-[family-name:var(--font-inter)]"
              style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.2), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}
            />
            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div
                className="absolute top-full mt-2 left-0 right-0 bg-black/80 backdrop-blur-md rounded-xl overflow-hidden max-h-64 overflow-y-auto"
                style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.2), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}
              >
                {searchResults.slice(0, 5).map((tileIndex) => {
                  const song = songTiles[tileIndex];
                  return (
                    <button
                      key={tileIndex}
                      onClick={() => goToTile(tileIndex)}
                      className="w-full px-4 py-3 text-left text-white hover:bg-white/20 transition-colors font-[family-name:var(--font-inter)]"
                    >
                      <p className="text-sm font-bold">{song.title}</p>
                      <p className="text-xs opacity-70">{song.artist}</p>
                    </button>
                  );
                })}
              </div>
            )}
            {showResults && searchResults.length === 0 && searchQuery.trim() !== '' && (
              <div
                className="absolute top-full mt-2 left-0 right-0 bg-black/80 backdrop-blur-md rounded-xl px-4 py-3"
                style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.2), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}
              >
                <p className="text-sm text-white/70 font-[family-name:var(--font-inter)]">No results found</p>
              </div>
            )}
          </div>
          {/* "or" - only visible on desktop, between button and search */}
          <span className="hidden md:block text-white/60 text-sm font-[family-name:var(--font-inter)] md:order-2">or</span>
          {/* Button wrapper - first on desktop */}
          <div className="flex items-center justify-center gap-2 w-full md:w-auto md:order-1">
            <button
              onClick={handleNext}
              disabled={isTransitioning}
              className="py-2 px-4 bg-white/20 backdrop-blur-md text-white text-sm font-bold rounded-full hover:bg-white/30 transition-all font-[family-name:var(--font-inter)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap jiggle-hover"
              style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.2), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}
            >
              {isTransitioning ? 'Moving...' : "Take a chance"}
            </button>
            {/* "or swipe around or" only on mobile */}
            <span className="md:hidden text-white/60 text-sm font-[family-name:var(--font-inter)]">or swipe around or</span>
          </div>
          </div>
        </div>

        {/* Submit Button - Top Right */}
        {/* Share a memory button - desktop only (mobile version is in header) */}
        <button
          onClick={() => setShowPopup(true)}
          className="hidden md:block fixed top-6 right-6 z-[60] px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-black hover:text-white transition-all font-[family-name:var(--font-inter)] jiggle-hover"
          style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.2), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}
        >
          Share a memory
        </button>

        {/* Submission Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-md px-4">
            <div
              className="bg-black/50 backdrop-blur-xl rounded-2xl p-5 md:p-8 w-full max-w-xs md:max-w-md relative border border-white/20"
              style={{ boxShadow: '0 0 60px rgba(255,255,255,0.1), inset 0 0 80px rgba(255,255,255,0.05)' }}
            >
              {/* Close button */}
              <button
                onClick={() => { setShowPopup(false); setFormError(''); }}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-white text-2xl md:text-2xl font-bold mb-2 font-[family-name:var(--font-instrument-serif)] italic">
                Share a song memory
              </h2>
              <p className="text-white/60 text-sm md:text-base mb-4 font-[family-name:var(--font-inter)]">
                Do you ever hear a song and it takes you back to a specific moment?
              </p>
              <p className="text-white/60 text-xs md:text-sm mb-4 -mt-2 italic font-[family-name:var(--font-inter)]">
                Tip: The more specific you are, the more special this feels. Go for it!
              </p>

              <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                {/* Spotify Song Search */}
                <div className="relative">
                  <label className="block text-white/70 text-sm mb-1 font-[family-name:var(--font-inter)]">
                    Search for a song <span className="text-white/40">(pulled from Spotify)</span> <span className="text-red-500">*</span>
                  </label>

                  {selectedTrack ? (
                    // Show selected track
                    <div className="flex items-center gap-3 px-4 py-3 bg-white/10 rounded-lg border border-white/30">
                      {selectedTrack.albumCover && (
                        <img
                          src={selectedTrack.albumCover}
                          alt=""
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate font-[family-name:var(--font-inter)]">
                          {selectedTrack.title}
                        </p>
                        <p className="text-white/60 text-sm truncate font-[family-name:var(--font-inter)]">
                          {selectedTrack.artist}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTrack(null);
                          setSpotifyQuery('');
                          setSpotifyResults([]);
                        }}
                        className="text-white/60 hover:text-white p-1"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    // Show search input
                    <>
                      <div className="relative">
                        <input
                          type="text"
                          value={spotifyQuery}
                          onChange={(e) => setSpotifyQuery(e.target.value)}
                          className="w-full px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none font-[family-name:var(--font-inter)]"
                          placeholder="Search by song or artist..."
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Search Results Dropdown */}
                      {spotifyResults.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-white/20 rounded-lg overflow-hidden shadow-xl">
                          {spotifyResults.map((track) => (
                            <button
                              key={track.id}
                              type="button"
                              onClick={() => {
                                setSelectedTrack(track);
                                setSpotifyQuery('');
                                setSpotifyResults([]);
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors text-left"
                            >
                              {track.albumCover && (
                                <img
                                  src={track.albumCover}
                                  alt=""
                                  className="w-10 h-10 rounded object-cover flex-shrink-0"
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-white font-medium truncate text-sm font-[family-name:var(--font-inter)]">
                                  {track.title}
                                </p>
                                <p className="text-white/60 text-xs truncate font-[family-name:var(--font-inter)]">
                                  {track.artist}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-1 font-[family-name:var(--font-inter)]">
                    Memory <span className="text-red-500">*</span> <span className="text-white/40">({360 - formMemory.length} characters left)</span>
                  </label>
                  <textarea
                    value={formMemory}
                    onChange={(e) => setFormMemory(e.target.value.slice(0, 360))}
                    maxLength={360}
                    rows={4}
                    className="w-full px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none resize-none font-[family-name:var(--font-inter)]"
                    placeholder="What memory does this song hold for you?"
                  />
                </div>

                <div>
                  <label className="block text-white/70 text-sm mb-1 font-[family-name:var(--font-inter)]">Link to Song on YouTube <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={formYoutubeUrl}
                    onChange={(e) => setFormYoutubeUrl(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none font-[family-name:var(--font-inter)]"
                    placeholder="e.g. https://youtube.com/watch?v=..."
                  />
                </div>

                {formError && (
                  <p className="text-red-500 text-sm text-center font-[family-name:var(--font-inter)]">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-white text-black font-bold rounded-full hover:bg-[#F8330D] hover:text-white transition-all font-[family-name:var(--font-inter)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Adding...' : 'Add my memory'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Logo - Top Left */}
        <a
          href="/songs-that-hold-memories"
          className="fixed top-4 left-4 md:top-6 md:left-6 z-50 opacity-60 hover:opacity-100 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/museum/artgallery/logo.webp"
            alt="Logo"
            className="w-8 md:w-14 h-auto"
          />
        </a>

        {/* Grid Container - moves to center active tile or zooms out */}
        <div
          ref={containerRef}
          className="absolute"
          style={{
            opacity: mounted ? 1 : 0,
            transform: showFullQuilt
              ? `translate(${(windowSize.width - gridWidth * quiltScale) / 2}px, ${headerOffset + (availableHeight - gridHeight * quiltScale) / (isMobile ? 4 : 2)}px) scale(${quiltScale})`
              : `translate(
                  calc(50vw - ${activePos.x}px),
                  calc(50vh - ${activePos.y}px)
                )`,
            transformOrigin: 'top left',
            transition: isMobile ? 'none' : 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Tile Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridDimensions.cols}, ${tileSize}px)`,
              gap: `${GAP}px`,
            }}
          >
            {currentPageTileIndices.map((tileIndex) => {
              const tileData = tiles[tileIndex % tiles.length];
              const isActive = tileIndex === activeTile;
              const songData = songTiles[tileIndex];
              const isFlipped = flippedTile === tileIndex;

              return (
                <div
                  key={tileIndex}
                  className="flip-card rounded-xl overflow-hidden"
                  style={{
                    width: `${tileSize}px`,
                    height: `${tileSize}px`,
                    filter: showFullQuilt ? 'brightness(1)' : (isActive ? 'brightness(1)' : 'brightness(0.2)'),
                    transform: showFullQuilt ? 'scale(1)' : (isActive ? 'scale(1.05)' : 'scale(1)'),
                    boxShadow: isMobile
                      ? 'none'
                      : (showFullQuilt
                        ? '0 4px 20px rgba(0,0,0,0.3)'
                        : (isActive
                          ? '0 0 60px 20px rgba(255,255,255,0.15), 0 0 100px 40px rgba(255,255,255,0.05)'
                          : 'none')),
                    transition: isMobile ? 'none' : 'filter 0.8s ease-out, transform 0.8s ease-out, box-shadow 0.8s ease-out',
                    cursor: showFullQuilt ? 'pointer' : 'default',
                    zIndex: isActive ? 10 : 1,
                  }}
                  onClick={() => {
                    if (showFullQuilt) {
                      // Clicking a tile in quilt view zooms to that tile
                      setShowFullQuilt(false);
                      setIsTransitioning(true);
                      setShowMemoryText(false);
                      setActiveTile(tileIndex);
                      setFlippedTile(null);
                      setTimeout(() => {
                        setIsTransitioning(false);
                        setShowMemoryText(true);
                      }, 400);
                    } else if (isActive && songData) {
                      // On mobile, show popup instead of flipping
                      if (isMobile) {
                        setMobileVideoPopup({
                          index: tileIndex,
                          youtubeId: songData.youtubeId,
                          title: songData.title,
                          artist: songData.artist
                        });
                      } else {
                        // Desktop: flip the tile
                        setFlippedTile(isFlipped ? null : tileIndex);
                      }
                    } else if (!isTransitioning && tileIndex !== activeTile) {
                      setIsTransitioning(true);
                      setShowMemoryText(false);
                      setActiveTile(tileIndex);
                      setFlippedTile(null);
                      setTimeout(() => {
                        setIsTransitioning(false);
                        setShowMemoryText(true);
                      }, 400);
                    }
                  }}
                >
                  <div className={`flip-card-inner w-full h-full ${isFlipped ? 'flipped' : ''}`}>
                    {/* Front of tile */}
                    <div
                      className="flip-card-front absolute inset-0 rounded-xl overflow-hidden"
                      style={{
                        backgroundColor: songData ? '#000' : tileData.bg,
                        ...(songData ? {} : getPatternStyle(tileData.pattern)),
                      }}
                    >
                      {/* Tile number */}
                      <span className="absolute top-2 right-2 text-white/40 text-[1.05rem] font-mono z-10">#{tileIndex + 1}</span>
                      {/* Album cover for song tiles */}
                      {songData && (
                        <>
                          {!failedImages.has(tileIndex) && (
                            <Image
                              src={getOptimizedImage(songData.albumCover)}
                              alt={`${songData.title} by ${songData.artist}`}
                              fill
                              className={`object-cover transition-all duration-500 ${showMemoryText && isActive && !showFullQuilt ? 'blur-[10px]' : 'blur-0'}`}
                              unoptimized
                              onError={() => setFailedImages(prev => new Set([...prev, tileIndex]))}
                            />
                          )}
                                                    {/* Memory text */}
                          <div className={`absolute inset-0 flex items-center justify-center px-4 md:px-12 py-4 md:py-6 text-gray-200 transition-opacity duration-500 bg-black/40 md:bg-black/30 md:backdrop-blur-[2px] ${showMemoryText && isActive && !showFullQuilt ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="flex flex-col items-center gap-2 md:gap-4">
                              <p className="text-[0.96rem] md:text-[1.2rem] leading-tight md:leading-none text-center font-medium max-w-[90%] md:max-w-[340px]" style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}>
                                &ldquo;{songData.memory}&rdquo;
                              </p>
                              <p className="text-[0.825rem] md:text-base text-gray-200 opacity-70" style={{ fontFamily: 'Futura, "Trebuchet MS", Arial, sans-serif' }}>
                                Click to play <span className="font-bold">→</span>
                              </p>
                            </div>
                          </div>
                                                  </>
                      )}
                      {/* Spotlight glow overlay for active tile */}
                      {isActive && (
                        <div
                          className="absolute inset-0 pointer-events-none"
                          style={{
                            background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 70%)',
                          }}
                        />
                      )}
                    </div>

                    {/* Back of tile */}
                    <div
                      className="flip-card-back absolute inset-0 rounded-xl overflow-hidden bg-black"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Desktop only: flip shows iframe */}
                      {songData && isFlipped && !isMobile && (
                        <iframe
                          key={`youtube-${tileIndex}-${songData.youtubeId}`}
                          src={`https://www.youtube.com/embed/${songData.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                          width="100%"
                          height="100%"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="eager"
                          className="absolute inset-0"
                          style={{ borderRadius: '12px' }}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Bottom Bar - All buttons in one row with even spacing */}
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-[60] flex items-center justify-between">
          {/* Share a memory */}
          <button
            onClick={() => setShowPopup(true)}
            className="px-3 py-2 bg-white text-black text-xs font-bold rounded-full hover:bg-black hover:text-white transition-all font-[family-name:var(--font-inter)] jiggle-hover"
            style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.2), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}
          >
            Share a memory
          </button>

          {/* Pagination - center (hidden during intro) */}
          {showFullQuilt && totalPages > 1 && isMobile !== null && !showIntro && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-3 py-2 bg-white text-black text-base font-black rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all font-[family-name:var(--font-inter)]"
                style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.2)' }}
              >
                ←
              </button>
              <span className="text-white text-sm font-[family-name:var(--font-inter)]">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage === totalPages - 1}
                className="px-3 py-2 bg-white text-black text-base font-black rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition-all font-[family-name:var(--font-inter)]"
                style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.2)' }}
              >
                →
              </button>
            </div>
          )}

          {/* Tile View */}
          <button
            onClick={() => {
              const goingToTileView = showFullQuilt;
              if (goingToTileView) {
                setActiveTile(lastActiveTile);
                setCurrentPage(Math.floor(lastActiveTile / tilesPerPage));
                setShowFullQuilt(false);
                setShowMemoryText(false);
                setTimeout(() => setShowMemoryText(true), 100);
              } else {
                setLastActiveTile(activeTile);
                setCurrentPage(Math.floor(activeTile / tilesPerPage));
                setShowFullQuilt(true);
              }
            }}
            className="px-3 py-2 bg-white text-black text-xs font-bold rounded-full hover:bg-black hover:text-white transition-all font-[family-name:var(--font-inter)]"
            style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.2), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}
          >
            {showFullQuilt ? 'Tile View' : 'Grid View'}
          </button>
        </div>

        {/* Desktop Pagination Controls - Bottom Center (hidden during intro) */}
        {showFullQuilt && totalPages > 1 && isMobile !== null && !showIntro && (
          <div className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] items-center gap-4">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-all font-[family-name:var(--font-inter)]"
              style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.2)' }}
            >
              ← Prev
            </button>
            <span className="text-white text-sm font-[family-name:var(--font-inter)]">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="px-4 py-2 bg-white text-black text-sm font-bold rounded-full disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black hover:text-white transition-all font-[family-name:var(--font-inter)]"
              style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.2)' }}
            >
              Next →
            </button>
          </div>
        )}

        {/* Desktop Tile View / Grid View - Bottom Right */}
        <button
          onClick={() => {
            const goingToTileView = showFullQuilt;
            if (goingToTileView) {
              setActiveTile(lastActiveTile);
              setCurrentPage(Math.floor(lastActiveTile / tilesPerPage));
              setShowFullQuilt(false);
              setShowMemoryText(false);
              setTimeout(() => setShowMemoryText(true), isMobile ? 100 : 800);
            } else {
              setLastActiveTile(activeTile);
              setCurrentPage(Math.floor(activeTile / tilesPerPage));
              setShowFullQuilt(true);
            }
          }}
          className="hidden md:block fixed bottom-6 right-6 z-[60] px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-black hover:text-white transition-all font-[family-name:var(--font-inter)]"
          style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.2), inset 0 0 0 0.5px rgba(255,255,255,0.3)' }}
        >
          {showFullQuilt ? 'Tile View' : 'Full Grid View'}
        </button>


        {/* Mobile Video Popup */}
        {mobileVideoPopup && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
            onClick={() => setMobileVideoPopup(null)}
          >
            <div
              className="relative w-[90vw] max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Video title */}
              <p className="text-white text-center mb-3 text-base leading-snug">
                <span className="font-bold">{mobileVideoPopup.title}</span> <span className="text-white/70">by {mobileVideoPopup.artist}</span>
              </p>

              {/* YouTube iframe */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <iframe
                  src={`https://www.youtube.com/embed/${mobileVideoPopup.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0"
                />
              </div>

              {/* Swipe hint */}
              <p className="text-white/50 text-[0.825rem] text-center mt-4">
                Tap outside video to keep exploring
              </p>
            </div>
          </div>
        )}

        {/* Vignette overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.6) 100%)',
          }}
        />
      </main>
    </>
  );
}
