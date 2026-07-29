import React, { Suspense, lazy } from "react";
import { Ghost } from "lucide-react";

// NOTE: adjust this path to wherever MyCharCard actually lives relative
// to this file (it was a sibling of the original Profile.jsx).
const MyCharCard = lazy(() => import("../MyCharCard.jsx"));

const LoadingGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
    {[...Array(8)].map((_, i) => (
      <div
        key={i}
        className="aspect-[4/5] rounded-xl bg-white/[0.02] border border-white/[0.05] animate-pulse"
      />
    ))}
  </div>
);

const EmptyState = ({ characterFilter }) => (
  <div className="flex flex-col items-center justify-center py-14 sm:py-20 bg-white/[0.015] border border-dashed border-white/[0.08] rounded-2xl text-center w-full px-4">
    <Ghost strokeWidth={1.5} className="text-zinc-700 w-10 h-10 sm:w-12 sm:h-12 mb-4" />
    <h3 className="text-white font-medium text-sm sm:text-base mb-2">
      Portfolio Empty
    </h3>
    <p className="text-zinc-500 text-sm mb-6 max-w-md">
      {characterFilter !== "All"
        ? `No characters found matching the '${characterFilter}' filter.`
        : "You haven't created any characters yet. Start building your portfolio now."}
    </p>
  </div>
);

const CharacterGrid = ({
  isLoading,
  characters,
  characterFilter,
  onCharacterDeleted,
}) => {
  if (isLoading) return <LoadingGrid />;
  if (!characters?.length) return <EmptyState characterFilter={characterFilter} />;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
      <Suspense
        fallback={<div className="aspect-[4/5] rounded-xl bg-white/[0.02] animate-pulse" />}
      >
        {characters.map((char) => (
          <MyCharCard key={char._id} char={char} onDelete={onCharacterDeleted} />
        ))}
      </Suspense>
    </div>
  );
};

export default CharacterGrid;