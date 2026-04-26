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

// Delete a user (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }
    
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Use deleteOne() for Mongoose modern syntax
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;
