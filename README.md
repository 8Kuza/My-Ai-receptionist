# AI Dental Receptionist

A production-grade AI receptionist system using Node.js, Twilio, and OpenAI Realtime API.

## Features
- **Voice Conversational AI**: Uses OpenAI's Realtime API for sub-second latency.
- **Appointment Scheduling**: Integrates with Google Calendar to check availability and book slots.
- **CRM Integration**: Pushes lead data to HubSpot.
- **Configurable**: Easy `config.json` for clinic hours, insurance types, etc.

## Setup

### Prerequisites
- Node.js v18+
- Twilio Account + Phone Number
- OpenAI Account (with Realtime API access)
- Google Cloud Project (for Calendar API)

### Local Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Copy `.env.example` to `.env` and fill in your keys.

3. **Run Server**
   ```bash
   npm run dev
   ```

4. **Expose Localhost** (for Twilio)
   Use ngrok:
   ```bash
   ngrok http 3000
   ```
   Take the https URL (e.g., `https://xyz.ngrok.io`) and configure your Twilio Voice Webhook to:
   `https://xyz.ngrok.io/voice/incoming`

### Deployment on Render

This project is configured to run on [Render](https://render.com).

1. **Create a Web Service**
   - Connect your GitHub repository.
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_VERSION`: `18` (or higher)
     - Add all variables from `.env.example` (OPENAI_API_KEY, TWILIO globals, etc.).
     - **Note**: For Google Credentials, you can base64 encode your service-account.json and load it, or just paste the JSON content into a variable and write a small script to dump it to a file on boot if needed. But for simple key-based auth, just using env vars is safest.

2. **Twilio Configuration**
   - Once deployed, get your Render URL (e.g., `https://my-ai-receptionist.onrender.com`).
   - Update your Twilio Phone Number's **Voice Webhook** to:
     `https://my-ai-receptionist.onrender.com/voice/incoming`

## File Structure
- `/app/voice`: Twilio and OpenAI Realtime logic.
- `/app/calendar`: Google Calendar integration.
- `/app/crm`: HubSpot integration.
- `/app/workflow`: Business logic & "Brain" functions.
