const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { initRedis } = require('./utils/redis');
const DeliveryService = require('./services/deliveryService');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'delivery-service' });
});

/**
 * Start server and initialize services
 */
async function startServer() {
  try {
    await initRedis();
    
    new DeliveryService();
    
    app.listen(PORT, () => {
      console.log(`Delivery service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start delivery service:', error);
    process.exit(1);
  }
}

startServer();