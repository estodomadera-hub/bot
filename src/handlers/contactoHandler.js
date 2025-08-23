// src/handlers/contactoHandler.js
const delay = require('../utils/delay');
const { setUserState, marcarPedido } = require('../core/userStateManager');

async function handleContacto(sock, sender) {
    setUserState(sender, 'inactivo');
    marcarPedido(sender, 'pidioContacto');

    await sock.sendMessage(sender, {
        text: `💬 Ya te derivamos con un asesor\n\nEn breve alguien de nuestro equipo te va a responder personalmente.\nSi es fuera del horario de atención, te vamos a responder dentro del horario habitual:\n🕒 Lunes a sábado de 7 a 21 hs.\n\n¡Gracias por tu paciencia! 🙌`,
    });

    const timeoutMin = parseInt(process.env.USER_INACTIVITY_TIMEOUT_MINUTES, 10) || 30;

    delay(timeoutMin * 60 * 1000).then(async () => {
        setUserState(sender, 'activo');
        await sock.sendMessage(sender, {
            text: `👋 ¡Estoy de vuelta!\n¿Querés seguir explorando el catálogo o hacer otra consulta?`,
        });
    });
}

module.exports = { handleContacto };
