// src/handlers/messageHandler.js
const { debeEnviarSaludo } = require('../core/userStateManager');
const { handlePromociones } = require('./promosHandler');
const { handleCatalogo } = require('./catalogoHandler');
const { handleUbicacion } = require('./ubicacionHandler');
const { handleContacto } = require('./contactoHandler');
const { handlePrecio } = require('./precioHandler');
const { detectarContexto } = require('../utils/intencionDetector');
const { enviarSaludoInicial } = require('../utils/saludoInicial');

// Regex por intención para frases naturales
const envioRegex = /(env[ií]os?|mandan|env[ií]an a domicilio)/i;
const promocionesRegex = /(promo|promociones|ofertas|descuentos|vigentes)/i;
const catalogoRegex = /(cat[aá]logo|productos|ver muebles|mostrar modelos|estantes)/i;
const contactoRegex = /(asesor|consultar|ayuda|comunicarme|quiero hablar)/i;

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

    // 🔍 Regex natural
    if (envioRegex.test(textoPlano)) return handleUbicacion(sock, sender, rawMessage);
    if (promocionesRegex.test(textoPlano)) return handlePromociones(sock, sender, rawMessage);
    if (catalogoRegex.test(textoPlano)) return handleCatalogo(sock, sender);
    if (contactoRegex.test(textoPlano)) return handleContacto(sock, sender);

    // 🔁 Contexto o botón
    switch (contexto || buttonId) {
        case 'promociones': return handlePromociones(sock, sender, rawMessage);
        case 'catalogo': return handleCatalogo(sock, sender);
        case 'ubicacion': return handleUbicacion(sock, sender, rawMessage);
        case 'contacto': return handleContacto(sock, sender);
        case 'precio': return handlePrecio(sock, sender);
    }
};

module.exports = messageHandler;
