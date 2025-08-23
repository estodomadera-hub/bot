// src/handlers/precioHandler.js
const { setUserState } = require('../core/userStateManager');

async function handlePrecio(sock, sender) {
    setUserState(sender, 'activo');

    const mensaje = `💬 Gracias por tu interés en nuestros estantes.\n\nFabricamos modelos de madera de pino con terminación tipo industrial (parecen de metal, pero son 100% madera maciza 💪).\n\nLos precios varían según modelo, tamaño y cantidad.\nPara darte el mejor precio, ¿cuántas unidades estás buscando y de qué tamaño aprox.?\n\n👉 También podés ver fotos y precios en nuestro catálogo:\n🔗 https://wa.me/c/5493854864263\n\nEstamos para ayudarte a elegir lo mejor para tu espacio 😊`;

    await sock.sendMessage(sender, { text: mensaje });
}

module.exports = { handlePrecio };
