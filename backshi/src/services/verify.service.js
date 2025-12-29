const { commitments, proofs } = require('../store/memoryStore');
const { generatePoEHash } = require('../utils/crypto');
const { getDistanceFromLatLonInMeters } = require('../utils/geo');

const ALLOWED_RADIUS_METERS = 200;

/**
 * Verifies a Proof of Execution
 * @param {string} poeHash 
 * @returns {object} Verification result
 */
const verifyProof = (poeHash) => {
  // 1. Validate Input
  if (!poeHash) {
    throw new Error('Missing poeHash parameter');
  }

  // 2. Fetch Proof
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

  // 4. Recompute Hash
  const recomputedHash = generatePoEHash({
    commitmentId: proof.commitmentId,
    timestamp: proof.executionTime,
    latitude: proof.executionLocation.lat,
    longitude: proof.executionLocation.lng
  });

  const hashMatch = recomputedHash === poeHash;

  // 5. Validate Time
  const execTime = new Date(proof.executionTime);
  const startTime = new Date(commitment.timeWindow.start);
  const endTime = new Date(commitment.timeWindow.end);
  const timeValid = execTime >= startTime && execTime <= endTime;

  // 6. Validate Location
  const distance = getDistanceFromLatLonInMeters(
    commitment.location.lat,
    commitment.location.lng,
    proof.executionLocation.lat,
    proof.executionLocation.lng
  );
  const locationValid = distance <= ALLOWED_RADIUS_METERS;

  // 7. Final Decision
  const isValid = hashMatch && timeValid && locationValid;

  if (!isValid) {
    return {
      valid: false,
      reason: 'Verification failed',
      checks: {
        hashMatch,
        time: timeValid,
        location: locationValid
      }
    };
  }

  return {
    valid: true,
    checks: {
      hashMatch,
      time: timeValid,
      location: locationValid
    }
  };
};

module.exports = {
  verifyProof
};
