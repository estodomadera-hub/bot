// src/handlers/promosHandler.js
function enviarPromociones(sock, sender) {
    return sock.sendMessage(sender, {
        text: `🎯 ¡Tenemos promociones increíbles esperándote!\n\n👉 *En nuestro catálogo: *https://wa.me/c/5493854864263*\n\n Facebook: https://www.facebook.com/estodomadera/photos\n\n Instagram: https://www.instagram.com/estodomadera/\n\n🛍️ Elegí lo que más te guste y escribinos para coordinar tu pedido 😃.`,
    });
}

module.exports = { enviarPromociones };
