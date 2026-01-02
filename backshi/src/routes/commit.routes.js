import express from 'express';
const router = express.Router();
import commitController, { getCommitmentById, getAllCommitmentsHandler } from '../controllers/commit.controller.js'

router.post('/commit', commitController);
router.get('/commitments', getAllCommitmentsHandler);
router.get('/commitments/:id', getCommitmentById);

export default router;
