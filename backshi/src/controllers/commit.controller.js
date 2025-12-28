const commitmentService = require('../services/commitment.service');

const createCommitment = (req, res) => {
  try {
    const commitment = commitmentService.createCommitment(req.body);
    res.status(201).json({
      commitmentId: commitment.commitmentId,
      status: commitment.status,
      data: commitment
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createCommitment
};
