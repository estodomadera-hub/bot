//src/routes/mensaje.js
const express = require('express');
const router = express.Router();
const { responder } = require('../core/contextualResponder');
const { setUserState } = require('../core/userStateManager');

router.post('/', (req, res) => {
    const { userId, mensaje } = req.body;

    if (/despedida|chau|nos vemos/i.test(mensaje)) {
        setUserState(userId, 'inactivo');
    } else {
        setUserState(userId, 'activo');
    }

    const respuesta = responder(userId, mensaje);
    res.json({ respuesta });
});

module.exports = router;
