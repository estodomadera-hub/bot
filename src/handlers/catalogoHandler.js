// src/handlers/catalogoHandler.js
const { setUserState, marcarPedido } = require('../core/userStateManager');

// Regex tolerante para detectar intención de ver el catálogo
const catalogoRegex = /\b(q?uiero ver el cat[aá]l[oó]g[oó]|me podr[ií]as pasar( el)? cat[aá]l[oó]g[oó]|cat[aá]l[oó]g[oó]|catalogo|catalovo|productos|ver productos|mostrar productos|pasame el catalogo|productos disponibles)\b/i;

async function handleCatalogo(sock, sender) {
    setUserState(sender, 'activo');
    marcarPedido(sender, 'pidioCatalogo');

    const mensajeIntro = `🛍️ *Catálogo de estantes disponibles*\n\nTenemos varios modelos hechos en madera de pino con terminación estilo industrial (parecen metálicos, pero son 100% madera).\n\nPodés ver todos los productos con fotos, medidas y precios en el siguiente enlace:`;

    const mensajeLinks = `🟢 *Catálogo por WhatsApp*\nhttps://wa.me/c/5493854864263\n\n📲 *Seguinos en redes:*\nInstagram 👉 https://www.instagram.com/estodomadera/\n\nFacebook 👉 https://www.facebook.com/estodomadera`;

    await sock.sendMessage(sender, { text: mensajeIntro });
    await sock.sendMessage(sender, { text: mensajeLinks });
}

module.exports = { handleCatalogo, catalogoRegex };