// src/handler/ubicacionHandler.js
const { setUserState, getUserState, marcarPedido } = require('../core/userStateManager');

const retiroRegex = /(retirar|retiro|coordinar|coordinemos|pasar a buscar)/i;
const cotizacionRegex = /(cuánto cuesta|cuanto costaría|presupuesto|envío|estoy en|mi dirección|mi ubicación|código postal|localidad)/i;
const ubicacionRegex = /\b(d[oó]nde est[aá]n|d[oó]nde queda|de d[oó]nde sos|d[oó]nde sos|de d[oó]nde son|d[oó]nde son|c[oó]mo llego|ubicaci[oó]n|est[aá]n en|est[aá]n ubicados?)\b/i;
const envioRegex = /\b(env[ií]os?|env[ií]an|env[ií]as|mandan|mand[aá]s|hac[eé]s env[ií]os?)\b/i;
const afirmativoRegex = /^(sí|si|dale|ok|quiero hablar|quiero asesor|bueno)$/i;
const negativoRegex = /^(no|no gracias|no hace falta)$/i;
const localidadRegex = /(soy de|estoy en|vivo en|mi ciudad es|la banda|villa maría|rosario|córdoba|tucumán|salta|bs as|buenos aires)/i;

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

    const estado = getUserState(sender);

    // 🧭 Mensaje inicial de ubicación
    if (ubicacionRegex.test(texto)) {
        marcarPedido(sender, 'pidioUbicacion');

        await sock.sendMessage(sender, {
            text: `Encontranos Aquí 👉 http://www.google.com.ar/maps/place/ESTODOMADERA/data=!4m2!3m1!1s0x0:0xf24ec161700ba6a8?sa=X&ved=1t:2428&hl=es-419&gl=ar&ictx=111\n\n🧭 Estamos en Santiago del Estero, capital. *Pasaje San Lorenzo 1261 Barrio Ramón Carrillo*\n\n🚚 Hacemos envíos a todo el país.\n\n✅ También podés retirar en persona coordinando previamente.\n\nCostos y tiempos de entrega varían según la zona.\n\n📦 ¿Dónde estás ubicado/a? Podemos calcular el costo de envío si nos decís tu localidad o código postal.`,
        });

        return;
    }

    // 🚚 Si pregunta si hacen envíos
    if (envioRegex.test(texto)) {
        marcarPedido(sender, 'preguntoEnvio');

        await sock.sendMessage(sender, {
            text: `🚚 Sí, hacemos envíos a todo el país. También podés retirar en persona si preferís. ¿Querés que te ayudemos a calcular el costo según tu localidad?`,
        });

        return;
    }

    // 🟢 Si menciona retiro
    if (retiroRegex.test(texto)) {
        marcarPedido(sender, 'quiereRetirar');

        await sock.sendMessage(sender, {
            text: `✅ Podés retirar en persona coordinando previamente. ¿Querés que te ayudemos a coordinar el retiro?`,
        });

        return;
    }

    // 📦 Si menciona cotización o ubicación
    if (cotizacionRegex.test(texto)) {
        marcarPedido(sender, 'pidioCotizacion');

        await sock.sendMessage(sender, {
            text: `🧮 ¿Necesitás hablar con un asesor para calcular el costo de envío? Respondé con *sí* o *no*.`,
        });

        return;
    }

    // 🎯 Si responde “sí” después de preguntar por envíos
    if (afirmativoRegex.test(texto) && estado?.preguntoEnvio) {
        marcarPedido(sender, 'pidioCotizacion');

        await sock.sendMessage(sender, {
            text: `📍 Perfecto. Decinos tu localidad o código postal y te pasamos el costo estimado del envío.`,
        });

        return;
    }

    // 🏙️ Si menciona localidad después de pedir cotización
    if (localidadRegex.test(texto) && estado?.pidioCotizacion) {
        marcarPedido(sender, 'envioLocalidad');

        await sock.sendMessage(sender, {
            text: `📦 Gracias. En breve te pasamos el costo estimado para *${texto}*. Si querés hablar con un asesor, respondé con *quiero hablar*.`,
        });

        return;
    }

    // 🎁 Si responde afirmativamente sin contexto previo
    if (afirmativoRegex.test(texto)) {
        marcarPedido(sender, 'confirmoAsesor');

        await sock.sendMessage(sender, {
            text: `🎁 ¡Genial! En un momento me comunico con vos para contarte cuál te corresponde. Gracias por tu interés 🙌`,
        });

        return;
    }

    // 📋 Si responde negativamente
    if (negativoRegex.test(texto)) {
        marcarPedido(sender, 'rechazoAsesor');

        const textoOpciones = `📌 Estas son algunas opciones disponibles:\n\n${opciones.map(o => o.label).join('\n')}`;

        await sock.sendMessage(sender, { text: textoOpciones });
        return;
    }
}

module.exports = { handleUbicacion };
