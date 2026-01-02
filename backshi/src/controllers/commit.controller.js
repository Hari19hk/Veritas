import {createCommitment as createCommitmentService, getCommitment, getAllCommitments} from '../services/commitment.service.js'

const createCommitment = (req, res) => {
  const timestamp = new Date().toISOString();
  
  // Log incoming request
  console.log(`[${timestamp}] POST /commit - Incoming request`);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const commitment = createCommitmentService(req.body);
    
    // Log successful response
    console.log(`[${new Date().toISOString()}] POST /commit - Success`);
    console.log('Response:', JSON.stringify({
      commitmentId: commitment.commitmentId,
      status: commitment.status,
      data: commitment
    }, null, 2));
    
    res.status(201).json({
      commitmentId: commitment.commitmentId,
      status: commitment.status,
      data: commitment
    });
  } catch (error) {
    // Log error
    console.error(`[${new Date().toISOString()}] POST /commit - Error:`, error.message);
    console.error('Error details:', error);
    
    res.status(400).json({ error: error.message });
  }
};

const getCommitmentById = (req, res) => {
  const { id } = req.params;
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] GET /commitments/${id} - Incoming request`);
  
  try {
    const commitment = getCommitment(id);
    
    if (!commitment) {
      console.log(`[${new Date().toISOString()}] GET /commitments/${id} - Not found`);
      return res.status(404).json({ error: 'Commitment not found' });
    }
    
    console.log(`[${new Date().toISOString()}] GET /commitments/${id} - Success`);
    res.json(commitment);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] GET /commitments/${id} - Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
};

const getAllCommitmentsHandler = (req, res) => {
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] GET /commitments - Incoming request`);
  
  try {
    const allCommitments = getAllCommitments();
    
    console.log(`[${new Date().toISOString()}] GET /commitments - Success (${allCommitments.length} commitments)`);
    res.json(allCommitments);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] GET /commitments - Error:`, error.message);
    res.status(500).json({ error: error.message });
  }
};

export { createCommitment, getCommitmentById, getAllCommitmentsHandler };
export default createCommitment;
