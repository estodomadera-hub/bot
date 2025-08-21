// src/utils/buttonManager.js

const generarTextoOpciones = (opciones = []) => {
    const texto = opciones.length
        ? opciones.map(({ label }) => `${label.toUpperCase()}`).join('\n')
        : '🎯 VER PROMOCIONES \n 🛍️ VER CATÁLOGO\n 📍VER UBICACIÓN\n 💬 CONTACTAR UN ASESOR';

    return `${texto}`;
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
