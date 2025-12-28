const verifyService = require('../services/verify.service');

const verifyProof = (req, res) => {
  try {
    const { poeHash } = req.query;
    const result = verifyService.verifyProof(poeHash);
    
    // Always return 200 OK for verification requests, 
    // the body contains the valid/invalid status
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  verifyProof
};
