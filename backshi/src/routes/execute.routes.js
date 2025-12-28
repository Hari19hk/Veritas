const express = require('express');
const router = express.Router();
const executeController = require('../controllers/execute.controller');

router.post('/execute', executeController.executeTask);

module.exports = router;
