const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Fire', 'Medical', 'Security Threat', 'Natural Disaster', 'Other']
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  location: {
    roomNumber: String,
    gps: {
      lat: Number,
      lng: Number
    }
  },
  image: {
    type: String // URL or base64
  },
  status: {
    type: String,
    enum: ['Reported', 'Acknowledged', 'Responding', 'Resolved'],
    default: 'Reported'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  aiSuggestions: {
    type: String // Gemini API responses or suggestions
  }
}, { timestamps: true });

module.exports = mongoose.model('Incident', incidentSchema);
