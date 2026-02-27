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
    title: "Read Something Wonderful",
    description: "A collection of the best articles, essays, and long-form writing on the internet.",
    link: "https://readsomethingwonderful.com/",
    category: "Website"
  },
  {
    title: "Brain Pickings",
    description: "Maria Popova's labor of love exploring what it means to live a good life.",
    link: "https://www.themarginalian.org/",
    category: "Blog"
  },
  {
    title: "The Pudding",
    description: "Visual essays that explain ideas debated in culture.",
    link: "https://pudding.cool/",
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
      className="inline-block border-4 border-dashed px-8 py-6 hover:bg-[#561DF1] hover:border-[#561DF1] transition-all group"
      style={{ borderColor: '#561DF1', boxShadow: '0 10px 40px rgba(86, 29, 241, 0.2)' }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.4)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(86, 29, 241, 0.2)'}
    >
      <span className="text-xs uppercase tracking-wider text-[#561DF1] group-hover:text-white mb-2 block" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        {offering.category}
      </span>
      <h3 className="text-2xl font-bold text-black group-hover:text-white mb-2" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        {offering.title}
      </h3>
      <p className="text-black/70 group-hover:text-white/90" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        {offering.description}
      </p>
    </a>
  );
}
