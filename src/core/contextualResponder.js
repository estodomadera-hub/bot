// src/core/contextualResponder.js
const { getUserState } = require('./userStateManager');

function responder(userId, mensaje) {
    const { estado } = getUserState(userId);

    if (estado === 'inactivo') {
        return '¡Hola de nuevo! ¿Quieres retomar la conversación anterior o empezar algo nuevo?';
    }

    if (/despedida|chau|nos vemos/i.test(mensaje)) {
        return 'Perfecto, cierro sesión y te marco como inactivo. ¡Hasta la próxima!';
    }

    if (/problema|error|fallo/i.test(mensaje)) {
        return '¿Puedes darme más detalles del error? Así lo rastreamos paso a paso.';
    }

    return '¿Quieres que te ayude con algo más o seguimos con el flujo anterior?';
}

module.exports = { responder };
