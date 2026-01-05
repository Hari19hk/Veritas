import { BigQuery } from '@google-cloud/bigquery';

/**
 * Analytics Service
 * -----------------
 * Fire-and-forget BigQuery logging
 * MUST NEVER throw upstream
 */

const PROJECT_ID = process.env.GCP_PROJECT_ID;
const DATASET_ID = 'poe_analytics';

const TABLES = {
  COMMITMENTS: 'commitments',
  EXECUTIONS: 'executions',
  VERIFICATIONS: 'verifications',
  AI_SIGNALS: 'ai_signals',
};

// ---------- Startup debug ----------
console.log('[BIGQUERY] Initializing client');
console.log('[BIGQUERY] Project ID:', PROJECT_ID);
console.log('[BIGQUERY] Dataset ID:', DATASET_ID);

const bigquery = new BigQuery({
  projectId: PROJECT_ID,
});

/* ------------------------------------------------------------------ */
/* Internal helper                                                     */
/* ------------------------------------------------------------------ */

const insertRow = async (table, row) => {
  console.log(`[BIGQUERY] Preparing insert`);
  console.log(`[BIGQUERY] Table: ${DATASET_ID}.${table}`);
  console.log('[BIGQUERY] Row payload:', JSON.stringify(row, null, 2));

  try {
    const [response] = await bigquery
      .dataset(DATASET_ID)
      .table(table)
      .insert([row]);

    // BigQuery sometimes returns partial errors
    if (response && response.insertErrors) {
      console.error(
        `[BIGQUERY] Partial insert errors for ${table}:`,
        JSON.stringify(response.insertErrors, null, 2)
      );
    } else {
      console.log(`[BIGQUERY] Insert successful → ${table}`);
    }
  } catch (err) {
    console.error(`[BIGQUERY] Insert FAILED → ${table}`);

    // Full error dump (this is CRITICAL)
    console.error('[BIGQUERY] Error message:', err.message);
    console.error('[BIGQUERY] Error details:', JSON.stringify(err, null, 2));

    if (err.errors) {
      console.error('[BIGQUERY] Row-level errors:', JSON.stringify(err.errors, null, 2));
    }
  }
};

/* ------------------------------------------------------------------ */
/* Public Analytics APIs                                               */
/* ------------------------------------------------------------------ */

export const logCommitmentCreated = async ({
  commitmentId,
  taskName,
  lat,
  lng,
//   startTime,
  endTime,
  createdAt,
}) => {
  console.log('[ANALYTICS] logCommitmentCreated:', commitmentId);

  await insertRow(TABLES.COMMITMENTS, {
    commitmentId,
    taskName,
    latitude: lat,
    longitude: lng,
    windowEnd: new Date(endTime),
    createdAt: new Date(createdAt),
  });
};

export const logExecutionEvent = async ({
  poeHash,
  commitmentId,
  executedAt,
  locationDistanceMeters,
  locationValid,
  timeValid,
  evidenceHash,
}) => {
  console.log('[ANALYTICS] logExecutionEvent:', poeHash);

  await insertRow(TABLES.EXECUTIONS, {
    poeHash,
    commitmentId,
    executedAt: new Date(executedAt),
    locationDistanceMeters,
    locationValid,
    timeValid,
    evidenceHash,
  });
};

export const logAISignals = async ({
  poeHash,
  visionVerdict,
  evidenceValid,
  labelCount,
  dominantColorScore,
  hasText,
  safeAdult,
  safeViolence,
  checkedAt,
}) => {
  console.log('[ANALYTICS] logAISignals:', poeHash);

  await insertRow(TABLES.AI_SIGNALS, {
    poeHash,
    visionVerdict,
    evidenceValid,
    labelCount,
    dominantColorScore,
    hasText,
    safeAdult,
    safeViolence,
    checkedAt: new Date(checkedAt),
  });
};

export const logVerificationResult = async ({
  poeHash,
  commitmentId,
  verifiedAt,

  verificationValid,
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

  visionVerdict,
  evidenceValid,

  riskLevel,
}) => {
  console.log('[ANALYTICS] logVerificationResult:', poeHash);

  await insertRow(TABLES.VERIFICATIONS, {
    poeHash,
    commitmentId,
    verifiedAt: new Date(verifiedAt),

    verificationValid,
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

    visionVerdict,
    evidenceValid,

    riskLevel,
  });
};
