const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const logger = require('../utils/logger');

// POST /voice/incoming
// Triggered when Twilio receives a call
router.post('/incoming', (req, res) => {
    logger.info('Incoming call received');

    const VoiceResponse = twilio.twiml.VoiceResponse;
    const response = new VoiceResponse();

    const connect = response.connect();
    const stream = connect.stream({
        url: `wss://${req.headers.host}/voice/stream` // The websocket endpoint
    });

    // Add parameters if needed
    // stream.parameter({ name: 'caller', value: req.body.From });

    res.type('text/xml');
    res.send(response.toString());
});

module.exports = router;
