// src/handlers/messageHandler.js
const { debeEnviarSaludo } = require('../core/userStateManager');
const { handlePromociones } = require('./promosHandler');
const { handleCatalogo } = require('./catalogoHandler');
const { handleUbicacion } = require('./ubicacionHandler');
const { handleContacto } = require('./contactoHandler');
const { handlePrecio } = require('./precioHandler');
const { detectarContexto } = require('../utils/intencionDetector');
const { enviarSaludoInicial } = require('../utils/saludoInicial');

const messageHandler = async (sock, msg) => {
    const sender = msg.key.remoteJid;
    const buttonId = msg.message?.buttonsResponseMessage?.selectedButtonId ||
        msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId;

    const isAndroid = msg.key.id?.includes(':');
    const rawMessage = msg.message;

    if (!rawMessage && !buttonId) return;

    const textoPlano = rawMessage?.conversation || rawMessage?.extendedTextMessage?.text || '';
    const contexto = detectarContexto(textoPlano);

    // 🧪 Test de stickers
    if (contexto === 'teststickers') return enviarStickerMenuTest(sock, sender);

    // 👋 Saludo inicial
    if (debeEnviarSaludo(sender)) {
        await enviarSaludoInicial(sock, sender, isAndroid);
        return;
    }

    // 🔁 Delegación por contexto
    if (contexto === 'promociones' || buttonId === 'promociones') {
        return handlePromociones(sock, sender, rawMessage);
    }

    if (contexto === 'catalogo' || buttonId === 'catalogo') {
        return handleCatalogo(sock, sender);
    }

    if (contexto === 'ubicacion' || buttonId === 'ubicacion') {
        return handleUbicacion(sock, sender);
    }

    if (contexto === 'contacto' || buttonId === 'contacto') {
        return handleContacto(sock, sender);
    }

    if (contexto === 'precio') {
        return handlePrecio(sock, sender);
    }
};

module.exports = messageHandler;
