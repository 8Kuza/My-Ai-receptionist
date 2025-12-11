const WebSocket = require('ws');
const logger = require('../utils/logger');
const configLoader = require('../utils/configLoader');
// We will import the brain/tools later
const receptionistBrain = require('../workflow/receptionistBrain');

// Configuration for OpenAI
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SYSTEM_MESSAGE = `
You are a helpful dental receptionist for BrightSmile Dental.
Your goal is to answer calls, triage patients, and schedule appointments.
Speak in a warm, professional tone.
Key details:
- Clinic Hours: Mon-Thu 9-5, Fri 9-1. Closed Sat/Sun.
- Accepted Insurance: Delta, Cigna, MetLife, UHC, Aetna.
- If it is an emergency (severe pain, bleeding), prioritize getting them in ASAP.

Start by asking for their name and how you can help.
`;

const setupWebSocket = (server) => {
    const wss = new WebSocket.Server({ server, path: '/voice/stream' });

    wss.on('connection', (ws, req) => {
        logger.info('New Twilio Media Stream connection');

        // Connect to OpenAI Realtime API
        // NOTE: This URL is based on the Realtime API Preview specs.
        const openAiWs = new WebSocket('wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01', {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                "OpenAI-Beta": "realtime=v1",
            },
        });

        let streamSid = null;

        const sendToOpenAI = (data) => {
            if (openAiWs.readyState === WebSocket.OPEN) {
                openAiWs.send(JSON.stringify(data));
            }
        };

        const sendToTwilio = (data) => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
            }
        };

        // OPENAI EVENTS
        openAiWs.on('open', () => {
            logger.info('Connected to OpenAI Realtime API');

            // Send Session Update to configure the model
            sendToOpenAI({
                type: 'session.update',
                session: {
                    modalities: ["text", "audio"],
                    instructions: SYSTEM_MESSAGE,
                    voice: "alloy",
                    input_audio_format: "g711_ulaw",
                    output_audio_format: "g711_ulaw",
                    turn_detection: {
                        type: "server_vad",
                    }
                }
            });
        });

        openAiWs.on('message', (data) => {
            try {
                const event = JSON.parse(data);

                if (event.type === 'response.audio.delta' && event.delta) {
                    // Audio from LLM -> Twilio
                    sendToTwilio({
                        event: 'media',
                        streamSid: streamSid,
                        media: {
                            payload: event.delta
                        }
                    });
                }

                // Handle function calling here...
                if (event.type === 'response.function_call_arguments.done') {
                    // Parse tool calls and execute brain functions
                    logger.info('Function call received', event);
                }

            } catch (e) {
                logger.error('Error parsing OpenAI message', e);
            }
        });

        openAiWs.on('error', (e) => {
            logger.error('OpenAI WebSocket Error', e);
        });


        // TWILIO EVENTS
        ws.on('message', (message) => {
            try {
                const msg = JSON.parse(message);

                switch (msg.event) {
                    case 'start':
                        streamSid = msg.start.streamSid;
                        logger.info(`Stream started: ${streamSid}`);
                        break;
                    case 'media':
                        // Audio from Twilio -> LLM
                        // We append input audio buffer
                        if (openAiWs.readyState === WebSocket.OPEN) {
                            sendToOpenAI({
                                type: 'input_audio_buffer.append',
                                audio: msg.media.payload
                            });
                        }
                        break;
                    case 'stop':
                        logger.info('Stream stopped');
                        openAiWs.close();
                        break;
                }
            } catch (e) {
                logger.error('Error parsing Twilio message', e);
            }
        });

        ws.on('close', () => {
            logger.info('Twilio connection closed');
            openAiWs.close();
        });
    });
};

module.exports = { setupWebSocket };
