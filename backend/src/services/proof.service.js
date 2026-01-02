import { db } from '../config/firebase.js';
import { generatePoEHash } from '../utils/crypto.js';
import { getDistanceFromLatLonInMeters } from '../utils/geo.js';
import { storeProofOnChain } from '../blockchain/poeContract.js';



const ALLOWED_RADIUS_METERS = 200; // MVP constraint

/**
 * Validates execution and generates a Proof of Execution
 * @param {object} data
 * @param {string} data.commitmentId
 * @param {object} data.executionLocation { lat, lng }
 * @param {string} data.executionTime
 * @returns {object} Proof data
 */
const executeTask = async (data) => {
  console.log('🔥 executeTask called with:', data);

  const { commitmentId, executionLocation, executionTime } = data;

  // Helper: strict UTC date parser
  const parseUtc = (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
      throw new Error('Invalid date format');
    }
    return d;
  };

  // 1. Validate Input
  if (!commitmentId || !executionLocation || !executionTime) {
    throw new Error('Missing required fields');
  }

  // Enforce ISO UTC time from client
  if (!executionTime.endsWith('Z')) {
    throw new Error('executionTime must be an ISO UTC string (use toISOString())');
  }

  // 2. Fetch Commitment from Firestore
  const commitmentDoc = await db
    .collection('commitments')
    .doc(commitmentId)
    .get();

  if (!commitmentDoc.exists) {
    throw new Error('Commitment not found');
  }

  const commitment = commitmentDoc.data();

  // 3. Validate Time Window (UTC-safe)
  const execTime = parseUtc(executionTime);
  const startTime = parseUtc(commitment.timeWindow.start);
  const endTime = parseUtc(commitment.timeWindow.end);

  console.log('--- TIME DEBUG START ---');
  console.log('Raw executionTime:', executionTime);
  console.log('Parsed execTime (ISO):', execTime.toISOString());
  console.log('Commitment start (raw):', commitment.timeWindow.start);
  console.log('Commitment end (raw):', commitment.timeWindow.end);
  console.log('Parsed startTime (ISO):', startTime.toISOString());
  console.log('Parsed endTime (ISO):', endTime.toISOString());
  console.log('Comparison results:', {
    exec_lt_start: execTime < startTime,
    exec_gt_end: execTime > endTime
  });
  console.log('--- TIME DEBUG END ---');

  if (execTime < startTime || execTime > endTime) {
    throw new Error('Execution time is outside the committed time window');
  }


  // 4. Validate Location
  const distance = getDistanceFromLatLonInMeters(
    commitment.location.lat,
    commitment.location.lng,
    executionLocation.lat,
    executionLocation.lng
  );

  if (distance > ALLOWED_RADIUS_METERS) {
    throw new Error(`Execution location is too far (${Math.round(distance)}m)`);
  }

  // 5. Generate PoE Hash
  const poeHash = generatePoEHash({
    commitmentId,
    timestamp: execTime.toISOString(),
    latitude: executionLocation.lat,
    longitude: executionLocation.lng
  });

  console.log(`[DEBUG] Generated PoE Hash: ${poeHash}`);
  console.log(`[DEBUG] Hash Length: ${poeHash.length}`);


  // 6. Create Proof Object (normalized UTC)
  const proof = {
    poeHash,
    commitmentId,
    executionLocation,
    executionTime: execTime.toISOString(),
    status: 'PROOF_GENERATED',
    createdAt: new Date().toISOString()
  };

  // 7. Store Proof in Firestore
  await db
    .collection('proofs')
    .doc(poeHash)
    .set(proof);

  // 8. Anchor Proof on Blockchain
  const { txHash } = await storeProofOnChain(commitmentId, poeHash);

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