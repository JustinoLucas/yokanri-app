/**
 * Data processing utilities for ObraForm
 * Handles formatting and data transformation
 */

/**
 * Formats a date for input[type="date"]
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted date (YYYY-MM-DD)
 */
export const formatDateForInput = (date) => {
  if (!date) return '';

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Converts date input value to ISO string
 * Creates date at local noon to avoid timezone issues
 * @param {string} value - Date input value (YYYY-MM-DD)
 * @returns {string|null} - ISO string or null
 */
export const dateInputToISO = (value) => {
  if (!value) return null;

  const [year, month, day] = value.split('-');
  const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
  return localDate.toISOString();
};

/**
 * Filters and validates links (removes empty ones)
 * @param {Array} links - Array of links
 * @returns {Array} - Filtered links
 */
export const filterValidLinks = (links) => {
  return links.filter(link => link.nome && link.url);
};

/**
 * Generates a unique filename for cover image
 * @param {string} obraId - Obra ID
 * @param {string} originalName - Original file name
 * @param {number} index - Index if multiple files
 * @returns {string} - Generated filename
 */
export const generateCoverFileName = (obraId, originalName, index = 0) => {
  const extension = originalName.split('.').pop();
  const timestamp = Date.now();
  return `${obraId}_${timestamp}_${index}.${extension}`;
};

/**
 * Sanitizes form data before submission
 * Removes empty/invalid values
 * @param {Object} data - Form data
 * @returns {Object} - Sanitized data
 */
export const sanitizeFormData = (data) => {
  const sanitized = { ...data };

  // Remove empty strings for optional number fields
  if (sanitized.anoLancamento === '') sanitized.anoLancamento = null;

  // Ensure arrays exist
  if (!Array.isArray(sanitized.generos)) sanitized.generos = [];
  if (!Array.isArray(sanitized.diasLancamento)) sanitized.diasLancamento = [];
  if (!Array.isArray(sanitized.links)) sanitized.links = [];
  if (!Array.isArray(sanitized.capas)) sanitized.capas = [];

  return sanitized;
};

/**
 * Calculates file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
