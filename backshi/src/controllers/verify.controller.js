import verifyService from '../services/verify.service.js';

const verifyProof = async (req, res) => {
  try {
    const { poeHash } = req.query;

    const result = await verifyService(poeHash);

    // Always return 200 OK for verification
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
};

export default verifyProof;
