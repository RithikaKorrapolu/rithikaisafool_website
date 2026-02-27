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
    title: "Internet Sculptures",
    description: "Digital art exploring the boundaries of the web.",
    link: "https://internetsculptures.com/",
    category: "Website"
  },
];

export default function DailyOffering() {
  const [offering, setOffering] = useState<typeof DAILY_OFFERINGS[0] | null>(null);

  useEffect(() => {
    // Calculate day of year to rotate daily
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const offeringIndex = dayOfYear % DAILY_OFFERINGS.length;
    setOffering(DAILY_OFFERINGS[offeringIndex]);
  }, []);

  if (!offering) return null;

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
