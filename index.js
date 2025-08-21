// index.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');

const startBot = require('./src/config/baileys');
const logger = require('./src/utils/logger');
const mensajeRoute = require('./src/routes/mensaje');

// 📁 Validación de carpetas críticas
if (!fs.existsSync('./auth')) fs.mkdirSync('./auth');
if (!fs.existsSync('./media')) logger.warn('📁 Carpeta /media no encontrada. Algunas funciones pueden fallar.');

// 🤖 Iniciar bot
startBot();

// 🌐 Express para mantener activo en Render
const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// 🧪 Endpoints básicos
app.get('/', (req, res) => res.send('🤖 Bot de WhatsApp activo'));
app.get('/ping', (req, res) => res.json({ message: 'pong' }));

// 🧠 Endpoint de conversación contextual
app.use('/mensaje', mensajeRoute);

const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    logger.info(`🚀 Servidor Express activo en puerto ${PORT}`);
});
