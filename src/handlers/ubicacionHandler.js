// src/handler/ubicacionHandler.js
const { setUserState, marcarPedido } = require('../core/userStateManager');

async function handleUbicacion(sock, sender) {
    setUserState(sender, 'activo');
    marcarPedido(sender, 'pidioUbicacion');

    await sock.sendMessage(sender, {
        text: `📍 Ubicación y envíos\n\n🧭 Estamos en Santiago del Estero, capital. Pasaje San Lorenzo 1261 Barrio Ramón Carrillo\n🚚 Hacemos envíos a todo el país\n✅ También podés retirar en persona coordinando previamente.\n\nCostos y tiempos de entrega varían según la zona.\n📦 ¿Dónde estás ubicado/a? Podemos calcular el costo de envío si nos decís tu localidad o código postal.`,
    });
}

module.exports = { handleUbicacion };
