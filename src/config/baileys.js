// src/config/baileys.js
require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const delay = require('../utils/delay');
const logger = require('../utils/logger');
const messageHandler = require('../handlers/messageHandler');

const AUTH_FOLDER = path.resolve(__dirname, '../../auth');
if (!fs.existsSync(AUTH_FOLDER)) fs.mkdirSync(AUTH_FOLDER);

const startBot = async () => {
    logger.info('⏳ Inicializando cliente...');

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    logger.info(`📦 Usando versión de WhatsApp Web: ${version.join('.')}${isLatest ? ' (última)' : ''}`);

    const sock = makeWASocket({
        version,
        auth: state,
        browser: ['Bot Personalizado', 'Chrome', '120'],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
        if (qr) qrcode.generate(qr, { small: true });

        if (connection === 'close') {
            const error = lastDisconnect?.error;
            const reason = new Boom(error || {}).output?.statusCode;
            const conflict = error?.message?.includes('conflict');

            if (conflict) {
                logger.warn('⚠️ Sesión reemplazada por otra instancia. Abortando reconexión.');
                return process.exit(1); // o detener el bot
            }

            if (reason === DisconnectReason.loggedOut) {
                logger.warn('🔒 Sesión cerrada. Escaneá el QR nuevamente.');
            } else {
                logger.warn('⚠️ Conexión cerrada. Reconectando...');
            }

            await delay(3000, 'Reconexión automática');
            return startBot();
        }

        if (connection === 'open') {
            logger.info('✅ Bot conectado correctamente.');
            const { platform, device } = sock.authState.creds;
            logger.info(`🧪 Sesión actual: ${platform} (${device})`);
            logger.info(`✅ ¿Sesión Android?: ${platform === 'android'}`);
        }
    });


    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        for (const msg of messages) {
            if (!msg?.message || msg.key.fromMe || type !== 'notify') continue;
            try {
                await messageHandler(sock, msg);
            } catch (err) {
                if (err.message?.includes('No matching sessions')) {
                    logger.warn('⚠️ Mensaje no descifrado. Ignorado.');
                } else {
                    logger.error(`❌ Error en messageHandler: ${err.message}`);
                }
            }
        }
    });
};

module.exports = startBot;
