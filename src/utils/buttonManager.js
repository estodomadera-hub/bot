// src/utils/buttonManager.js

const generarTextoOpciones = (opciones = [], encabezado = '📋 Respondeme:') => {
    const texto = opciones.length
        ? opciones.map(({ label }) => `${label.toUpperCase()}`).join('\n')
        : '🎯 VER PROMOCIONES \n 🛍️ VER CATÁLOGO\n 📍VER UBICACIÓN\n 💬 CONTACTARME';

    return `${encabezado}\n\n${texto}\n\nEscribí solo el número o lo que está resaltado.`;
};

const sendMenuTexto = async (sock, jid, opciones = []) => {
    const texto = generarTextoOpciones(opciones);
    await sock.sendMessage(jid, { text: texto });
};

const sendMenu = async (sock, jid, isAndroid, opciones = []) => {
    if (isAndroid) {
        const buttons = opciones.map(({ id, label }) => ({
            buttonId: id,
            buttonText: { displayText: label },
            type: 1,
        }));

        await sock.sendMessage(jid, {
            text: '📋 Seleccioná una opción:',
            buttons,
        });
    } else {
        await sendMenuTexto(sock, jid, opciones);
    }
};

module.exports = {
    sendMenuTexto,
    sendMenu,
    generarTextoOpciones
};
