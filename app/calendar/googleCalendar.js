const { google } = require('googleapis');
const logger = require('../utils/logger');
const path = require('path');

// NOTE: This requires a Service Account JSON key file or OAuth setup.
// For server-to-server, Service Account is easiest.
// Assumes 'service-account.json' is in the root or env vars.

const SCOPES = ['https://www.googleapis.com/auth/calendar'];

const getAuthClient = async () => {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
            scopes: SCOPES,
        });
        return await auth.getClient();
    } catch (e) {
        logger.error('Google Auth Error', e);
        return null;
    }
};

const listEvents = async (timeMin, timeMax) => {
    const auth = await getAuthClient();
    if (!auth) return [];

    const calendar = google.calendar({ version: 'v3', auth });

    try {
        const res = await calendar.events.list({
            calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
            timeMin: timeMin,
            timeMax: timeMax,
            singleEvents: true,
            orderBy: 'startTime',
        });
        return res.data.items;
    } catch (e) {
        logger.error('Error fetching calendar events', e);
        return [];
    }
};

const createEvent = async (eventDetails) => {
    const auth = await getAuthClient();
    if (!auth) return false;

    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
        summary: eventDetails.summary, // e.g., "Cleaning - John Doe"
        description: eventDetails.description,
        start: {
            dateTime: eventDetails.startDateTime, // ISO format
            timeZone: 'America/New_York',
        },
        end: {
            dateTime: eventDetails.endDateTime,
            timeZone: 'America/New_York',
        },
    };

    try {
        const res = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
            resource: event,
        });
        logger.info(`Event created: ${res.data.htmlLink}`);
        return true;
    } catch (e) {
        logger.error('Error creating event', e);
        return false;
    }
};

module.exports = { listEvents, createEvent };
