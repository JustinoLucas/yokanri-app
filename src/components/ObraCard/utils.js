/**
 * Check if an obra has any links
 * @param {Object} obra - The obra object
 * @returns {boolean} True if the obra has links
 */
export const hasLink = (obra) => {
  return Array.isArray(obra.links) && obra.links.length > 0;
};

/**
 * Get the principal link from an obra
 * @param {Object} obra - The obra object
 * @returns {string|null} The principal link URL or null
 */
export const getPrincipalLink = (obra) => {
  if (Array.isArray(obra.links) && obra.links.length > 0) {
    const principalLink = obra.links.find(l => l.principal) || obra.links[0];
    return principalLink.url;
  }
  return null;
};

/**
 * Calculate progress percentage
 * @param {number} current - Current chapter
 * @param {number} total - Total chapters
 * @returns {number} Progress percentage (0-100)
 */
export const calculateProgress = (current, total) => {
  if (!total || total <= 0) return 0;
  return Math.round((current / total) * 100);
};

/**
 * Normalize rating from 0-10 to 0-5 scale
 * @param {number} rating - The rating to normalize
 * @returns {number} Normalized rating (0-5)
 */
export const normalizeRating = (rating) => {
  if (!rating || rating === 0) return 0;
  return rating > 5 ? rating / 2 : rating;
};
