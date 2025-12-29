import {createCommitment as createCommitmentService} from '../services/commitment.service.js'

const createCommitment = (req, res) => {
  try {
    const commitment = createCommitmentService(req.body);
    res.status(201).json({
      commitmentId: commitment.commitmentId,
      status: commitment.status,
      data: commitment
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export default createCommitment
