const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  // If incidentId is present, the message belongs to a specific incident chat
  // If not, it could be a general broadcast or direct message hub
  incidentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident'
  },
  isBroadcast: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
