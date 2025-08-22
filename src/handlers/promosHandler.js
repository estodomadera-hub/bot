// src/handlers/promosHandler.js
const { setUserState, marcarPedido } = require('../core/userStateManager');

async function handlePromociones(sock, sender, message = {}) {
    setUserState(sender, 'activo');

    const texto = (
        message?.conversation ||
        message?.extendedTextMessage?.text ||
        message?.text ||
        ''
    ).toLowerCase().trim();

    const accionDirectaRegex = /(quiero la promo|me interesa la promo|quiero mi promo)/;
    const promoRegex = /\b(promo|promos|promoción|promociones|oferta|ofertas|🎁)\b/;

    if (accionDirectaRegex.test(texto)) {
        marcarPedido(sender, 'pidioPromoDirecta');

        await sock.sendMessage(sender, {
            text: `🎁 ¡Genial! En un momento me comunico con vos para contarte cuál te corresponde. Gracias por tu interés 🙌`,
        });

        return;
    }

    if (promoRegex.test(texto)) {
        marcarPedido(sender, 'pidioPromociones');

        await sock.sendMessage(sender, {
            text: `🎯 Promociones especiales\n\nTenemos algunos beneficios pensados para vos:\n\n✅ 10% OFF pagando en efectivo o transferencia\n✅ Envío bonificado en compras grandes mayores a $200.000 (Capital y La Banda)\n✅ Precio especial por 2 o más estantes\n✅ Regalito sorpresa con tu primera compra\n\n🎁 ¿Querés saber cuál te corresponde?\nRespondé con “QUIERO MI PROMO” y te contamos más por privado.`,
        });

        return;
    }


    // 🟢 Sino esto: pedido directo si no hubo promoRegex
    if (accionDirectaRegex.test(texto)) {
        marcarPedido(sender, 'pidioPromoDirecta');

        await sock.sendMessage(sender, {
            text: `🎁 ¡Genial! En un momento me comunico con vos para contarte cuál te corresponde. Gracias por tu interés 🙌`,
        });

        return;
    }

    // 🕳️ Si no matchea nada, no responde
}

module.exports = { handlePromociones };
