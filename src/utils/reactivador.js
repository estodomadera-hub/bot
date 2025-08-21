// utils/reactivador.js
const delay = require('./delay');
const { setUserState } = require('../core/userStateManager');
const logger = require('./logger');
const { sendMenuTexto } = require('./buttonManager');

const reactivarUsuario = async (sock, sender, motivo = '') => {
    const timeoutMin = parseInt(process.env.USER_INACTIVITY_TIMEOUT_MINUTES, 10) || 30;
    delay(timeoutMin * 60 * 1000, `Reactivación de ${sender}`).then(async () => {
        setUserState(sender, 'activo');
        logger.evento('REACTIVACIÓN', `Usuario ${sender} reactivado automáticamente tras ${timeoutMin} minutos (${motivo})`);
        await sock.sendMessage(sender, {
            text: '👋 ¡Estoy de vuelta!\n¿Querés seguir explorando el catálogo o hacer otra consulta?',
        });
        await sendMenuTexto(sock, sender);
    });
};

module.exports = { reactivarUsuario };
