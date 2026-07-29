

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const getWordCount = (text) => {
    return text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
};