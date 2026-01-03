import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash'
});

/**
 * Generate human-readable explanation for proof verification
 */
export const generateVerificationExplanation = async ({
  vision,
  checks
}) => {
  const prompt = `
You are an auditor assistant.

Explain clearly and concisely why a Proof of Execution was flagged or verified.

Vision Analysis:
- Verdict: ${vision?.verdict}
- Meaningful labels: ${vision?.meaningfulLabels?.map(l => l.description).join(', ') || 'None'}
- Dominant colors count: ${vision?.imageProperties?.dominantColors?.length || 0}

Deterministic Checks:
- Hash match: ${checks.hashMatch}
- Blockchain match: ${checks.onChainMatch}
- Time valid: ${checks.time}
- Location valid: ${checks.location}

Rules:
- Do NOT speculate
- Do NOT mention probabilities
- Do NOT suggest actions
- Just explain the result in simple English
`;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
};
