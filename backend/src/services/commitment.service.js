import crypto from 'crypto';
import { db } from '../config/firebase.js';
import { logCommitmentCreated } from './analytics.service.js';
/**
 * Creates a new task commitment
 * @param {object} data
 * @param {string} data.taskName
 * @param {object} data.location { lat, lng }
 * @param {object} data.timeWindow { start, end }
 * @returns {object} Created commitment
 */
export const createCommitment = async (data) => {
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
    createdAt: new Date().toISOString(),
  };

  // 4. Store in Firestore (persistent)
  await db
    .collection('commitments')
    .doc(commitmentId)
    .set(commitment);

  // bigquery analytics
  logCommitmentCreated({
    commitmentId,
    taskName,
    lat: location.lat,
    lng: location.lng,
    startTime: timeWindow.start,
    endTime: timeWindow.end,
    createdAt: commitment.createdAt,
  });

  return commitment;
};

/**
 * Retrieves a commitment by ID
 * @param {string} commitmentId
 * @returns {object|null}
 */
export const getCommitment = async (commitmentId) => {
  const doc = await db
    .collection('commitments')
    .doc(commitmentId)
    .get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
};

/**
 * Retrieves all commitments
 * @returns {Array} Array of all commitments
 */
export const getAllCommitments = async () => {
  const snapshot = await db
    .collection('commitments')
    .get();

  return snapshot.docs.map(doc => doc.data());
};
