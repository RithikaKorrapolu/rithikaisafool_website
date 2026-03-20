interface ScrollingMarqueeProps {
  text: string;
}

export function ScrollingMarquee({ text }: ScrollingMarqueeProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white py-3 overflow-hidden z-40" style={{ boxShadow: '0px 4px 34px 0px rgba(0, 0, 0, 0.25)' }}>
      <div className="flex animate-marquee-seamless" style={{ letterSpacing: '-0.06em' }}>
        <div className="flex whitespace-nowrap">
          {Array(20).fill(0).map((_, i) => (
            <span key={i} className="text-base md:text-xl font-normal italic text-black font-[family-name:var(--font-inter)]">
              {text}&nbsp;
            </span>
          ))}
        </div>
        <div className="flex whitespace-nowrap" aria-hidden="true">
          {Array(20).fill(0).map((_, i) => (
            <span key={i} className="text-base md:text-xl font-normal italic text-black font-[family-name:var(--font-inter)]">
              {text}&nbsp;
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
