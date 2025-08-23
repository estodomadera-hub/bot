// src/handlers/messageHandler.js
const { debeEnviarSaludo } = require('../core/userStateManager');
const { handlePromociones } = require('./promosHandler');
const { handleCatalogo } = require('./catalogoHandler');
const { handleUbicacion } = require('./ubicacionHandler');
const { handleContacto } = require('./contactoHandler');
const { handlePrecio } = require('./precioHandler');
const { detectarContexto } = require('../utils/intencionDetector');
const { enviarSaludoInicial } = require('../utils/saludoInicial');

// 🧠 Regex por intención para frases naturales
const envioRegex = /(hacés envíos|haces envios|envían|envian|envío disponible|envios disponibles|mandan|mandás|mandas|envían a domicilio)/i;
const promocionesRegex = /(promociones|ofertas|descuentos|promo|vigentes)/i;
const catalogoRegex = /(catálogo|catalogo|productos|ver estantes|quiero ver|mostrar modelos|ver muebles|ver productos|estantes|muebles)/i;
const contactoRegex = /(asesor|hablar|consultar|quiero ayuda|quiero hablar|necesito ayuda|quiero consultar|quiero comunicarme)/i;

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

    // 🔍 Validaciones por regex natural antes del contexto
    if (envioRegex.test(textoPlano)) return handleUbicacion(sock, sender, rawMessage);
    if (promocionesRegex.test(textoPlano)) return handlePromociones(sock, sender, rawMessage);
    if (catalogoRegex.test(textoPlano)) return handleCatalogo(sock, sender);
    if (contactoRegex.test(textoPlano)) return handleContacto(sock, sender);

    // 🔁 Delegación por contexto o botón
    if (contexto === 'promociones' || buttonId === 'promociones') {
        return handlePromociones(sock, sender, rawMessage);
    }

    if (contexto === 'catalogo' || buttonId === 'catalogo') {
        return handleCatalogo(sock, sender);
    }

    if (contexto === 'ubicacion' || buttonId === 'ubicacion') {
        return handleUbicacion(sock, sender, rawMessage);
    }

    if (contexto === 'contacto' || buttonId === 'contacto') {
        return handleContacto(sock, sender);
    }

    if (contexto === 'precio') {
        return handlePrecio(sock, sender);
    }
};

module.exports = messageHandler;
