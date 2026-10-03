import React from "react";
import { Quote } from "lucide-react";
import { renderFormattedBio } from "../logic/bioFormatter.jsx";

const ProfileBio = ({ bio, accent }) => (
  <div className="w-full">
    {/* Compact when empty; grows naturally with the bio (min-h-0 overrides any min-height from accent.bioBox) */}
    <div
      className={`relative rounded-2xl !min-h-0 h-auto ${bio ? "p-5 sm:p-8" : "p-4 sm:p-5"} ${accent.bioBox}`}
    >
      <Quote
        size={44}
        className="absolute -bottom-2 -right-2 text-white/[0.03] -rotate-12"
      />
      <h3 className="text-[10px] sm:text-xs font-medium text-zinc-400 mb-2 uppercase tracking-widest">
        Biography
      </h3>
      <div className="max-w-3xl text-sm sm:text-base leading-relaxed text-zinc-300 relative z-10">
        {bio ? (
          renderFormattedBio(bio)
        ) : (
          <span className="italic text-zinc-500">
            No bio yet. Click "Edit Profile" to add one.
          </span>
        )}
      </div>
    </div>
  </div>
);

export default ProfileBio;
