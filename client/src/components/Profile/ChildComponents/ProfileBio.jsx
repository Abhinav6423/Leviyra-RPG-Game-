import React from "react";
import { Quote } from "lucide-react";
import { renderFormattedBio } from "../logic/bioFormatter.jsx";

const ProfileBio = ({ bio, accent }) => (
  <div className="w-full">
    <div className={`relative p-5 sm:p-8 rounded-2xl ${accent.bioBox}`}>
      <Quote
        size={44}
        className="absolute -bottom-2 -right-2 text-white/[0.03] -rotate-12"
      />
      <h3 className="text-[10px] sm:text-xs font-medium text-zinc-500 mb-3 uppercase tracking-widest">
        Biography
      </h3>
      <div className="max-w-3xl text-sm sm:text-base leading-relaxed text-zinc-300 relative z-10">
        {bio ? (
          renderFormattedBio(bio)
        ) : (
          <span className="italic text-zinc-600">
            No bio yet. Click "Edit Profile" to add one.
          </span>
        )}
      </div>
    </div>
  </div>
);

export default ProfileBio;