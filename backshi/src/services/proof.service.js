import { commitments, proofs } from '../store/memoryStore.js';
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
  const { commitmentId, executionLocation, executionTime, evidenceFileHash } = data;

  // 1. Validate Input
  if (!commitmentId || !executionLocation || !executionTime) {
    throw new Error('Missing required fields');
  }

  // 2. Fetch Commitment
  const commitment = commitments.get(commitmentId);
  if (!commitment) {
    throw new Error('Commitment not found');
  }

  // 3. Validate Time Window
  const execTime = new Date(executionTime);
  const startTime = new Date(commitment.timeWindow.start);
  const endTime = new Date(commitment.timeWindow.end);

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
    throw new Error(`Execution location is too far (${Math.round(distance)}m) from committed location`);
  }

  // 5. Generate PoE Hash
  // SHA256(commitmentId + executionTime + executionLocation)
  const poeHash = generatePoEHash({
    commitmentId,
    timestamp: executionTime,
    latitude: executionLocation.lat,
    longitude: executionLocation.lng
  });

 


  // 6. Store Proof Immutably
  const proof = {
    poeHash,
    commitmentId,
    executionLocation,
    executionTime,
    status: 'PROOF_GENERATED',
    createdAt: new Date().toISOString()
  };

  proofs.set(poeHash, Object.freeze(proof));

   // 7. Anchor Proof on Blockchain
   const { txHash } = await storeProofOnChain(commitmentId, poeHash);

   return {
    ...proof,
    blockchainTx: txHash
  };
  
};

export default executeTask;