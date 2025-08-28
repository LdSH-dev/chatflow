const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { initRedis } = require('./utils/redis');
const SocketService = require('./services/socketService');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json());

let socketService;

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'websocket-gateway',
    connectedUsers: socketService ? socketService.getConnectedUsersCount() : 0
  });
});

app.get('/stats', (req, res) => {
  res.json({
    connectedUsers: socketService ? socketService.getConnectedUsersCount() : 0,
    users: socketService ? socketService.getConnectedUsers() : []
  });
});

/**
 * Start server and initialize services
 */
async function startServer() {
  try {
    await initRedis();
    
    socketService = new SocketService(server);
    
    server.listen(PORT, () => {
      console.log(`WebSocket gateway running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start websocket gateway:', error);
    process.exit(1);
  }
}

startServer();