import crypto from 'crypto'

/**
 * Generates a SHA-256 hash of the input data.
 * @param {string|object} data - The data to hash.
 * @returns {string} - The hex string of the hash.
 */
export const generateHash = (data) => {
  const stringData = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(stringData).digest('hex');
};

/**
 * Generates a deterministic Proof of Execution hash.
 * Structure: SHA256(commitmentId + timestamp + latitude + longitude + evidenceUrl)
 * @param {object} params
 * @param {string} params.commitmentId
 * @param {string} params.timestamp
 * @param {number} params.latitude
 * @param {number} params.longitude
 * @param {string} params.evidenceUrl
 * @returns {string}
 */
export const generatePoEHash = ({ commitmentId, timestamp, latitude, longitude, evidenceUrl }) => {
  // Ensure deterministic order and types
  const payload = `${commitmentId}:${timestamp}:${latitude}:${longitude}:${evidenceUrl}`;
  return generateHash(payload);
};

