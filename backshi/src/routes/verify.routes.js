const express = require('express');
const router = express.Router();
const verifyController = require('../controllers/verify.controller');

router.get('/verify', verifyController.verifyProof);

module.exports = router;
