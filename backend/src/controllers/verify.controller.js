import verifyService from '../services/verify.service.js';

const verifyProof = async (req, res) => {
  const timestamp = new Date().toISOString();
  
  // Log incoming request
  console.log(`[${timestamp}] GET /verify - Incoming request`);
  console.log('Query params:', JSON.stringify(req.query, null, 2));
  
  try {
    const { poeHash } = req.query;

    if (!poeHash) {
      console.log(`[${new Date().toISOString()}] GET /verify - Missing poeHash parameter`);
      return res.status(400).json({
        error: 'Missing poeHash parameter'
      });
    }

    const result = await verifyService(poeHash);

    // Log verification result
    console.log(`[${new Date().toISOString()}] GET /verify - Success`);
    console.log('Verification result:', JSON.stringify(result, null, 2));

    // Always return 200 OK for verification (even if invalid)
    return res.status(200).json(result);
  } catch (error) {
    // Log error
    console.error(`[${new Date().toISOString()}] GET /verify - Error:`, error.message);
    console.error('Error details:', error);
    
    return res.status(400).json({
      error: error.message
    });
  }
};

export default verifyProof;
