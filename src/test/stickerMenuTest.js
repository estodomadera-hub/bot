const { sendMessage } = require('../core/sockWrapper'); // o directamente sock.sendMessage si no tenés wrapper

const enviarStickerMenuTest = async (sock, sender) => {
    // 🟢 Sticker de promociones
    await sock.sendMessage(sender, {
        sticker: { url: './src/img/stickers/promos.webp' }
    });
    await sock.sendMessage(sender, {
        text: '🤑 ¿Querés ver nuestras promociones vigentes? Escribí "promos", "ofertas" o simplemente "1".'
    });

    // 🟡 Sticker de catálogo
    await sock.sendMessage(sender, {
        sticker: { url: './src/img/stickers/catalogo.webp' }
    });
    await sock.sendMessage(sender, {
        text: '📦 ¿Querés explorar el catálogo completo? Podés escribir "catálogo", "productos" o "2".'
    });

    // 🔵 Sticker de ubicación
    await sock.sendMessage(sender, {
        sticker: { url: './src/img/stickers/ubicacion.webp' }
    });
    await sock.sendMessage(sender, {
        text: '📍 ¿Querés saber dónde estamos? Escribí "ubicación", "cómo llegar" o "3".'
    });

    // 🔴 Sticker de contacto
    await sock.sendMessage(sender, {
        sticker: { url: './src/img/stickers/contacto.webp' }
    });
    await sock.sendMessage(sender, {
        text: '📞 ¿Necesitás hablar con alguien? Escribí "asesor", "ayuda" o "4".'
    });
};

const frasesPorContexto = {
    promociones: [
        'promos', 'promociones', 'ver las promos', 'ver promociones', 'ofertas', 'descuentos',
        'el sticker de promociones', 'el sticker de las promos'
    ],
    catalogo: [
        'catálogo', 'ver catálogo', 'pasame el catálogo', 'quiero ver productos', 'mostrar productos',
        'el sticker del catálogo', 'el sticker de productos'
    ],
    ubicacion: [
        'ubicación', 'dónde están', 'cómo llegar', 'dónde puedo ir', 'ver estantes', 'dirección',
        'el sticker de ubicación', 'el sticker del mapa'
    ],
    contacto: [
        'hablar con alguien', 'asesor', 'necesito ayuda', 'quiero hablar', 'me pueden llamar', 'contacto',
        'el sticker de contacto', 'el sticker del asesor'
    ],
    precio: [
        'precio', 'cuánto sale', 'cuánto cuesta', 'valor', 'me decís el precio',
        'el sticker del precio'
    ]
};


module.exports = { enviarStickerMenuTest };
