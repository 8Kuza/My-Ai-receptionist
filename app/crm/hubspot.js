const hubspot = require('@hubspot/api-client');
const logger = require('../utils/logger');

const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_ACCESS_TOKEN });

const createContact = async (contactInfo) => {
    if (!process.env.HUBSPOT_ACCESS_TOKEN) {
        logger.warn('HubSpot token missing, skipping CRM push');
        return;
    }

    const properties = {
        firstname: contactInfo.firstName,
        lastname: contactInfo.lastName,
        phone: contactInfo.phone,
        email: contactInfo.email,
        lifecyclestage: 'lead'
    };

    const SimplePublicObjectInputForCreate = { properties, associations: [] };

    try {
        const apiResponse = await hubspotClient.crm.contacts.basicApi.create(SimplePublicObjectInputForCreate);
        logger.info(`HubSpot contact created: ${apiResponse.id}`);
        return apiResponse.id;
    } catch (e) {
        logger.error('HubSpot Create Error', e.message);
        return null;
    }
};

module.exports = { createContact };
