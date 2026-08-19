import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-wwc-red-dark via-wwc-black to-wwc-black",
  "from-wwc-grey-800 via-wwc-black to-wwc-red-dark",
  "from-wwc-black via-wwc-grey-900 to-wwc-red-dark",
  "from-wwc-red-dark via-wwc-grey-900 to-wwc-black",
];

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

interface PosterProps {
  seed: string;
  title: string;
  subtitle?: string;
  aspect?: "poster" | "video" | "square";
  className?: string;
  monogram?: boolean;
}

export function Poster({
  seed,
  title,
  subtitle,
  aspect = "poster",
  className,
  monogram = true,
}: PosterProps) {
  const gradient = GRADIENTS[hashSeed(seed) % GRADIENTS.length];
  const aspectClass =
    aspect === "poster" ? "aspect-[2/3]" : aspect === "video" ? "aspect-video" : "aspect-square";

  return (
    <div
      className={cn(
        "relative flex items-end overflow-hidden rounded-sm bg-gradient-to-br",
        gradient,
        aspectClass,
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(0,0,0,0.88)_100%)]" />
      <div className="absolute inset-0 opacity-[0.06] [background-image:repeating-linear-gradient(115deg,#fff_0,#fff_1px,transparent_1px,transparent_14px)]" />
      {monogram && (
        <span className="absolute right-3 top-3 font-display text-lg tracking-wider text-white/20">
          WWC
        </span>
      )}
      <div className="relative z-10 p-3">
        <p className="line-clamp-3 font-display text-base uppercase leading-tight tracking-wide text-white">
          {title}
        </p>
        {subtitle && <p className="mt-1 line-clamp-1 text-xs text-white/70">{subtitle}</p>}
      </div>
    </div>
  );
}
