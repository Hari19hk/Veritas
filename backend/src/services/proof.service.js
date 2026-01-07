import { db, storage } from '../config/firebase.js';
import crypto from 'crypto';
import { generatePoEHash } from '../utils/crypto.js';
import { getDistanceFromLatLonInMeters } from '../utils/geo.js';
import { storeProofOnChain } from '../blockchain/poeContract.js';
import { analyzeEvidenceImage } from './vision.service.js';
import { logExecutionEvent, logAISignals } from './analytics.service.js';
const bucket = storage.bucket(); // Uses default bucket from config

const ALLOWED_RADIUS_METERS = 200; // MVP constraint

/**
 * Validates execution and generates a Proof of Execution
 * @param {object} data
 * @param {string} data.commitmentId
 * @param {object} data.executionLocation { lat, lng }
 * @param {string} data.executionTime
 * @returns {object} Proof data
 */

const isEvidenceAcceptable = (visionResult) => {
  if (!visionResult) return false;

  const { labels, safeSearch } = visionResult;

  // Blank / meaningless image
  if (!labels || labels.length === 0) {
    return false;
  }

  // Unsafe content
  if (
    safeSearch.adult === 'VERY_LIKELY' ||
    safeSearch.violence === 'VERY_LIKELY'
  ) {
    return false;
  }

  return true;
};


const executeTask = async (data) => {
  console.log('🔥 executeTask called');

  const {
    commitmentId,
    executionLocation,
    executionTime,
    evidenceFile
  } = data;

  /* ----------------------------- helpers ----------------------------- */
  const parseUtc = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      throw new Error('Invalid date format');
    }
    return d;
  };

  /* -------------------------- 1. validation -------------------------- */
  if (!commitmentId || !executionLocation || !executionTime || !evidenceFile) {
    throw new Error('Missing required fields');
  }

  if (!executionTime.endsWith('Z')) {
    throw new Error('executionTime must be ISO UTC (use toISOString())');
  }

  /* -------------------- 2. fetch commitment --------------------------- */
  const commitmentDoc = await db
    .collection('commitments')
    .doc(commitmentId)
    .get();

  if (!commitmentDoc.exists) {
    throw new Error('Commitment not found');
  }

  const commitment = commitmentDoc.data();

  /* ------------------- 3. validate time window ------------------------ */
  const execTime = parseUtc(executionTime);
  const startTime = parseUtc(commitment.timeWindow.start);
  const endTime = parseUtc(commitment.timeWindow.end);

  if (execTime < startTime || execTime > endTime) {
    throw new Error('Execution time is outside the committed time window');
  }

  /* ------------------- 4. validate location --------------------------- */
  const distance = getDistanceFromLatLonInMeters(
    commitment.location.lat,
    commitment.location.lng,
    executionLocation.lat,
    executionLocation.lng
  );
  
  // Use radius from commitment, or configured default
  const allowedRadius = commitment.location.radius || ALLOWED_RADIUS_METERS;

  console.log(`[PROOF] Distance: ${distance}m, Allowed: ${allowedRadius}m`);

  if (distance > allowedRadius) {
    throw new Error(
      `Execution location too far (${Math.round(distance)}m). Max allowed: ${allowedRadius}m`
    );
  }

  /* ------------------- 5. upload evidence ----------------------------- */
  const evidenceHash = crypto
    .createHash('sha256')
    .update(evidenceFile.buffer)
    .digest('hex');

  const evidencePath = `evidences/${commitmentId}/${Date.now()}_${evidenceHash}`;
  const file = bucket.file(evidencePath);

  await file.save(evidenceFile.buffer, {
    metadata: {
      contentType: evidenceFile.mimetype
    }
  });

  const [fileUrl] = await file.getSignedUrl({
    action: 'read',
    expires: '03-01-2030'
  });

  /* ------------------- 6. AI verification (Vision API) ---------------- */
  const visionResult = await analyzeEvidenceImage(evidenceFile.buffer);
  const evidenceValid = isEvidenceAcceptable(visionResult);

  console.log(
    '[VISION] Evidence valid:',
    evidenceValid,
    'Verdict:',
    visionResult.verdict
  );


  /* ------------------- 7. generate PoE hash --------------------------- */
  const poeHash = generatePoEHash({
    commitmentId,
    timestamp: execTime.toISOString(),
    latitude: executionLocation.lat,
    longitude: executionLocation.lng,
    evidenceHash
  });

  /* ------------------- 8. create proof object ------------------------- */
  const proof = {
    poeHash,
    commitmentId,
    executionLocation,
    executionTime: execTime.toISOString(),
    evidence: {
      hash: evidenceHash,
      url: fileUrl,
      path: evidencePath,
      mimeType: evidenceFile.mimetype
    },
    aiVerification: {
      vision: visionResult,
      checkedAt: new Date().toISOString()
    },
    status: evidenceValid ? 'PROOF_GENERATED' : 'PROOF_SUSPICIOUS',
    createdAt: new Date().toISOString()
  };
  
  /* ------------------- 9. store proof metadata ------------------------ */
  await db.collection('proofs').doc(poeHash).set(proof);

  await db.collection('evidences').doc(evidenceHash).set({
    commitmentId,
    poeHash,
    fileUrl,
    filePath: evidencePath,
    aiVerdict: visionResult.verdict,
    uploadedAt: new Date().toISOString()
  });

  // BigQuery analytics
  logExecutionEvent({
    poeHash,
    commitmentId,
    executedAt: execTime.toISOString(),
    locationDistanceMeters: Math.round(distance),
    locationValid,
    timeValid,
    evidenceHash
  });

  // AI analytics
  logAISignals({
    poeHash,
    visionVerdict: visionResult.verdict,
    evidenceValid,
    labelCount: visionResult.labels?.length || 0,
    dominantColorScore:
      visionResult.imageProperties?.dominantColors?.[0]?.score || 0,
    hasText: Boolean(visionResult.extractedText),
    safeAdult: visionResult.safeSearch?.adult,
    safeViolence: visionResult.safeSearch?.violence,
    checkedAt: new Date().toISOString()
  });

  /* ------------------- 10. anchor on blockchain ----------------------- */
  const { txHash } = await storeProofOnChain(commitmentId, poeHash);

  /* ------------------- 11. return result ------------------------------ */
  return {
    ...proof,
    blockchainTx: txHash
  };
};



export const getProofByHash = async (poeHash) => {
  const doc = await db
    .collection('proofs')
    .doc(poeHash)
    .get();

  if (!doc.exists) {
    return null;
  }

  return doc.data();
};

export const getAllProofs = async () => {
  const snapshot = await db
    .collection('proofs')
    .get();

  return snapshot.docs.map(doc => doc.data());
};

export default executeTask;