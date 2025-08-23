// src/handlers/ubicacionHandler.js
const { setUserState, marcarPedido } = require('../core/userStateManager');

const retiroRegex = /(retirar|retiro|coordinar|coordinemos|pasar a buscar)/i;
const cotizacionRegex = /(cu[aá]nto cuesta|cu[aá]nto costar[ií]a|presupuesto|env[ií]o|direcci[oó]n|ubicaci[oó]n|c[oó]digo postal|localidad|estoy en)/i;
const ubicacionRegex = /(d[oó]nde est[aá]n|d[oó]nde queda|de d[oó]nde sos|c[oó]mo llego|ubicaci[oó]n|est[aá]n en|ubicados)/i;
const afirmativoRegex = /^(s[ií]|dale|ok|quiero hablar|quiero asesor)$/i;
const negativoRegex = /^(no|no gracias|no hace falta)$/i;

const opciones = [
    { id: 'promociones', label: '1️⃣ Ver promociones vigentes' },
    { id: 'catalogo', label: '2️⃣ Explorar nuestro catálogo completo' },
    { id: 'ubicacion', label: '3️⃣ Ver ubicación y formas de entrega' },
    { id: 'contacto', label: '4️⃣ Hablar con un asesor ahora' }
];

async function handleUbicacion(sock, sender, message = {}) {
    setUserState(sender, 'activo');

    const texto = (
        message?.conversation ||
        message?.extendedTextMessage?.text ||
        message?.text ||
        ''
    ).toLowerCase().trim();

    if (ubicacionRegex.test(texto)) {
        marcarPedido(sender, 'pidioUbicacion');
        await sock.sendMessage(sender, {
            text: `📍 Encontranos aquí 👉 http://www.google.com.ar/maps/place/ESTODOMADERA/data=!4m2!3m1!1s0x0:0xf24ec161700ba6a8?sa=X&ved=1t:2428&hl=es-419&gl=ar&ictx=111\n\n🧭 Estamos en Santiago del Estero, capital. *Pasaje San Lorenzo 1261 Barrio Ramón Carrillo*\n\n🚚 Hacemos envíos a todo el país.\n✅ También podés retirar en persona coordinando previamente.\n\n📦 ¿Dónde estás ubicado/a? Podemos calcular el costo de envío si nos decís tu localidad o código postal.`,
        });
        return;
    }

    if (retiroRegex.test(texto)) {
        marcarPedido(sender, 'quiereRetirar');
        await sock.sendMessage(sender, {
            text: `✅ Podés retirar en persona coordinando previamente. ¿Querés que te ayudemos a coordinar el retiro?`,
        });
        return;
    }

    if (cotizacionRegex.test(texto)) {
        marcarPedido(sender, 'pidioCotizacion');
        await sock.sendMessage(sender, {
            text: `🧮 ¿Necesitás hablar con un asesor para calcular el costo de envío? Respondé con *sí* o *no*.`,
        });
        return;
    }

    if (afirmativoRegex.test(texto)) {
        marcarPedido(sender, 'confirmoAsesor');
        await sock.sendMessage(sender, {
            text: `🎁 ¡Genial! En un momento me comunico con vos para contarte cuál te corresponde. Gracias por tu interés 🙌`,
        });
        return;
    }

    if (negativoRegex.test(texto)) {
        marcarPedido(sender, 'rechazoAsesor');
        const textoOpciones = `📌 Estas son algunas opciones disponibles:\n\n${opciones.map(o => o.label).join('\n')}`;
        await sock.sendMessage(sender, { text: textoOpciones });
        return;
    }
}

module.exports = { handleUbicacion };
