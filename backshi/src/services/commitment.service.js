import { commitments } from '../store/memoryStore.js';
import crypto from 'crypto'

/**
 * Creates a new task commitment
 * @param {object} data
 * @param {string} data.taskName
 * @param {object} data.location { lat, lng }
 * @param {object} data.timeWindow { start, end }
 * @returns {object} Created commitment
 */
export const createCommitment = (data) => {
  const { taskName, location, timeWindow } = data;

  // 1. Basic Validation
  if (!taskName || !location || !timeWindow) {
    throw new Error('Missing required fields: taskName, location, timeWindow');
  }

  if (new Date(timeWindow.start) >= new Date(timeWindow.end)) {
    throw new Error('Invalid timeWindow: start must be before end');
  }

  // 2. Generate ID
  const commitmentId = `COMMIT-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  // 3. Create Commitment Object
  const commitment = {
    commitmentId,
    taskName,
    location,
    timeWindow,
    status: 'COMMITTED',
    createdAt: new Date().toISOString()
  };

  // 4. Store Immutably (in memory)
  commitments.set(commitmentId, Object.freeze(commitment));

  return commitment;
};

/**
 * Retrieves a commitment by ID
 * @param {string} commitmentId 
 * @returns {object|null}
 */
export const getCommitment = (commitmentId) => {
  return commitments.get(commitmentId) || null;
};


