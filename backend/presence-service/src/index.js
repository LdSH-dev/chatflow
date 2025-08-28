const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const presenceRoutes = require('./routes/presence');
const { initRedis } = require('./utils/redis');
const PresenceService = require('./services/presenceService');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/presence', presenceRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'presence-service' });
});

/**
 * Start server and initialize services
 */
async function startServer() {
  try {
    await initRedis();
    
    new PresenceService();
    
    app.listen(PORT, () => {
      console.log(`Presence service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start presence service:', error);
    process.exit(1);
  }
}

startServer();