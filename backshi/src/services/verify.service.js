import { commitments, proofs } from '../store/memoryStore.js';
import { generatePoEHash } from '../utils/crypto.js';
import { getDistanceFromLatLonInMeters } from '../utils/geo.js';
import { getProofFromChain } from '../blockchain/poeContract.js';


const ALLOWED_RADIUS_METERS = 200;

/**
 * Verifies a Proof of Execution
 * @param {string} poeHash
 * @returns {object} Verification result
 */
const verifyProof = async (poeHash) => {
  // 1. Validate Input
  if (!poeHash) {
    throw new Error('Missing poeHash parameter');
  }

  // 2. Fetch Proof (off-chain)
  const proof = proofs.get(poeHash);
  if (!proof) {
    return {
      valid: false,
      reason: 'Proof not found'
    };
  }

  // 3. Fetch Commitment
  const commitment = commitments.get(proof.commitmentId);
  if (!commitment) {
    return {
      valid: false,
      reason: 'Associated commitment not found'
    };
  }

  // 4. Recompute PoE hash from stored data
  const recomputedHash = generatePoEHash({
    commitmentId: proof.commitmentId,
    timestamp: proof.executionTime,
    latitude: proof.executionLocation.lat,
    longitude: proof.executionLocation.lng,
    evidenceUrl: proof.evidenceFileHash
  });

  const hashMatch = recomputedHash === poeHash;

  // 5. Fetch on-chain hash
  let onChainHash;
  try {
    const chainProof = await getProofFromChain(proof.commitmentId);
    onChainHash = chainProof.poeHash;
  } catch (err) {
    return {
      valid: false,
      reason: 'Proof not anchored on blockchain'
    };
  }

  const onChainMatch = recomputedHash === onChainHash;

  // 6. Validate Time
  const execTime = new Date(proof.executionTime);
  const startTime = new Date(commitment.timeWindow.start);
  const endTime = new Date(commitment.timeWindow.end);
  const timeValid = execTime >= startTime && execTime <= endTime;

  // 7. Validate Location
  const distance = getDistanceFromLatLonInMeters(
    commitment.location.lat,
    commitment.location.lng,
    proof.executionLocation.lat,
    proof.executionLocation.lng
  );
  const locationValid = distance <= ALLOWED_RADIUS_METERS;

  // 8. Final Decision (ALL checks must pass)
  const isValid =
    hashMatch &&
    onChainMatch &&
    timeValid &&
    locationValid;

  if (!isValid) {
    return {
      valid: false,
      reason: 'Verification failed',
      checks: {
        hashMatch,
        onChainMatch,
        time: timeValid,
        location: locationValid
      }
    };
  }

  return {
    valid: true,
    checks: {
      hashMatch,
      onChainMatch,
      time: timeValid,
      location: locationValid
    }
  };
};


export default verifyProof;