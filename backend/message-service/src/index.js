const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const messageRoutes = require('./routes/messages');
const { connectDatabase } = require('./utils/database');
const { initRedis, subscribeToChannel } = require('./utils/redis');
const Message = require('./models/Message');
const { emitMessageCreated } = require('./events/messageEvents');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/messages', messageRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'message-service' });
});

/**
 * Handle message send event from WebSocket gateway
 */
async function handleMessageSend(data) {
  console.log('Processing message send event:', data);
  
  try {
    const { senderId, receiverId, content, messageType = 'text' } = data;
    
    const message = new Message({
      senderId,
      receiverId,
      content,
      messageType
    });

    await message.save();
    await emitMessageCreated(message);
    
    console.log(`Message ${message._id} created and event emitted`);
  } catch (error) {
    console.error('Error handling message send:', error);
  }
}

/**
 * Start server and initialize dependencies
 */
async function startServer() {
  try {
    await connectDatabase();
    await initRedis();
    
    await subscribeToChannel('message:send', handleMessageSend);
    
    app.listen(PORT, () => {
      console.log(`Message service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start message service:', error);
    process.exit(1);
  }
}

startServer();