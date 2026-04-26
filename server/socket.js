const Message = require('./models/Message');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join a specific incident room
    socket.on('joinIncident', (incidentId) => {
      socket.join(incidentId);
      console.log(`Socket ${socket.id} joined incident: ${incidentId}`);
    });

    // Chat Message
    socket.on('chatMessage', async (data) => {
      console.log('Received chatMessage from', data.sender, 'content:', data.content);
      try {
        const message = await Message.create({
          sender: data.sender,
          content: data.content,
          incidentId: data.incidentId
        });
        
        await message.populate('sender', 'name role');
        console.log('Message created and populated:', message);

        if (data.incidentId) {
          io.to(data.incidentId).emit('message', message);
        } else {
          io.emit('message', message); // Global broadcast
        }
      } catch (err) {
        console.error(err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
