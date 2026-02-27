"use client";

import Image from "next/image";

export default function DailyOffering() {
  return (
    <a
      href="https://www.arthistoryproject.com/kaleidoscope/"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block border-4 border-dashed p-6 hover:border-[#561DF1] transition-all group"
      style={{ borderColor: '#561DF1', boxShadow: '0 10px 40px rgba(86, 29, 241, 0.2)', maxWidth: '400px' }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.4)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(86, 29, 241, 0.2)'}
    >
      {/* Thumbnail */}
      <div className="w-full h-48 mb-4 overflow-hidden rounded bg-gray-100">
        <img
          src="https://image.thum.io/get/width/800/crop/600/https://www.arthistoryproject.com/kaleidoscope/"
          alt="The Kaleidoscope Preview"
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-sm uppercase tracking-wider text-[#561DF1] group-hover:text-[#561DF1] mb-3 block" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        Website
      </span>
      <h3 className="text-2xl font-bold text-black group-hover:text-black mb-2" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        The Kaleidoscope
      </h3>
      <p className="text-base text-black/70 group-hover:text-black/70" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        A hypnotic journey through art history.
      </p>
    </a>
  );
}
