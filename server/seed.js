require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Incident = require('./models/Incident');

const connectDB = require('./db');

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing
    await User.deleteMany();
    await Incident.deleteMany();

    console.log('Cleared existing data.');

    // Seed Users
    const users = await User.create([
      { name: 'Admin One', email: 'admin@crisis.com', password: 'password123', role: 'Admin' },
      { name: 'Staff Member', email: 'staff@crisis.com', password: 'password123', role: 'Staff' },
      { name: 'Guest User', email: 'guest@crisis.com', password: 'password123', role: 'Guest', roomNumber: '404' }
    ]);

    console.log('Seeded users:', users.map(u => u.email));

    // Seed Incident
    await Incident.create([
      {
        type: 'Fire',
        description: 'Smell of smoke near the elevators on floor 4.',
        severity: 'Critical',
        location: { roomNumber: '404' },
        status: 'Reported',
        createdBy: users[2]._id // guest
      },
      {
        type: 'Medical',
        description: 'Guest collapsed near the pool.',
        severity: 'High',
        location: { roomNumber: 'Pool Area' },
        status: 'Responding',
        createdBy: users[1]._id // staff
      }
    ]);

    console.log('Seeded incidents.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
