import { db } from '../config/firebase.js';
import { generatePoEHash } from '../utils/crypto.js';
import { getDistanceFromLatLonInMeters } from '../utils/geo.js';
import { getProofFromChain } from '../blockchain/poeContract.js';
import { generateVerificationExplanation } from './gemini.service.js';
import { logVerificationResult } from './analytics.service.js';

const ALLOWED_RADIUS_METERS = 200;

// Helper: strict UTC date parser
const parseUtc = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid date format');
  }
  return d;
};

/**
 * Verifies a Proof of Execution
 * @param {string} poeHash
 * @returns {object} Verification result
 */
const verifyProof = async (poeHash) => {
  if (!poeHash) {
    throw new Error('Missing poeHash parameter');
  }

  /* ------------------ fetch proof ------------------ */
  const proofDoc = await db.collection('proofs').doc(poeHash).get();

  if (!proofDoc.exists) {
    return { valid: false, reason: 'Proof not found' };
  }

  const proof = proofDoc.data();

  /* ------------------ fetch commitment ------------------ */
  const commitmentDoc = await db
    .collection('commitments')
    .doc(proof.commitmentId)
    .get();

  if (!commitmentDoc.exists) {
    return { valid: false, reason: 'Associated commitment not found' };
  }

  const commitment = commitmentDoc.data();

  /* ------------------ recompute hash ------------------ */
  const recomputedHash = generatePoEHash({
    commitmentId: proof.commitmentId,
    timestamp: proof.executionTime,
    latitude: proof.executionLocation.lat,
    longitude: proof.executionLocation.lng
  });

  const hashMatch = recomputedHash === poeHash;

  /* ------------------ blockchain check ------------------ */
  let onChainMatch = false;
  try {
    const chainProof = await getProofFromChain(proof.commitmentId);
    onChainMatch = recomputedHash === chainProof.poeHash;
  } catch {
    onChainMatch = false;
  }

  /* ------------------ time check ------------------ */
  const execTime = parseUtc(proof.executionTime);
  const startTime = parseUtc(commitment.timeWindow.start);
  const endTime = parseUtc(commitment.timeWindow.end);
  const timeValid = execTime >= startTime && execTime <= endTime;

  /* ------------------ location check ------------------ */
  const distance = getDistanceFromLatLonInMeters(
    commitment.location.lat,
    commitment.location.lng,
    proof.executionLocation.lat,
    proof.executionLocation.lng
  );
  
  const allowedRadius = commitment.location.radius || ALLOWED_RADIUS_METERS;
  const locationValid = distance <= allowedRadius;

  /* ------------------ final checks ------------------ */
  const checks = {
    hashMatch,
    onChainMatch,
    time: timeValid,
    location: locationValid
  };

  const deterministicValid =
    hashMatch && onChainMatch && timeValid && locationValid;

    const aiSuspicious =
    proof.aiVerification?.vision?.evidenceValid === false ||
    proof.aiVerification?.vision?.verdict === 'SUSPICIOUS';
    console.log('[VERIFY] AI suspicious:', {
      verdict: proof.aiVerification?.vision?.verdict,
      evidenceValid: proof.aiVerification?.vision?.evidenceValid
    });
      
  /* ------------------ Gemini explanation (ONLY when useful) ------------------ */
  let explanation = null;

  if (!deterministicValid || aiSuspicious) {
    explanation = await generateVerificationExplanation({
      vision: proof.aiVerification?.vision,
      checks
    });

    // Optional: persist explanation for audits
    await db.collection('proofs').doc(poeHash).update({
      aiExplanation: {
        provider: 'gemini',
        summary: explanation,
        generatedAt: new Date().toISOString()
      }
    });
  }


  /* ------------------ risk classification ------------------ */
  const riskLevel =
    !deterministicValid ? 'HIGH' :
    aiSuspicious ? 'MEDIUM' :
    'LOW';

  /* ------------------ log analytics ------------------ */
  await logVerificationResult({
    poeHash,
    commitmentId: proof.commitmentId,
    verifiedAt,
  
    verificationValid: deterministicValid,
    deterministicValid,
    aiSuspicious,
    aiExplanationUsed,
  
    hashMatch,
    onChainMatch,
    timeValid,
    locationValid,
  
    distanceMeters,
    distanceBucket,
    timeDriftSeconds,
  
    visionVerdict: proof.aiVerification?.vision?.verdict || 'UNKNOWN',
    evidenceValid: proof.aiVerification?.vision?.evidenceValid ?? null,
  
    riskLevel
  });
  

  /* ------------------ return ------------------ */
  if (!deterministicValid) {
    return {
      valid: false,
      reason: 'Verification failed',
      checks,
      aiExplanation: explanation
    };
  }

  return {
    valid: true,
    checks,
    aiExplanation: explanation // may still exist if AI was suspicious
  };
};

export default verifyProof;
