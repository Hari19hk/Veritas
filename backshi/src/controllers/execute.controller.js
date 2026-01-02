import proofService, { getProofByHash, getAllProofs } from '../services/proof.service.js';

const executeTask = async (req, res) => {
  const timestamp = new Date().toISOString();
  
  // Log incoming request
  console.log(`[${timestamp}] POST /execute - Incoming request`);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const proof = await proofService(req.body);

    // Log successful response
    console.log(`[${new Date().toISOString()}] POST /execute - Success`);
    console.log('Response:', JSON.stringify({
      poeHash: proof.poeHash,
      status: proof.status,
      data: proof
    }, null, 2));

    return res.status(201).json({
      poeHash: proof.poeHash,
      status: proof.status,
      data: proof
    });
  } catch (error) {
    // Log error
    console.error(`[${new Date().toISOString()}] POST /execute - Error:`, error.message);
    console.error('Error details:', error);
    
    return res.status(400).json({
      error: error.message
    });
  }
};

const getProofByHashHandler = (req, res) => {
  const { poeHash } = req.params;
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] GET /proofs/${poeHash} - Incoming request`);
  
  try {
    const proof = getProofByHash(poeHash);
    
    if (!proof) {
      console.log(`[${new Date().toISOString()}] GET /proofs/${poeHash} - Not found`);
      return res.status(404).json({ error: 'Proof not found' });
    }
    
    console.log(`[${new Date().toISOString()}] GET /proofs/${poeHash} - Success`);
    res.json(proof);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] GET /proofs/${poeHash} - Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
};

const getAllProofsHandler = (req, res) => {
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] GET /proofs - Incoming request`);
  
  try {
    const allProofs = getAllProofs();
    
    console.log(`[${new Date().toISOString()}] GET /proofs - Success (${allProofs.length} proofs)`);
    res.json(allProofs);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] GET /proofs - Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
};

export { getProofByHashHandler, getAllProofsHandler };
export default executeTask;
