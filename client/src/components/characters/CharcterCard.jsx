import React, { memo, useState } from "react";
import { Link } from "react-router-dom";
import { Flame } from "lucide-react";

const formatCount = (n) => {
  if (!n) return null;
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`;
  return `${n}`;
};

const CharacterCard = memo(({ char, style }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const name = char.name || "Unknown";
  const imageUrl = char.images?.[0]?.url;
  const shortDesc = char.shortDescription || "";
  const primaryTag = char.primaryTags?.[0] || "Tag";
  const tags = (char.secondaryTags || []).slice(0, 2);
  const plays = formatCount(char.messageCount);
  const showImage = imageUrl && !errored;

  return (
    <Link
      to={`/character/${char._id}`}
      style={style}
      className="group flex flex-col h-full w-full max-w-[520px] mx-auto bg-[#1a1a1a] rounded-2xl overflow-hidden border border-[#2a2a2a] hover:border-[#00c875]/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-[#00c875]/10 transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative h-[300px] w-full bg-[#111] overflow-hidden">
        {showImage ? (
          <>
            {!loaded && (
              <div className="absolute inset-0 bg-zinc-800/50 animate-pulse" />
            )}
            <img
              src={imageUrl}
              alt={name}
              loading="lazy"
              decoding="async"
              onLoad={() => setLoaded(true)}
              onError={() => setErrored(true)}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                loaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#111]">
            <span className="text-zinc-600 font-bold uppercase text-xs tracking-wider">
              No Image
            </span>
          </div>
        )}

        {/* Primary Tag */}
        <div className="absolute top-0 right-0 bg-[#00c875] text-black text-[11px] font-bold px-3.5 py-1.5 rounded-bl-xl uppercase tracking-wide z-10">
          {primaryTag}
        </div>

        {/* Name + Plays Overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-4 pt-10 pb-3 flex items-end justify-between gap-3">
          <h2 className="text-white text-lg sm:text-xl font-bold truncate leading-tight">
            {name}
          </h2>

          {plays && (
            <div className="shrink-0 flex items-center gap-1 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full border border-white/10">
              <Flame className="w-3.5 h-3.5 text-[#ffb648] fill-[#ffb648]" />
              <span className="text-[11px] font-bold text-[#ffb648]">
                {plays}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {shortDesc && (
          <p className="text-zinc-400 text-[13px] leading-relaxed line-clamp-2">
            {shortDesc}
          </p>
        )}

        {tags.length > 0 && (
          <div className="mt-auto flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="bg-white/[0.04] text-zinc-400 border border-white/10 text-[10px] font-medium px-2.5 py-1 rounded-md uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
});

export default CharacterCard;
