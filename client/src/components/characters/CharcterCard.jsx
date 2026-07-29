import React, { memo } from "react";
import { Link } from "react-router-dom";

const CharacterCard = memo(({ char, idx, style }) => {
    // 🗄️ DATA MAPPING
    const name = char.name || "Unknown";
    const imageUrl = char.images?.[0]?.url;
    const shortDesc = char.shortDescription || "";
    const primaryTag = char.primaryTags?.[0] || "Tag";

    // Strict 3 tags limit
    const secondaryTags = (char.secondaryTags || []).slice(0, 3);

    return (
        <Link
            to={`/character/${char._id}`}
            style={style}
            className="block w-full max-w-[520px] mx-auto bg-[#1e1e1e] rounded-md overflow-hidden border border-[#333] hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
            {/* 🖼️ TOP SECTION: IMAGE */}
            <div className="relative h-[300px] w-full bg-[#111]">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-zinc-600 font-bold uppercase">
                            No Image
                        </span>
                    </div>
                )}

                {/* Main Tag */}
                <div className="absolute top-0 right-0 bg-[#00c875] text-white text-[11px] font-bold px-3 py-1.5 rounded-bl-lg shadow-md uppercase tracking-wide z-10">
                    {primaryTag}
                </div>

                {/* Character Name */}
                <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-sm px-4 py-2.5">
                    <h2 className="text-white text-xl font-bold truncate">
                        {name}
                    </h2>
                </div>
            </div>

            {/* 📝 BOTTOM SECTION */}
            <div className="p-4 flex flex-col gap-3">
                {shortDesc && (
                    <p className="text-zinc-300 text-xs font-medium line-clamp-2 leading-relaxed">
                        {shortDesc}
                    </p>
                )}

                {/* Secondary Tags */}
                {secondaryTags.length > 0 && (
                    <div className="flex gap-2 mt-1">
                        {secondaryTags.map((tag, i) => (
                            <span
                                key={i}
                                className="flex-1 bg-[#00c875] text-black text-[10px] font-bold px-2.5 py-1 rounded-sm text-center uppercase tracking-wide truncate"
                                title={tag}
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