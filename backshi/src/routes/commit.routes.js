const express = require('express');
const router = express.Router();
const commitController = require('../controllers/commit.controller');

router.post('/commit', commitController.createCommitment);

module.exports = router;
