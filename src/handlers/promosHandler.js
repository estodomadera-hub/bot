// src/handlers/promosHandler.js
const { esRespuestaImagenPromo } = require('../utils/respuestasUtils');

if (esRespuestaImagenPromo(contexto)) {
    await sock.sendMessage(sender, {
        text: '📞 En un momento me comunico con vos.',
    });
    return;
}
