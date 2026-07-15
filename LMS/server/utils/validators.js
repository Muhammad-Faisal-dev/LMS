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

  // Gmail validation regex
  // Format: username@gmail.com
  // - Username can contain letters (a-z, A-Z), numbers (0-9), periods (.), underscores (_), and plusses (+)
  // - Username must start with a letter or number
  // - Multiple consecutive periods are not allowed
  // - Must end with @gmail.com (case insensitive)
  const gmailRegex = /^[a-zA-Z0-9][a-zA-Z0-9.+_-]+@gmail\.com$/i;

  // Basic validation
  if (!gmailRegex.test(email)) return false;

  // Additional specific Gmail validations
  const username = email.split("@")[0];

  // Cannot have consecutive dots
  if (username.includes("..")) return false;

  // Maximum length for Gmail username is 64 characters
  if (username.length > 64) return false;

  // Gmail usernames are case-insensitive
  // And dots don't matter in Gmail usernames (e.g., john.doe@gmail.com is same as johndoe@gmail.com)

  return true;
};

/**
 * Gets a normalized form of a Gmail address
 * @param {string} email - The Gmail address to normalize
 * @returns {string|null} - Normalized Gmail address or null if invalid
 */
exports.normalizeGmailAddress = (email) => {
  if (!exports.isValidGmailAddress(email)) return null;

  // Gmail addresses are case-insensitive
  const normalizedEmail = email.toLowerCase();

  // For Gmail, dots in the username part don't matter
  const [username, domain] = normalizedEmail.split("@");
  const usernameWithoutDots = username.replace(/\./g, "");

  // Return the normalized version
  return `${usernameWithoutDots}@${domain}`;
};
