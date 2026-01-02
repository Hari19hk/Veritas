import express from 'express';
const router = express.Router();
import verifyController from '../controllers/verify.controller.js'

router.get('/verify', verifyController);

export default router;
