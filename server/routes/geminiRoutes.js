const express = require('express');
const router = express.Router();
const { classifyIncident } = require('../controllers/geminiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/classify', protect, classifyIncident);

module.exports = router;
