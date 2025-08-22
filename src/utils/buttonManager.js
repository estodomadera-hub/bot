// src/utils/buttonManager.js

const generarTextoOpciones = (opciones = []) => {
    if (!opciones.length) {
        return `1️⃣ Ver promociones vigentes\n2️⃣ Explorar nuestro catálogo completo\n3️⃣ Ver ubicación y formas de entrega\n4️⃣ Hablar con un asesor ahora`;
    }

    return opciones.map(({ label }, i) => `${i + 1}️⃣ ${label}`).join('\n');
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
