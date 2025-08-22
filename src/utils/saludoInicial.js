const { sendMenu } = require('./buttonManager');
const { marcarSaludo } = require('../core/userStateManager');

const enviarSaludoInicial = async (sock, sender, isAndroid) => {
    await sock.sendMessage(sender, {
        image: { url: './src/img/inicial.webp' },
        caption: '',
    });

    await sock.sendMessage(sender, {
        text: `👋 ¡Hola! Gracias por escribirnos.\n📅 Nuestro horario de atención es de lunes a sábado, de 7 a 21 hs.\n¿Cómo podemos ayudarte hoy? Respondé con el número de la opción que te interese y te guiamos:\n\n1️⃣ Ver promociones vigentes\n2️⃣ Explorar nuestro catálogo completo\n3️⃣ Ver ubicación y formas de entrega\n4️⃣ Hablar con un asesor ahora\n\n😉 Estamos para ayudarte, ¡elegí la opción que necesites!`,
    });

    const opciones = [
        { id: 'promociones', label: '1️⃣ Ver promociones vigentes' },
        { id: 'catalogo', label: '2️⃣ Explorar nuestro catálogo completo' },
        { id: 'ubicacion', label: '3️⃣ Ver ubicación y formas de entrega' },
        { id: 'contacto', label: '4️⃣ Hablar con un asesor ahora' }
    ];

    // Si querés mostrar botones interactivos:
    // await sendMenu(sock, sender, isAndroid, opciones);

    marcarSaludo(sender);
};

module.exports = { enviarSaludoInicial };
