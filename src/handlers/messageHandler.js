// src/handlers/messageHandler.js
const iaResponder = require('../core/iaResponder');
const delay = require('../utils/delay');
const logger = require('../utils/logger');
const { sendFollowUp } = require('../utils/sendFollowUp');
const { sendMenuTexto } = require('../utils/buttonManager');
const { responder } = require('../core/contextualResponder');
const { manejarRespuestaFollowUp } = require('../utils/sendFollowUp');
const {
    setUserState,
    getUserState,
    debeEnviarSaludo,
    marcarSaludo,
    marcarPedido
} = require('../core/userStateManager');
const { esRespuestaImagenPromo } = require('../utils/respuestasUtils');

// 🧠 Historial por usuario para mantener contexto
const historialPorUsuario = {};

// 🎯 Mapeo de números y palabras
const opcionesNumericas = {
    '1': 'promociones', 'uno': 'promociones',
    '2': 'catalogo', 'dos': 'catalogo',
    '3': 'ubicacion', 'tres': 'ubicacion',
    '4': 'contacto', 'cuatro': 'contacto',
};

const messageHandler = async (sock, msg) => {
    const sender = msg.key.remoteJid;
    const message = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    const buttonId = msg.message?.buttonsResponseMessage?.selectedButtonId ||
        msg.message?.listResponseMessage?.singleSelectReply?.selectedRowId;

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const quotedText = quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text;
    const isReply = !!quotedText;
    const isReplyToProduct =
        quotedMsg?.productMessage ||
        quotedText?.includes('wa.me/c/') ||
        quotedText?.startsWith('*') ||
        quotedText?.toLowerCase().includes('estantería') ||
        quotedText?.toLowerCase().includes('madera');

    const lowerMsg = message?.toLowerCase().trim();
    let contexto = isReply ? `${quotedText.toLowerCase().trim()} → ${lowerMsg}` : lowerMsg;

    // 🎯 Interpretar número o palabra como comando
    if (opcionesNumericas[contexto]) {
        logger.evento('NUMERO_RECONOCIDO', `Usuario ${sender} envió "${contexto}" → interpretado como "${opcionesNumericas[contexto]}"`);
        contexto = opcionesNumericas[contexto];
    }

    const userState = getUserState(sender);
    const isAndroid = msg.key.id?.includes(':');

    if (!message && !buttonId) return;

    if (userState.estado === 'inactivo') {
        console.log('⏸️ Usuario en estado inactivo. No se responde hasta reactivación manual.');
        return;
    }

    console.log(`🧪 ID del mensaje: ${msg.key.id}`);
    console.log(`✅ ¿Cliente Android?: ${isAndroid}`);
    console.log(`📨 Mensaje recibido: ${lowerMsg}`);
    console.log(`🧠 Contexto interpretado: ${contexto}`);
    console.log('📊 Estado actual del usuario:', debeEnviarSaludo(sender) ? 'sin saludo' : 'ya saludado');

    // 📦 Mensaje desde el catálogo (prioridad absoluta)
    if (isReplyToProduct) {
        setUserState(sender, 'inactivo');
        marcarPedido(sender, 'mensajeDesdeCatalogo');

        const nombreProducto = quotedMsg?.productMessage?.product?.name ||
            quotedText?.split('\n')[0]?.replace(/\*/g, '').trim() ||
            'Producto desconocido';

        const comentarioUsuario = message?.trim() || '(sin mensaje)';

        logger.evento('MENSAJE_DESDE_CATALOGO', {
            usuario: sender,
            producto: nombreProducto,
            comentario: comentarioUsuario
        });

        await sock.sendMessage(sender, {
            text: '📞 En un momento me comunico con vos.',
        });

        const timeoutMin = parseInt(process.env.USER_INACTIVITY_TIMEOUT_MINUTES, 10) || 30;
        delay(timeoutMin * 60 * 1000, `Reactivación de ${sender}`).then(async () => {
            setUserState(sender, 'activo');
            logger.evento('REACTIVACIÓN', `Usuario ${sender} reactivado automáticamente tras ${timeoutMin} minutos (mensaje desde catálogo)`);

            await sock.sendMessage(sender, {
                text: '👋 ¡Estoy de vuelta!\n¿Querés seguir explorando el catálogo o hacer otra consulta?',
            });

            await sendMenuTexto(sock, sender);
        });

        return;
    }

    // 🧠 Saludo inicial con imagen
    if (debeEnviarSaludo(sender)) {
        await sock.sendMessage(sender, {
            image: { url: './src/img/inicial.png' },
            caption: '', // sin texto
        });
        marcarSaludo(sender);
        return;
    }

    // 📍 Dirección
    if (
        contexto?.includes('ubicacion') || contexto?.includes('son') || contexto?.includes('donde') ||
        buttonId === 'ubicacion'
    ) {
        setUserState(sender, 'activo');
        marcarPedido(sender, 'pidioUbicacion');
        await sock.sendMessage(sender, {
            text: '📍Ubicación: www.google.com.ar/maps/place/ESTODOMADERA/data=!4m2!3m1!1s0x0:0xf24ec161700ba6a8?sa=X&ved=1t:2428&hl=es-419&gl=ar&ictx=111',
        });
        await sendFollowUp(sock, sender, isAndroid);
        return;
    }

    // 🛍️ Productos
    if (
        contexto?.includes('catalogo') || contexto?.includes('producto') || buttonId === 'catalogo'
    ) {
        setUserState(sender, 'activo');
        marcarPedido(sender, 'pidioCatalogo');
        await sock.sendMessage(sender, {
            text: '🛍️ Puedes ver los artículos disponibles en mi catálogo:\n\n👉 *https://wa.me/c/5493855941088*',
        });
        await sendFollowUp(sock, sender, isAndroid);
        return;
    }

    // 🎯 Promociones con imágenes
    if (
        contexto?.includes('promocion') || contexto?.includes('oferta') || buttonId === 'promociones'
    ) {
        setUserState(sender, 'activo');
        marcarPedido(sender, 'pidioPromociones');

        const imagenesPromo = [
            'src/img/promos/1.jpeg'
        ];

        for (const imgPath of imagenesPromo) {
            await sock.sendMessage(sender, {
                image: { url: imgPath },
                caption: '🎯 Te invito a aprovechar nuestra PROMO!!! 😃.'
            });
        }

        return;
    }

    // 📞 Respuesta automática si responde a imagen de promoción
    if (contexto?.includes('promo') && esRespuestaImagenPromo(contexto)) {
        await sock.sendMessage(sender, {
            text: '📞 En un momento me comunico con vos.',
        });
        return;
    }


    // 📞 Contacto directo
    if (
        contexto?.includes('pedido') || contexto?.includes('chatear') || contexto?.includes('dueño') ||
        contexto?.includes('pagar') || contexto?.includes('vos') ||
        contexto?.includes('contacto') || contexto?.includes('asesor') || buttonId === 'contacto'
    ) {
        setUserState(sender, 'inactivo');
        marcarPedido(sender, 'pidioContacto');
        await sock.sendMessage(sender, {
            text: '📞 En un momento me comunico con vos.',
        });

        const timeoutMin = parseInt(process.env.USER_INACTIVITY_TIMEOUT_MINUTES, 10) || 30;
        delay(timeoutMin * 60 * 1000, `Reactivación de ${sender}`).then(async () => {
            setUserState(sender, 'activo');
            logger.evento('REACTIVACIÓN', `Usuario ${sender} reactivado automáticamente tras ${timeoutMin} minutos (contacto directo)`);

            await sock.sendMessage(sender, {
                text: '👋 ¡Estoy de vuelta!\n¿Querés seguir explorando el catálogo o hacer otra consulta?',
            });

            await sendMenuTexto(sock, sender);
        });

        return;
    }

    // 🔁 Manejo de respuesta al seguimiento
    const respuestaFollowUp = lowerMsg || buttonId;
    if (['✅ sí', '❌ no'].includes(respuestaFollowUp)) {
        await manejarRespuestaFollowUp(sock, sender, isAndroid, respuestaFollowUp);
        return;
    }

    // 👋 Despedida
    if (
        contexto?.includes('chau') || contexto?.includes('nos vemos') ||
        contexto?.includes('no') || contexto?.includes('adios')
    ) {
        setUserState(sender, 'inactivo');
        await sock.sendMessage(sender, {
            text: '👋 Hasta luego, que tengas buen día!',
        });

        const timeoutMin = parseInt(process.env.USER_INACTIVITY_TIMEOUT_MINUTES, 10) || 30;
        delay(timeoutMin * 60 * 1000, `Reactivación de ${sender}`).then(async () => {
            setUserState(sender, 'activo');
            logger.evento('REACTIVACIÓN', `Usuario ${sender} reactivado automáticamente tras ${timeoutMin} minutos (despedida)`);

            await sock.sendMessage(sender, {
                text: '👋 ¡Estoy de vuelta!\n¿Querés seguir explorando el catálogo o hacer otra consulta?',
            });

            await sendMenuTexto(sock, sender);
        });

        return;
    }

    // 🧾 Fallback
    const comandosValidos = Object.values(opcionesNumericas).concat([
        'menu', 'chau', 'nos vemos', 'no', 'hola', 'pedido', 'chatear', 'dueño', 'comprar', 'pagar', 'vos'
    ]);
    const contieneComando = comandosValidos.some(cmd => contexto?.includes(cmd));



    // 🧾 Fallback - Si no hay comando directo, se usa la IA
    if (!buttonId && !contieneComando) {
        setUserState(sender, 'activo');

        // 🧠 Guardar historial del usuario
        if (!historialPorUsuario[sender]) historialPorUsuario[sender] = [];
        historialPorUsuario[sender].push(`Usuario: ${lowerMsg}`);

        const respuestaIA = await copilotResponder(lowerMsg, historialPorUsuario[sender]);
        const respuestaFinal = respuestaIA || responder(sender, contexto);
        await sock.sendMessage(sender, { text: respuestaFinal });
        return;
    }

    // 🧠 Respuesta contextual
    setUserState(sender, 'activo');

    if (!historialPorUsuario[sender]) historialPorUsuario[sender] = [];
    historialPorUsuario[sender].push(`Usuario: ${lowerMsg}`);

    const respuestaIA = await iaResponder(lowerMsg); // Usamos solo el mensaje, ya que iaResponder no necesita historial
    const respuestaFinal = respuestaIA || responder(sender, contexto);

    await sock.sendMessage(sender, { text: respuestaFinal });
};

module.exports = messageHandler;