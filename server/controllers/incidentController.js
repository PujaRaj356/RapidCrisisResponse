const Incident = require('../models/Incident');

const createIncident = async (req, res) => {
  try {
    const { type, description, location, image } = req.body;
    let { severity } = req.body;

    // AI AUTO-SEVERITY DETECTION HOOK
    if (!severity) {
      const lowerDesc = description.toLowerCase();
      if (lowerDesc.includes('fire') || lowerDesc.includes('smoke') || lowerDesc.includes('gun') || lowerDesc.includes('weapon')) {
        severity = 'Critical';
      } else if (lowerDesc.includes('heart') || lowerDesc.includes('blood') || lowerDesc.includes('unconscious')) {
        severity = 'High';
      } else if (lowerDesc.includes('theft') || lowerDesc.includes('stolen') || lowerDesc.includes('leak')) {
        severity = 'Medium';
      } else {
        severity = 'Low';
      }
    }

    const incident = await Incident.create({
      type,
      description,
      location,
      severity,
      image,
      createdBy: req.user._id
    });

    // We will emit socket events from the frontend or central service, 
    // but doing it here might require access to io instance. Let's pass it via req.io if attached.
    if (req.io) {
      req.io.emit('newIncident', incident);
    }

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getIncidents = async (req, res) => {
  try {
    // Staff/Admin get all, Guests might only get theirs
    let q = {};
    if (req.user.role === 'Guest') {
      q.createdBy = req.user._id;
    }

    const incidents = await Incident.find(q).populate('createdBy', 'name roomNumber role').sort({ createdAt: -1 });
    res.json(incidents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateIncidentStatus = async (req, res) => {
  try {
    const incidentId = req.params.id;
    const { status } = req.body;

    const incident = await Incident.findById(incidentId);

    if (incident) {
      incident.status = status;
      const updatedIncident = await incident.save();
      
      if (req.io) {
        req.io.emit('statusChange', updatedIncident);
      }

      res.json(updatedIncident);
    } else {
      res.status(404).json({ message: 'Incident not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createIncident, getIncidents, updateIncidentStatus };
