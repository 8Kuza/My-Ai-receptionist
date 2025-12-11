const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./app/utils/logger');
const configLoader = require('./app/utils/configLoader');
const twilioRoutes = require('./app/voice/twilioRoutes');

// Load env vars
dotenv.config();

// Load Config
configLoader.loadConfig();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true })); // For Twilio webhooks
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'AI Receptionist' });
});

// Twilio Voice Routes
app.use('/voice', twilioRoutes);

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle WebSocket upgrades for OpenAI Realtime API (handled inside twilioRoutes/realtimeLLM logic usually, 
// but if we are acting as the websocket server for Twilio Media Streams, we need to handle upgrade here or in the route)
// The Twilio Media Stream connects to a WSS URL. We will likely handle this in `twilioRoutes` but usually it needs access to the server instance.
// For standard Express + express-ws or similar, we might need to export the setup.
// Let's modify twilioRoutes to export a setup function or attach to the existing server if using 'ws' library directly.

const { setupWebSocket } = require('./app/voice/realtimeLLM');
setupWebSocket(server);

module.exports = app;
