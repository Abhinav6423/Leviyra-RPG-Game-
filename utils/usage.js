export const FREE_TOTAL_LIMIT = 200;
export const FREE_DAILY_LIMIT = 20; // frontend ke saath sync rakho
export const PACK_MESSAGES = 1000; // ek pack me kitne messages milte hain

// Free plan: reset time nikal gaya ho to DB ka purana count ignore karo
export const getEffectiveMessagesToday = (usage) => {
  const resetAt = usage?.messagesResetAt;
  if (resetAt && Date.now() >= new Date(resetAt).getTime()) return 0;
  return usage?.messagesToday || 0;
};

// Pack: bache hue messages
export const getPackMessagesLeft = (usage) => usage?.packMessagesLeft || 0;