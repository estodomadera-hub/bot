🤖 Bot Personalizado para WhatsApp
Bot conversacional modular desarrollado con Node.js y Baileys, orientado a trazabilidad, control de estado por usuario y respuestas contextuales. Ideal para automatización profesional, flujos adaptativos y despliegue en Render.

📦 Estructura del Proyecto
plaintext
📁 bot-personalizado-whatsapp/
├── index.js                   # Punto de entrada principal
├── package.json              # Configuración y dependencias
├── .env                      # Variables de entorno
├── auth/                     # Sesión persistente de Baileys
└── /src
     ├── handlers/  
     src/
├── logic/
│   ├── handlers/
│   │   └── promosHandler.js   ← lógica principal de promociones
│   └── utils/
│       └── respuestasUtils.js ← funciones auxiliares como esRespuestaImagenPromo
          # Manejo de mensajes entrantes
     ├── routes/              # Endpoint HTTP para enviar mensajes
     ├── utils/               # Utilidades (botones, logger, delay)
     ├── config/              # Inicialización de entorno y cliente
├── render.yaml               # Configuración para despliegue en Render
└── README.md                 # Documentación del proyecto
⚙️ Instalación
bash
# Clonar el repositorio
git clone https://github.com/sss2611/bot-personalizado-whatsapp.git
cd bot-personalizado-whatsapp

# Instalar dependencias
npm ci

# Crear archivo .env
cp .env.example .env
📌 Variables de entorno (.env)
Variable	Descripción	Ejemplo
AUTHORIZED_NUMBER	Número autorizado para interactuar con el bot	5493876123456
SESSION_FOLDER	Carpeta donde se guarda la sesión de Baileys	auth
PORT	Puerto para el servidor HTTP opcional	3000
🚀 Ejecución
bash
# Ejecutar en desarrollo
node index.js

# Ejecutar en producción con PM2
pm2 start index.js --name bot-whatsapp
🧠 Casos de Uso
1. Bot de atención automatizada
Responde según el estado del usuario (activo/inactivo)

Envía menú adaptativo con botones

Interpreta respuestas ambiguas y replies

2. Integración con sistemas externos
Endpoint HTTP (/src/routes/mensaje.js) para enviar mensajes desde APIs

Ideal para CRM, ERP o formularios web

3. Seguimiento conversacional
Envío de mensajes de seguimiento con lógica contextual (sendFollowUp.js)

Persistencia de sesión para mantener el estado

🛠️ Implementación
1. Inicialización del cliente
src/config/baileys.js configura el cliente WhatsApp con Baileys

Usa sesión persistente en auth/

2. Manejo de mensajes
messageHandler.js recibe y procesa cada mensaje

Delegación a buttonManager.js y contextualResponder.js (si se integra)

3. Respuestas contextuales
Puedes extender con lógica de estado por usuario (userStateManager.js)

Ideal para flujos conversacionales avanzados

4. Despliegue en Render
Usa render.yaml para definir el servicio

Variables de entorno se configuran desde el dashboard de Render