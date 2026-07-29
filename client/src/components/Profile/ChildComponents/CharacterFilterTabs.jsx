import React from "react";

const CharacterFilterTabs = ({ tabs, activeFilter, onChange }) => (
  <div className="flex p-1 bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-x-auto w-full sm:w-auto snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
    {tabs.map((tab) => {
      const isActive = activeFilter === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg text-[13px] font-medium transition-all duration-200 snap-center whitespace-nowrap shrink-0
            ${isActive ? "bg-white/[0.08] text-white" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          <tab.icon size={14} strokeWidth={2} />
          <span>{tab.label}</span>
        </button>
      );
    })}
  </div>
);

export default CharacterFilterTabs;