// src/utils/delay.js
const logger = require('./logger');

const delay = async (ms, label = '') => {
    if (label) {
        logger.info(`⏳ Esperando ${ms}ms... (${label})`);
    }
    return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports = delay;
