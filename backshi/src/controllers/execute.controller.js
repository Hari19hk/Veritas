import proofService from '../services/proof.service.js';

const executeTask = async (req, res) => {
  try {
    const proof = await proofService(req.body);

    return res.status(201).json({
      poeHash: proof.poeHash,
      status: proof.status,
      data: proof
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
};

export default executeTask;
