require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./db');
const authRoutes = require('./routes/authRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const geminiRoutes = require('./routes/geminiRoutes');
const socketHandler = require('./socket');

// Connect Database
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
const userRoutes = require('./routes/userRoutes');
const Incident = require('./models/Incident');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
  }
});

// Pass IO instance to req so controllers can use it
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/gemini', geminiRoutes);
app.use('/api/users', userRoutes);

// Optional simple root endpoint
app.get('/', (req, res) => res.send('API is running...'));

socketHandler(io);

// Escalation Engine: Checks every 15 seconds
setInterval(async () => {
  try {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    // Find unacknowledged incidents older than 30s that haven't been escalated
    const neglectedEscalations = await Incident.find({
      status: 'Reported',
      createdAt: { $lte: thirtySecondsAgo },
      severity: { $ne: 'Critical' }
    });

    for (let inc of neglectedEscalations) {
      inc.severity = 'Critical';
      const updated = await inc.save();
      io.emit('statusChange', updated);
      console.log(`Auto-escalated Incident ${inc._id} to Critical due to timeout.`);
    }
  } catch(e) {
    console.error('Escalation error', e);
  }
}, 15000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
