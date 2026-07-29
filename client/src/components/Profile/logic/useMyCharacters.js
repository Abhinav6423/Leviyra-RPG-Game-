import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyCharacters } from "../../../api-calls/getMyCharacters.js";

// Owns: the active portfolio filter tab and the react-query-backed list
// of the current user's characters for that filter.
export const useMyCharacters = () => {
  const [characterFilter, setCharacterFilter] = useState("All");

  const {
    data: queryResponse,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-characters", characterFilter],
    queryFn: () => getMyCharacters(characterFilter),
    staleTime: 1000 * 60 * 5,
  });

  const characters = queryResponse?.data || [];

  const handleCharacterDeleted = useCallback(() => refetch(), [refetch]);

  return {
    characterFilter,
    setCharacterFilter,
    characters,
    isLoading,
    handleCharacterDeleted,
  };
};