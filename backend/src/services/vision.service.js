import vision from '@google-cloud/vision';
import fs from 'fs';
import path from 'path';
import os from 'os';

const client = new vision.ImageAnnotatorClient();

/**
 * Analyze an evidence image using Google Vision API
 * Produces interpretable verification signals (NOT absolute truth).
 */
export const analyzeEvidenceImage = async (imageBuffer) => {
  console.log('🧠 [VISION] Starting evidence analysis');

  /* ------------------ 1. Write temp file ------------------ */
  const tempPath = path.join(os.tmpdir(), `evidence-${Date.now()}.jpg`);
  fs.writeFileSync(tempPath, imageBuffer);

  console.log('🧠 [VISION] Temp file written:', tempPath);
  console.log('🧠 [VISION] Image size (bytes):', imageBuffer.length);

  /* ------------------ 2. Call Vision API ------------------ */
  console.log('🧠 [VISION] Sending image to Google Vision API');

  const [result] = await client.annotateImage({
    image: { source: { filename: tempPath } },
    features: [
      { type: 'LABEL_DETECTION', maxResults: 10 },
      { type: 'TEXT_DETECTION' },
      { type: 'SAFE_SEARCH_DETECTION' },
      { type: 'IMAGE_PROPERTIES' } // 🔥 important addition
    ]
  });

  console.log('🧠 [VISION] Raw Vision response received');

  /* ------------------ 3. Cleanup -------------------------- */
  fs.unlinkSync(tempPath);
  console.log('🧠 [VISION] Temp file deleted');

  /* ------------------ 4. Labels --------------------------- */
  const labels =
    result.labelAnnotations?.map(l => ({
      description: l.description,
      score: l.score
    })) || [];

  console.log('🧠 [VISION] Labels detected:', labels);

  /* ------------------ 5. SafeSearch ----------------------- */
  const safeSearch = result.safeSearchAnnotation || {};
  console.log('🧠 [VISION] SafeSearch:', safeSearch);

  /* ------------------ 6. Text detection ------------------- */
  const extractedText =
    result.textAnnotations?.[0]?.description || '';

  if (extractedText) {
    console.log('🧠 [VISION] Extracted text:', extractedText);
  } else {
    console.log('🧠 [VISION] No text detected');
  }

  /* ------------------ 7. Image properties ----------------- */
  const colors =
    result.imagePropertiesAnnotation?.dominantColors?.colors || [];

  console.log(
    '🧠 [VISION] Dominant colors:',
    colors.map(c => ({
      rgb: c.color,
      score: c.score,
      pixelFraction: c.pixelFraction
    }))
  );

  /* ------------------ 8. Intelligence logic ---------------- */

  // A. Remove meaningless labels
  const meaningfulLabels = labels.filter(
    l =>
      !['white', 'black', 'background', 'empty', 'pattern'].includes(
        l.description.toLowerCase()
      )
  );

  console.log(
    '🧠 [VISION] Meaningful labels:',
    meaningfulLabels
  );

  // B. Detect blank / single-color images
  const looksBlank =
    colors.length === 1 &&
    colors[0].pixelFraction > 0.85;

  console.log(
    '🧠 [VISION] Blank image detected:',
    looksBlank
  );

  // C. Unsafe content check
  const unsafeContent =
    safeSearch.adult === 'VERY_LIKELY' ||
    safeSearch.violence === 'VERY_LIKELY';

  console.log(
    '🧠 [VISION] Unsafe content detected:',
    unsafeContent
  );

  /* ------------------ 9. Final verdict -------------------- */
  const evidenceValid =
    meaningfulLabels.length > 0 &&
    !looksBlank &&
    !unsafeContent;

  const verdict = evidenceValid ? 'PASS' : 'SUSPICIOUS';

  console.log('🧠 [VISION] FINAL VERDICT:', verdict);

  return {
    verdict,
    evidenceValid,
    labels,
    meaningfulLabels,
    safeSearch,
    extractedText,
    imageProperties: {
      dominantColors: colors
    }
  };
};
