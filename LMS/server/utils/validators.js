/**
 * Email validation utility functions
 */

/**
 * Validates if an email is a correctly formatted Gmail address
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid Gmail address, false otherwise
 */
exports.isValidGmailAddress = (email) => {
  if (!email) return false;

  const gmailRegex = /^[a-zA-Z0-9][a-zA-Z0-9.+_-]+@gmail\.com$/i;

  if (!gmailRegex.test(email)) return false;

  const username = email.split("@")[0];

  if (username.includes("..")) return false;
  if (username.length > 64) return false;

  return true;
};

/**
 * Normalizes a Gmail address for app-level uniqueness and lookup.
 * We only lowercase + trim it.
 */
exports.normalizeGmailAddress = (email) => {
  if (!exports.isValidGmailAddress(email)) return null;
  return email.trim().toLowerCase();
};
