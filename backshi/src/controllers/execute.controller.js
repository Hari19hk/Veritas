const proofService = require('../services/proof.service');

const executeTask = (req, res) => {
  try {
    const proof = proofService.executeTask(req.body);
    res.status(201).json({
      poeHash: proof.poeHash,
      status: proof.status,
      data: proof
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  executeTask
};
