const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Get all users (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    // Ideally we would add an admin check middleware here
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    
    // Return all users
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error loading users' });
  }
});

// Get basic system aggregate stats
router.get('/stats', protect, async (req, res) => {
  try {
    const totalStaff = await User.countDocuments({ role: { $in: ['Staff', 'Admin'] } });
    
    // Very basic active incident stat
    const Incident = require('../models/Incident');
    const incidentsToday = await Incident.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    });
    
    res.json({
      activeStaff: totalStaff,
      incidentsToday: incidentsToday,
      avgResponseTime: '3.1 mins', // Mocked calculation
      resolvedRate: '88%' // Mocked calculation
    });
  } catch(e) {
    res.status(500).json({ message: 'Error loading stats' });
  }
});

module.exports = router;
