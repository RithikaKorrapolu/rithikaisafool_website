"use client";

import { useEffect, useState } from "react";

const DAILY_OFFERINGS = [
  {
    title: "The Kaleidoscope",
    description: "A hypnotic journey through art history.",
    link: "https://www.arthistoryproject.com/kaleidoscope/",
    category: "Website"
  },
  {
    title: "Internet Sculptures",
    description: "Digital art exploring the boundaries of the web.",
    link: "https://internetsculptures.com/",
    category: "Website"
  },
  {
    title: "MSCHF",
    description: "Art collective making weird, wonderful things.",
    link: "https://mschf.com/",
    category: "Website"
  },
  {
    title: "Appstar",
    description: "A collection of the most beautiful apps.",
    link: "https://www.appstar.world/",
    category: "Website"
  },
  {
    title: "Read Something Wonderful",
    description: "A collection of the best writing on the internet.",
    link: "https://readsomethingwonderful.com/",
    category: "Website"
  },
  {
    title: "It's Nice That",
    description: "Championing creativity across art, illustration, and design.",
    link: "https://www.itsnicethat.com/",
    category: "Website"
  },
  {
    title: "Ask Polly",
    description: "Advice column for the lost, the confused, and the hopeful.",
    link: "https://www.ask-polly.com/",
    category: "Website"
  },
  {
    title: "Radiooooo",
    description: "A musical time machine. Pick a decade, pick a country, listen.",
    link: "https://app.radiooooo.com/",
    category: "Website"
  },
  {
    title: "Window Swap",
    description: "See the view from someone else's window, anywhere in the world.",
    link: "https://www.window-swap.com/",
    category: "Website"
  },
  {
    title: "Pointer Pointer",
    description: "A photo of someone pointing at your cursor. Every time.",
    link: "https://pointerpointer.com/",
    category: "Website"
  },
  {
    title: "The Pudding",
    description: "Visual essays that explain ideas debated in culture.",
    link: "https://pudding.cool/",
    category: "Website"
  },
  {
    title: "Wait But Why",
    description: "Long-form posts about science, society, and the human experience.",
    link: "https://waitbutwhy.com/",
    category: "Website"
  },
  {
    title: "FutureMe",
    description: "Write a letter to your future self. Receive it when the time comes.",
    link: "https://www.futureme.org/",
    category: "Website"
  },
  {
    title: "Neal.fun",
    description: "Delightful internet experiments and interactive experiences.",
    link: "https://neal.fun/",
    category: "Website"
  },
  {
    title: "Every Noise at Once",
    description: "A map of every music genre. Click to explore and listen.",
    link: "https://everynoise.com/",
    category: "Website"
  },
  {
    title: "Staggering Beauty",
    description: "Wiggle the worm. Warning: flashing lights.",
    link: "http://www.staggeringbeauty.com/",
    category: "Website"
  },
  {
    title: "SFPC",
    description: "School for Poetic Computation. Art, code, and critical theory.",
    link: "https://sfpc.study/",
    category: "Website"
  },
];

export default function DailyOffering() {
  const [offering, setOffering] = useState<typeof DAILY_OFFERINGS[0] | null>(null);

  useEffect(() => {
    // Get current time in EST
    const now = new Date();
    const estTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    const startOfYear = new Date(estTime.getFullYear(), 0, 0);
    const diff = estTime.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    setOffering(DAILY_OFFERINGS[dayOfYear % DAILY_OFFERINGS.length]);
  }, []);

  if (!offering) {
    return (
      <div
        className="inline-block border-4 border-dashed p-6"
        style={{ borderColor: '#561DF1', maxWidth: '550px', width: '100%', height: '400px' }}
      />
    );
  }

  const offeringData = offering;

  return (
    <a
      href={offering.link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block border-4 border-dashed p-6 hover:border-[#561DF1] transition-all group"
      style={{ borderColor: '#561DF1', boxShadow: '0 10px 40px rgba(86, 29, 241, 0.2)', maxWidth: '550px', width: '100%' }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.4)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(86, 29, 241, 0.2)'}
    >
      {/* Preview iframe */}
      <div className="w-full h-72 mb-5 overflow-hidden rounded pointer-events-none">
        <iframe
          src={offering.link}
          className="w-full h-full border-0"
          style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
          title={`${offering.title} Preview`}
        />
      </div>
      <span className="text-sm uppercase tracking-wider text-[#561DF1] group-hover:text-[#561DF1] mb-3 block" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        {offering.category}
      </span>
      <h3 className="text-3xl font-bold text-black group-hover:text-black mb-3" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        {offering.title}
      </h3>
      <p className="text-lg text-black/70 group-hover:text-black/70" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        {offering.description}
      </p>
    </a>
  );
}
