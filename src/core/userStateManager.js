//ssrc/core/userStateManager.js
const userStates = new Map();

function setUserState(userId, estado) {
    const prev = userStates.get(userId) || {};
    userStates.set(userId, {
        estado,
        saludoEnviado: estado === 'inactivo' ? false : prev.saludoEnviado ?? false,
        pidioProductos: prev.pidioProductos ?? false,
        pidioDireccion: prev.pidioDireccion ?? false,
        timestamp: Date.now()
    });
}

function getUserState(userId) {
    return userStates.get(userId) || {
        estado: 'activo',
        saludoEnviado: false,
        pidioProductos: false,
        pidioDireccion: false,
        timestamp: null
    };
}

function marcarSaludo(userId) {
    const estado = getUserState(userId);
    userStates.set(userId, {
        ...estado,
        saludoEnviado: true
    });
}

function debeEnviarSaludo(userId) {
    const estado = getUserState(userId);
    return !estado.saludoEnviado;
}

function marcarPedido(userId, tipo) {
    const estado = getUserState(userId);
    userStates.set(userId, {
        ...estado,
        [tipo]: true
    });
}

module.exports = {
    setUserState,
    getUserState,
    marcarSaludo,
    debeEnviarSaludo,
    marcarPedido
};
