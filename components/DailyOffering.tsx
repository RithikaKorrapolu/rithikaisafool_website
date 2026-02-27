"use client";

export default function DailyOffering() {
  return (
    <a
      href="https://www.arthistoryproject.com/kaleidoscope/"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block border-4 border-dashed px-12 py-10 hover:bg-[#561DF1] hover:border-[#561DF1] transition-all group"
      style={{ borderColor: '#561DF1', boxShadow: '0 10px 40px rgba(86, 29, 241, 0.2)' }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.4)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(86, 29, 241, 0.2)'}
    >
      <span className="text-sm uppercase tracking-wider text-[#561DF1] group-hover:text-white mb-3 block" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        Website
      </span>
      <h3 className="text-3xl font-bold text-black group-hover:text-white mb-3" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        The Kaleidoscope
      </h3>
      <p className="text-lg text-black/70 group-hover:text-white/90" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        A hypnotic journey through art history.
      </p>
    </a>
  );
}
