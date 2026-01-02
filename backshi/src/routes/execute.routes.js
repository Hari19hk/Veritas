import express from 'express';
const router = express.Router();
import executeController, { getProofByHashHandler, getAllProofsHandler } from '../controllers/execute.controller.js'

router.post('/execute', executeController);
router.get('/proofs', getAllProofsHandler);
router.get('/proofs/:poeHash', getProofByHashHandler);

export default router;
