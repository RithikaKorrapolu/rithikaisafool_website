"use client";

export default function DailyOffering() {
  return (
    <a
      href="https://www.arthistoryproject.com/kaleidoscope/"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block border-4 border-dashed p-4 hover:border-[#561DF1] transition-all group"
      style={{ borderColor: '#561DF1', boxShadow: '0 10px 40px rgba(86, 29, 241, 0.2)', maxWidth: '400px' }}
      onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.4)'}
      onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 10px 40px rgba(86, 29, 241, 0.2)'}
    >
      {/* Preview iframe */}
      <div className="w-full h-48 mb-4 overflow-hidden rounded pointer-events-none">
        <iframe
          src="https://www.arthistoryproject.com/kaleidoscope/"
          className="w-full h-full border-0"
          style={{ transform: 'scale(0.5)', transformOrigin: 'top left', width: '200%', height: '200%' }}
          title="The Kaleidoscope Preview"
        />
      </div>
      <span className="text-xs uppercase tracking-wider text-[#561DF1] group-hover:text-[#561DF1] mb-2 block" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        Website
      </span>
      <h3 className="text-xl font-bold text-black group-hover:text-black mb-2" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        The Kaleidoscope
      </h3>
      <p className="text-black/70 group-hover:text-black/70 text-sm" style={{ fontFamily: 'Anek Bangla, sans-serif' }}>
        A hypnotic journey through art history.
      </p>
    </a>
  );
}
