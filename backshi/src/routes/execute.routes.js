import express from 'express';
const router = express.Router();
import executeController from '../controllers/execute.controller.js'

router.post('/execute', executeController);

export default router;
