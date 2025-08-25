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
const envioRegex = /\b(env[ií]os?|env[ií]an|env[ií]as|mandan|mand[aá]s|hac[eé]s env[ií]os?)\b/i;
const promocionesRegex = /(promociones|ofertas|descuentos|promo|vigentes)/i;
const catalogoRegex = /(catálogo|catalogo|productos|ver estantes|quiero ver|mostrar modelos|ver muebles|ver productos|estantes|muebles)/i;
const contactoRegex = /(asesor|hablar|consultar|quiero ayuda|quiero hablar|necesito ayuda|quiero consultar|quiero comunicarme)/i;
const afirmativoRegex = /^(sí|si|dale|ok|quiero hablar|quiero asesor|bueno)$/i;
const localidadRegex = /(soy de|estoy en|vivo en|mi ciudad es|la banda|villa maría|rosario|córdoba|tucumán|salta|bs as|buenos aires)/i;
const ubicacionRegex = /\b(d[oó]nde est[aá]n|d[oó]nde queda|de d[oó]nde sos|d[oó]nde sos|de d[oó]nde son|d[oó]nde son|c[oó]mo llego|ubicaci[oó]n|est[aá]n en|est[aá]n ubicados?)\b/i;

const messageHandler = async (sock, msg) => {
    const sender = msg.key.remoteJid;
    const buttonId = msg.message?.buttonsResponseMessage?.selectedButtonId ||
        msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId;

    const isAndroid = msg.key.id?.includes(':');
    const rawMessage = msg.message;

    if (!rawMessage && !buttonId) return;

    let textoPlano = '';

    try {
        textoPlano = rawMessage?.conversation || rawMessage?.extendedTextMessage?.text || '';
    } catch (err) {
        // ⚠️ Error de descifrado → ignorar sin responder
        if (err.message?.includes('Bad MAC') || err.message?.includes('No matching sessions')) {
            console.warn(`Mensaje no descifrado de ${sender}. Ignorado.`);
            return;
        }
        throw err;
    }

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
    if (afirmativoRegex.test(textoPlano)) return handleUbicacion(sock, sender, rawMessage);
    if (localidadRegex.test(textoPlano)) return handleUbicacion(sock, sender, rawMessage);
    if (ubicacionRegex.test(textoPlano)) return handleUbicacion(sock, sender, rawMessage);

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

    if (contexto === 'envio') {
        return handleUbicacion(sock, sender, rawMessage);
    }
};

module.exports = messageHandler;
