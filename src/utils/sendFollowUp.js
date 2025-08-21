// src/utils/sendFollowUp.js
const { sendMenu, sendMenuTexto } = require('./buttonManager');

const opcionesMap = {
    promociones: { id: 'promociones', label: '1️⃣ VER PROMOCIONES' },
    catalogo:  { id: 'catalogo', label: '2️⃣ VER CATÁLOGO' },
    ubicacion: { id: 'ubicacion', label: '3️⃣ VER UBICACIÓN' },
    contacto:  { id: 'contacto', label: '4️⃣ CONTACTARME' },
};

const opcionesConfirmacion = [
    { id: 'si', label: '✅ SÍ' },
    { id: 'no', label: '❌ NO' },
];

const sendFollowUp = async (sock, jid, isAndroid) => {
    await sock.sendMessage(jid, { text: '¿Necesitás algo más?' });

    if (isAndroid) {
        await sendMenu(sock, jid, true, opcionesConfirmacion);
    } else {
        await sendMenuTexto(sock, jid, opcionesConfirmacion);
    }
};

const manejarRespuestaFollowUp = async (sock, jid, isAndroid, mensaje) => {
    const respuesta = mensaje.trim().toLowerCase();

    if (['sí', 'si', '✅ sí'].includes(respuesta)) {
        const opciones = [
            opcionesMap.promociones,
            opcionesMap.catalogo,
            opcionesMap.ubicacion,
            opcionesMap.contacto,
        ];
        if (isAndroid) {
            await sendMenu(sock, jid, true, opciones);
        } else {
            await sendMenuTexto(sock, jid, opciones);
        }
    } else if (['no', '❌ no'].includes(respuesta)) {
        await sock.sendMessage(jid, { text: '👋 Hasta luego, que tengas buen día!' });
    } else {
        await sendFollowUp(sock, jid, isAndroid); // Reintenta la pregunta
    }
};

module.exports = {
    sendFollowUp,
    manejarRespuestaFollowUp
};
