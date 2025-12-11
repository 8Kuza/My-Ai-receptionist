const logger = require('../utils/logger');
const googleCalendar = require('../calendar/googleCalendar');
const hubspot = require('../crm/hubspot');

// This file will contain functions exposed to the LLM (Function Calling)

const checkAvailability = async ({ date }) => {
    logger.info(`Checking availability for ${date}`);

    // Example: Check 9am to 5pm for the given date
    const start = `${date}T09:00:00-05:00`;
    const end = `${date}T17:00:00-05:00`;

    const events = await googleCalendar.listEvents(start, end);
    // Simple logic: If < 5 events, say yes (stub). Real logic would compute gaps.
    if (events.length < 5) {
        return "Yes, we have availability on that day. Morning or Afternoon?";
    }
    return "That day looks quite busy. Do you have another date in mind?";
};

const bookAppointment = async ({ name, phone, email, time, type }) => {
    logger.info(`Booking ${type} for ${name} at ${time}`);

    // 1. Create Event
    // Simple duration mapping
    const durationMins = type.toLowerCase().includes('cleaning') ? 60 : 30;
    const start = new Date(time);
    const end = new Date(start.getTime() + durationMins * 60000);

    const booked = await googleCalendar.createEvent({
        summary: `${type} - ${name}`,
        description: `Phone: ${phone}`,
        startDateTime: start.toISOString(),
        endDateTime: end.toISOString()
    });

    if (!booked) return "I'm sorry, I couldn't book the calendar slot. Please try again.";

    // 2. Push to CRM
    await hubspot.createContact({ firstName: name.split(' ')[0], lastName: name.split(' ')[1] || '', phone, email });

    return "Appointment booked successfully and confirmed.";
};

module.exports = {
    checkAvailability,
    bookAppointment
};
