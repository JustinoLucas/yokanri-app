/**
 * Validation utilities for ObraForm
 * These functions complement the validateObra from types/obra
 */

/**
 * Validates if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean} - True if valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates if a file is a valid image
 * @param {File} file - File to validate
 * @returns {boolean} - True if valid image
 */
export const isValidImageFile = (file) => {
  return file && file.type.startsWith('image/');
};

/**
 * Validates an array of files for images
 * @param {FileList|Array} files - Files to validate
 * @returns {Object} - { valid: File[], invalid: File[] }
 */
export const validateImageFiles = (files) => {
  const fileArray = Array.from(files);
  const valid = fileArray.filter(isValidImageFile);
  const invalid = fileArray.filter(file => !isValidImageFile(file));

  return { valid, invalid };
};

/**
 * Validates year range
 * @param {number} year - Year to validate
 * @returns {boolean} - True if valid
 */
export const isValidYear = (year) => {
  if (!year) return true; // Optional field
  const currentYear = new Date().getFullYear();
  return year >= 1900 && year <= currentYear + 1;
};

/**
 * Validates rating value (0-5)
 * @param {number} rating - Rating to validate
 * @returns {boolean} - True if valid
 */
export const isValidRating = (rating) => {
  return rating >= 0 && rating <= 5;
};

/**
 * Validates chapter number
 * @param {number} chapter - Chapter to validate
 * @returns {boolean} - True if valid
 */
export const isValidChapter = (chapter) => {
  return chapter >= 0;
};

/**
 * Validates day of month (1-31)
 * @param {number} day - Day to validate
 * @returns {boolean} - True if valid
 */
export const isValidDayOfMonth = (day) => {
  return day >= 1 && day <= 31;
};

/**
 * Validates interval weeks (2-4)
 * @param {number} weeks - Weeks to validate
 * @returns {boolean} - True if valid
 */
export const isValidIntervalWeeks = (weeks) => {
  return weeks >= 2 && weeks <= 4;
};
