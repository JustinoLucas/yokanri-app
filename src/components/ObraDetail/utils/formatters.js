/**
 * Formats a date string to Brazilian Portuguese locale
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date or 'N/A' if invalid
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
};
