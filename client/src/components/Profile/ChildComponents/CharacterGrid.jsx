import React, { Suspense, lazy } from "react";
import { Ghost } from "lucide-react";

const MyCharCard = lazy(() => import("../MyCharCard.jsx"));

// Auto-fill: as many columns as fit (min 150px on phones, 200px from sm up),
// cards stretch evenly to fill the row. Same look for loading + real cards.
const GRID =
  "grid w-full min-w-0 gap-4 sm:gap-6 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]";

// Strict ratio so no card can stretch or break the grid, whatever its image size.
const CARD_RATIO = "aspect-[4/5]";

const Skeleton = () => (
  <div
    className={`${CARD_RATIO} rounded-xl bg-white/[0.03] border border-white/[0.05] animate-pulse`}
  />
);

const LoadingGrid = () => (
  <div className={GRID}>
    {[...Array(8)].map((_, i) => (
      <Skeleton key={i} />
    ))}
  </div>
);

const EmptyState = ({ characterFilter }) => (
  <div className="flex flex-col items-center justify-center py-14 sm:py-20 bg-white/[0.015] border border-dashed border-white/[0.08] rounded-2xl text-center w-full px-4">
    <Ghost
      strokeWidth={1.5}
      className="text-zinc-700 w-10 h-10 sm:w-12 sm:h-12 mb-4"
    />
    <h3 className="text-white font-medium text-sm sm:text-base mb-2">
      Portfolio Empty
    </h3>
    <p className="text-zinc-500 text-sm max-w-md">
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
  if (!characters?.length)
    return <EmptyState characterFilter={characterFilter} />;

  return (
    <div className={GRID}>
      <Suspense fallback={<Skeleton />}>
        {characters.map((char) => (
          // Wrapper fixes the ratio; [&>*]:h-full makes the card fill it.
          <div
            key={char._id}
            className={`${CARD_RATIO} min-w-0 [&>*]:h-full [&>*]:w-full`}
          >
            <MyCharCard char={char} onDelete={onCharacterDeleted} />
          </div>
        ))}
      </Suspense>
    </div>
  );
};

export default CharacterGrid;
