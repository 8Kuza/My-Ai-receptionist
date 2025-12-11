const fs = require('fs');
const path = require('path');
const logger = require('./logger');

let currentConfig = {};

const loadConfig = () => {
    try {
        const configPath = path.join(__dirname, '../../config.json');
        if (fs.existsSync(configPath)) {
            const raw = fs.readFileSync(configPath, 'utf-8');
            currentConfig = JSON.parse(raw);
            logger.info('Configuration loaded successfully from config.json');
        } else {
            logger.warn('config.json not found, using defaults');
        }
    } catch (err) {
        logger.error('Error loading config', err);
    }
};

const getConfig = () => currentConfig;

module.exports = {
    loadConfig,
    getConfig
};
