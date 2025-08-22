// src/handlers/messageHandler.js
const delay = require('../utils/delay');
const logger = require('../utils/logger');
const { sendMenu, sendMenuTexto } = require('../utils/buttonManager');
const { responder } = require('../core/contextualResponder');
const {
    setUserState,
    getUserState,
    debeEnviarSaludo,
    marcarSaludo,
    marcarPedido
} = require('../core/userStateManager');
const { enviarPromociones } = require('./promosHandler');

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

    // 🧠 Saludo inicial con imagen + texto + menú
    if (debeEnviarSaludo(sender)) {
        // 🖼️ Imagen de bienvenida
        await sock.sendMessage(sender, {
            image: { url: './src/img/inicial.webp' },
            caption: '', // sin texto
        });

        // 🕒 Horarios de atención
        await sock.sendMessage(sender, {
            text: '*Nuestros Horarios de Atención son:*\nDe lunes a sábado de 7 a 21 hrs.',
        });

        // 📋 Texto introductorio + menú
        await sock.sendMessage(sender, {
            text: '*¿Quieres saber más sobre nosotros?*\nPuedes elegir una opción:',
        });

        const opciones = [
            { id: 'promociones', label: '🎯 Ver promociones' },
            { id: 'catalogo', label: '🛍️ Ver catálogo' },
            { id: 'ubicacion', label: '📍 Ver ubicación' },
            { id: 'contacto', label: '💬 Contactar con un asesor' }
        ];

        const isAndroid = msg.key.id?.includes(':');
        await sendMenu(sock, sender, isAndroid, opciones);

        marcarSaludo(sender);
        return;
    }

    // 📍 Dirección
    if (
        contexto?.includes('ubicacion') || contexto?.includes('estan') || contexto?.includes('donde') ||
        buttonId === 'ubicacion'
    ) {
        setUserState(sender, 'activo');
        marcarPedido(sender, 'pidioUbicacion');
        await sock.sendMessage(sender, {
            text: '📍Ubicación: www.google.com.ar/maps/place/ESTODOMADERA/data=!4m2!3m1!1s0x0:0xf24ec161700ba6a8?sa=X&ved=1t:2428&hl=es-419&gl=ar&ictx=111',
        });
        return;
    }

    // 🛍️ Productos
    if (
        contexto?.includes('catalogo') || contexto?.includes('producto') || buttonId === 'catalogo'
    ) {
        setUserState(sender, 'activo');
        marcarPedido(sender, 'pidioCatalogo');
        await sock.sendMessage(sender, {
            text: '🛍️ Puedes ver los artículos disponibles en mi catálogo:\n\n👉 *https://wa.me/c/5493854864263*',
        });

        await sock.sendMessage(sender, {
            text: '📍 Estamos en Santiago del Estero. Si querés que te enviemos ubicación o ayuda para elegir, escribinos 😉',
        });

        return;
    }


    // 🎯 Promociones desde el catálogo
    if (
        contexto?.includes('promocion') || contexto?.includes('oferta') || contexto?.includes('promo') || contexto?.includes('promos') || buttonId === 'promociones'
    ) {
        setUserState(sender, 'activo');
        marcarPedido(sender, 'pidioPromociones');
        await enviarPromociones(sock, sender);
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

    if (!contexto || contexto === '' || (!buttonId && !contieneComando)) {
        setUserState(sender, 'activo');
        return;
    }

    // 🧠 Respuesta contextual
    setUserState(sender, 'activo');
    const respuesta = responder(sender, contexto);
    await sock.sendMessage(sender, { text: respuesta });
};

module.exports = messageHandler;
