import express from 'express';
const router = express.Router();
import commitController from '../controllers/commit.controller.js'

router.post('/commit', commitController);

export default router;
