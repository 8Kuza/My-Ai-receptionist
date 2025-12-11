const logger = require('../utils/logger');

const syncPatient = async (data) => {
    logger.info('Weave integration not yet implemented', data);
    return true;
};

module.exports = { syncPatient };
