// Normalizes whatever shape the follow-system API returns into a flat
// array of users, regardless of which key the backend nested it under.
export const extractUserList = (res) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return (
    res.data || res.followers || res.following || res.results || res.users || []
  );
};


export const extractTotalCount = (res, fallbackList) => {
  if (!res) return fallbackList?.length || 0;
  return res.total ?? res.count ?? res.totalCount ?? fallbackList?.length ?? 0;
};