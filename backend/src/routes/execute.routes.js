import express from 'express';
import multer from 'multer';
const router = express.Router();
import executeController, { getProofByHashHandler, getAllProofsHandler } from '../controllers/execute.controller.js'

// Multer setup for memory storage (we need buffer for GCS)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

router.post('/execute', upload.single('evidenceFile'), executeController);
router.get('/proofs', getAllProofsHandler);
router.get('/proofs/:poeHash', getProofByHashHandler);

export default router;
