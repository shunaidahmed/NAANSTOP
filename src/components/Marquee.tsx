const WORDS = ["French Tacos", "Burgers", "Loaded Fries", "Shakes", "Grilled Fresh", "Cheese Pull"];

export default function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <div
      className="relative overflow-hidden border-y border-brand/40 bg-brand py-3"
      aria-hidden="true"
    >
      <div className="animate-marquee flex w-max items-center">
        {row.map((word, i) => (
          <span
            key={i}
            className="flex items-center gap-8 pr-8 font-display text-sm tracking-[0.25em] text-white"
          >
            {word.toUpperCase()}
            <span className="text-black">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}