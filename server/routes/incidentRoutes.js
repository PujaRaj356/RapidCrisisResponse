const express = require('express');
const router = express.Router();
const { createIncident, getIncidents, updateIncidentStatus } = require('../controllers/incidentController');
const { protect, staff } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createIncident)
  .get(protect, getIncidents);

router.route('/:id/status')
  .put(protect, staff, updateIncidentStatus);

module.exports = router;
