// src/utils/logger.js
const timestamp = () => new Date().toISOString();

const logger = {
    info: (msg) => console.log(`[${timestamp()}] [INFO] ${msg}`),
    warn: (msg) => console.warn(`[${timestamp()}] [WARN] ${msg}`),
    error: (msg) => console.error(`[${timestamp()}] [ERROR] ${msg}`),

    evento: (tipo, detalle) => {
        console.log(`[${timestamp()}] [EVENTO] [${tipo}] ${detalle}`);
    }
};

module.exports = logger;
